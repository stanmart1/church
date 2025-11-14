from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.models.sermon import Sermon, SermonSeries
from app.schemas.sermon import SermonCreate, SermonUpdate
from app.utils.pagination import format_pagination_response
from app.core.exceptions import NotFoundException

async def get_sermons(db: AsyncSession, page: int, limit: int, search: str = None, series_id: str = None, speaker: str = None):
    offset = (page - 1) * limit
    query = select(Sermon)
    
    if search:
        query = query.where(or_(
            Sermon.title.ilike(f"%{search}%"),
            Sermon.speaker.ilike(f"%{search}%"),
            Sermon.description.ilike(f"%{search}%")
        ))
    if series_id:
        query = query.where(Sermon.series_id == series_id)
    if speaker:
        query = query.where(Sermon.speaker.ilike(f"%{speaker}%"))
    
    query = query.order_by(Sermon.date.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    sermons = result.scalars().all()
    
    count_query = select(func.count(Sermon.id))
    if search:
        count_query = count_query.where(or_(
            Sermon.title.ilike(f"%{search}%"),
            Sermon.speaker.ilike(f"%{search}%")
        ))
    if series_id:
        count_query = count_query.where(Sermon.series_id == series_id)
    
    total = await db.scalar(count_query)
    
    return format_pagination_response(sermons, total, page, limit)

async def get_sermon(db: AsyncSession, sermon_id: str):
    result = await db.execute(select(Sermon).where(Sermon.id == sermon_id))
    sermon = result.scalar_one_or_none()
    if not sermon:
        raise NotFoundException("Sermon not found")
    return sermon

async def create_sermon(db: AsyncSession, data: SermonCreate, audio=None, thumbnail=None):
    from app.services.storage_service import save_file
    
    sermon_data = data.model_dump()
    if audio:
        sermon_data['audio_url'] = await save_file(audio, 'sermons/audio')
    if thumbnail:
        sermon_data['thumbnail_url'] = await save_file(thumbnail, 'sermons/thumbnails')
    
    sermon = Sermon(**sermon_data)
    db.add(sermon)
    
    if data.series_id:
        series = await db.get(SermonSeries, data.series_id)
        if series:
            series.sermon_count += 1
    
    await db.commit()
    await db.refresh(sermon)
    return sermon

async def update_sermon(db: AsyncSession, sermon_id: str, data: SermonUpdate):
    sermon = await get_sermon(db, sermon_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(sermon, key, value)
    await db.commit()
    await db.refresh(sermon)
    return sermon

async def delete_sermon(db: AsyncSession, sermon_id: str):
    sermon = await get_sermon(db, sermon_id)
    
    if sermon.series_id:
        series = await db.get(SermonSeries, sermon.series_id)
        if series:
            series.sermon_count -= 1
    
    await db.delete(sermon)
    await db.commit()

async def increment_plays(db: AsyncSession, sermon_id: str):
    sermon = await get_sermon(db, sermon_id)
    sermon.plays += 1
    await db.commit()

async def increment_downloads(db: AsyncSession, sermon_id: str):
    sermon = await get_sermon(db, sermon_id)
    sermon.downloads += 1
    await db.commit()
