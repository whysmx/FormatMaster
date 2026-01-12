"""
Word Format Restorer - A tool to restore Word document formatting from a template.

This package provides functionality to apply formatting from a standard Word document
to other documents while preserving their content.
"""

__version__ = "0.1.0"
__author__ = "Your Name"
__email__ = "your.email@example.com"

from restorer.core import FormatRestorer
from restorer.comparer import FormatComparer

__all__ = ["FormatRestorer", "FormatComparer"]
