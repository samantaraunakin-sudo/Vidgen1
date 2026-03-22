import os
from huggingface_hub import hf_hub_download

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ckpt_dir = os.path.join(base_dir, "checkpoints")
    gfpgan_dir = os.path.join(base_dir, "gfpgan", "weights")
    
    os.makedirs(ckpt_dir, exist_ok=True)
    os.makedirs(gfpgan_dir, exist_ok=True)
    
    # Try different repos if one fails
    repos = ["vinthony/SadTalker", "Winfredy/SadTalker"]
    
    files_to_download = [
        ("checkpoints/auido2exp.pth", ckpt_dir, "auido2exp.pth"),
        ("checkpoints/auido2pose.pth", ckpt_dir, "auido2pose.pth"),
        ("checkpoints/edget_v0.1.0-4a317929.pth", ckpt_dir, "edget_v0.1.0-4a317929.pth"),
        ("checkpoints/expression.mat", ckpt_dir, "expression.mat"),
        ("checkpoints/face_vid2vid_256_v0.0.pth", ckpt_dir, "face_vid2vid_256_v0.0.pth"),
        ("checkpoints/shape_predictor_68_face_landmarks.dat", ckpt_dir, "shape_predictor_68_face_landmarks.dat"),
        ("checkpoints/mapping_00109-model.pth.tar", ckpt_dir, "mapping_00109-model.pth.tar"),
        ("checkpoints/mapping_00229-model.pth.tar", ckpt_dir, "mapping_00229-model.pth.tar"),
        ("gfpgan/weights/GFPGANv1.4.pth", gfpgan_dir, "GFPGANv1.4.pth")
    ]
    
    for hf_path, target_dir, local_name in files_to_download:
        dest_path = os.path.join(target_dir, local_name)
        print(f"\n--- Processing {local_name} ---")
        
        success = False
        for repo in repos:
            print(f"Trying repo: {repo}...")
            try:
                # Resolve subpath if needed
                hf_hub_download(
                    repo_id=repo,
                    filename=hf_path,
                    local_dir=base_dir,
                    local_dir_use_symlinks=False,
                    resume_download=True
                )
                print(f"Successfully downloaded {local_name} from {repo}")
                success = True
                break
            except Exception as e:
                # Try without prefix if first attempt fails
                short_name = hf_path.split('/')[-1]
                print(f"Trying root file: {short_name} in {repo}...")
                try:
                    hf_hub_download(
                        repo_id=repo,
                        filename=short_name,
                        local_dir=target_dir,
                        local_dir_use_symlinks=False,
                        resume_download=True
                    )
                    print(f"Successfully downloaded {local_name} from {repo} (root)")
                    success = True
                    break
                except:
                    print(f"Failed to find {hf_path} in {repo}")
        
        if not success:
            print(f"!!! Error: Could not download {local_name} from any repo")

if __name__ == "__main__":
    main()
