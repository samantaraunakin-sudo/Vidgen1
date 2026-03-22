"""
TTS Service — Text-to-Speech via Coqui TTS with chunked processing.
"""

import os
import re
import subprocess
import wave
from config import FFMPEG_PATH


def split_into_sentences(text: str) -> list[str]:
    """Split text into sentences for chunked TTS processing."""
    # Split on sentence-ending punctuation
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    # Filter empty strings
    return [s.strip() for s in sentences if s.strip()]


def get_audio_duration(file_path: str) -> float:
    """Get duration of a WAV file in seconds."""
    try:
        with wave.open(file_path, 'r') as wav_file:
            frames = wav_file.getnframes()
            rate = wav_file.getframerate()
            return round(frames / float(rate), 2)
    except Exception:
        return 0.0


def generate_speech(
    text: str,
    output_path: str,
    speaker: str = "p225",
    language: str = "en",
    speed: float = 1.0,
    is_long: bool = False,
) -> int:
    """
    Generate speech audio from text using Coqui TTS.
    For long texts (500+ words), processes in chunks to avoid memory issues.
    Returns the number of chunks processed.
    """
    try:
        from TTS.api import TTS

        clone_mode = False
        speaker_wav = None

        if speaker.startswith("upload_"):
            clone_mode = True
            speaker_wav = os.path.join("outputs", f"{speaker}.wav")
            # Download/Load XTTSv2 for Voice Cloning
            model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
        elif language == "hi":
            model_name = "tts_models/hi/custom/vits"
        else:
            model_name = "tts_models/en/vctk/vits"

        tts = TTS(model_name)

        if not is_long:
            # Short text — single call
            if clone_mode:
                tts.tts_to_file(
                    text=text,
                    speaker_wav=speaker_wav,
                    language=language,
                    file_path=output_path,
                )
            else:
                tts.tts_to_file(
                    text=text,
                    speaker=speaker,
                    file_path=output_path,
                )
            return 1
        else:
            # Long text — process sentence by sentence and concatenate
            sentences = split_into_sentences(text)
            temp_dir = "temp"
            os.makedirs(temp_dir, exist_ok=True)
            chunks = []

            for i, sentence in enumerate(sentences):
                chunk_path = os.path.join(temp_dir, f"tts_chunk_{i}.wav")
                if clone_mode:
                    tts.tts_to_file(
                        text=sentence,
                        speaker_wav=speaker_wav,
                        language=language,
                        file_path=chunk_path,
                    )
                else:
                    tts.tts_to_file(
                        text=sentence,
                        speaker=speaker,
                        file_path=chunk_path,
                    )
                chunks.append(chunk_path)

            # Concatenate all chunks using FFmpeg
            _concatenate_audio(chunks, output_path)

            # Cleanup temp chunks
            for chunk in chunks:
                if os.path.exists(chunk):
                    os.remove(chunk)

            return len(chunks)

    except ImportError:
        # Fallback: generate a placeholder silent audio file
        _generate_silent_audio(output_path, duration=5.0)
        return 1


def _concatenate_audio(chunks: list[str], output_path: str):
    """Concatenate multiple audio files using FFmpeg."""
    concat_list = os.path.join("temp", "concat_list.txt")
    with open(concat_list, "w") as f:
        for chunk in chunks:
            f.write(f"file '{os.path.abspath(chunk)}'\n")

    subprocess.run(
        [
            FFMPEG_PATH, "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_list,
            "-c", "copy",
            output_path,
        ],
        capture_output=True,
        check=True,
    )

    if os.path.exists(concat_list):
        os.remove(concat_list)


def _generate_silent_audio(output_path: str, duration: float = 5.0):
    """Generate a silent WAV file as a placeholder."""
    import struct

    sample_rate = 22050
    num_samples = int(sample_rate * duration)

    with wave.open(output_path, "w") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        for _ in range(num_samples):
            wav_file.writeframesraw(struct.pack("<h", 0))
