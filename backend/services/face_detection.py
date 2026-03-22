"""
Face Detection Service — MediaPipe face detection + auto-crop.
"""

import cv2
import numpy as np
from PIL import Image


def detect_and_crop_face(input_path: str, output_path: str) -> tuple[bool, dict]:
    """
    Detect face in image and crop to centered portrait.
    Returns (face_detected, face_info).
    """
    try:
        import mediapipe as mp

        mp_face_detection = mp.solutions.face_detection

        # Read image
        image = cv2.imread(input_path)
        if image is None:
            return False, {"error": "Could not read image"}

        h, w, _ = image.shape
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Detect face
        with mp_face_detection.FaceDetection(
            model_selection=1, min_detection_confidence=0.5
        ) as face_detection:
            results = face_detection.process(rgb_image)

            if not results.detections:
                return False, {"error": "No face detected"}

            # Get the first (most confident) detection
            detection = results.detections[0]
            bbox = detection.location_data.relative_bounding_box

            # Convert relative bbox to absolute
            x = int(bbox.xmin * w)
            y = int(bbox.ymin * h)
            face_w = int(bbox.width * w)
            face_h = int(bbox.height * h)

            # Expand crop area for a portrait-style frame (add 60% padding)
            pad_x = int(face_w * 0.6)
            pad_y = int(face_h * 0.8)

            crop_x1 = max(0, x - pad_x)
            crop_y1 = max(0, y - pad_y)
            crop_x2 = min(w, x + face_w + pad_x)
            crop_y2 = min(h, y + face_h + int(pad_y * 0.5))

            # Crop and save
            cropped = image[crop_y1:crop_y2, crop_x1:crop_x2]

            # Resize to standard size for SadTalker (256x256 or maintain aspect)
            pil_image = Image.fromarray(cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB))
            # Keep aspect ratio, max 512px
            pil_image.thumbnail((512, 512), Image.Resampling.LANCZOS)
            pil_image.save(output_path, "JPEG", quality=95)

            face_info = {
                "confidence": round(detection.score[0], 3),
                "bbox": {"x": x, "y": y, "width": face_w, "height": face_h},
                "cropSize": {"width": pil_image.width, "height": pil_image.height},
            }

            return True, face_info

    except ImportError:
        # Fallback: just copy the image if MediaPipe is not installed
        pil_image = Image.open(input_path)
        pil_image.thumbnail((512, 512), Image.Resampling.LANCZOS)
        pil_image.save(output_path, "JPEG", quality=95)
        return True, {
            "confidence": 1.0,
            "note": "MediaPipe not installed, using original image",
            "cropSize": {"width": pil_image.width, "height": pil_image.height},
        }
