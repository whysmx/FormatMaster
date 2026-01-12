# -*- mode: python ; coding: utf-8 -*-

import sys
from pathlib import Path

# 获取项目路径
project_path = Path(SPECPATH).parent
src_path = project_path.parent / "src"

block_cipher = None

a = Analysis(
    ['main.py'],
    pathex=[str(project_path)],
    binaries=[],
    datas=[
        # 静态文件
        (str(project_path / 'static'), 'static'),
        (str(project_path / 'templates'), 'templates'),
        (str(project_path / 'data'), 'data'),
        (str(project_path / 'template_files'), 'template_files'),
        (str(project_path / 'examples'), 'examples'),

        # 源代码
        (str(src_path / 'restorer'), 'restorer'),
    ],
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'fastapi',
        'fastapi.responses',
        'lxml',
        'lxml._elementpath',
        'aiofiles',
        'pydantic',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='FormatMaster',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # 显示控制台，便于调试
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # 可以添加自定义图标
)
