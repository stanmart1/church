from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.giving import GivingCreate, GivingResponse
from app.services import giving_service

router = APIRouter(prefix="/giving", tags=["Giving"])

@router.get("/member/{member_id}")
async def get_member_giving(member_id: str, page: int = 1, limit: int = 10, db: AsyncSession = Depends(get_db)):
    return await giving_service.get_member_giving(db, member_id, page, limit)

@router.get("/member/{member_id}/summary")
async def get_member_giving_summary(member_id: str, db: AsyncSession = Depends(get_db)):
    return await giving_service.get_member_giving_summary(db, member_id)

@router.post("/", response_model=GivingResponse, status_code=201)
async def create_giving(data: GivingCreate, db: AsyncSession = Depends(get_db)):
    return await giving_service.create_giving(db, data)
