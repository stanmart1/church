import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getRecentNotifications, getUnreadCount, markAsRead } = useNotifications();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      const data = await getRecentNotifications(user?.id);
      setNotifications(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCount(user?.id || '');
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
      fetchUnreadCount();
    }
    if (notification.link) {
      navigate(notification.link);
    }
    setShowNotifications(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      if (search.includes('sermon') || search.includes('message') || search.includes('preach')) {
        navigate('/sermons');
      } else if (search.includes('member') || search.includes('people') || search.includes('contact')) {
        navigate('/membership');
      } else if (search.includes('event') || search.includes('calendar') || search.includes('schedule')) {
        navigate('/events');
      } else {
        navigate('/sermons');
      }
      setSearchTerm('');
    }
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden cursor-pointer"
        onClick={onMenuClick}
      >
        <i className="ri-menu-line text-xl"></i>
      </button>

      <div className="h-6 w-px bg-gray-200 lg:hidden"></div>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form onSubmit={handleSearch} className="relative hidden sm:flex sm:flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <i className="ri-search-line text-gray-400 text-sm"></i>
          </div>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-sm"
            placeholder="Search sermons, members, events..."
            type="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
          <div className="relative">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 cursor-pointer relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="ri-notification-2-line text-xl"></i>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b">
                  Notifications
                </div>
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <i className="ri-notification-line text-blue-500 mt-1"></i>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.type}</p>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{Math.round(parseFloat(notification.time))} {notification.time.includes('minutes') ? 'min' : notification.time.includes('hours') ? 'hrs' : 'days'} ago</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No notifications
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"></div>

          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5 cursor-pointer"
              onClick={() => setShowProfile(!showProfile)}
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name ? getInitials(user.name) : 'U'}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900">
                  {user?.name || 'User'}
                </span>
                <i className="ml-2 ri-arrow-down-s-line text-gray-400"></i>
              </span>
            </button>
            {showProfile && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                  Your Profile
                </Link>
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/landing');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
