from resend import Resend
from typing import List, Union
from app.core.config import settings

resend_client = None

def get_resend_client():
    global resend_client
    if not resend_client and settings.RESEND_API_KEY:
        resend_client = Resend(settings.RESEND_API_KEY)
    return resend_client

async def send_email(to: Union[str, List[str]], subject: str, html: str) -> dict:
    client = get_resend_client()
    if not client:
        raise Exception("Resend API key not configured")
    
    recipients = [to] if isinstance(to, str) else to
    
    response = client.emails.send({
        "from": settings.RESEND_FROM_EMAIL,
        "to": recipients,
        "subject": subject,
        "html": html
    })
    
    return {"success": True, "data": response}
