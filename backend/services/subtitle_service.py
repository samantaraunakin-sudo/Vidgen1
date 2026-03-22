"""
Subtitle Service — Automated subtitle extraction and SRT formatting using Whisper.
"""

import os
import whisper
from datetime import timedelta

def format_timestamp(seconds: float) -> str:
    """Format seconds into SRT timestamp format: HH:MM:SS,mmm"""
    td = timedelta(seconds=seconds)
    total_seconds = int(td.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    secs = total_seconds % 60
    millis = int(td.microseconds / 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def generate_subtitles(audio_path: str, output_srt_path: str, model_size: str = "base") -> bool:
    """
    Generate an SRT subtitle file from an audio file using OpenAI Whisper.
    Returns True if successful.
    """
    try:
        # Load whisper model
        model = whisper.load_model(model_size)
        
        # Transcribe audio
        result = model.transcribe(audio_path, verbose=False)
        
        # Write segments to SRT file
        with open(output_srt_path, "w", encoding="utf-8") as f:
            for i, segment in enumerate(result["segments"], start=1):
                start = format_timestamp(segment["start"])
                end = format_timestamp(segment["end"])
                text = segment["text"].strip()
                
                f.write(f"{i}\n")
                f.write(f"{start} --> {end}\n")
                f.write(f"{text}\n\n")
        
        return True
    except Exception as e:
        print(f"Error generating subtitles: {e}")
        return False
