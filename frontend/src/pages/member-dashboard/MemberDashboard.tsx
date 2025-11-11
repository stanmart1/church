import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useMemberDashboard } from '@/hooks/useMemberDashboard';
import { useLivestream } from '@/hooks/useLivestream';
import { useNotifications } from '@/hooks/useNotifications';
import { api } from '@/services/api';

const AudioPlayer = lazy(() => import('@/components/AudioPlayer'));
const LiveStreamPlayer = lazy(() => import('@/components/livestream/LiveStreamPlayer'));
const LiveStreamInfo = lazy(() => import('@/components/livestream/LiveStreamInfo'));
const LiveStreamChat = lazy(() => import('@/pages/live/LiveStreamChat'));
const MemberEvents = lazy(() => import('./MemberEvents'));
const MemberGiving = lazy(() => import('./MemberGiving'));
const MemberPrayer = lazy(() => import('./MemberPrayer'));

const LoadingSpinner = () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;

export default function MemberDashboard() {
  const { user } = useAuth();
  const { stats, recentSermons, upcomingEvents, loading } = useMemberDashboard(user?.id || '');
  const { getCurrentLivestream } = useLivestream();
  const { getRecentNotifications, getUnreadCount, markAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStream, setCurrentStream] = useState<any>(null);

  const [loadingStream, setLoadingStream] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user?.id]);

  useEffect(() => {
    loadLivestream();
    
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5001';
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe-stream-status' }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'stream-status-change' || data.type === 'stream-update') {
          loadLivestream();
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    return () => ws.close();
  }, []);

  const loadLivestream = async () => {
    setLoadingStream(true);
    try {
      const stream = await getCurrentLivestream();
      if (stream && stream.id) {
        setCurrentStream(stream);
      } else {
        setCurrentStream(null);
      }
    } catch (error) {
      console.error('Error loading livestream:', error);
      setCurrentStream(null);
    } finally {
      setLoadingStream(false);
    }
  };

  const [sermonSearchTerm, setSermonSearchTerm] = useState('');
  const [sermons, setSermons] = useState<any[]>([]);
  const [loadingSermons, setLoadingSermons] = useState(false);
  const [currentSermon, setCurrentSermon] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'sermons') {
      loadSermons();
    }
  }, [activeTab, sermonSearchTerm]);

  const loadSermons = async () => {
    setLoadingSermons(true);
    try {
      const params: any = { limit: 20 };
      if (sermonSearchTerm) params.search = sermonSearchTerm;
      const response = await api.get(`/sermons?${new URLSearchParams(params).toString()}`);
      setSermons(response.data || response);
    } catch (error) {
      console.error('Error loading sermons:', error);
    } finally {
      setLoadingSermons(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await getRecentNotifications(user?.id);
      setNotifications(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
      setActiveTab('livestream');
    }
    setShowNotifications(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600" style={{ fontFamily: "Pacifico, serif" }}>
                Bibleway
              </div>
              <span className="ml-2 sm:ml-4 text-sm sm:text-base text-gray-600 hidden sm:inline">Member Portal</span>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer relative"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-notification-2-line"></i>
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
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
              <Link to="/landing" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'Member'}!</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Stay connected with your church community</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 sm:mb-8">
          <div className="sm:border-b border-gray-200">
            <nav className="grid grid-cols-3 gap-2 sm:gap-0 sm:flex sm:space-x-8 p-4 sm:px-6 sm:py-0">
              {[
                { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
                { id: 'livestream', label: 'Live Stream', icon: 'ri-live-line' },
                { id: 'sermons', label: 'Sermons', icon: 'ri-book-open-line' },
                { id: 'events', label: 'Events', icon: 'ri-calendar-line' },
                { id: 'giving', label: 'Giving', icon: 'ri-hand-heart-line' },
                { id: 'prayer', label: 'Prayer Requests', icon: 'ri-heart-line' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start py-3 sm:py-4 px-1 border sm:border-0 border-b-2 rounded-lg sm:rounded-none font-semibold text-xs sm:text-sm cursor-pointer transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-gray-300 sm:border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <i className={`${tab.icon} sm:mr-2 text-lg sm:text-base`}></i>
                  <span className="mt-1 sm:mt-0 text-center">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-12">Loading...</div>
                ) : (
                  <>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      <div className="bg-blue-50 rounded-lg p-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i className="ri-download-cloud-line text-blue-600 text-xl"></i>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">Total Downloaded Sermons</p>
                            <p className="text-2xl font-bold text-blue-900">{stats.downloadedSermons} Sermons</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <i className="ri-hand-heart-line text-green-600 text-xl"></i>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-green-600">Total Giving</p>
                            <p className="text-2xl font-bold text-green-900">₦{stats.totalGiving.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <i className="ri-group-line text-purple-600 text-xl"></i>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-purple-600">Events Attended</p>
                            <p className="text-2xl font-bold text-purple-900">{stats.eventsAttended} Events</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sermons</h3>
                        <div className="space-y-4">
                          {recentSermons.length > 0 ? recentSermons.map((sermon: any) => (
                            <div key={sermon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{sermon.title}</p>
                                <p className="text-sm text-gray-500">{new Date(sermon.date).toLocaleDateString()}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {sermon.duration && <span className="text-xs text-gray-500">{sermon.duration}</span>}
                                <button 
                                  onClick={() => setCurrentSermon(sermon)}
                                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                >
                                  <i className="ri-play-line"></i>
                                </button>
                              </div>
                            </div>
                          )) : (
                            <p className="text-gray-500 text-center py-4">No recent sermons</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                        <div className="space-y-4">
                          {upcomingEvents.length > 0 ? upcomingEvents.map((event: any) => (
                            <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{event.title}</p>
                                <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {event.type}
                                </span>
                              </div>
                            </div>
                          )) : (
                            <p className="text-gray-500 text-center py-4">No upcoming events</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'livestream' && (
              <div>
                {loadingStream ? (
                  <div className="text-center py-12">Loading stream...</div>
                ) : (
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        <LiveStreamPlayer 
                          isLive={currentStream?.is_live || false} 
                          title={currentStream?.title}
                          description={currentStream?.description}
                          streamUrl={currentStream?.stream_url}
                          streamId={currentStream?.id}
                        />
                        <LiveStreamInfo 
                          isLive={currentStream?.is_live || false} 
                        />
                      </div>
                      <div>
                        <LiveStreamChat streamId={currentStream?.id} isLive={currentStream?.is_live || false} showDeleteButton={false} />
                      </div>
                    </div>
                  </Suspense>
                )}
              </div>
            )}

            {activeTab === 'sermons' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Sermon Library</h3>
                  <div className="relative">
                    <input
                      type="text"
                      value={sermonSearchTerm}
                      onChange={(e) => setSermonSearchTerm(e.target.value)}
                      placeholder="Search sermons..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <i className="ri-search-line absolute left-3 top-2.5 text-gray-400 text-sm"></i>
                  </div>
                </div>

                {loadingSermons ? (
                  <div className="text-center py-12">Loading sermons...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {sermons.length > 0 ? sermons.map((sermon) => (
                      <div key={sermon.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">{sermon.title}</h4>
                            <p className="text-sm text-gray-600 mb-1">by {sermon.speaker}</p>
                            <p className="text-sm text-gray-500">{new Date(sermon.date).toLocaleDateString()} • {sermon.duration}</p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
                            <i className="ri-bookmark-line"></i>
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{sermon.plays || 0} plays</span>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => currentSermon?.id === sermon.id ? setCurrentSermon(null) : setCurrentSermon(sermon)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap"
                            >
                              <i className={`${currentSermon?.id === sermon.id ? 'ri-pause-line' : 'ri-play-line'} mr-2`}></i>
                              {currentSermon?.id === sermon.id ? 'Pause' : 'Play'}
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  await api.post(`/sermons/${sermon.id}/download`, {});
                                  const response = await fetch(`${import.meta.env.VITE_API_URL?.replace('/api', '')}${sermon.audio_url}`);
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `${sermon.title}.mp3`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  window.URL.revokeObjectURL(url);
                                } catch (error) {
                                  console.error('Download error:', error);
                                }
                              }}
                              className="text-gray-600 hover:text-gray-800 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer"
                            >
                              <i className="ri-download-line"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-2 text-center py-12">
                        <i className="ri-search-line text-4xl text-gray-300 mb-2"></i>
                        <p className="text-gray-500">{sermonSearchTerm ? `No sermons found matching "${sermonSearchTerm}"` : 'No sermons available'}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'events' && (
              <Suspense fallback={<LoadingSpinner />}>
                <MemberEvents />
              </Suspense>
            )}

            {activeTab === 'giving' && (
              <Suspense fallback={<LoadingSpinner />}>
                <MemberGiving />
              </Suspense>
            )}

            {activeTab === 'prayer' && (
              <Suspense fallback={<LoadingSpinner />}>
                <MemberPrayer />
              </Suspense>
            )}
          </div>
        </div>
      </div>

      {currentSermon && (
        <Suspense fallback={null}>
          <AudioPlayer 
            sermon={currentSermon} 
            onClose={() => setCurrentSermon(null)} 
          />
        </Suspense>
      )}
    </div>
  );
}
