from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse

from pydantic import BaseModel
import os
from services.job_manager import job_manager
from services.sadtalker_service import SadTalkerService
from config import UPLOAD_DIR, OUTPUT_DIR, CHECKPOINT_DIR
from services.subtitle_service import generate_subtitles
from services.video_processor import video_processor


router = APIRouter()

# Initialize SadTalker service
sadtalker = SadTalkerService(CHECKPOINT_DIR)

class GenerateVideoRequest(BaseModel):
    photoPath: str
    audioId: str
    mode: str = "shorts" # shorts, long, square
    background: str = "dark_studio"
    subtitles: bool = True
    subtitleStyle: str = "youtube"
    chapters: bool = False
    introOutro: bool = False
    lowerThird: dict | None = None
    layoutOption: str = "A"
    brandColor: str = "#7c6ffa"
    watermarkUrl: str = ""
    introVideoId: str | None = None
    outroVideoId: str | None = None

@router.post("/generate-video")
async def generate_video(request: GenerateVideoRequest, background_tasks: BackgroundTasks):
    # Validate files exist
    photo_path = os.path.join(UPLOAD_DIR, f"{request.photoPath}_cropped.jpg")
    audio_path = os.path.join(OUTPUT_DIR, f"{request.audioId}.wav") # TTS outputs are in OUTPUT_DIR
    
    if not os.path.exists(photo_path):
        # Fallback to original if cropped doesn't exist just in case
        photo_path = os.path.join(UPLOAD_DIR, request.photoPath)
        if not os.path.exists(photo_path):
            raise HTTPException(status_code=404, detail="Photo file not found")
            
    if not os.path.exists(audio_path):
        # Fallback in case audioId has extension already
        audio_path = os.path.join(OUTPUT_DIR, request.audioId)
        if not os.path.exists(audio_path):
            raise HTTPException(status_code=404, detail="Audio file not found")
    
    # Create job
    job_id = job_manager.create_job("video_generation")
    output_filename = f"video_{job_id}.mp4"
    output_path = os.path.join(OUTPUT_DIR, output_filename)
    
    # Add generation to background tasks
    background_tasks.add_task(
        process_video_job,
        photo_path=photo_path,
        audio_path=audio_path,
        mode=request.mode,
        job_id=job_id,
        output_path=output_path,
        intro_id=request.introVideoId,
        outro_id=request.outroVideoId
    )
    
    return {"jobId": job_id, "status": "pending"}

async def process_video_job(photo_path: str, audio_path: str, mode: str, job_id: str, output_path: str, intro_id: str = None, outro_id: str = None):
    """
    Background task to handle the full video generation pipeline:
    1. SadTalker Generation (Silent Video)
    2. Subtitle Generation (Whisper)
    3. Stitch Audio + Video
    4. Apply Mode Layout (Crop/Scale)
    5. Burn Subtitles
    """
    try:
        job_manager.update_job(job_id, {"status": "processing", "progress": 10})
        
        # 1. Generate Silent Video (SadTalker)
        temp_video = os.path.join(OUTPUT_DIR, f"temp_silent_{job_id}.mp4")
        success = await sadtalker.generate_video(
            photo_path=photo_path,
            audio_path=audio_path,
            output_path=temp_video,
            job_id=job_id,
            job_manager=None # We manage status here
        )
        
        if not success:
            job_manager.update_job(job_id, {"status": "failed", "error": "SadTalker generation failed"})
            return

        job_manager.update_job(job_id, {"progress": 40})

        # 2. Generate Subtitles (Whisper)
        srt_path = os.path.join(OUTPUT_DIR, f"subs_{job_id}.srt")
        if not generate_subtitles(audio_path, srt_path):
            # Non-fatal, just continue without subs if it fails
            srt_path = None
        
        job_manager.update_job(job_id, {"progress": 60})

        # 3. Stitch Audio + Video
        stitched_video = os.path.join(OUTPUT_DIR, f"temp_stitched_{job_id}.mp4")
        if not video_processor.stitch_audio_video(temp_video, audio_path, stitched_video):
            job_manager.update_job(job_id, {"status": "failed", "error": "Audio stitching failed"})
            return

        job_manager.update_job(job_id, {"progress": 80})

        # 4. Apply Mode Layout
        layout_video = os.path.join(OUTPUT_DIR, f"temp_layout_{job_id}.mp4")
        if not video_processor.apply_mode_layout(stitched_video, mode, layout_video):
            layout_video = stitched_video # Fallback to stitched if layout fails

        # 5. Burn Subtitles
        subtitled_video = os.path.join(OUTPUT_DIR, f"temp_subbed_{job_id}.mp4")
        if srt_path and os.path.exists(srt_path):
            if not video_processor.burn_subtitles(layout_video, srt_path, subtitled_video):
                subtitled_video = layout_video
        else:
            subtitled_video = layout_video

        # 6. Apply Watermark
        watermarked_video = os.path.join(OUTPUT_DIR, f"temp_watermarked_{job_id}.mp4")
        if not video_processor.apply_watermark(subtitled_video, "Vidgen AI", watermarked_video):
            watermarked_video = subtitled_video

        # 7. Final Output
        import shutil
        shutil.copy(watermarked_video, output_path)

        # 8. Generate Thumbnail
        thumb_path = output_path.replace(".mp4", ".jpg")
        video_processor.generate_thumbnail(output_path, thumb_path)

        # 9. Handle Intro/Outro Stitching
        if intro_id or outro_id:
            vids_to_stitch = []
            if intro_id:
                intro_path = os.path.join(UPLOAD_DIR, os.path.basename(intro_id))
                if os.path.exists(intro_path): vids_to_stitch.append(intro_path)
            
            vids_to_stitch.append(output_path) # The main generated video
            
            if outro_id:
                outro_path = os.path.join(UPLOAD_DIR, os.path.basename(outro_id))
                if os.path.exists(outro_path): vids_to_stitch.append(outro_path)
            
            if len(vids_to_stitch) > 1:
                stitched_final = os.path.join(OUTPUT_DIR, f"final_stitched_{job_id}.mp4")
                if video_processor.stitch_videos(vids_to_stitch, stitched_final):
                    # Replace the output_path with the stitched one
                    import shutil
                    shutil.move(stitched_final, output_path)

        # Cleanup temp files
        for f in [temp_video, stitched_video, layout_video, subtitled_video, watermarked_video, srt_path]:
            if f and os.path.exists(f):
                try: os.remove(f)
                except: pass

        job_manager.update_job(job_id, {
            "status": "completed", 
            "progress": 100, 
            "videoUrl": f"/outputs/{os.path.basename(output_path)}",
            "thumbnailUrl": f"/outputs/{os.path.basename(thumb_path)}"
        })
        
    except Exception as e:
        job_manager.update_job(job_id, {"status": "failed", "error": str(e)})


@router.get("/job-status/{job_id}")
async def get_job_status(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/download/{job_id}")
async def download_video(job_id: str):
    output_filename = f"video_{job_id}.mp4"
    path = os.path.join(OUTPUT_DIR, output_filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(path, filename=output_filename, media_type="video/mp4")

@router.get("/download/{job_id}/srt")
async def download_srt(job_id: str):
    srt_filename = f"subs_{job_id}.srt"
    path = os.path.join(OUTPUT_DIR, srt_filename)
    if not os.path.exists(path):
        # The subs might be deleted if generation is finished, or might not exist
        raise HTTPException(status_code=404, detail="Subtitles not found")
    return FileResponse(path, filename=srt_filename, media_type="text/plain")

@router.get("/download/{job_id}/thumbnail")
async def download_thumbnail(job_id: str):
    thumb_filename = f"video_{job_id}.jpg"
    path = os.path.join(OUTPUT_DIR, thumb_filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    return FileResponse(path, filename=thumb_filename, media_type="image/jpeg")

