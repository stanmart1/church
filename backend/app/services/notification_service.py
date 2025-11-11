from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.notification import Notification
from app.models.user import User
from app.services.email_service import send_email

async def create_notification(
    db: AsyncSession,
    type: str,
    message: str,
    recipient_id: str = None,
    recipient_email: str = None,
    link: str = None
):
    """Create a notification"""
    notification = Notification(
        type=type,
        message=message,
        recipient_id=recipient_id,
        recipient_email=recipient_email,
        link=link,
        status="pending"
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification

async def send_notification_email(
    db: AsyncSession,
    notification_id: str,
    subject: str,
    html: str
):
    """Send notification via email"""
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id)
    )
    notification = result.scalar_one_or_none()
    
    if notification and notification.recipient_email:
        try:
            await send_email(notification.recipient_email, subject, html)
            notification.status = "sent"
        except Exception as e:
            notification.status = "failed"
        
        await db.commit()
