from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.announcement import Announcement
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate
from app.utils.pagination import format_pagination_response
from app.core.exceptions import NotFoundException

async def get_announcements(db: AsyncSession, page: int, limit: int, status: str = None):
    offset = (page - 1) * limit
    query = select(Announcement)
    
    if status:
        query = query.where(Announcement.status == status)
    
    query = query.order_by(Announcement.publish_date.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    announcements = result.scalars().all()
    
    count_query = select(func.count(Announcement.id))
    if status:
        count_query = count_query.where(Announcement.status == status)
    total = await db.scalar(count_query)
    
    return format_pagination_response(announcements, total, page, limit)

async def get_announcement(db: AsyncSession, announcement_id: str):
    result = await db.execute(select(Announcement).where(Announcement.id == announcement_id))
    announcement = result.scalar_one_or_none()
    if not announcement:
        raise NotFoundException("Announcement not found")
    return announcement

async def create_announcement(db: AsyncSession, data: AnnouncementCreate, created_by: str):
    announcement = Announcement(**data.model_dump(), created_by=created_by)
    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)
    return announcement

async def update_announcement(db: AsyncSession, announcement_id: str, data: AnnouncementUpdate):
    announcement = await get_announcement(db, announcement_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(announcement, key, value)
    await db.commit()
    await db.refresh(announcement)
    return announcement

async def delete_announcement(db: AsyncSession, announcement_id: str):
    announcement = await get_announcement(db, announcement_id)
    await db.delete(announcement)
    await db.commit()
