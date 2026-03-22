import subprocess
import os
import logging
from config import FFMPEG_PATH

logger = logging.getLogger(__name__)

class VideoProcessor:
    """
    Handles video editing tasks using FFmpeg.
    """
    def __init__(self, ffmpeg_path: str = FFMPEG_PATH):
        self.ffmpeg_path = ffmpeg_path

    def stitch_audio_video(self, video_path: str, audio_path: str, output_path: str):
        """
        Combines a silent video with an audio track.
        """
        try:
            cmd = [
                self.ffmpeg_path, "-y",
                "-i", video_path,
                "-i", audio_path,
                "-c:v", "copy",
                "-c:a", "aac",
                "-map", "0:v:0",
                "-map", "1:a:0",
                "-shortest",
                output_path
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg stitch error: {e.stderr.decode()}")
            return False

    def apply_mode_layout(self, input_path: str, mode: str, output_path: str):
        """
        Applies aspect ratio and layout logic for different social media formats.
        """
        layouts = {
            "shorts": "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
            "square": "scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080",
            "long": "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2"
        }
        vf = layouts.get(mode, layouts["long"])

        try:
            cmd = [
                self.ffmpeg_path, "-y",
                "-i", input_path,
                "-vf", vf,
                "-c:a", "copy",
                output_path
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg layout error: {e.stderr.decode()}")
            return False

    def burn_subtitles(self, video_path: str, srt_path: str, output_path: str):
        """
        Burns SRT subtitles into the video file.
        """
        # Note: FFmpeg subtitles filter requires path to be escaped properly for Windows
        abs_srt = os.path.abspath(srt_path).replace("\\", "/")
        if ":" in abs_srt:
            # Handle drive letter (C:/ -> C\\:/)
            abs_srt = abs_srt.replace(":", "\\:")
        
        vf = f"subtitles='{abs_srt}'"
        
        try:
            cmd = [
                self.ffmpeg_path, "-y",
                "-i", video_path,
                "-vf", vf,
                "-c:a", "copy",
                output_path
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg subtitle burn error: {e.stderr.decode()}")
            return False

    def apply_watermark(self, video_path: str, watermark_text: str, output_path: str):
        """
        Adds a text watermark to the video.
        """
        vf = f"drawtext=text='{watermark_text}':x=10:y=10:fontsize=24:fontcolor=white@0.5"
        
        try:
            cmd = [
                self.ffmpeg_path, "-y",
                "-i", video_path,
                "-vf", vf,
                "-c:a", "copy",
                output_path
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg watermark error: {e.stderr.decode()}")
            return False

    def generate_thumbnail(self, video_path: str, output_path: str, time_offset: float = 1.0):
        """
        Generates a thumbnail image from the video at the given time offset.
        """
        try:
            cmd = [
                self.ffmpeg_path, "-y",
                "-ss", str(time_offset),
                "-i", video_path,
                "-vframes", "1",
                "-q:v", "2",
                output_path
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg thumbnail error: {e.stderr.decode()}")
            return False

    def stitch_videos(self, video_list: list[str], output_path: str):
        """
        Stitches multiple videos together.
        Ensures all videos have the same resolution and framerate before concat.
        """
        if not video_list:
            return False
            
        if len(video_list) == 1:
            import shutil
            shutil.copy(video_list[0], output_path)
            return True

        try:
            # Create a complex filter for concatenation with normalization
            # We scale all to 1920x1080 (landscape) or 1080x1920 (portrait) based on the first video
            # For simplicity, we'll use 1080x1920 as the target if it's a short, or 1920x1080 otherwise
            
            # Simple approach: use the 'concat' demuxer if they are identical, 
            # but usually they aren't. So we use filter_complex.
            
            inputs = []
            filter_str = ""
            for i, vid in enumerate(video_list):
                inputs.extend(["-i", vid])
                # Scale and pad to 1920x1080, force 30fps
                filter_str += f"[{i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v{i}];"
                filter_str += f"[{i}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a{i}];"
            
            for i in range(len(video_list)):
                filter_str += f"[v{i}][a{i}]"
            
            filter_str += f"concat=n={len(video_list)}:v=1:a=1[v][a]"
            
            cmd = [
                self.ffmpeg_path, "-y"
            ] + inputs + [
                "-filter_complex", filter_str,
                "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-preset", "fast", "-crf", "23",
                "-c:a", "aac", "-b:a", "128k",
                output_path
            ]
            
            subprocess.run(cmd, check=True, capture_output=True)
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg stitching error: {e.stderr.decode()}")
            return False

# Singleton instance
video_processor = VideoProcessor()
