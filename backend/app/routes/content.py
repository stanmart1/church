from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.content import ContentUpdate, ServiceTimeCreate, ServiceTimeUpdate, ServiceTimeResponse
from app.services import content_service
from app.models.user import User

router = APIRouter(prefix="/content", tags=["Content"])

@router.get("/")
async def get_content(db: AsyncSession = Depends(get_db)):
    return await content_service.get_all_content(db)

@router.get("/service-times")
async def get_service_times(page: int = 1, limit: int = 10, db: AsyncSession = Depends(get_db)):
    return await content_service.get_service_times(db, page, limit)

@router.post("/service-times", response_model=ServiceTimeResponse, status_code=201)
async def create_service_time(data: ServiceTimeCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await content_service.create_service_time(db, data)

@router.put("/service-times/{service_time_id}", response_model=ServiceTimeResponse)
async def update_service_time(service_time_id: str, data: ServiceTimeUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await content_service.update_service_time(db, service_time_id, data)

@router.delete("/service-times/{service_time_id}")
async def delete_service_time(service_time_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await content_service.delete_service_time(db, service_time_id)
    return {"message": "Service time deleted"}

@router.get("/{key}")
async def get_content_by_key(key: str, db: AsyncSession = Depends(get_db)):
    return await content_service.get_content_by_key(db, key)

@router.put("/{key}")
async def update_content(key: str, data: ContentUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await content_service.update_content(db, key, data)
