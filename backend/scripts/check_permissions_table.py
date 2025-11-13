import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def check_table():
    async with AsyncSessionLocal() as db:
        result = await db.execute(text("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'permissions' ORDER BY ordinal_position"))
        columns = result.fetchall()
        print("\nPermissions table structure:")
        for col in columns:
            print(f"  {col[0]}: {col[1]} (nullable: {col[2]})")

if __name__ == "__main__":
    asyncio.run(check_table())
