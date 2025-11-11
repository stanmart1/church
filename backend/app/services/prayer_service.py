from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.prayer import PrayerRequest
from app.schemas.prayer import PrayerRequestCreate, PrayerRequestUpdate
from app.utils.pagination import format_pagination_response
from app.core.exceptions import NotFoundException

async def get_prayer_requests(db: AsyncSession, page: int, limit: int, status: str = None, is_private: bool = None):
    offset = (page - 1) * limit
    query = select(PrayerRequest)
    
    if status:
        query = query.where(PrayerRequest.status == status)
    if is_private is not None:
        query = query.where(PrayerRequest.is_private == is_private)
    
    query = query.order_by(PrayerRequest.date.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    prayers = result.scalars().all()
    
    count_query = select(func.count(PrayerRequest.id))
    if status:
        count_query = count_query.where(PrayerRequest.status == status)
    if is_private is not None:
        count_query = count_query.where(PrayerRequest.is_private == is_private)
    total = await db.scalar(count_query)
    
    return format_pagination_response(prayers, total, page, limit)

async def get_prayer_request(db: AsyncSession, prayer_id: str):
    result = await db.execute(select(PrayerRequest).where(PrayerRequest.id == prayer_id))
    prayer = result.scalar_one_or_none()
    if not prayer:
        raise NotFoundException("Prayer request not found")
    return prayer

async def create_prayer_request(db: AsyncSession, data: PrayerRequestCreate, member_id: str = None):
    prayer = PrayerRequest(**data.model_dump(), member_id=member_id)
    db.add(prayer)
    await db.commit()
    await db.refresh(prayer)
    return prayer

async def update_prayer_request(db: AsyncSession, prayer_id: str, data: PrayerRequestUpdate):
    prayer = await get_prayer_request(db, prayer_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(prayer, key, value)
    await db.commit()
    await db.refresh(prayer)
    return prayer

async def increment_prayers(db: AsyncSession, prayer_id: str):
    prayer = await get_prayer_request(db, prayer_id)
    prayer.prayers += 1
    await db.commit()
