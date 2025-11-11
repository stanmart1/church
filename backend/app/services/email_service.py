from resend import Resend
from typing import List, Union
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.settings import Settings
from app.models.notification import Notification

resend_client = None

async def get_email_config(db: AsyncSession) -> dict:
    """Get email configuration from database settings"""
    result = await db.execute(
        select(Settings).where(Settings.key.in_(['resend_api_key', 'resend_from_email']))
    )
    settings_list = result.scalars().all()
    
    config = {}
    for setting in settings_list:
        config[setting.key] = setting.value
    
    return config

async def initialize_resend(db: AsyncSession):
    """Initialize Resend client with config from database"""
    config = await get_email_config(db)
    
    api_key = config.get('resend_api_key') or settings.RESEND_API_KEY
    if not api_key:
        raise Exception('Resend API key not configured')
    
    client = Resend(api_key)
    from_email = config.get('resend_from_email') or settings.RESEND_FROM_EMAIL
    
    return {"client": client, "from_email": from_email}

async def send_email(db: AsyncSession, to: Union[str, List[str]], subject: str, html: str) -> dict:
    """Send email via Resend and log to notifications"""
    try:
        config = await initialize_resend(db)
        client = config["client"]
        from_email = config["from_email"]
        
        recipients = [to] if isinstance(to, str) else to
        
        response = client.emails.send({
            "from": from_email,
            "to": recipients,
            "subject": subject,
            "html": html
        })
        
        # Log success
        notification = Notification(
            type="Email",
            message=subject,
            status="sent",
            recipient_email=recipients[0]
        )
        db.add(notification)
        await db.commit()
        
        return {"success": True, "data": response}
    except Exception as error:
        # Log failure
        notification = Notification(
            type="Email",
            message=subject,
            status="failed",
            recipient_email=recipients[0] if isinstance(to, list) else to
        )
        db.add(notification)
        await db.commit()
        
        raise error

async def test_email_connection(db: AsyncSession) -> dict:
    """Test Resend connection"""
    try:
        await initialize_resend(db)
        return {"success": True, "message": "Resend connection successful"}
    except Exception as error:
        return {"success": False, "message": str(error)}

def load_email_template(template_name: str) -> str:
    """Load email template from file"""
    template_path = Path(__file__).parent.parent / "templates" / f"{template_name}.html"
    with open(template_path, "r") as f:
        return f.read()
