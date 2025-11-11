from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.event import Event, EventRegistration
from app.schemas.event import EventCreate, EventUpdate
from app.utils.pagination import format_pagination_response
from app.core.exceptions import NotFoundException, ConflictException

async def get_events(db: AsyncSession, page: int, limit: int, status: str = None):
    offset = (page - 1) * limit
    query = select(Event)
    
    if status:
        query = query.where(Event.status == status)
    
    query = query.order_by(Event.date.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    events = result.scalars().all()
    
    count_query = select(func.count(Event.id))
    if status:
        count_query = count_query.where(Event.status == status)
    total = await db.scalar(count_query)
    
    return format_pagination_response(events, total, page, limit)

async def get_event(db: AsyncSession, event_id: str):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise NotFoundException("Event not found")
    return event

async def create_event(db: AsyncSession, data: EventCreate):
    event = Event(**data.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event

async def update_event(db: AsyncSession, event_id: str, data: EventUpdate):
    event = await get_event(db, event_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(event, key, value)
    await db.commit()
    await db.refresh(event)
    return event

async def delete_event(db: AsyncSession, event_id: str):
    event = await get_event(db, event_id)
    await db.delete(event)
    await db.commit()

async def register_for_event(db: AsyncSession, event_id: str, member_id: str):
    event = await get_event(db, event_id)
    
    existing = await db.execute(
        select(EventRegistration).where(
            EventRegistration.event_id == event_id,
            EventRegistration.member_id == member_id
        )
    )
    if existing.scalar_one_or_none():
        raise ConflictException("Already registered for this event")
    
    registration = EventRegistration(event_id=event_id, member_id=member_id)
    db.add(registration)
    event.registered_count += 1
    await db.commit()
    await db.refresh(registration)
    return registration

async def get_member_events(db: AsyncSession, member_id: str):
    result = await db.execute(
        select(Event).join(EventRegistration).where(EventRegistration.member_id == member_id).order_by(Event.date.desc())
    )
    return result.scalars().all()

async def unregister_from_event(db: AsyncSession, event_id: str, member_id: str):
    from sqlalchemy import delete
    await db.execute(
        delete(EventRegistration).where(
            EventRegistration.event_id == event_id,
            EventRegistration.member_id == member_id
        )
    )
    event = await get_event(db, event_id)
    event.registered_count = max(0, event.registered_count - 1)
    await db.commit()

async def get_event_attendees(db: AsyncSession, event_id: str):
    result = await db.execute(
        select(EventRegistration).where(EventRegistration.event_id == event_id)
    )
    return result.scalars().all()

async def mark_attendance(db: AsyncSession, event_id: str, member_id: str):
    result = await db.execute(
        select(EventRegistration).where(
            EventRegistration.event_id == event_id,
            EventRegistration.member_id == member_id
        )
    )
    registration = result.scalar_one_or_none()
    if registration:
        registration.attended = True
        await db.commit()
