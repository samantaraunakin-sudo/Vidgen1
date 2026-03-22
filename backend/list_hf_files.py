from huggingface_hub import list_repo_files

try:
    files = list_repo_files(repo_id="Winfredy/SadTalker")
    print("Files in repo:")
    for f in files:
        print(f" - {f}")
except Exception as e:
    print(f"Error listing files: {e}")
