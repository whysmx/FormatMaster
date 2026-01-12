#!/usr/bin/env python3
"""
测试打包后的exe程序能否正常运行
"""

import subprocess
import time
import sys
import requests
from pathlib import Path

def test_exe_execution():
    """测试exe是否能正常启动和响应"""
    print("="*60)
    print("测试 FormatMaster.exe 执行")
    print("="*60)

    # 查找exe文件
    exe_path = Path("dist/FormatMaster.exe")
    if not exe_path.exists():
        print(f"❌ 错误: 找不到 {exe_path}")
        return False

    print(f"✅ 找到可执行文件: {exe_path}")

    # 启动exe程序
    print("\n启动程序...")
    process = None
    try:
        # 启动进程，不等待
        process = subprocess.Popen(
            [str(exe_path)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
        )
        print(f"✅ 程序已启动，PID: {process.pid}")

        # 等待服务器启动
        print("\n等待服务器启动...")
        max_wait = 30  # 最多等待30秒
        for i in range(max_wait):
            try:
                response = requests.get("http://localhost:8002/api/health", timeout=2)
                if response.status_code == 200:
                    print(f"✅ 服务器响应正常 (等待 {i+1} 秒)")
                    print(f"   响应: {response.json()}")
                    return True
            except:
                if i < max_wait - 1:
                    time.sleep(1)
                    print(f"   等待中... ({i+1}/{max_wait})", end='\r')

        print(f"\n❌ 超时: 服务器在 {max_wait} 秒内未响应")
        return False

    except Exception as e:
        print(f"❌ 错误: {e}")
        return False
    finally:
        # 清理：关闭进程
        if process:
            try:
                print("\n关闭测试进程...")
                process.terminate()
                time.sleep(2)
                if process.poll() is None:
                    process.kill()
                print("✅ 进程已关闭")
            except:
                pass

def test_file_structure():
    """测试打包后的文件结构"""
    print("\n" + "="*60)
    print("测试文件结构")
    print("="*60)

    required_files = [
        "dist/FormatMaster.exe"
    ]

    all_ok = True
    for file_path in required_files:
        path = Path(file_path)
        if path.exists():
            size = path.stat().st_size / (1024 * 1024)  # MB
            print(f"✅ {file_path} ({size:.1f} MB)")
        else:
            print(f"❌ {file_path} 缺失")
            all_ok = False

    return all_ok

def main():
    """主测试函数"""
    print("\n" + "="*60)
    print("FormatMaster.exe 测试套件")
    print("="*60)

    results = {}

    # 测试1: 文件结构
    print("\n[测试 1/2] 文件结构检查")
    results['file_structure'] = test_file_structure()

    # 测试2: 程序执行
    print("\n[测试 2/2] 程序执行测试")
    results['execution'] = test_exe_execution()

    # 总结
    print("\n" + "="*60)
    print("测试结果总结")
    print("="*60)

    for test_name, passed in results.items():
        status = "✅ 通过" if passed else "❌ 失败"
        print(f"{test_name}: {status}")

    all_passed = all(results.values())

    if all_passed:
        print("\n🎉 所有测试通过！")
        return 0
    else:
        print("\n⚠️ 部分测试失败")
        return 1

if __name__ == "__main__":
    sys.exit(main())
