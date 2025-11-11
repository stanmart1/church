from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.audit import TokenBlacklist
from app.utils.auth import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.exceptions import UnauthorizedException, ConflictException

async def register_user(db: AsyncSession, name: str, email: str, password: str, phone: str = None):
    """Register a new user"""
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise ConflictException("Email already exists")
    
    hashed_password = hash_password(password)
    user = User(
        name=name,
        email=email,
        password=hashed_password,
        phone=phone,
        role="member"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    access_token = create_access_token(str(user.id), user.email, user.role)
    refresh_token = create_refresh_token(str(user.id))
    
    return {"user": user, "token": access_token, "refresh_token": refresh_token}

async def login_user(db: AsyncSession, email: str, password: str):
    """Login user"""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(password, user.password):
        raise UnauthorizedException("Invalid credentials")
    
    if user.status != "active":
        raise UnauthorizedException("Account is inactive")
    
    access_token = create_access_token(str(user.id), user.email, user.role)
    refresh_token = create_refresh_token(str(user.id))
    
    return {"user": user, "token": access_token, "refresh_token": refresh_token}

async def logout_user(db: AsyncSession, user_id: str):
    """Logout user by blacklisting token"""
    blacklist = TokenBlacklist(user_id=user_id)
    db.add(blacklist)
    await db.commit()
