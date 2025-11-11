from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from app.models.user import User
from app.models.sermon import Sermon
from app.models.event import Event
from app.models.announcement import Announcement
from app.models.livestream import Livestream
from app.models.attendance import Attendance

async def get_dashboard_stats(db: AsyncSession):
    # Total members
    total_members = await db.scalar(
        select(func.count(User.id)).where(User.role == "member", User.membership_status == "active")
    )
    
    # New members this week
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_members = await db.scalar(
        select(func.count(User.id)).where(User.role == "member", User.date_joined >= week_ago.date())
    )
    
    # Total sermons
    total_sermons = await db.scalar(select(func.count(Sermon.id)))
    
    # Sermon downloads
    sermon_downloads = await db.scalar(select(func.sum(Sermon.downloads))) or 0
    
    # Upcoming events
    upcoming_events = await db.scalar(
        select(func.count(Event.id)).where(Event.date >= datetime.utcnow().date())
    )
    
    # Active announcements
    active_announcements = await db.scalar(
        select(func.count(Announcement.id)).where(Announcement.status == "published")
    )
    
    # Current livestream
    livestream = await db.execute(
        select(Livestream).where(Livestream.is_live == True).order_by(Livestream.created_at.desc()).limit(1)
    )
    current_stream = livestream.scalar_one_or_none()
    
    # Weekly attendance
    this_week_attendance = await db.scalar(
        select(func.count(func.distinct(Attendance.user_id)))
        .where(Attendance.date >= week_ago.date(), Attendance.present == True)
    ) or 0
    
    return {
        "totalMembers": total_members or 0,
        "newMembersThisWeek": new_members or 0,
        "weeklyAttendance": this_week_attendance,
        "sermonDownloads": int(sermon_downloads),
        "liveViewers": current_stream.viewers if current_stream else 0,
        "isLive": current_stream.is_live if current_stream else False,
        "totalSermons": total_sermons or 0,
        "upcomingEvents": upcoming_events or 0,
        "activeAnnouncements": active_announcements or 0
    }
