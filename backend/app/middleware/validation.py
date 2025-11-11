import uuid
from fastapi import HTTPException
from app.core.constants import HTTPStatus

def validate_uuid(value: str) -> str:
    try:
        uuid.UUID(value)
        return value
    except ValueError:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail={"error": "Invalid UUID format"}
        )

def validate_file_size(file_size: int, max_size: int = 10485760) -> bool:
    if file_size > max_size:
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST,
            detail={"error": f"File size exceeds maximum of {max_size} bytes"}
        )
    return True
