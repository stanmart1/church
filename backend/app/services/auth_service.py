from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.audit import TokenBlacklist
from app.utils.auth import hash_password, verify_password, create_access_token, create_refresh_token
from app.utils.auth import decode_token
from jose import JWTError
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

async def register(db: AsyncSession, data):
    return await register_user(db, data.first_name + " " + data.last_name, data.email, data.password, data.phone)

async def login(db: AsyncSession, data):
    return await login_user(db, data.email, data.password)

async def logout_all(db: AsyncSession, user_id: str):
    await logout_user(db, user_id)

async def get_login_history(db: AsyncSession, user_id: str):
    from app.models.audit import AuditLog
    result = await db.execute(
        select(AuditLog).where(AuditLog.user_id == user_id).where(AuditLog.action == "login").order_by(AuditLog.created_at.desc()).limit(50)
    )
    return result.scalars().all()

async def get_users(db: AsyncSession, page: int, limit: int, search: str = None, role: str = None, status: str = None):
    from app.utils.pagination import parse_pagination_params, format_pagination_response
    offset = (page - 1) * limit
    query = select(User)
    if search:
        query = query.where(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
    if role:
        query = query.where(User.role == role)
    if status:
        query = query.where(User.status == status)
    result = await db.execute(query.offset(offset).limit(limit))
    users = result.scalars().all()
    from sqlalchemy import func
    count_result = await db.execute(select(func.count()).select_from(User))
    total = count_result.scalar()
    return format_pagination_response(users, total, page, limit)

async def get_user(db: AsyncSession, user_id: str):
    from app.core.exceptions import NotFoundException
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")
    return user

async def create_user(db: AsyncSession, data):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise ConflictException("Email already exists")
    hashed_password = hash_password(data.password)
    user = User(
        name=data.name, 
        email=data.email, 
        password=hashed_password, 
        phone=data.phone, 
        role=data.role,
        status=data.status
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def update_user(db: AsyncSession, user_id: str, data):
    user = await get_user(db, user_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return user

async def delete_user(db: AsyncSession, user_id: str):
    from sqlalchemy import delete as sql_delete
    await db.execute(sql_delete(User).where(User.id == user_id))
    await db.commit()

async def reset_password(db: AsyncSession, user_id: str):
    user = await get_user(db, user_id)
    new_password = "TempPassword123!"
    user.password = hash_password(new_password)
    await db.commit()
    return {"temporary_password": new_password}

async def change_password(db: AsyncSession, user_id: str, current_password: str, new_password: str):
    user = await get_user(db, user_id)
    if not verify_password(current_password, user.password):
        raise UnauthorizedException("Current password is incorrect")
    user.password = hash_password(new_password)
    await db.commit()

async def get_notification_preferences(db: AsyncSession, user_id: str):
    user = await get_user(db, user_id)
    return {"preferences": user.notification_preferences or {}}

async def update_notification_preferences(db: AsyncSession, user_id: str, preferences: dict):
    user = await get_user(db, user_id)
    user.notification_preferences = preferences
    await db.commit()

async def get_user_stats(db: AsyncSession):
    from sqlalchemy import func
    total = await db.execute(select(func.count()).select_from(User))
    active = await db.execute(select(func.count()).select_from(User).where(User.status == "active"))
    return {"total": total.scalar(), "active": active.scalar()}

async def refresh_token(db: AsyncSession, refresh_token: str):
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid token type")
        user = await get_user(db, payload["userId"])
        access_token = create_access_token(str(user.id), user.email, user.role)
        new_refresh_token = create_refresh_token(str(user.id))
        return {"token": access_token, "refresh_token": new_refresh_token}
    except JWTError:
        raise UnauthorizedException("Invalid or expired refresh token")
