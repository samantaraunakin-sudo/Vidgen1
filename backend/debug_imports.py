import sys
import os

print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")
print(f"CWD: {os.getcwd()}")

print("\n--- Testing MediaPipe ---")
try:
    import mediapipe as mp
    print(f"MediaPipe version: {getattr(mp, '__version__', 'unknown')}")
    print(f"MediaPipe file: {mp.__file__}")
    print(f"Has solutions: {hasattr(mp, 'solutions')}")
    if not hasattr(mp, 'solutions'):
        print(f"MediaPipe dir: {dir(mp)}")
except Exception as e:
    import traceback
    traceback.print_exc()

print("\n--- Testing TTS ---")
try:
    from TTS.api import TTS
    print("TTS import successful")
except Exception as e:
    import traceback
    traceback.print_exc()
