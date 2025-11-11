from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.services import dashboard_service
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await dashboard_service.get_dashboard_stats(db)

@router.get("/activity")
async def get_recent_activity(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await dashboard_service.get_recent_activity(db)

@router.get("/member/{member_id}/stats")
async def get_member_stats(member_id: str, db: AsyncSession = Depends(get_db)):
    return await dashboard_service.get_member_stats(db, member_id)

@router.get("/member/{member_id}/recent-sermons")
async def get_member_recent_sermons(member_id: str, db: AsyncSession = Depends(get_db)):
    return await dashboard_service.get_member_recent_sermons(db, member_id)

@router.get("/member/{member_id}/upcoming-events")
async def get_member_upcoming_events(member_id: str, db: AsyncSession = Depends(get_db)):
    return await dashboard_service.get_member_upcoming_events(db, member_id)
