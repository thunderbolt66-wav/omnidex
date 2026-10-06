import os
import urllib.request
import zipfile
import sys

JDK_URL = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.20.1%2B1/OpenJDK17U-jdk_x64_windows_hotspot_17.0.20.1_1.zip"
TARGET_DIR = r"C:\Users\ojasp\.jdk17"
ZIP_PATH = r"C:\Users\ojasp\.jdk17.zip"

def download():
    if os.path.exists(TARGET_DIR) and os.path.exists(os.path.join(TARGET_DIR, "bin", "java.exe")):
        print("JDK already exists at", TARGET_DIR)
        return

    print("Downloading JDK 17...")
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(JDK_URL, headers=headers)
    
    with urllib.request.urlopen(req) as resp, open(ZIP_PATH, "wb") as out_file:
        total = int(resp.headers.get("Content-Length", 0))
        downloaded = 0
        chunk_size = 1024 * 1024 # 1MB chunks
        
        while True:
            chunk = resp.read(chunk_size)
            if not chunk:
                break
            out_file.write(chunk)
            downloaded += len(chunk)
            if total > 0:
                percent = int(downloaded / total * 100)
                if percent % 10 == 0:
                    print(f"Downloaded {percent}% ({downloaded // (1024*1024)} MB / {total // (1024*1024)} MB)")
    
    print("Download complete. Extracting to", TARGET_DIR)
    os.makedirs(TARGET_DIR, exist_ok=True)
    
    with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
        # Find root folder in zip
        first_dir = zip_ref.namelist()[0].split('/')[0]
        zip_ref.extractall(r"C:\Users\ojasp")
        
        extracted_root = os.path.join(r"C:\Users\ojasp", first_dir)
        if os.path.exists(TARGET_DIR):
            import shutil
            shutil.rmtree(TARGET_DIR, ignore_errors=True)
        os.rename(extracted_root, TARGET_DIR)

    if os.path.exists(ZIP_PATH):
        os.remove(ZIP_PATH)
        
    print("JDK 17 installed successfully at", TARGET_DIR)

if __name__ == "__main__":
    download()
