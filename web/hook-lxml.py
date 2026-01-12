# PyInstaller hook for lxml
from PyInstaller.utils.hooks import collect_submodules, collect_data_files, collect_dynamic_libs

# Collect all lxml submodules
hiddenimports = collect_submodules('lxml')

# Collect lxml data files
datas = collect_data_files('lxml')

# Collect lxml DLLs (binaries)
binaries = collect_dynamic_libs('lxml')
