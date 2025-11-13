from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.services import auth_service
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.register(db, data)

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.login(db, data)

@router.get("/verify")
async def verify(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {"user": await auth_service.get_user(db, current_user["userId"])}

@router.post("/refresh")
async def refresh_token(data: dict, db: AsyncSession = Depends(get_db)):
    return await auth_service.refresh_token(db, data.get("refresh_token"))

@router.get("/login-history/{user_id}")
async def get_login_history(user_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await auth_service.get_login_history(db, user_id)

@router.post("/logout-all/{user_id}")
async def logout_all(user_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await auth_service.logout_all(db, user_id)
    return {"message": "Logged out from all devices"}
