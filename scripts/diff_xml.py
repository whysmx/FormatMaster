#!/usr/bin/env python3
"""
对比两个XML文件的差异。

用法:
    python scripts/diff_xml.py file1.xml file2.xml
"""

import sys
from pathlib import Path
from difflib import unified_diff


def diff_xml(file1: str, file2: str) -> None:
    """
    对比两个XML文件。

    Args:
        file1: 第一个XML文件路径
        file2: 第二个XML文件路径
    """
    file1_path = Path(file1)
    file2_path = Path(file2)

    if not file1_path.exists():
        print(f"❌ 错误: 文件不存在: {file1}")
        sys.exit(1)

    if not file2_path.exists():
        print(f"❌ 错误: 文件不存在: {file2}")
        sys.exit(1)

    # 读取文件内容
    with open(file1_path, 'r', encoding='utf-8') as f:
        lines1 = f.readlines()

    with open(file2_path, 'r', encoding='utf-8') as f:
        lines2 = f.readlines()

    # 生成差异
    diff = unified_diff(
        lines1,
        lines2,
        fromfile=file1,
        tofile=file2,
        lineterm=''
    )

    # 输出差异
    diff_lines = list(diff)
    if diff_lines:
        print(f"📊 发现差异 ({len(diff_lines)} 行):")
        print()
        for line in diff_lines[:100]:  # 限制输出前100行
            print(line)

        if len(diff_lines) > 100:
            print()
            print(f"... 还有 {len(diff_lines) - 100} 行差异")
    else:
        print("✅ 文件完全一致！")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("用法: python diff_xml.py <file1.xml> <file2.xml>")
        print("\n示例:")
        print("  python diff_xml.py extracted1/word/styles.xml extracted2/word/styles.xml")
        sys.exit(1)

    diff_xml(sys.argv[1], sys.argv[2])
