"""
Command-line interface for Word Format Restorer.

This module provides the CLI for restoring Word document formatting
and comparing documents.
"""

import argparse
import sys
from pathlib import Path
from typing import List

from restorer.core import FormatRestorer
from restorer.comparer import FormatComparer


def main():
    """Main entry point for the CLI."""
    parser = create_parser()
    args = parser.parse_args()

    try:
        if args.command == "restore":
            handle_restore(args)
        elif args.command == "compare":
            handle_compare(args)
        elif args.command == "batch":
            handle_batch(args)
        else:
            parser.print_help()
            sys.exit(1)
    except Exception as e:
        print(f"❌ 错误: {str(e)}", file=sys.stderr)
        sys.exit(1)


def create_parser() -> argparse.ArgumentParser:
    """Create the argument parser."""
    parser = argparse.ArgumentParser(
        prog="format-restorer",
        description="Word格式还原工具 - 将标准格式应用到Word文档",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 还原单个文档格式
  %(prog)s restore 正常格式.docx 错乱格式.docx -o 输出.docx

  # 批量还原格式
  %(prog)s batch 正常格式.docx *.docx -o formatted/

  # 对比两个文档格式
  %(prog)s compare 正常格式.docx 输出文档.docx

  # 对比特定XML文件
  %(prog)s compare 正常格式.docx 输出文档.docx --file styles.xml

  # 仅对比格式文件（非全量）
  %(prog)s compare 正常格式.docx 输出文档.docx --no-full
        """
    )

    subparsers = parser.add_subparsers(dest="command", help="可用命令")

    # Restore command
    restore_parser = subparsers.add_parser(
        "restore",
        help="还原单个文档的格式",
        description="将标准格式文档的样式应用到目标文档"
    )
    restore_parser.add_argument(
        "template",
        help="标准格式文档路径 (.docx)"
    )
    restore_parser.add_argument(
        "target",
        help="待处理文档路径 (.docx)"
    )
    restore_parser.add_argument(
        "-o", "--output",
        help="输出文档路径 (默认: 目标文档_已格式化.docx)"
    )

    # Batch command
    batch_parser = subparsers.add_parser(
        "batch",
        help="批量还原文档格式",
        description="将标准格式应用到多个文档"
    )
    batch_parser.add_argument(
        "template",
        help="标准格式文档路径 (.docx)"
    )
    batch_parser.add_argument(
        "targets",
        nargs="+",
        help="待处理文档路径列表 (支持通配符)"
    )
    batch_parser.add_argument(
        "-o", "--output-dir",
        help="输出目录 (默认: 与原文件相同目录)"
    )

    # Compare command
    compare_parser = subparsers.add_parser(
        "compare",
        help="对比两个文档的格式",
        description="比较两个Word文档的XML结构差异"
    )
    compare_parser.add_argument(
        "reference",
        help="参考文档路径 (.docx)"
    )
    compare_parser.add_argument(
        "target",
        help="待验证文档路径 (.docx)"
    )
    compare_parser.add_argument(
        "--file",
        help="仅对比指定的XML文件 (如: styles.xml)"
    )
    compare_parser.add_argument(
        "--no-full",
        action="store_true",
        help="仅对比格式相关文件，非全量对比"
    )

    return parser


def handle_restore(args) -> None:
    """
    Handle the restore command.

    Args:
        args: Parsed command-line arguments
    """
    print("📋 开始还原文档格式...")
    print(f"  标准格式: {args.template}")
    print(f"  目标文档: {args.target}")
    print()

    restorer = FormatRestorer(args.template)

    output_path = args.output
    result_path = restorer.restore_format(args.target, output_path)

    print(f"✅ 格式还原完成！")
    print(f"  输出文件: {result_path}")


def handle_batch(args) -> None:
    """
    Handle the batch command.

    Args:
        args: Parsed command-line arguments
    """
    print("📋 开始批量还原文档格式...")
    print(f"  标准格式: {args.template}")
    print(f"  待处理文件数: {len(args.targets)}")
    print()

    restorer = FormatRestorer(args.template)

    output_files, errors = restorer.restore_batch(
        args.targets,
        args.output_dir
    )

    if output_files:
        print(f"✅ 成功处理 {len(output_files)} 个文件:")
        for output_file in output_files:
            print(f"  • {output_file}")

    if errors:
        print()
        print(f"❌ {len(errors)} 个文件处理失败:")
        for error in errors:
            print(f"  • {error}")

    if output_files:
        print()
        print(f"📊 处理完成: {len(output_files)} 成功, {len(errors)} 失败")


def handle_compare(args) -> None:
    """
    Handle the compare command.

    Args:
        args: Parsed command-line arguments
    """
    print("📋 开始对比文档格式...")
    print(f"  参考文档: {args.reference}")
    print(f"  待验证文档: {args.target}")
    print()

    comparer = FormatComparer()

    comparison_result = comparer.compare_documents(
        args.reference,
        args.target,
        specific_file=args.file,
        full_compare=not args.no_full
    )

    # Generate and print report
    report = comparer.generate_report(
        comparison_result,
        args.reference,
        args.target
    )
    print(report)

    # Exit with error code if similarity is low
    if comparison_result.get("overall_similarity", 0.0) < 0.9:
        sys.exit(1)


# Legacy CLI interface (for backward compatibility)
def legacy_main():
    """
    Legacy CLI interface using positional arguments and flags.

    This supports the old-style interface:
    format-restorer template.docx target.docx -o output.docx
    format-restorer --compare template.docx target.docx
    """
    parser = argparse.ArgumentParser(
        prog="format-restorer",
        description="Word格式还原工具 - 将标准格式应用到Word文档",
        add_help=False
    )

    parser.add_argument(
        "template",
        nargs="?",
        help="标准格式文档路径 (.docx)"
    )
    parser.add_argument(
        "target",
        nargs="?",
        help="待处理文档路径 (.docx)"
    )
    parser.add_argument(
        "-o", "--output",
        help="输出文档路径"
    )
    parser.add_argument(
        "--compare",
        action="store_true",
        help="对比模式: 对比两个文档的格式"
    )
    parser.add_argument(
        "--file",
        help="仅对比指定的XML文件"
    )
    parser.add_argument(
        "--no-full",
        action="store_true",
        help="仅对比格式文件，非全量对比"
    )
    parser.add_argument(
        "-h", "--help",
        action="store_true",
        help="显示帮助信息"
    )

    args = parser.parse_args()

    # Show help if requested
    if args.help:
        create_parser().print_help()
        sys.exit(0)

    # Compare mode
    if args.compare:
        if not args.template or not args.target:
            print("❌ 错误: 对比模式需要两个文档参数", file=sys.stderr)
            print("用法: format-restorer --compare 参考文档.docx 待验证文档.docx")
            sys.exit(1)

        print("📋 开始对比文档格式...")
        print(f"  参考文档: {args.template}")
        print(f"  待验证文档: {args.target}")
        print()

        comparer = FormatComparer()
        comparison_result = comparer.compare_documents(
            args.template,
            args.target,
            specific_file=args.file,
            full_compare=not args.no_full
        )

        report = comparer.generate_report(
            comparison_result,
            args.template,
            args.target
        )
        print(report)

        if comparison_result.get("overall_similarity", 0.0) < 0.9:
            sys.exit(1)
        return

    # Restore mode (default)
    if not args.template or not args.target:
        print("❌ 错误: 还原模式需要两个文档参数", file=sys.stderr)
        print("用法: format-restorer 标准格式.docx 待处理.docx [-o 输出.docx]")
        print("或使用: format-restorer --help 查看详细帮助")
        sys.exit(1)

    print("📋 开始还原文档格式...")
    print(f"  标准格式: {args.template}")
    print(f"  目标文档: {args.target}")
    print()

    restorer = FormatRestorer(args.template)
    result_path = restorer.restore_format(args.target, args.output)

    print(f"✅ 格式还原完成！")
    print(f"  输出文件: {result_path}")


if __name__ == "__main__":
    # Use legacy interface for backward compatibility
    # Detect if using new command-style or old positional-style
    if len(sys.argv) > 1 and sys.argv[1] in ["restore", "compare", "batch", "-h", "--help"]:
        main()
    else:
        legacy_main()
