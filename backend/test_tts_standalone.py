import os
from TTS.api import TTS

try:
    print("Initializing TTS...")
    model_name = "tts_models/en/vctk/vits"
    tts = TTS(model_name)
    print("TTS Initialized!")
    
    print("Generating speech...")
    tts.tts_to_file(text="Hello world", speaker="p225", file_path="temp/test_tts.wav")
    print("Speech generated successfully!")
except Exception as e:
    print(f"TTS Failed: {e}")
