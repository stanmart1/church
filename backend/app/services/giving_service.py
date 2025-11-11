from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.giving import Giving
from app.schemas.giving import GivingCreate
from app.utils.pagination import format_pagination_response

async def get_giving_records(db: AsyncSession, page: int, limit: int, member_id: str = None, type: str = None):
    offset = (page - 1) * limit
    query = select(Giving)
    
    if member_id:
        query = query.where(Giving.member_id == member_id)
    if type:
        query = query.where(Giving.type == type)
    
    query = query.order_by(Giving.date.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    records = result.scalars().all()
    
    count_query = select(func.count(Giving.id))
    if member_id:
        count_query = count_query.where(Giving.member_id == member_id)
    if type:
        count_query = count_query.where(Giving.type == type)
    total = await db.scalar(count_query)
    
    return format_pagination_response(records, total, page, limit)

async def create_giving_record(db: AsyncSession, data: GivingCreate):
    giving = Giving(**data.model_dump())
    db.add(giving)
    await db.commit()
    await db.refresh(giving)
    return giving

async def get_giving_stats(db: AsyncSession, member_id: str = None):
    query = select(func.sum(Giving.amount))
    if member_id:
        query = query.where(Giving.member_id == member_id)
    total = await db.scalar(query) or 0
    return {"total": float(total)}
