import asyncio
import asyncpg
from app.core.config import settings

async def check_database():
    conn = await asyncpg.connect(settings.DATABASE_URL)
    
    try:
        # Get all tables
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        """)
        
        print(f"\n{'='*80}")
        print(f"DATABASE SCHEMA INSPECTION")
        print(f"{'='*80}\n")
        print(f"Total Tables: {len(tables)}\n")
        
        for table in tables:
            table_name = table['table_name']
            print(f"\n{'─'*80}")
            print(f"TABLE: {table_name}")
            print(f"{'─'*80}")
            
            # Get columns
            columns = await conn.fetch("""
                SELECT 
                    column_name,
                    data_type,
                    character_maximum_length,
                    is_nullable,
                    column_default
                FROM information_schema.columns
                WHERE table_name = $1
                ORDER BY ordinal_position
            """, table_name)
            
            for col in columns:
                nullable = "NULL" if col['is_nullable'] == 'YES' else "NOT NULL"
                data_type = col['data_type']
                if col['character_maximum_length']:
                    data_type += f"({col['character_maximum_length']})"
                default = f" DEFAULT {col['column_default']}" if col['column_default'] else ""
                
                print(f"  {col['column_name']:<30} {data_type:<20} {nullable:<10}{default}")
            
            # Get indexes
            indexes = await conn.fetch("""
                SELECT indexname, indexdef
                FROM pg_indexes
                WHERE tablename = $1
            """, table_name)
            
            if indexes:
                print(f"\n  Indexes:")
                for idx in indexes:
                    print(f"    - {idx['indexname']}")
        
        print(f"\n{'='*80}\n")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_database())
