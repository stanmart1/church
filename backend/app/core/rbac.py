from typing import List
from app.core.constants import UserRole

ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        "manage_users",
        "manage_members",
        "manage_sermons",
        "manage_events",
        "manage_announcements",
        "manage_forms",
        "manage_giving",
        "manage_livestream",
        "manage_content",
        "manage_settings",
        "view_reports",
        "view_members",
        "view_sermons",
        "view_events",
        "register_events"
    ],
    UserRole.PASTOR: [
        "manage_members",
        "manage_sermons",
        "manage_events",
        "manage_announcements",
        "manage_forms",
        "manage_giving",
        "manage_livestream",
        "manage_content",
        "view_reports",
        "view_members",
        "view_sermons",
        "view_events"
    ],
    UserRole.MINISTER: [
        "manage_sermons",
        "manage_events",
        "manage_announcements",
        "view_members",
        "view_sermons",
        "view_events",
        "view_reports"
    ],
    UserRole.STAFF: [
        "manage_members",
        "manage_events",
        "manage_forms",
        "view_members",
        "view_sermons",
        "view_events"
    ],
    UserRole.MEMBER: [
        "view_sermons",
        "view_events",
        "register_events"
    ]
}

def has_permission(role: str, permission: str) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, [])

def get_role_permissions(role: str) -> List[str]:
    return ROLE_PERMISSIONS.get(role, [])
