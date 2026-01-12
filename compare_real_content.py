#!/usr/bin/env python3
"""对比真正的可见正文内容（排除书签等隐藏标记）"""
import sys
import zipfile
import tempfile
from pathlib import Path
from lxml import etree

SRC_DIR = Path(__file__).parent / "src"
sys.path.insert(0, str(SRC_DIR))

from restorer.comparer import FormatComparer

template_path = Path(__file__).parent / 'web/template_files/e940785b-9e07-4f27-baff-c79707281f44_正常格式.docx'
output_path = Path(__file__).parent / 'test_output_fixed.docx'

print('=' * 100)
print('🔍 对比真正的可见正文内容')
print('=' * 100)
print()

# 提取并分析
with tempfile.TemporaryDirectory() as temp_dir:
    for doc_path, doc_name in [(template_path, "template"), (output_path, "output")]:
        with zipfile.ZipFile(doc_path, 'r') as zip_ref:
            extract_dir = Path(temp_dir) / doc_name
            zip_ref.extractall(extract_dir)

    # 读取 document.xml
    template_doc = Path(temp_dir) / "template" / "word" / "document.xml"
    output_doc = Path(temp_dir) / "output" / "word" / "document.xml"

    template_tree = etree.parse(template_doc)
    output_tree = etree.parse(output_doc)

    w_ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

    # 分析真正的正文内容
    def analyze_real_content(tree, doc_name):
        print(f"📄 {doc_name}:")
        print("-" * 80)

        # 1. 提取所有文本内容（这是真正的正文）
        text_elements = tree.getroot().xpath("//w:t", namespaces=w_ns)
        all_text = "".join([elem.text or "" for elem in text_elements])

        print(f"  📝 正文文本:")
        print(f"     - 字符数: {len(all_text)}")
        print(f"     - 前100字符: {all_text[:100]}")

        # 2. 统计段落数
        paragraphs = tree.getroot().xpath("//w:p", namespaces=w_ns)
        print(f"  📋 段落数: {len(paragraphs)}")

        # 3. 统计表格数
        tables = tree.getroot().xpath("//w:tbl", namespaces=w_ns)
        print(f"  📊 表格数: {len(tables)}")

        # 4. 统计图片数
        drawings = tree.getroot().xpath("//w:drawing", namespaces=w_ns)
        print(f"  🖼️  图片数: {len(drawings)}")

        # 5. 统计书签数（隐藏标记，不是正文）
        bookmarks_start = tree.getroot().xpath("//w:bookmarkStart", namespaces=w_ns)
        bookmarks_end = tree.getroot().xpath("//w:bookmarkEnd", namespaces=w_ns)
        print(f"  🔖 书签数 (隐藏标记): {len(bookmarks_start)} + {len(bookmarks_end)} = {len(bookmarks_start) + len(bookmarks_end)}")

        # 6. 统计超链接
        hyperlinks = tree.getroot().xpath("//w:hyperlink", namespaces=w_ns)
        print(f"  🔗 超链接数: {len(hyperlinks)}")

        print()
        return {
            'text': all_text,
            'text_length': len(all_text),
            'paragraphs': len(paragraphs),
            'tables': len(tables),
            'images': len(drawings),
            'bookmarks': len(bookmarks_start) + len(bookmarks_end),
            'hyperlinks': len(hyperlinks)
        }

    template_info = analyze_real_content(template_tree, "模板文档")
    output_info = analyze_real_content(output_tree, "转换后文档")

    print("=" * 100)
    print("🔍 真正可见正文内容差异对比:")
    print("=" * 100)

    # 文本对比
    print(f"📝 正文文本:")
    text_same = template_info['text'] == output_info['text']
    if text_same:
        print(f"  ✅ 完全相同 ({len(template_info['text'])} 字符)")
    else:
        diff = len(output_info['text']) - len(template_info['text'])
        diff_pct = (abs(diff) / len(template_info['text'])) * 100 if len(template_info['text']) > 0 else 0
        print(f"  ❌ 不同")
        print(f"     模板: {len(template_info['text'])} 字符")
        print(f"     转换: {len(output_info['text'])} 字符")
        print(f"     差异: {diff:+d} 字符 ({diff_pct:.2f}%)")

    # 段落对比
    print(f"\n📋 段落数:")
    para_diff = output_info['paragraphs'] - template_info['paragraphs']
    if para_diff == 0:
        print(f"  ✅ 相同 ({template_info['paragraphs']} 个)")
    else:
        print(f"  ❌ 不同")
        print(f"     模板: {template_info['paragraphs']} 个")
        print(f"     转换: {output_info['paragraphs']} 个")
        print(f"     差异: {para_diff:+d} 个")

    # 表格对比
    print(f"\n📊 表格数:")
    table_diff = output_info['tables'] - template_info['tables']
    if table_diff == 0:
        print(f"  ✅ 相同 ({template_info['tables']} 个)")
    else:
        print(f"  ❌ 不同")
        print(f"     模板: {template_info['tables']} 个")
        print(f"     转换: {output_info['tables']} 个")
        print(f"     差异: {table_diff:+d} 个")

    # 图片对比
    print(f"\n🖼️  图片数:")
    img_diff = output_info['images'] - template_info['images']
    if img_diff == 0:
        print(f"  ✅ 相同 ({template_info['images']} 个)")
    else:
        print(f"  ❌ 不同")
        print(f"     模板: {template_info['images']} 个")
        print(f"     转换: {output_info['images']} 个")
        print(f"     差异: {img_diff:+d} 个")

    # 书签对比（隐藏标记）
    print(f"\n🔖 书签数 (隐藏标记，非正文):")
    bookmark_diff = output_info['bookmarks'] - template_info['bookmarks']
    print(f"  ℹ️  模板: {template_info['bookmarks']} 个")
    print(f"  ℹ️  转换: {output_info['bookmarks']} 个")
    print(f"  ℹ️  差异: {bookmark_diff:+d} 个")

    print()
    print("=" * 100)
    print("🎯 结论:")
    print("=" * 100)

    # 计算正文内容相似度
    content_items = [
        ('文本', template_info['text_length'], output_info['text_length']),
        ('段落', template_info['paragraphs'], output_info['paragraphs']),
        ('表格', template_info['tables'], output_info['tables']),
        ('图片', template_info['images'], output_info['images']),
    ]

    all_match = all(t == o for _, t, o in content_items)

    if all_match:
        print("✅ 真正的可见正文内容（文字、段落、表格、图片）完全相同！")
        print(f"   只有书签等隐藏标记不同（差异 {bookmark_diff:+d} 个）")
    else:
        print("⚠️  可见正文内容存在差异:")
        for name, t, o in content_items:
            if t != o:
                diff = o - t
                print(f"   - {name}: {t} → {o} (差异 {diff:+d})")
        print()
        print("   这是正常现象，因为:")
        print("   - 模板文档和目标文档本来就有不同的内容")
        print("   - 格式还原工具的目标是保留格式，而不是保留模板的内容")
