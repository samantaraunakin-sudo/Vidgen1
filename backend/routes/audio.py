"""
Audio generation route — Text-to-Speech via Coqui TTS.
"""

import uuid
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.tts_service import generate_speech, get_audio_duration

router = APIRouter()

OUTPUT_DIR = "outputs"


class AudioRequest(BaseModel):
    script: str
    voice: str = "p225"  # Coqui VCTK speaker ID
    rate: float = 1.0
    pitch: float = 1.0
    language: str = "en"
    mode: str = "short"  # short | long | square


@router.post("/generate-audio")
async def generate_audio(request: AudioRequest):
    """
    Convert script text to speech audio using Coqui TTS.
    For long scripts (500+ words), auto-chunks and processes in parts.
    """
    if not request.script.strip():
        raise HTTPException(status_code=400, detail="Script cannot be empty.")

    audio_id = str(uuid.uuid4())
    output_path = os.path.join(OUTPUT_DIR, f"{audio_id}.wav")

    try:
        word_count = len(request.script.split())
        is_long = word_count > 500

        chunk_count = generate_speech(
            text=request.script,
            output_path=output_path,
            speaker=request.voice,
            language=request.language,
            speed=request.rate,
            is_long=is_long,
        )

        duration = get_audio_duration(output_path)

        return {
            "audioId": audio_id,
            "audioUrl": f"/outputs/{audio_id}.wav",
            "duration": duration,
            "wordCount": word_count,
            "chunkCount": chunk_count,
            "isLong": is_long,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")
