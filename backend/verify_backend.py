import requests
import os

BASE_URL = "http://localhost:8000/api"

def test_upload():
    print("Testing /upload-photo...", flush=True)
    photo_path = os.path.join("uploads", "d044591e-0bbc-44b4-8817-1f5e4152bdff_original.png")
    if not os.path.exists(photo_path):
        print(f"Error: Sample photo {photo_path} not found.", flush=True)
        return None
    
    with open(photo_path, "rb") as f:
        files = {"file": ("test.png", f, "image/png")}
        response = requests.post(f"{BASE_URL}/upload-photo", files=files)
    
    if response.status_code == 200:
        print("Upload Success!", flush=True)
        print(response.json(), flush=True)
        return response.json()["photoId"]
    else:
        print(f"Upload Failed: {response.text}", flush=True)
        return None

def test_audio():
    print("\nTesting /generate-audio...", flush=True)
    payload = {
        "script": "Hello, this is a test of the Vidgen audio generation system. I hope you are having a great day!",
        "voice": "p225",
        "rate": 1.0
    }
    response = requests.post(f"{BASE_URL}/generate-audio", json=payload)
    
    if response.status_code == 200:
        print("Audio Success!", flush=True)
        print(response.json(), flush=True)
        return response.json()["audioId"]
    else:
        print(f"Audio Failed: {response.text}", flush=True)
        return None

if __name__ == "__main__":
    photo_id = test_upload()
    if photo_id:
        audio_id = test_audio()
        if audio_id:
            print("\nPhase 2 Verification Complete!", flush=True)
