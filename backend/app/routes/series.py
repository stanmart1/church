from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/series", tags=["Series"])

class SeriesCreate(BaseModel):
    name: str
    description: Optional[str] = None

class SeriesUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class SeriesResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.get("")
async def get_series(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from app.models.sermon import SermonSeries
    result = await db.execute(select(SermonSeries))
    return result.scalars().all()

@router.post("", response_model=SeriesResponse, status_code=201)
async def create_series(data: SeriesCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    from app.models.sermon import SermonSeries
    series = SermonSeries(**data.model_dump())
    db.add(series)
    await db.commit()
    await db.refresh(series)
    return series

@router.get("/{series_id}", response_model=SeriesResponse)
async def get_series_by_id(series_id: str, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from app.models.sermon import SermonSeries
    from app.core.exceptions import NotFoundException
    result = await db.execute(select(SermonSeries).where(SermonSeries.id == series_id))
    series = result.scalar_one_or_none()
    if not series:
        raise NotFoundException("Series not found")
    return series

@router.put("/{series_id}", response_model=SeriesResponse)
async def create_series(data: SeriesCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    from app.models.sermon import SermonSeries
    series = SermonSeries(**data.model_dump())
    db.add(series)
    await db.commit()
    await db.refresh(series)
    return series

@router.put("/{series_id}", response_model=SeriesResponse)
async def update_series(series_id: str, data: SeriesUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    from sqlalchemy import select
    from app.models.sermon import SermonSeries
    from app.core.exceptions import NotFoundException
    result = await db.execute(select(SermonSeries).where(SermonSeries.id == series_id))
    series = result.scalar_one_or_none()
    if not series:
        raise NotFoundException("Series not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(series, key, value)
    await db.commit()
    await db.refresh(series)
    return series

@router.delete("/{series_id}")
async def delete_series(series_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    from sqlalchemy import select, delete
    from app.models.sermon import SermonSeries
    from app.core.exceptions import NotFoundException
    result = await db.execute(select(SermonSeries).where(SermonSeries.id == series_id))
    if not result.scalar_one_or_none():
        raise NotFoundException("Series not found")
    await db.execute(delete(SermonSeries).where(SermonSeries.id == series_id))
    await db.commit()
    return {"message": "Series deleted"}
