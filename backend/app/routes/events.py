from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.event import EventCreate, EventUpdate, EventResponse, EventRegistration
from app.services import event_service
from app.models.user import User

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("/")
async def get_events(
    page: int = 1,
    limit: int = 10,
    upcoming: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    return await event_service.get_events(db, page, limit, upcoming)

@router.get("/member/{member_id}")
async def get_member_events(member_id: str, db: AsyncSession = Depends(get_db)):
    return await event_service.get_member_events(db, member_id)

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str, db: AsyncSession = Depends(get_db)):
    return await event_service.get_event(db, event_id)

@router.post("/", response_model=EventResponse, status_code=201)
async def create_event(data: EventCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await event_service.create_event(db, data)

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(event_id: str, data: EventUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await event_service.update_event(db, event_id, data)

@router.delete("/{event_id}")
async def delete_event(event_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await event_service.delete_event(db, event_id)
    return {"message": "Event deleted"}

@router.post("/{event_id}/register")
async def register_for_event(event_id: str, data: EventRegistration, db: AsyncSession = Depends(get_db)):
    await event_service.register_for_event(db, event_id, data.member_id)
    return {"message": "Registered successfully"}

@router.delete("/{event_id}/register/{member_id}")
async def unregister_from_event(event_id: str, member_id: str, db: AsyncSession = Depends(get_db)):
    await event_service.unregister_from_event(db, event_id, member_id)
    return {"message": "Unregistered successfully"}

@router.get("/{event_id}/attendees")
async def get_event_attendees(event_id: str, db: AsyncSession = Depends(get_db)):
    return await event_service.get_event_attendees(db, event_id)

@router.put("/{event_id}/attendance/{member_id}")
async def mark_attendance(event_id: str, member_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await event_service.mark_attendance(db, event_id, member_id)
    return {"message": "Attendance marked"}
