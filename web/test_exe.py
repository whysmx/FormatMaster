#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for FormatMaster.exe
Tests if the executable can run and respond correctly
"""

import subprocess
import time
import sys
import requests
from pathlib import Path

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def test_exe_execution():
    """Test if exe can start and respond correctly"""
    print("="*60)
    print("Testing FormatMaster.exe Execution")
    print("="*60)

    # Find exe file
    exe_path = Path("dist/FormatMaster.exe")
    if not exe_path.exists():
        print(f"[ERROR] Cannot find {exe_path}")
        return False

    print(f"[OK] Found executable: {exe_path}")
    size = exe_path.stat().st_size / (1024 * 1024)
    print(f"      Size: {size:.1f} MB")

    # Start exe process
    print("\nStarting executable...")
    process = None
    try:
        # Start process without waiting
        process = subprocess.Popen(
            [str(exe_path)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
        )
        print(f"[OK] Process started, PID: {process.pid}")

        # Wait for server to start
        print("\nWaiting for server startup...")
        max_wait = 30  # max wait 30 seconds
        for i in range(max_wait):
            try:
                response = requests.get("http://localhost:8002/api/health", timeout=2)
                if response.status_code == 200:
                    print(f"[OK] Server responding (waited {i+1}s)")
                    print(f"     Response: {response.json()}")
                    return True
            except:
                if i < max_wait - 1:
                    time.sleep(1)
                    print(f"     Waiting... ({i+1}/{max_wait})", end='\r')

        print(f"\n[ERROR] Timeout: Server not responding in {max_wait}s")
        return False

    except Exception as e:
        print(f"[ERROR] Exception: {e}")
        return False
    finally:
        # Cleanup: close process
        if process:
            try:
                print("\nClosing test process...")
                process.terminate()
                time.sleep(2)
                if process.poll() is None:
                    process.kill()
                print("[OK] Process closed")
            except:
                pass

def test_file_structure():
    """Test packaged file structure"""
    print("\n" + "="*60)
    print("Testing File Structure")
    print("="*60)

    required_files = [
        "dist/FormatMaster.exe"
    ]

    all_ok = True
    for file_path in required_files:
        path = Path(file_path)
        if path.exists():
            size = path.stat().st_size / (1024 * 1024)  # MB
            print(f"[OK] {file_path} ({size:.1f} MB)")
        else:
            print(f"[FAIL] {file_path} missing")
            all_ok = False

    return all_ok

def main():
    """Main test function"""
    print("\n" + "="*60)
    print("FormatMaster.exe Test Suite")
    print("="*60)

    results = {}

    # Test 1: File structure
    print("\n[Test 1/2] File Structure Check")
    results['file_structure'] = test_file_structure()

    # Test 2: Program execution
    print("\n[Test 2/2] Program Execution Test")
    results['execution'] = test_exe_execution()

    # Summary
    print("\n" + "="*60)
    print("Test Results Summary")
    print("="*60)

    for test_name, passed in results.items():
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{test_name}: {status}")

    all_passed = all(results.values())

    if all_passed:
        print("\n[SUCCESS] All tests passed!")
        return 0
    else:
        print("\n[WARNING] Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
