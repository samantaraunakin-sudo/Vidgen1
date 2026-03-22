"""
Vidgen Backend Configuration
"""
import os

# System Paths
# Use absolute path for FFmpeg to avoid PATH issues in current shell
FFMPEG_PATH = r"C:\Users\paulr\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"

# Storage Directories
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
TEMP_DIR = "temp"
CHECKPOINT_DIR = "checkpoints"

# Ensure directories exist
for d in [UPLOAD_DIR, OUTPUT_DIR, TEMP_DIR, CHECKPOINT_DIR]:
    os.makedirs(d, exist_ok=True)
