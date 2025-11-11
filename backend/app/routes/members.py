from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.member import MemberCreate, MemberUpdate, MemberResponse
from app.services import member_service
from app.models.user import User

router = APIRouter(prefix="/members", tags=["Members"])

@router.get("/")
async def get_members(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await member_service.get_members(db, page, limit, search)

@router.get("/export")
async def export_members(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await member_service.export_members(db)

@router.get("/{member_id}", response_model=MemberResponse)
async def get_member(member_id: str, db: AsyncSession = Depends(get_db)):
    return await member_service.get_member(db, member_id)

@router.post("/", response_model=MemberResponse, status_code=201)
async def create_member(data: MemberCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await member_service.create_member(db, data)

@router.put("/{member_id}", response_model=MemberResponse)
async def update_member(member_id: str, data: MemberUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await member_service.update_member(db, member_id, data)

@router.delete("/{member_id}")
async def delete_member(member_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await member_service.delete_member(db, member_id)
    return {"message": "Member deleted"}
