import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from app.core.config import settings

UPLOAD_DIR = Path(settings.UPLOAD_DIR)

async def save_file(file: UploadFile, subfolder: str) -> str:
    """Save uploaded file and return relative path"""
    folder = UPLOAD_DIR / subfolder
    folder.mkdir(parents=True, exist_ok=True)
    
    ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{ext}"
    filepath = folder / filename
    
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)
    
    return f"/{settings.UPLOAD_DIR}/{subfolder}/{filename}"

async def delete_file(file_path: str):
    """Delete file from storage"""
    if file_path and file_path.startswith("/"):
        full_path = Path(file_path[1:])
        if full_path.exists():
            full_path.unlink()
