#!/usr/bin/env python3
"""逐个字符精确定位 document.xml 差异"""
import sys
import zipfile
import tempfile
from pathlib import Path
from lxml import etree

SRC_DIR = Path(__file__).parent / "src"
sys.path.insert(0, str(SRC_DIR))

from restorer.comparer import FormatComparer

# Command line arguments
if len(sys.argv) >= 3:
    output_path = Path(sys.argv[1])
    template_path = Path(sys.argv[2])
else:
    template_path = Path(__file__).parent / 'web/template_files/e940785b-9e07-4f27-baff-c79707281f44_正常格式.docx'
    output_path = Path(__file__).parent / 'test_output.docx'

print('=' * 100)
print('🔍 逐字符精确定位 document.xml 第一个差异')
print('=' * 100)
print()

# 使用 FormatComparer 的对比方法
comparer = FormatComparer()

# 提取并对比 document.xml
with tempfile.TemporaryDirectory() as temp_dir:
    # 提取两个文档
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

    # Pre-process: merge adjacent runs with identical formatting
    comparer._merge_runs_in_tree(template_tree.getroot())
    comparer._merge_runs_in_tree(output_tree.getroot())

    template_root_norm = comparer._normalize_xml(template_tree.getroot())
    output_root_norm = comparer._normalize_xml(output_tree.getroot())

    # 转换为字符串
    template_str = etree.tostring(template_root_norm, method='c14n', exclusive=True).decode('utf-8')
    output_str = etree.tostring(output_root_norm, method='c14n', exclusive=True).decode('utf-8')

    print(f"模板字符串长度: {len(template_str)}")
    print(f"转换字符串长度: {len(output_str)}")
    print()

    # 逐字符对比
    max_len = min(len(template_str), len(output_str))
    first_diff = None

    for i in range(max_len):
        if template_str[i] != output_str[i]:
            first_diff = i
            break

    if first_diff is None:
        if len(template_str) != len(output_str):
            first_diff = max_len
            print(f"✅ 前 {max_len} 个字符完全相同，但长度不同")
        else:
            print("✅ 两个字符串完全相同")
            exit(0)

    print(f"📍 第一个差异位置: 索引 {first_diff}")
    print()

    # 显示差异前后的上下文
    context_size = 200
    start = max(0, first_diff - context_size)
    end_template = min(len(template_str), first_diff + context_size)
    end_output = min(len(output_str), first_diff + context_size)

    print("=" * 100)
    print("📋 模板文档 (差异位置已用 🔴 标记):")
    print("=" * 100)
    before = template_str[start:first_diff]
    char = template_str[first_diff] if first_diff < len(template_str) else "[EOF]"
    after = template_str[first_diff+1:end_template]

    # 显示前文
    print(f"...{before}")
    # 标记差异字符
    print(f"🔴 差异字符 [{repr(char)}] (位置 {first_diff})")
    # 显示后文
    print(f"{after}...")

    print()
    print("=" * 100)
    print("📋 转换后文档 (差异位置已用 🔴 标记):")
    print("=" * 100)
    before2 = output_str[start:first_diff]
    char2 = output_str[first_diff] if first_diff < len(output_str) else "[EOF]"
    after2 = output_str[first_diff+1:end_output]

    # 显示前文
    print(f"...{before2}")
    # 标记差异字符
    print(f"🔴 差异字符 [{repr(char2)}] (位置 {first_diff})")
    # 显示后文
    print(f"{after2}...")

    print()
    print("=" * 100)
    print("🔍 差异对比:")
    print("=" * 100)
    print(f"模板字符: {repr(char)} (Unicode: U+{ord(char):04X})")
    print(f"转换字符: {repr(char2)} (Unicode: U+{ord(char2):04X})")

    if char != char2:
        print(f"❌ 字符不同!")

        # 尝试识别这是什么类型的字符
        def analyze_char(c, name):
            print(f"\n{name} 分析:")
            print(f"  - 字符: {c}")
            print(f"  - Unicode码点: U+{ord(c):04X}")
            print(f"  - 类别: {c.__class__.__name__}")

            # 检查是否是空白字符
            if c.isspace():
                print(f"  - 类型: 空白字符")
                if c == ' ':
                    print(f"  - 名称: 空格 (SPACE)")
                elif c == '\n':
                    print(f"  - 名称: 换行 (LINE FEED)")
                elif c == '\t':
                    print(f"  - 名称: 制表符 (TAB)")
                elif c == '\r':
                    print(f"  - 名称: 回车 (CARRIAGE RETURN)")
                else:
                    print(f"  - 描述: 其他空白字符")
            # 检查是否是标签字符
            elif c in '<>&':
                print(f"  - 类型: XML标签字符")
            else:
                print(f"  - 类型: 普通字符")

        analyze_char(char, "模板字符")
        analyze_char(char2, "转换字符")

    print()
    print("=" * 100)
    print("📊 统计信息:")
    print("=" * 100)
    print(f"模板总长度: {len(template_str)}")
    print(f"转换总长度: {len(output_str)}")
    print(f"长度差异: {len(output_str) - len(template_str):+d}")

    # 计算从第一个差异开始，还有多少字符不同
    remaining_diff = 0
    for i in range(first_diff, max_len):
        if template_str[i] != output_str[i]:
            remaining_diff += 1

    print(f"从第一个差异位置到末尾，还有 {remaining_diff} 个字符不同")
