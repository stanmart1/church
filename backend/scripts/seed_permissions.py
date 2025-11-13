import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.core.database import AsyncSessionLocal

PERMISSIONS = [
    # User Management
    {'name': 'users.view', 'description': 'View users', 'category': 'users'},
    {'name': 'users.create', 'description': 'Create users', 'category': 'users'},
    {'name': 'users.edit', 'description': 'Edit users', 'category': 'users'},
    {'name': 'users.delete', 'description': 'Delete users', 'category': 'users'},
    {'name': 'users.export', 'description': 'Export users', 'category': 'users'},
    
    # Member Management
    {'name': 'members.view', 'description': 'View members', 'category': 'members'},
    {'name': 'members.create', 'description': 'Create members', 'category': 'members'},
    {'name': 'members.edit', 'description': 'Edit members', 'category': 'members'},
    {'name': 'members.delete', 'description': 'Delete members', 'category': 'members'},
    
    # Sermon Management
    {'name': 'sermons.view', 'description': 'View sermons', 'category': 'sermons'},
    {'name': 'sermons.create', 'description': 'Create sermons', 'category': 'sermons'},
    {'name': 'sermons.edit', 'description': 'Edit sermons', 'category': 'sermons'},
    {'name': 'sermons.delete', 'description': 'Delete sermons', 'category': 'sermons'},
    
    # Event Management
    {'name': 'events.view', 'description': 'View events', 'category': 'events'},
    {'name': 'events.create', 'description': 'Create events', 'category': 'events'},
    {'name': 'events.edit', 'description': 'Edit events', 'category': 'events'},
    {'name': 'events.delete', 'description': 'Delete events', 'category': 'events'},
    
    # Announcement Management
    {'name': 'announcements.view', 'description': 'View announcements', 'category': 'announcements'},
    {'name': 'announcements.create', 'description': 'Create announcements', 'category': 'announcements'},
    {'name': 'announcements.edit', 'description': 'Edit announcements', 'category': 'announcements'},
    {'name': 'announcements.delete', 'description': 'Delete announcements', 'category': 'announcements'},
    
    # Prayer Request Management
    {'name': 'prayers.view', 'description': 'View prayer requests', 'category': 'prayers'},
    {'name': 'prayers.create', 'description': 'Create prayer requests', 'category': 'prayers'},
    {'name': 'prayers.edit', 'description': 'Edit prayer requests', 'category': 'prayers'},
    {'name': 'prayers.delete', 'description': 'Delete prayer requests', 'category': 'prayers'},
    
    # Giving Management
    {'name': 'giving.view', 'description': 'View giving records', 'category': 'giving'},
    {'name': 'giving.create', 'description': 'Create giving records', 'category': 'giving'},
    {'name': 'giving.edit', 'description': 'Edit giving records', 'category': 'giving'},
    {'name': 'giving.delete', 'description': 'Delete giving records', 'category': 'giving'},
    {'name': 'giving.reports', 'description': 'View giving reports', 'category': 'giving'},
    
    # Livestream Management
    {'name': 'livestream.view', 'description': 'View livestreams', 'category': 'livestream'},
    {'name': 'livestream.create', 'description': 'Create livestreams', 'category': 'livestream'},
    {'name': 'livestream.manage', 'description': 'Manage livestreams', 'category': 'livestream'},
    {'name': 'livestream.delete', 'description': 'Delete livestreams', 'category': 'livestream'},
    
    # Content Management
    {'name': 'content.view', 'description': 'View content', 'category': 'content'},
    {'name': 'content.create', 'description': 'Create content', 'category': 'content'},
    {'name': 'content.edit', 'description': 'Edit content', 'category': 'content'},
    {'name': 'content.delete', 'description': 'Delete content', 'category': 'content'},
    {'name': 'content.publish', 'description': 'Publish content', 'category': 'content'},
    
    # Forms Management
    {'name': 'forms.view', 'description': 'View forms', 'category': 'forms'},
    {'name': 'forms.create', 'description': 'Create forms', 'category': 'forms'},
    {'name': 'forms.edit', 'description': 'Edit forms', 'category': 'forms'},
    {'name': 'forms.delete', 'description': 'Delete forms', 'category': 'forms'},
    {'name': 'forms.submissions', 'description': 'View form submissions', 'category': 'forms'},
    
    # Media Management
    {'name': 'media.view', 'description': 'View media', 'category': 'media'},
    {'name': 'media.upload', 'description': 'Upload media', 'category': 'media'},
    {'name': 'media.edit', 'description': 'Edit media', 'category': 'media'},
    {'name': 'media.delete', 'description': 'Delete media', 'category': 'media'},
    
    # Settings
    {'name': 'settings.view', 'description': 'View settings', 'category': 'settings'},
    {'name': 'settings.edit', 'description': 'Edit settings', 'category': 'settings'},
    
    # Roles & Permissions
    {'name': 'roles.view', 'description': 'View roles', 'category': 'roles'},
    {'name': 'roles.create', 'description': 'Create roles', 'category': 'roles'},
    {'name': 'roles.edit', 'description': 'Edit roles', 'category': 'roles'},
    {'name': 'roles.delete', 'description': 'Delete roles', 'category': 'roles'},
    {'name': 'permissions.view', 'description': 'View permissions', 'category': 'roles'},
    {'name': 'permissions.assign', 'description': 'Assign permissions to roles', 'category': 'roles'},
    
    # Reports
    {'name': 'reports.view', 'description': 'View reports', 'category': 'reports'},
    {'name': 'reports.export', 'description': 'Export reports', 'category': 'reports'},
]

async def seed_permissions():
    async with AsyncSessionLocal() as db:
        try:
            # Insert permissions
            for perm in PERMISSIONS:
                await db.execute(
                    text("""
                        INSERT INTO permissions (id, name, description)
                        VALUES (gen_random_uuid(), :name, :description)
                        ON CONFLICT (name) DO UPDATE SET
                            description = EXCLUDED.description
                    """),
                    {'name': perm['name'], 'description': perm['description']}
                )
            
            # Get all permission IDs
            result = await db.execute(text("SELECT id FROM permissions"))
            permission_ids = [row[0] for row in result]
            
            # Assign all permissions to superadmin role
            for perm_id in permission_ids:
                result = await db.execute(
                    text("SELECT COUNT(*) FROM role_permissions WHERE role = 'superadmin' AND permission_id = :permission_id"),
                    {'permission_id': perm_id}
                )
                if result.scalar() == 0:
                    await db.execute(
                        text("INSERT INTO role_permissions (id, role, permission_id) VALUES (gen_random_uuid(), 'superadmin', :permission_id)"),
                        {'permission_id': perm_id}
                    )
            
            await db.commit()
            print(f"✓ Seeded {len(PERMISSIONS)} permissions")
            print(f"✓ Assigned all permissions to superadmin role")
            
        except Exception as e:
            await db.rollback()
            print(f"✗ Error seeding permissions: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(seed_permissions())
