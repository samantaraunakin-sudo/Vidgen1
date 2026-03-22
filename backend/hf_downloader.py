import os
from huggingface_hub import hf_hub_download

def main():
    repo_id = "Winfredy/SadTalker"
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ckpt_dir = os.path.join(base_dir, "checkpoints")
    gfpgan_dir = os.path.join(base_dir, "gfpgan", "weights")
    
    os.makedirs(ckpt_dir, exist_ok=True)
    os.makedirs(gfpgan_dir, exist_ok=True)
    
    files_to_download = [
        ("checkpoints/auido2exp.pth", ckpt_dir),
        ("checkpoints/auido2pose.pth", ckpt_dir),
        ("checkpoints/edget_v0.1.0-4a317929.pth", ckpt_dir),
        ("checkpoints/expression.mat", ckpt_dir),
        ("checkpoints/face_vid2vid_256_v0.0.pth", ckpt_dir),
        ("checkpoints/shape_predictor_68_face_landmarks.dat", ckpt_dir),
        ("checkpoints/mapping_00109-model.pth.tar", ckpt_dir),
        ("checkpoints/mapping_00229-model.pth.tar", ckpt_dir),
        ("gfpgan/weights/GFPGANv1.4.pth", gfpgan_dir),
    ]
    
    for filename, target_dir in files_to_download:
        print(f"Downloading {filename}...")
        try:
            hf_hub_download(
                repo_id=repo_id,
                filename=filename,
                local_dir=base_dir, # This will maintain the relative structure
                local_dir_use_symlinks=False
            )
        except Exception as e:
            print(f"Error downloading {filename}: {e}")

if __name__ == "__main__":
    main()
