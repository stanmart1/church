from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.form import FormCreate, FormUpdate, FormResponse, FormResponseCreate
from app.services import form_service
from app.models.user import User

router = APIRouter(prefix="/forms", tags=["Forms"])

@router.get("/")
async def get_forms(page: int = 1, limit: int = 10, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await form_service.get_forms(db, page, limit)

@router.get("/{form_id}", response_model=FormResponse)
async def get_form(form_id: str, db: AsyncSession = Depends(get_db)):
    return await form_service.get_form(db, form_id)

@router.post("/", response_model=FormResponse, status_code=201)
async def create_form(data: FormCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await form_service.create_form(db, data)

@router.put("/{form_id}", response_model=FormResponse)
async def update_form(form_id: str, data: FormUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await form_service.update_form(db, form_id, data)

@router.delete("/{form_id}")
async def delete_form(form_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await form_service.delete_form(db, form_id)
    return {"message": "Form deleted"}

@router.post("/delete-multiple")
async def delete_forms(ids: List[str], db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await form_service.delete_forms(db, ids)
    return {"message": "Forms deleted"}

@router.post("/export")
async def export_forms(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await form_service.export_forms(db)

@router.post("/{form_id}/responses", status_code=201)
async def submit_form_response(form_id: str, data: FormResponseCreate, db: AsyncSession = Depends(get_db)):
    return await form_service.submit_form_response(db, form_id, data)

@router.get("/{form_id}/responses")
async def get_form_responses(form_id: str, page: int = 1, limit: int = 10, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await form_service.get_form_responses(db, form_id, page, limit)

@router.get("/{form_id}/responses/export")
async def export_form_responses(form_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await form_service.export_form_responses(db, form_id)
