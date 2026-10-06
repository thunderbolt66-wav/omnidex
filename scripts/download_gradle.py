import os
import urllib.request
import zipfile

MIRROR_URL = "https://mirrors.cloud.tencent.com/gradle/gradle-8.10.2-bin.zip"
TARGET_DIR = r"C:\Users\ojasp\.gradle\wrapper\dists\gradle-8.10.2-bin\a04bxjujx95o3nb99gddekhwo"
ZIP_FILE = os.path.join(TARGET_DIR, "gradle-8.10.2-bin.zip")

def main():
    os.makedirs(TARGET_DIR, exist_ok=True)
    part_file = os.path.join(TARGET_DIR, "gradle-8.10.2-bin.zip.part")
    if os.path.exists(part_file):
        os.remove(part_file)

    print("Downloading Gradle 8.10.2 from high-speed mirror...")
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(MIRROR_URL, headers=headers)
    
    with urllib.request.urlopen(req) as resp, open(ZIP_FILE, "wb") as out:
        total = int(resp.headers.get("Content-Length", 0))
        downloaded = 0
        chunk_size = 1024 * 1024
        
        while True:
            chunk = resp.read(chunk_size)
            if not chunk:
                break
            out.write(chunk)
            downloaded += len(chunk)
            if total > 0:
                percent = int(downloaded / total * 100)
                if percent % 20 == 0:
                    print(f"Downloaded {percent}% ({downloaded // (1024*1024)} MB / {total // (1024*1024)} MB)")

    print("Download finished. Unzipping Gradle...")
    with zipfile.ZipFile(ZIP_FILE, 'r') as z:
        z.extractall(TARGET_DIR)

    # Touch the completion flag
    open(os.path.join(TARGET_DIR, "gradle-8.10.2-bin.zip.ok"), "w").close()
    print("Gradle 8.10.2 is ready in cache!")

if __name__ == "__main__":
    main()
