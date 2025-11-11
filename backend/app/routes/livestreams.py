from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.livestream import LivestreamCreate, LivestreamUpdate, LivestreamResponse
from app.services import livestream_service
from app.models.user import User

router = APIRouter(prefix="/livestreams", tags=["Livestreams"])

@router.get("/current")
async def get_current_livestream(db: AsyncSession = Depends(get_db)):
    return await livestream_service.get_current_livestream(db)

@router.post("/", response_model=LivestreamResponse, status_code=201)
async def create_livestream(data: LivestreamCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await livestream_service.create_livestream(db, data)

@router.put("/{livestream_id}", response_model=LivestreamResponse)
async def update_livestream(livestream_id: str, data: LivestreamUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await livestream_service.update_livestream(db, livestream_id, data)

@router.post("/{livestream_id}/end")
async def end_livestream(livestream_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await livestream_service.stop_livestream(db, livestream_id)
    return {"message": "Livestream ended"}

@router.get("/{livestream_id}/chat")
async def get_chat_messages(livestream_id: str, limit: int = 50, db: AsyncSession = Depends(get_db)):
    return await livestream_service.get_chat_messages(db, livestream_id, limit)
