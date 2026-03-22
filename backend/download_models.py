import os
import requests
from tqdm import tqdm

def download_file(url, session, dest_path):
    if os.path.exists(dest_path):
        print(f"Skipping {os.path.basename(dest_path)} (already exists)")
        return
    
    print(f"Downloading {os.path.basename(dest_path)}...")
    response = session.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(dest_path, 'wb') as file, tqdm(
        desc=os.path.basename(dest_path),
        total=total_size,
        unit='iB',
        unit_scale=True,
        unit_divisor=1024,
    ) as bar:
        for data in response.iter_content(chunk_size=1024):
            size = file.write(data)
            bar.update(size)

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ckpt_dir = os.path.join(base_dir, "checkpoints")
    gfpgan_dir = os.path.join(base_dir, "gfpgan", "weights")
    
    os.makedirs(ckpt_dir, exist_ok=True)
    os.makedirs(gfpgan_dir, exist_ok=True)
    
    # Official SadTalker Hugging Face URLs
    urls = {
        os.path.join(ckpt_dir, "auido2exp.pth"): "https://huggingface.co/Winfredy/SadTalker/resolve/main/checkpoints/auido2exp.pth",
        os.path.join(ckpt_dir, "auido2pose.pth"): "https://huggingface.co/Winfredy/SadTalker/resolve/main/checkpoints/auido2pose.pth",
        os.path.join(ckpt_dir, "edget_v0.1.0-4a317929.pth"): "https://huggingface.co/Winfredy/SadTalker/resolve/main/checkpoints/edget_v0.1.0-4a317929.pth",
        os.path.join(ckpt_dir, "expression.mat"): "https://huggingface.co/Winfredy/SadTalker/resolve/main/checkpoints/expression.mat",
        os.path.join(ckpt_dir, "face_vid2vid_256_v0.0.pth"): "https://huggingface.co/Winfredy/SadTalker/resolve/main/checkpoints/face_vid2vid_256_v0.0.pth",
        os.path.join(ckpt_dir, "shape_predictor_68_face_landmarks.dat"): "https://huggingface.co/Winfredy/SadTalker/resolve/main/checkpoints/shape_predictor_68_face_landmarks.dat",
        os.path.join(ckpt_dir, "mapping_00109-model.pth.tar"): "https://huggingface.co/Winfredy/SadTalker/resolve/main/checkpoints/mapping_00109-model.pth.tar",
        os.path.join(ckpt_dir, "mapping_00229-model.pth.tar"): "https://huggingface.co/Winfredy/SadTalker/resolve/main/checkpoints/mapping_00229-model.pth.tar",
        os.path.join(gfpgan_dir, "GFPGANv1.4.pth"): "https://huggingface.co/Winfredy/SadTalker/resolve/main/gfpgan/weights/GFPGANv1.4.pth",
    }
    
    session = requests.Session()
    for dest, url in urls.items():
        try:
            download_file(url, session, dest)
        except Exception as e:
            print(f"Error downloading {url}: {e}")

if __name__ == "__main__":
    main()
