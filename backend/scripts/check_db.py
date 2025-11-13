import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def check_db():
    async with AsyncSessionLocal() as db:
        result = await db.execute(text("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'permissions' ORDER BY ordinal_position"))
        print("\nPermissions table structure:")
        for row in result:
            print(f"  {row[0]}: {row[1]} (nullable: {row[2]})")
        
        result = await db.execute(text("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'role_permissions' ORDER BY ordinal_position"))
        print("\nRole_permissions table structure:")
        for row in result:
            print(f"  {row[0]}: {row[1]} (nullable: {row[2]})")

if __name__ == "__main__":
    asyncio.run(check_db())
