#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quick diagnostic script to check why exe won't start
"""

import subprocess
import time
import sys

def test_exe():
    """Test exe startup and capture output"""
    print("="*60)
    print("Testing FormatMaster.exe Startup")
    print("="*60)

    exe_path = "dist/FormatMaster.exe"

    # Start process and capture output
    print("\nStarting executable...")
    process = subprocess.Popen(
        [exe_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    print(f"Process started, PID: {process.pid}")
    print("\nWaiting 5 seconds for startup...")
    time.sleep(5)

    # Check if process is still running
    poll_result = process.poll()
    if poll_result is None:
        print("[OK] Process is still running")
        print("\nAttempting to terminate...")

        # Try to get output
        try:
            stdout, stderr = process.communicate(timeout=2)
            print("\n--- STDOUT ---")
            print(stdout)
            print("\n--- STDERR ---")
            print(stderr)
        except:
            print("[WARNING] Could not capture output")

        process.terminate()
        time.sleep(1)
        if process.poll() is None:
            process.kill()

        print("[OK] Process terminated")
    else:
        print(f"[ERROR] Process exited with code: {poll_result}")
        stdout, stderr = process.communicate()
        print("\n--- STDOUT ---")
        print(stdout)
        print("\n--- STDERR ---")
        print(stderr)

if __name__ == "__main__":
    test_exe()
