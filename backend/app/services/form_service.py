from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.form import Form, FormResponse
from app.schemas.form import FormCreate, FormUpdate
from app.utils.pagination import format_pagination_response
from app.core.exceptions import NotFoundException

async def get_forms(db: AsyncSession, page: int, limit: int, status: str = None):
    offset = (page - 1) * limit
    query = select(Form)
    
    if status:
        query = query.where(Form.status == status)
    
    query = query.order_by(Form.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    forms = result.scalars().all()
    
    count_query = select(func.count(Form.id))
    if status:
        count_query = count_query.where(Form.status == status)
    total = await db.scalar(count_query)
    
    return format_pagination_response(forms, total, page, limit)

async def get_form(db: AsyncSession, form_id: str):
    result = await db.execute(select(Form).where(Form.id == form_id))
    form = result.scalar_one_or_none()
    if not form:
        raise NotFoundException("Form not found")
    return form

async def create_form(db: AsyncSession, data: FormCreate):
    form = Form(**data.model_dump())
    db.add(form)
    await db.commit()
    await db.refresh(form)
    return form

async def update_form(db: AsyncSession, form_id: str, data: FormUpdate):
    form = await get_form(db, form_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(form, key, value)
    await db.commit()
    await db.refresh(form)
    return form
