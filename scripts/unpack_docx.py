#!/usr/bin/env python3
"""
解压docx文件，用于调试和查看XML结构。

用法:
    python scripts/unpack_docx.py document.docx [output_dir]
"""

import sys
import zipfile
from pathlib import Path


def unpack_docx(docx_path: str, output_dir: str = None) -> None:
    """
    解压docx文件到指定目录。

    Args:
        docx_path: docx文件路径
        output_dir: 输出目录（默认为文件名加上_extracted）
    """
    docx_path = Path(docx_path)

    if not docx_path.exists():
        print(f"❌ 错误: 文件不存在: {docx_path}")
        sys.exit(1)

    if not docx_path.suffix.lower() == ".docx":
        print(f"❌ 错误: 不是docx文件: {docx_path}")
        sys.exit(1)

    # 默认输出目录
    if output_dir is None:
        output_dir = docx_path.parent / f"{docx_path.stem}_extracted"
    else:
        output_dir = Path(output_dir)

    # 解压
    print(f"📦 解压 {docx_path.name} 到 {output_dir}...")
    with zipfile.ZipFile(docx_path, 'r') as zip_ref:
        zip_ref.extractall(output_dir)

    print(f"✅ 解压完成！")
    print(f"📂 输出目录: {output_dir}")

    # 显示关键文件
    key_files = [
        "word/document.xml",
        "word/styles.xml",
        "word/numbering.xml",
        "word/settings.xml",
        "word/fontTable.xml",
    ]

    print("\n📄 关键文件:")
    for key_file in key_files:
        file_path = output_dir / key_file
        if file_path.exists():
            size = file_path.stat().st_size
            print(f"  ✓ {key_file} ({size:,} bytes)")
        else:
            print(f"  ✗ {key_file} (不存在)")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python unpack_docx.py <document.docx> [output_dir]")
        print("\n示例:")
        print("  python unpack_docx.py examples/正常格式.docx")
        print("  python unpack_docx.py examples/正常格式.docx /tmp/extracted")
        sys.exit(1)

    unpack_docx(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
