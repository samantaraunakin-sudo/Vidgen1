import os
from huggingface_hub import hf_hub_download

def main():
    repo_id = "vinthony/SadTalker"
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ckpt_dir = os.path.join(base_dir, "checkpoints")
    gfpgan_dir = os.path.join(base_dir, "gfpgan", "weights")
    
    os.makedirs(ckpt_dir, exist_ok=True)
    os.makedirs(gfpgan_dir, exist_ok=True)
    
    # Official filenames in vinthony/SadTalker
    files_to_download = [
        ("auido2exp_00300-model.pth", ckpt_dir, "auido2exp.pth"),
        ("auido2pose_00140-model.pth", ckpt_dir, "auido2pose.pth"),
        ("mapping_00109-model.pth.tar", ckpt_dir, "mapping_00109-model.pth.tar"),
        ("mapping_00229-model.pth.tar", ckpt_dir, "mapping_00229-model.pth.tar"),
        ("shape_predictor_68_face_landmarks.dat", ckpt_dir, "shape_predictor_68_face_landmarks.dat"),
        ("facevid2vid_00189-model.pth.tar", ckpt_dir, "face_vid2vid_256_v0.0.pth"),
    ]
    
    # Also need GFPGAN from a different source usually, but let's check if it's there
    # Or just use the one from GitHub if possible.
    
    # We'll use hf_hub_download for each
    for hf_name, target_dir, local_name in files_to_download:
        print(f"Downloading {local_name} (from {hf_name})...")
        try:
            hf_hub_download(
                repo_id=repo_id,
                filename=hf_name,
                local_dir=target_dir,
                local_dir_use_symlinks=False
            )
            # Rename if needed
            downloaded_path = os.path.join(target_dir, hf_name)
            final_path = os.path.join(target_dir, local_name)
            if downloaded_path != final_path:
                if os.path.exists(final_path):
                    os.remove(final_path)
                os.rename(downloaded_path, final_path)
        except Exception as e:
            print(f"Error downloading {local_name}: {e}")

    # GFPGAN
    try:
        print("Downloading GFPGANv1.4.pth...")
        hf_hub_download(
            repo_id="public-data/GFPGAN",
            filename="GFPGANv1.4.pth",
            local_dir=gfpgan_dir,
            local_dir_use_symlinks=False
        )
    except Exception as e:
        print(f"GFPGAN download error: {e}")

if __name__ == "__main__":
    main()
