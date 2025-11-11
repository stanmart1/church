from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.prayer import PrayerCreate, PrayerUpdate, PrayerResponse
from app.services import prayer_service
from app.models.user import User

router = APIRouter(prefix="/prayers", tags=["Prayers"])

@router.get("/")
async def get_prayer_requests(status: Optional[str] = None, page: int = 1, limit: int = 10, db: AsyncSession = Depends(get_db)):
    return await prayer_service.get_prayer_requests(db, page, limit, status)

@router.get("/member/{member_id}")
async def get_member_prayer_requests(member_id: str, db: AsyncSession = Depends(get_db)):
    return await prayer_service.get_member_prayer_requests(db, member_id)

@router.get("/{prayer_id}", response_model=PrayerResponse)
async def get_prayer_request(prayer_id: str, db: AsyncSession = Depends(get_db)):
    return await prayer_service.get_prayer_request(db, prayer_id)

@router.post("/", response_model=PrayerResponse, status_code=201)
async def create_prayer_request(data: PrayerCreate, db: AsyncSession = Depends(get_db)):
    return await prayer_service.create_prayer_request(db, data)

@router.put("/{prayer_id}", response_model=PrayerResponse)
async def update_prayer_request(prayer_id: str, data: PrayerUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await prayer_service.update_prayer_request(db, prayer_id, data)

@router.delete("/{prayer_id}")
async def delete_prayer_request(prayer_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await prayer_service.delete_prayer_request(db, prayer_id)
    return {"message": "Prayer request deleted"}

@router.post("/{prayer_id}/pray")
async def pray_for_request(prayer_id: str, db: AsyncSession = Depends(get_db)):
    await prayer_service.increment_prayer_count(db, prayer_id)
    return {"message": "Prayer recorded"}
