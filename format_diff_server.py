#!/usr/bin/env python3
"""格式差异对比服务"""
import sys
import json
import zipfile
import tempfile
from pathlib import Path
from lxml import etree
from difflib import SequenceMatcher

# 添加 src 目录到路径
SRC_DIR = Path(__file__).parent / "src"
sys.path.insert(0, str(SRC_DIR))

from restorer.comparer import FormatComparer

# 配置
TEMPLATE_PATH = Path('web/template_files/e940785b-9e07-4f27-baff-c79707281f44_正常格式.docx')
OUTPUT_PATH = Path('test_new14.docx')

def analyze_format_differences(template_path, output_path, max_diffs=100):
    """分析两个文档之间的格式差异（排除内容差异）"""

    w_ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

    print("📂 提取并解析文档...")

    # 提取 document.xml
    with tempfile.TemporaryDirectory() as temp_dir:
        # 提取文档
        for doc_path, doc_name in [(template_path, "template"), (output_path, "output")]:
            with zipfile.ZipFile(doc_path, 'r') as zip_ref:
                extract_dir = Path(temp_dir) / doc_name
                zip_ref.extractall(extract_dir)

        # 读取 document.xml
        template_doc = Path(temp_dir) / "template" / "word" / "document.xml"
        output_doc = Path(temp_dir) / "output" / "word" / "document.xml"

        # 解析并标准化
        template_tree = etree.parse(template_doc)
        output_tree = etree.parse(output_doc)

        # 使用 FormatComparer 的方法
        comparer = FormatComparer()
        comparer._merge_runs_in_tree(template_tree.getroot())
        comparer._merge_runs_in_tree(output_tree.getroot())

        template_root_norm = comparer._normalize_xml(template_tree.getroot())
        output_root_norm = comparer._normalize_xml(output_tree.getroot())

        # 转换为字符串
        template_str = etree.tostring(template_root_norm, method='c14n', exclusive=True).decode('utf-8')
        output_str = etree.tostring(output_root_norm, method='c14n', exclusive=True).decode('utf-8')

    print(f"✅ 文档解析完成")
    print(f"   模板长度: {len(template_str):,} 字符")
    print(f"   输出长度: {len(output_str):,} 字符")
    print()

    print("🔍 分析差异...")

    # 找出所有差异位置
    diffs = []
    context_size = 100

    i = 0
    count = 0
    skipped_content = 0

    while i < min(len(template_str), len(output_str)) and count < max_diffs:
        if template_str[i] != output_str[i]:
            # 判断差异类型
            diff_type = classify_difference(template_str, output_str, i)

            # 如果是内容差异（中文文本差异），跳过并找到下一个格式差异
            if diff_type == 'content':
                skipped_content += 1
                # 跳过这个内容差异段落
                i = skip_content_difference(template_str, output_str, i)
                continue

            # 收集格式差异
            start = max(0, i - context_size)
            end_template = min(len(template_str), i + context_size)
            end_output = min(len(output_str), i + context_size)

            diff = {
                'position': i,
                'type': diff_type,
                'type_name': get_type_name(diff_type),
                'template_char': template_str[i],
                'output_char': output_str[i],
                'template_context': template_str[start:i],
                'output_context': output_str[start:i],
                'template_full_context': template_str[start:end_template],
                'output_full_context': output_str[start:end_output],
                'template_length': len(template_str),
                'output_length': len(output_str)
            }
            diffs.append(diff)
            count += 1

            if count % 10 == 0:
                print(f"   已找到 {count} 个格式差异...")

        i += 1

    # 计算相似度
    matcher = SequenceMatcher(None, template_str, output_str)
    similarity = matcher.ratio() * 100

    # 找到第一个差异
    first_diff = 0
    for i in range(min(len(template_str), len(output_str))):
        if template_str[i] != output_str[i]:
            first_diff = i
            break

    return {
        'diffs': diffs,
        'first_diff': first_diff,
        'similarity': round(similarity, 2),
        'total_format_diffs': len(diffs),
        'skipped_content_diffs': skipped_content
    }

def classify_difference(template_str, output_str, position):
    """判断差异类型"""

    # 检查是否是 XML 标签差异
    if template_str[position] == '<' or output_str[position] == '<':
        return 'structure'

    # 检查是否是属性名差异
    if template_str[position].isalpha() and output_str[position].isalpha():
        # 检查前后文是否是 XML 属性
        context_before = template_str[max(0, position-10):position]
        context_after = template_str[position:min(len(template_str), position+10)]

        if '=' in context_after or '=' in context_before:
            return 'style'

    # 检查是否是样式值差异（数字、字母组合）
    if template_str[position].isalnum() and output_str[position].isalnum():
        # 检查是否在引号中（属性值）
        before_20 = template_str[max(0, position-20):position]
        after_20 = template_str[position:min(len(template_str), position+20)]

        if '"' in before_20 or '"' in after_20:
            return 'style'

    # 检查是否是内容差异（中文字符）
    # 规则：如果是中文字符 vs 中文字符，且不在 XML 标签中，则视为内容差异
    if '\u4e00' <= template_str[position] <= '\u9fff' and '\u4e00' <= output_str[position] <= '\u9fff':
        # 检查是否在文本标签中
        context = template_str[max(0, position-100):min(len(template_str), position+100)]
        if '<w:t' in context or '</w:t>' in context:
            # 两个都是中文字符，在文本标签中 → 内容差异
            return 'content'

    # 特殊情况：空格 vs 中文字符 → 内容差异
    if template_str[position] == ' ' and '\u4e00' <= output_str[position] <= '\u9fff':
        # 检查是否在文本标签中
        context = template_str[max(0, position-50):min(len(template_str), position+50)]
        if '<w:t' in context or '</w:t>' in context:
            return 'content'

    if output_str[position] == ' ' and '\u4e00' <= template_str[position] <= '\u9fff':
        # 检查是否在文本标签中
        context = output_str[max(0, position-50):min(len(output_str), position+50)]
        if '<w:t' in context or '</w:t>' in context:
            return 'content'

    # 默认为格式差异
    return 'other'

def skip_content_difference(template_str, output_str, position):
    """跳过内容差异段落，返回下一个可能的位置"""

    # 找到下一个 XML 标签
    next_tag_template = template_str.find('<', position)
    next_tag_output = output_str.find('<', position)

    # 跳到较近的标签
    if next_tag_template != -1 and next_tag_output != -1:
        return min(next_tag_template, next_tag_output)
    elif next_tag_template != -1:
        return next_tag_template
    elif next_tag_output != -1:
        return next_tag_output

    return position + 100  # 默认跳过100个字符

def get_type_name(diff_type):
    """获取差异类型的中文名称"""
    type_names = {
        'style': '样式差异',
        'structure': '结构差异',
        'punctuation': '标点符号差异',
        'content': '内容差异',
        'other': '其他差异'
    }
    return type_names.get(diff_type, '未知类型')

if __name__ == '__main__':
    print("=" * 70)
    print("📊 格式差异分析工具")
    print("=" * 70)
    print()

    try:
        result = analyze_format_differences(TEMPLATE_PATH, OUTPUT_PATH)

        # 保存为 JSON 文件
        output_json = Path('format_diffs.json')
        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print()
        print("=" * 70)
        print("✅ 分析完成！")
        print("=" * 70)
        print(f"📊 统计信息:")
        print(f"   • 第一个差异位置: {result['first_diff']:,}")
        print(f"   • 格式差异总数: {result['total_format_diffs']}")
        print(f"   • 跳过内容差异: {result.get('skipped_content_diffs', 0)}")
        print(f"   • 相似度: {result['similarity']}%")
        print(f"\n📁 差异数据已保存到: {output_json}")
        print(f"\n💡 使用方法:")
        print(f"   1. 直接在浏览器中打开: format_diff_viewer_standalone.html")
        print(f"   2. 或者启动本地服务器: python3 -m http.server 8000")
        print(f"   3. 然后访问: http://localhost:8000/format_diff_viewer_standalone.html")
        print()

    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
