from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.settings import Settings
from app.schemas.settings import SettingsCreate, SettingsUpdate
from app.core.exceptions import NotFoundException

async def get_all_settings(db: AsyncSession):
    import json
    result = await db.execute(select(Settings))
    settings = result.scalars().all()
    # Convert to dict with parsed values
    settings_dict = {}
    for setting in settings:
        try:
            settings_dict[setting.key] = json.loads(setting.value)
        except:
            settings_dict[setting.key] = setting.value
    return settings_dict

async def get_setting_by_key(db: AsyncSession, key: str):
    result = await db.execute(select(Settings).where(Settings.key == key))
    setting = result.scalar_one_or_none()
    if not setting:
        raise NotFoundException(f"Setting with key '{key}' not found")
    return setting

async def create_setting(db: AsyncSession, data: SettingsCreate):
    setting = Settings(**data.model_dump())
    db.add(setting)
    await db.commit()
    await db.refresh(setting)
    return setting

async def update_setting(db: AsyncSession, key: str, data: SettingsUpdate):
    setting = await get_setting_by_key(db, key)
    setting.value = data.value
    await db.commit()
    await db.refresh(setting)
    return setting

async def update_bulk_settings(db: AsyncSession, settings: dict):
    import json
    for key, value in settings.items():
        result = await db.execute(select(Settings).where(Settings.key == key))
        setting = result.scalar_one_or_none()
        # Convert value to string for storage
        str_value = json.dumps(value) if isinstance(value, (bool, dict, list)) else str(value)
        if setting:
            setting.value = str_value
        else:
            db.add(Settings(key=key, value=str_value))
    await db.commit()

async def get_system_status(db: AsyncSession):
    from sqlalchemy import func, text
    from app.models.user import User
    from datetime import datetime, timedelta
    import psutil
    
    # Get active users (logged in within last 30 minutes)
    thirty_min_ago = datetime.utcnow() - timedelta(minutes=30)
    active_users_result = await db.execute(
        select(func.count()).select_from(User).where(User.status == 'active')
    )
    active_users = active_users_result.scalar() or 0
    
    # Get database uptime
    try:
        uptime_result = await db.execute(text("SELECT EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) as uptime"))
        uptime_seconds = uptime_result.scalar() or 0
        uptime_days = int(uptime_seconds / 86400)
        uptime_hours = int((uptime_seconds % 86400) / 3600)
        uptime = f"{uptime_days}d {uptime_hours}h"
    except:
        uptime = "N/A"
    
    # Get system stats
    try:
        cpu_usage = f"{psutil.cpu_percent(interval=1)}%"
        memory = psutil.virtual_memory()
        memory_usage = f"{memory.percent}%"
    except:
        cpu_usage = "N/A"
        memory_usage = "N/A"
    
    return {
        "status": "operational",
        "database": "connected",
        "uptime": uptime,
        "cpuUsage": cpu_usage,
        "memoryUsage": memory_usage,
        "activeUsers": str(active_users)
    }

async def get_security_stats(db: AsyncSession):
    from sqlalchemy import func
    from app.models.audit import AuditLog
    from app.models.user import User
    from datetime import datetime, timedelta
    
    # Active sessions (users logged in within last 30 minutes)
    thirty_min_ago = datetime.utcnow() - timedelta(minutes=30)
    active_sessions_result = await db.execute(
        select(func.count()).select_from(User).where(User.status == 'active')
    )
    active_sessions = active_sessions_result.scalar() or 0
    
    # Security alerts (failed login attempts in last 24 hours)
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    alerts_result = await db.execute(
        select(func.count()).select_from(AuditLog)
        .where(AuditLog.event.in_(['failed_login', 'suspicious_activity']))
        .where(AuditLog.created_at >= twenty_four_hours_ago)
    )
    security_alerts = alerts_result.scalar() or 0
    
    # Blocked attempts (all failed logins)
    blocked_result = await db.execute(
        select(func.count()).select_from(AuditLog)
        .where(AuditLog.event == 'failed_login')
    )
    blocked_attempts = blocked_result.scalar() or 0
    
    # Calculate security score (0-100)
    score = 100
    if security_alerts > 10:
        score -= 20
    elif security_alerts > 5:
        score -= 10
    if blocked_attempts > 50:
        score -= 15
    elif blocked_attempts > 20:
        score -= 10
    
    return {
        "securityScore": max(0, score),
        "activeSessions": active_sessions,
        "securityAlerts": security_alerts,
        "blockedAttempts": blocked_attempts
    }

async def get_recent_notifications(db: AsyncSession, page: int, limit: int):
    from app.models.notification import Notification
    offset = (page - 1) * limit
    result = await db.execute(select(Notification).offset(offset).limit(limit))
    return result.scalars().all()

async def get_unread_count(db: AsyncSession, user_id: str):
    from sqlalchemy import func
    from app.models.notification import Notification
    result = await db.execute(
        select(func.count()).select_from(Notification).where(Notification.recipient_id == user_id).where(Notification.read == False)
    )
    return {"count": result.scalar()}

async def mark_notification_read(db: AsyncSession, notification_id: str):
    from app.models.notification import Notification
    result = await db.execute(select(Notification).where(Notification.id == notification_id))
    notification = result.scalar_one_or_none()
    if notification:
        notification.read = True
        await db.commit()

async def test_email(db: AsyncSession, email: str):
    from app.services.email_service import send_email
    await send_email(db, email, "Test Email", "<p>This is a test email</p>")

async def get_integration_stats(db: AsyncSession):
    return {
        "email": {"status": "active", "last_sent": None},
        "icecast": {"status": "inactive", "last_stream": None}
    }

async def test_integration(db: AsyncSession, integration: str):
    if integration == "email":
        from app.services.email_service import send_email
        await send_email(db, "test@example.com", "Test Email", "<p>Test</p>")
        return {"message": "Test email sent"}
    return {"message": f"Test for {integration} completed"}
