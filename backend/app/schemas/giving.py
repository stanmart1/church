from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from decimal import Decimal

class GivingCreate(BaseModel):
    member_id: UUID
    amount: Decimal
    type: str
    method: str
    date: date
    notes: Optional[str] = None

class GivingResponse(BaseModel):
    id: UUID
    member_id: UUID
    amount: Decimal
    type: str
    method: str
    date: date
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
