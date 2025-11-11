import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.utils.auth import hash_password
from sqlalchemy import select

async def create_admin():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == "admin@bibleway.com"))
        existing = result.scalar_one_or_none()
        
        if existing:
            print("Admin user already exists")
            return
        
        admin = User(
            name="Admin",
            email="admin@bibleway.com",
            password=hash_password("admin123"),
            role="superadmin",
            status="active"
        )
        
        db.add(admin)
        await db.commit()
        print("✓ Super admin created: admin@bibleway.com / admin123")

if __name__ == "__main__":
    asyncio.run(create_admin())
