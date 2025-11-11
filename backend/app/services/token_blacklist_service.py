import asyncio
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.audit import TokenBlacklist
from app.core.logging import logger

TOKEN_BLACKLIST_CLEANUP_HOURS = 168  # 7 days

async def cleanup_expired_tokens(db: AsyncSession) -> int:
    """Delete expired token blacklist entries"""
    try:
        cutoff_time = datetime.utcnow() - timedelta(hours=TOKEN_BLACKLIST_CLEANUP_HOURS)
        result = await db.execute(
            delete(TokenBlacklist).where(TokenBlacklist.created_at < cutoff_time)
        )
        await db.commit()
        count = result.rowcount
        logger.info(f"Cleaned up {count} expired blacklist entries")
        return count
    except Exception as error:
        logger.error(f"Token cleanup error: {error}")
        raise error

async def is_token_blacklisted(db: AsyncSession, user_id: str, token_iat: int) -> bool:
    """Check if token is blacklisted"""
    token_time = datetime.fromtimestamp(token_iat)
    result = await db.execute(
        select(TokenBlacklist)
        .where(TokenBlacklist.user_id == user_id)
        .where(TokenBlacklist.created_at > token_time)
        .limit(1)
    )
    return result.scalar_one_or_none() is not None

async def add_to_blacklist(db: AsyncSession, user_id: str):
    """Add user to token blacklist"""
    blacklist = TokenBlacklist(user_id=user_id)
    db.add(blacklist)
    await db.commit()

async def start_cleanup_schedule(db: AsyncSession):
    """Start periodic cleanup of expired tokens"""
    while True:
        await cleanup_expired_tokens(db)
        await asyncio.sleep(6 * 60 * 60)  # Every 6 hours
