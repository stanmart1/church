from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class SettingsCreate(BaseModel):
    key: str
    value: str
    category: Optional[str] = None

class SettingsUpdate(BaseModel):
    value: str

SettingUpdate = SettingsUpdate

class SettingsResponse(BaseModel):
    id: UUID
    key: str
    value: str
    category: Optional[str]
    updated_at: datetime
    
    class Config:
        from_attributes = True
