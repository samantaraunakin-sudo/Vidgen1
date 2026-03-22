import cv2
import os

def test_face():
    try:
        print("Importing MediaPipe...")
        import mediapipe as mp
        print("MediaPipe Imported!")
        
        photo_path = os.path.join("uploads", "d044591e-0bbc-44b4-8817-1f5e4152bdff_original.png")
        if not os.path.exists(photo_path):
            print(f"Error: {photo_path} not found.")
            return

        print(f"Reading image {photo_path}...")
        image = cv2.imread(photo_path)
        if image is None:
            print("Error: Could not read image.")
            return

        print("Initializing Face Detection...")
        mp_face_detection = mp.solutions.face_detection
        with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5) as face_detection:
            print("Processing Image...")
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = face_detection.process(rgb_image)
            print("Processing Complete!")
            
            if results.detections:
                print(f"Face Detected! Confidence: {results.detections[0].score[0]}")
            else:
                print("No Face Detected.")
                
    except Exception as e:
        print(f"Face Detection Failed: {e}")

if __name__ == "__main__":
    test_face()
