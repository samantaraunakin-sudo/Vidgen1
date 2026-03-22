"""
SEO route — Generate YouTube descriptions, titles, tags, and thumbnails.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class ThumbnailRequest(BaseModel):
    photoId: str
    title: str
    brandColor: str = "#7c6ffa"


class DescriptionRequest(BaseModel):
    script: str
    chapters: Optional[str] = None


@router.post("/generate-thumbnail")
async def generate_thumbnail(request: ThumbnailRequest):
    """
    Generate a YouTube thumbnail from the uploaded face photo.
    Uses FFmpeg to composite face + title text + brand colors.
    """
    import os
    from services.thumbnail_service import create_thumbnail

    photo_path = f"uploads/{request.photoId}_cropped.jpg"
    if not os.path.exists(photo_path):
        raise HTTPException(status_code=404, detail="Photo not found.")

    try:
        thumbnail_path = create_thumbnail(
            photo_path=photo_path,
            title=request.title,
            brand_color=request.brandColor,
            output_dir="outputs",
        )
        return {"thumbnailUrl": f"/{thumbnail_path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Thumbnail generation failed: {str(e)}")


@router.post("/generate-description")
async def generate_description(request: DescriptionRequest):
    """
    Generate YouTube SEO package from the script.
    Returns description, titles, and tags.
    """
    from services.seo_service import generate_youtube_seo

    try:
        seo = generate_youtube_seo(
            script=request.script,
            chapters=request.chapters,
        )
        return seo
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SEO generation failed: {str(e)}")
