"""
Photo upload and face detection route.
"""

import uuid
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.face_detection import detect_and_crop_face

router = APIRouter()

UPLOAD_DIR = "uploads"


@router.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...)):
    """
    Upload a portrait photo. Detects face, crops it, and returns preview.
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = [".jpg", ".jpeg", ".png", ".webp"]
    
    if file.content_type not in allowed_types and ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type ({file.content_type}). Please upload JPG, PNG, or WebP."
        )

    # Generate unique ID
    photo_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    original_path = os.path.join(UPLOAD_DIR, f"{photo_id}_original{ext}")
    cropped_path = os.path.join(UPLOAD_DIR, f"{photo_id}_cropped.jpg")

    # Save original
    content = await file.read()
    with open(original_path, "wb") as f:
        f.write(content)

    # Detect and crop face
    try:
        face_detected, face_info = detect_and_crop_face(original_path, cropped_path)
    except Exception as e:
        # Clean up on error
        if os.path.exists(original_path):
            os.remove(original_path)
        raise HTTPException(status_code=500, detail=f"Face detection failed: {str(e)}")

    if not face_detected:
        os.remove(original_path)
        raise HTTPException(
            status_code=400,
            detail="No face detected. Please upload a clear front-facing portrait photo."
        )

    return {
        "photoId": photo_id,
        "originalUrl": f"/uploads/{photo_id}_original{ext}",
        "croppedUrl": f"/uploads/{photo_id}_cropped.jpg",
        "faceDetected": True,
        "faceInfo": face_info,
    }


@router.post("/upload-voice")
async def upload_voice(file: UploadFile = File(...)):
    """
    Upload a voiceover audio file.
    """
    # Validate file type
    allowed_exts = [".wav", ".mp3", ".m4a", ".mp4", ".aac"]
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension ({ext}). Please upload WAV, MP3, or M4A."
        )

    # Generate unique ID
    voice_id = f"upload_{uuid.uuid4().hex}"
    audio_path = os.path.join("outputs", f"{voice_id}.wav")

    # Save file
    # We save as .wav because the pipeline expects .wav, 
    # but we should probably use ffmpeg to normalize it if it's mp3.
    content = await file.read()
    
    temp_path = os.path.join("temp", f"{voice_id}{ext}")
    with open(temp_path, "wb") as f:
        f.write(content)
        
    # Convert/Normalize to WAV using ffmpeg if needed, or just copy if already wav
    import subprocess
    from config import FFMPEG_PATH
    
    try:
        subprocess.run([
            FFMPEG_PATH, "-y", "-i", temp_path,
            "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
            audio_path
        ], check=True)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Audio processing failed: {str(e)}")

    if os.path.exists(temp_path):
        os.remove(temp_path)

    return {
        "id": voice_id,
        "url": f"/outputs/{voice_id}.wav"
    }
