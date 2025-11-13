import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.core.database import AsyncSessionLocal

ROLES = ['superadmin', 'admin', 'pastor', 'minister', 'staff', 'member']

async def seed_roles():
    async with AsyncSessionLocal() as db:
        try:
            for role in ROLES:
                result = await db.execute(
                    text("SELECT COUNT(*) FROM role_permissions WHERE role = :role"),
                    {'role': role}
                )
                if result.scalar() == 0:
                    perm_result = await db.execute(text("SELECT id FROM permissions LIMIT 1"))
                    perm_id = perm_result.scalar()
                    if perm_id:
                        await db.execute(
                            text("INSERT INTO role_permissions (id, role, permission_id) VALUES (gen_random_uuid(), :role, :perm_id)"),
                            {'role': role, 'perm_id': perm_id}
                        )
            
            await db.commit()
            print(f"✓ Seeded {len(ROLES)} roles")
            
        except Exception as e:
            await db.rollback()
            print(f"✗ Error seeding roles: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(seed_roles())
