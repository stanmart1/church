from fastapi import UploadFile, HTTPException
from app.core.constants import HTTPStatus, MAX_FILE_SIZE

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav"]
ALLOWED_VIDEO_TYPES = ["video/mp4", "video/mpeg", "video/quicktime"]

async def validate_image_file(file: UploadFile) -> UploadFile:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail={"error": f"Invalid image type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"}
        )
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail={"error": f"File size exceeds {MAX_FILE_SIZE} bytes"}
        )
    
    await file.seek(0)
    return file

async def validate_audio_file(file: UploadFile) -> UploadFile:
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail={"error": f"Invalid audio type. Allowed: {', '.join(ALLOWED_AUDIO_TYPES)}"}
        )
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE * 10:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail={"error": f"File size exceeds {MAX_FILE_SIZE * 10} bytes"}
        )
    
    await file.seek(0)
    return file

async def validate_video_file(file: UploadFile) -> UploadFile:
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail={"error": f"Invalid video type. Allowed: {', '.join(ALLOWED_VIDEO_TYPES)}"}
        )
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE * 50:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail={"error": f"File size exceeds {MAX_FILE_SIZE * 50} bytes"}
        )
    
    await file.seek(0)
    return file
