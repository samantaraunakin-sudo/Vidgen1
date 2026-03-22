import requests
import json
import os

BASE_URL = "http://localhost:8000/api"
IMAGE_PATH = r"C:\Users\paulr\.gemini\antigravity\brain\ad552837-2bb6-4fb0-94fb-f95194f2cdff\sample_portrait_for_test_1774170669316.png"

def test_upload():
    print("\n--- Testing /upload-photo ---")
    if not os.path.exists(IMAGE_PATH):
        print(f"Error: Image not found at {IMAGE_PATH}")
        return None
    
    with open(IMAGE_PATH, 'rb') as f:
        files = {'file': (os.path.basename(IMAGE_PATH), f, 'image/png')}
        response = requests.post(f"{BASE_URL}/upload-photo", files=files)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.json().get("photoId") if response.status_code == 200 else None

def test_audio():
    print("\n--- Testing /generate-audio ---")
    payload = {
        "script": "Hello. This is a test of the Vidgen AI voice generation system.",
        "voice": "p225",
        "language": "en"
    }
    response = requests.post(f"{BASE_URL}/generate-audio", json=payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    photo_id = test_upload()
    test_audio()
