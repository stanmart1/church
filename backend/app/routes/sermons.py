from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.sermon import SermonCreate, SermonUpdate, SermonResponse
from app.services import sermon_service
from app.models.user import User

router = APIRouter(prefix="/sermons", tags=["Sermons"])

@router.get("/")
async def get_sermons(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    series_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    return await sermon_service.get_sermons(db, page, limit, search, series_id)

@router.get("/{sermon_id}", response_model=SermonResponse)
async def get_sermon(sermon_id: str, db: AsyncSession = Depends(get_db)):
    return await sermon_service.get_sermon(db, sermon_id)

@router.post("/", response_model=SermonResponse, status_code=201)
async def create_sermon(
    title: str = Form(...),
    speaker: str = Form(...),
    date: str = Form(...),
    description: Optional[str] = Form(None),
    series_id: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    thumbnail: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    data = SermonCreate(title=title, speaker=speaker, date=date, description=description, series_id=series_id)
    return await sermon_service.create_sermon(db, data, audio, video, thumbnail)

@router.put("/{sermon_id}", response_model=SermonResponse)
async def update_sermon(
    sermon_id: str,
    data: SermonUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await sermon_service.update_sermon(db, sermon_id, data)

@router.delete("/{sermon_id}")
async def delete_sermon(sermon_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await sermon_service.delete_sermon(db, sermon_id)
    return {"message": "Sermon deleted"}

@router.post("/{sermon_id}/play")
async def increment_plays(sermon_id: str, db: AsyncSession = Depends(get_db)):
    await sermon_service.increment_plays(db, sermon_id)
    return {"message": "Play count incremented"}

@router.post("/{sermon_id}/download")
async def increment_downloads(sermon_id: str, db: AsyncSession = Depends(get_db)):
    await sermon_service.increment_downloads(db, sermon_id)
    return {"message": "Download count incremented"}
