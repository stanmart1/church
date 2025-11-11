from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from app.models.attendance import Attendance
from app.schemas.attendance import AttendanceCreate

async def create_attendance(db: AsyncSession, data: AttendanceCreate):
    attendance = Attendance(**data.model_dump())
    db.add(attendance)
    await db.commit()
    await db.refresh(attendance)
    return attendance

async def get_attendance_stats(db: AsyncSession, start_date: datetime = None, end_date: datetime = None):
    query = select(func.count(func.distinct(Attendance.user_id))).where(Attendance.present == True)
    
    if start_date:
        query = query.where(Attendance.date >= start_date.date())
    if end_date:
        query = query.where(Attendance.date <= end_date.date())
    
    total = await db.scalar(query) or 0
    return {"total_attendance": total}
