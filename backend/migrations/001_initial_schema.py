"""
Initial database schema migration
Drops all existing tables and recreates from SQLAlchemy models
"""
import asyncio
import asyncpg
from app.core.config import settings as app_settings
from app.core.database import Base, engine
from app import models

async def upgrade():
    """Drop all tables and recreate from models"""
    print("🔄 Starting migration: Drop and recreate all tables...")
    
    # Connect to database
    conn = await asyncpg.connect(app_settings.DATABASE_URL)
    
    try:
        # Drop all tables with CASCADE
        print("⚠️  Dropping all existing tables...")
        await conn.execute("DROP SCHEMA public CASCADE")
        await conn.execute("CREATE SCHEMA public")
        print("✅ All tables dropped")
        
        # Create all tables from models
        print("📦 Creating tables from SQLAlchemy models...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ All tables created")
        
        print("✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        await conn.close()

async def downgrade():
    """Drop all tables"""
    print("🔄 Rolling back migration...")
    
    conn = await asyncpg.connect(app_settings.DATABASE_URL)
    
    try:
        await conn.execute("DROP SCHEMA public CASCADE")
        await conn.execute("CREATE SCHEMA public")
        print("✅ Rollback completed")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(upgrade())
