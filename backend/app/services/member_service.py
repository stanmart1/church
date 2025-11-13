from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from fastapi.responses import StreamingResponse
import csv
import io
from app.models.user import User
from app.schemas.user import UserUpdate
from app.utils.pagination import format_pagination_response
from app.core.exceptions import NotFoundException

async def get_members(db: AsyncSession, page: int, limit: int, search: str = None, role: str = None):
    offset = (page - 1) * limit
    query = select(User)
    
    if search:
        query = query.where(or_(
            User.name.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%")
        ))
    if role:
        query = query.where(User.role == role)
    
    query = query.order_by(User.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    members = result.scalars().all()
    
    count_query = select(func.count(User.id))
    if search:
        count_query = count_query.where(or_(
            User.name.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%")
        ))
    if role:
        count_query = count_query.where(User.role == role)
    total = await db.scalar(count_query)
    
    return format_pagination_response(members, total, page, limit)

async def get_member(db: AsyncSession, member_id: str):
    result = await db.execute(select(User).where(User.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise NotFoundException("Member not found")
    return member

async def update_member(db: AsyncSession, member_id: str, data: UserUpdate):
    member = await get_member(db, member_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(member, key, value)
    await db.commit()
    await db.refresh(member)
    return member

async def delete_member(db: AsyncSession, member_id: str):
    member = await get_member(db, member_id)
    await db.delete(member)
    await db.commit()

async def export_members(db: AsyncSession, format: str = 'csv'):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    members = result.scalars().all()
    
    if format == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Name', 'Email', 'Phone', 'Role', 'Status', 'Created At'])
        for member in members:
            writer.writerow([member.name, member.email, member.phone or '', member.role, member.status, member.created_at])
        output.seek(0)
        return StreamingResponse(iter([output.getvalue()]), media_type='text/csv', headers={'Content-Disposition': 'attachment; filename=members.csv'})
    else:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
        from reportlab.lib import colors
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        data = [['Name', 'Email', 'Phone', 'Role', 'Status', 'Created At']]
        for member in members:
            data.append([member.name, member.email, member.phone or '', member.role, member.status, str(member.created_at)])
        table = Table(data)
        table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.grey), ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke), ('ALIGN', (0, 0), (-1, -1), 'CENTER'), ('GRID', (0, 0), (-1, -1), 1, colors.black)]))
        doc.build([table])
        buffer.seek(0)
        return StreamingResponse(iter([buffer.getvalue()]), media_type='application/pdf', headers={'Content-Disposition': 'attachment; filename=members.pdf'})
