from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.content import Content
from app.schemas.content import ContentCreate, ContentUpdate
from app.core.exceptions import NotFoundException

async def get_all_content(db: AsyncSession):
    result = await db.execute(select(Content))
    return result.scalars().all()

async def get_content_by_key(db: AsyncSession, key: str):
    result = await db.execute(select(Content).where(Content.key == key))
    content = result.scalar_one_or_none()
    if not content:
        raise NotFoundException(f"Content with key '{key}' not found")
    return content

async def create_content(db: AsyncSession, data: ContentCreate):
    content = Content(**data.model_dump())
    db.add(content)
    await db.commit()
    await db.refresh(content)
    return content

async def update_content(db: AsyncSession, key: str, data: ContentUpdate):
    result = await db.execute(select(Content).where(Content.key == key))
    content = result.scalar_one_or_none()
    if not content:
        content = Content(key=key, value=data.value)
        db.add(content)
    else:
        content.value = data.value
    await db.commit()
    await db.refresh(content)
    return content

async def get_service_times(db: AsyncSession, page: int, limit: int):
    from app.models.service_time import ServiceTime
    from app.utils.pagination import format_pagination_response
    from sqlalchemy import func
    offset = (page - 1) * limit
    result = await db.execute(select(ServiceTime).offset(offset).limit(limit))
    times = result.scalars().all()
    total = await db.scalar(select(func.count(ServiceTime.id)))
    return format_pagination_response(times, total, page, limit)

async def create_service_time(db: AsyncSession, data):
    from app.models.service_time import ServiceTime
    service_time = ServiceTime(**data.model_dump())
    db.add(service_time)
    await db.commit()
    await db.refresh(service_time)
    return service_time

async def update_service_time(db: AsyncSession, service_time_id: str, data):
    from app.models.service_time import ServiceTime
    result = await db.execute(select(ServiceTime).where(ServiceTime.id == service_time_id))
    service_time = result.scalar_one_or_none()
    if not service_time:
        raise NotFoundException("Service time not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(service_time, key, value)
    await db.commit()
    await db.refresh(service_time)
    return service_time

async def delete_service_time(db: AsyncSession, service_time_id: int):
    from app.models.service_time import ServiceTime
    from sqlalchemy import delete
    await db.execute(delete(ServiceTime).where(ServiceTime.id == service_time_id))
    await db.commit()
