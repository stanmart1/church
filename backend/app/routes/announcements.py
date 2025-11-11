from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse
from app.services import announcement_service
from app.models.user import User

router = APIRouter(prefix="/announcements", tags=["Announcements"])

@router.get("")
async def get_announcements(page: int = 1, limit: int = 10, db: AsyncSession = Depends(get_db)):
    return await announcement_service.get_announcements(db, page, limit)

@router.get("/{announcement_id}", response_model=AnnouncementResponse)
async def get_announcement(announcement_id: str, db: AsyncSession = Depends(get_db)):
    return await announcement_service.get_announcement(db, announcement_id)

@router.post("/", response_model=AnnouncementResponse, status_code=201)
async def create_announcement(data: AnnouncementCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await announcement_service.create_announcement(db, data)

@router.put("/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(announcement_id: str, data: AnnouncementUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await announcement_service.update_announcement(db, announcement_id, data)

@router.delete("/{announcement_id}")
async def delete_announcement(announcement_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await announcement_service.delete_announcement(db, announcement_id)
    return {"message": "Announcement deleted"}

@router.post("/{announcement_id}/view")
async def increment_views(announcement_id: str, db: AsyncSession = Depends(get_db)):
    await announcement_service.increment_views(db, announcement_id)
    return {"message": "View count incremented"}
