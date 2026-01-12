#!/usr/bin/env python3
"""
Simple script to run the restoration process
"""
import sys
sys.path.insert(0, 'src')

from restorer.core import FormatRestorer
from pathlib import Path

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python run_restoration.py <source> <template> <output>")
        sys.exit(1)

    source_path = sys.argv[1]
    template_path = sys.argv[2]
    output_path = sys.argv[3]

    print(f"源文档: {source_path}")
    print(f"模板文档: {template_path}")
    print(f"输出文档: {output_path}")

    restorer = FormatRestorer(template_path=template_path)

    print("\n开始格式恢复...")
    result = restorer.restore_format(target_path=source_path, output_path=output_path)

    print(f"\n✓ 完成！输出文件: {result}")
