"""
Download route — serve generated files.
"""

import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from services.job_manager import JobManager

router = APIRouter()
job_manager = JobManager()


@router.get("/download/{job_id}")
async def download_video(job_id: str):
    """
    Download the final MP4 video for a completed job.
    """
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    if job.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Video is still processing.")

    video_path = job.get("videoUrl", "")
    if not video_path or not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video file not found.")

    return FileResponse(
        path=video_path,
        media_type="video/mp4",
        filename=f"vidgen_{job_id[:8]}.mp4",
    )


@router.get("/download/{job_id}/srt")
async def download_srt(job_id: str):
    """Download the SRT subtitle file."""
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    srt_path = job.get("srtUrl", "")
    if not srt_path or not os.path.exists(srt_path):
        raise HTTPException(status_code=404, detail="SRT file not found.")

    return FileResponse(
        path=srt_path,
        media_type="text/srt",
        filename=f"vidgen_{job_id[:8]}.srt",
    )


@router.get("/download/{job_id}/thumbnail")
async def download_thumbnail(job_id: str):
    """Download the thumbnail image."""
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    thumb_path = job.get("thumbnailUrl", "")
    if not thumb_path or not os.path.exists(thumb_path):
        raise HTTPException(status_code=404, detail="Thumbnail not found.")

    return FileResponse(
        path=thumb_path,
        media_type="image/jpeg",
        filename=f"vidgen_{job_id[:8]}_thumb.jpg",
    )
