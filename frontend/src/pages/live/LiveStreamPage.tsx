import { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { useLivestream } from '@/hooks/useLivestream';
import LivestreamWebSocket from '@/services/LivestreamWebSocket';

const StreamControls = lazy(() => import('./StreamControls'));
const ViewersList = lazy(() => import('./ViewersList'));
const StreamStats = lazy(() => import('./StreamStats'));
const LiveStreamChat = lazy(() => import('./LiveStreamChat'));

const LoadingSpinner = () => <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>;

export default function LiveStreamPage() {
  const { getCurrentLivestream, createLivestream, endLivestream, getStreamHistory, updateLivestream } = useLivestream();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [streamHistory, setStreamHistory] = useState<any[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalHistoryPages, setTotalHistoryPages] = useState(1);
  const [streamStats, setStreamStats] = useState({
    current_viewers: 0,
    peak_viewers: 0,
    duration: 0,
    chat_messages: 0
  });
  const [streamSettings, setStreamSettings] = useState({
    title: 'Sunday Morning Service - Live Audio',
    quality: 'high',
    category: 'Sunday Service',
    autoRecord: true,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [showAudioDeviceModal, setShowAudioDeviceModal] = useState(false);
  const [audioDevices, setAudioDevices] = useState<{ inputDevices: MediaDeviceInfo[], outputDevices: MediaDeviceInfo[] }>({ inputDevices: [], outputDevices: [] });
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>('');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>('');
  const [audioDeviceLoading, setAudioDeviceLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);

  useEffect(() => {
    loadCurrentStream();
    loadStreamHistory(historyPage);
    loadAudioDevices();

    const handleDeviceChange = () => {
      loadAudioDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [historyPage]);

  const loadAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputDevices = devices.filter(device => device.kind === 'audioinput');
      const outputDevices = devices.filter(device => device.kind === 'audiooutput');
      setAudioDevices({ inputDevices, outputDevices });
      if (inputDevices.length > 0 && !selectedInputDevice) {
        setSelectedInputDevice(inputDevices[0].deviceId);
      }
      if (outputDevices.length > 0 && !selectedOutputDevice) {
        setSelectedOutputDevice(outputDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error loading audio devices:', error);
    }
  };

  useEffect(() => {
    if (currentStreamId && isLive) {
      LivestreamWebSocket.connect(currentStreamId, (stats) => {
        setStreamStats(stats);
        setViewerCount(stats.current_viewers);
      });

      return () => {
        LivestreamWebSocket.disconnect();
      };
    } else if (!isLive) {
      LivestreamWebSocket.disconnect();
      setStreamStats({
        current_viewers: 0,
        peak_viewers: 0,
        duration: 0,
        chat_messages: 0
      });
    }
  }, [currentStreamId, isLive]);

  const loadCurrentStream = async () => {
    try {
      const stream = await getCurrentLivestream();
      if (stream && stream.id) {
        setIsLive(true);
        setViewerCount(stream.viewers || 0);
        setCurrentStreamId(stream.id);
        setStreamSettings(prev => ({
          ...prev,
          title: stream.title || prev.title,
          description: stream.description || prev.description
        }));
      } else {
        setIsLive(false);
        setCurrentStreamId(null);
      }
    } catch (error) {
      setIsLive(false);
      setCurrentStreamId(null);
    }
  };

  const loadStreamHistory = async (page = 1) => {
    try {
      const response = await getStreamHistory(page, 5);
      setStreamHistory(response.data || response);
      if (response.pagination) {
        setTotalHistoryPages(response.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error loading stream history:', error);
    }
  };



  const handleToggleLive = async (live: boolean) => {
    if (live) {
      setLoading(true);
      try {
        const stream = await createLivestream({
          title: streamSettings.title,
          description: streamSettings.description,
          stream_url: null
        });
        setCurrentStreamId(stream.id);
        setIsLive(true);
        setStreamStats({
          current_viewers: 0,
          peak_viewers: 0,
          duration: 0,
          chat_messages: 0
        });
      } finally {
        setLoading(false);
      }
    } else {
      if (currentStreamId) {
        setLoading(true);
        try {
          LivestreamWebSocket.disconnect();
          await endLivestream(currentStreamId);
          setCurrentStreamId(null);
          setIsLive(false);
          setViewerCount(0);
          setStreamStats({
            current_viewers: 0,
            peak_viewers: 0,
            duration: 0,
            chat_messages: 0
          });
          await loadStreamHistory(1);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Live Audio Streaming</h1>
              <p className="mt-2 text-sm text-gray-700">
                Broadcast live audio services to your online congregation.
              </p>
            </div>

            <Suspense fallback={<LoadingSpinner />}>
              <StreamStats isLive={isLive} stats={streamStats} />
            </Suspense>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 relative">
                    {isLive ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <i className="ri-mic-line text-3xl relative z-10"></i>
                          </div>
                          <h3 className="text-2xl font-semibold mb-2">LIVE AUDIO</h3>
                          <p className="text-gray-300 mb-4">Broadcasting to {viewerCount} listeners</p>
                          <div className="flex items-center justify-center space-x-6 text-sm">
                            <div className="flex items-center">
                              <i className="ri-headphone-line mr-2"></i>
                              {streamSettings.quality === 'high' ? 'High Quality (128kbps)' : streamSettings.quality === 'standard' ? 'Standard (96kbps)' : 'Low Bandwidth (64kbps)'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <i className="ri-mic-off-line text-5xl mb-6"></i>
                          <h3 className="text-2xl font-semibold mb-2">Audio Stream Offline</h3>
                          <p className="mb-4">Ready to broadcast live audio to your congregation</p>
                          <div className="flex items-center justify-center space-x-6 text-sm">
                            <div className="flex items-center">
                              <i className="ri-headphone-line mr-2"></i>
                              {streamSettings.quality === 'high' ? 'High Quality (128kbps)' : streamSettings.quality === 'standard' ? 'Standard (96kbps)' : 'Low Bandwidth (64kbps)'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {isLive && (
                      <>
                        <div className="absolute top-4 left-4 flex items-center space-x-2">
                          <div className="flex items-center bg-red-600 text-white px-3 py-2 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                            LIVE AUDIO
                          </div>
                          <div className="bg-black/50 text-white px-3 py-2 rounded-full text-sm">
                            <i className="ri-headphone-line mr-1"></i>
                            {viewerCount} listeners
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                          <button
                            onClick={() => setShowAudioDeviceModal(true)}
                            className="bg-black/50 backdrop-blur-sm rounded-lg p-2 hover:bg-black/70 transition-colors"
                            title="Audio Device Settings"
                          >
                            <i className="ri-settings-3-line text-white text-sm"></i>
                          </button>
                          <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                            {[...Array(20)].map((_, i) => {
                              const threshold = (i + 1) * 5;
                              const isActive = audioLevel > threshold;
                              let bgColor = 'bg-gray-600';
                              if (isActive) {
                                if (i < 12) bgColor = 'bg-green-500';
                                else if (i < 16) bgColor = 'bg-yellow-500';
                                else bgColor = 'bg-red-500';
                              }
                              return (
                                <div
                                  key={i}
                                  className={`w-1 h-4 rounded-full transition-all duration-75 ${bgColor}`}
                                ></div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                    

                  </div>
                  
                  <Suspense fallback={<LoadingSpinner />}>
                    <StreamControls isLive={isLive} onToggleLive={handleToggleLive} loading={loading} currentStreamId={currentStreamId} onAudioLevelChange={setAudioLevel} selectedInputDevice={selectedInputDevice} selectedOutputDevice={selectedOutputDevice} shouldResumeAudio={!!currentStreamId} />
                  </Suspense>
                </div>

                <div className="bg-white shadow-sm rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Audio Stream Settings</h3>
                    {isLive && (
                      <button
                        onClick={async () => {
                          if (currentStreamId) {
                            try {
                              await updateLivestream(currentStreamId, {
                                title: streamSettings.title,
                                description: streamSettings.description
                              });
                              alert('Stream settings updated!');
                            } catch (error) {
                              console.error('Error updating stream:', error);
                              alert('Failed to update stream settings');
                            }
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm cursor-pointer"
                      >
                        Save Changes
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stream Title
                      </label>
                      <input
                        type="text"
                        value={streamSettings.title}
                        onChange={(e) => setStreamSettings(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Audio Quality
                      </label>
                      <select 
                        value={streamSettings.quality}
                        onChange={(e) => setStreamSettings(prev => ({ ...prev, quality: e.target.value }))}
                        className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="high">High Quality (128kbps)</option>
                        <option value="standard">Standard (96kbps)</option>
                        <option value="low">Low Bandwidth (64kbps)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select 
                        value={streamSettings.category}
                        onChange={(e) => setStreamSettings(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Sunday Service</option>
                        <option>Bible Study</option>
                        <option>Prayer Meeting</option>
                        <option>Special Event</option>
                        <option>Youth Service</option>
                        <option>Worship Night</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Auto Record
                      </label>
                      <select 
                        value={streamSettings.autoRecord ? 'yes' : 'no'}
                        onChange={(e) => setStreamSettings(prev => ({ ...prev, autoRecord: e.target.value === 'yes' }))}
                        className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="yes">Yes - Save for library</option>
                        <option value="no">No - Live only</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={streamSettings.description}
                      onChange={(e) => setStreamSettings(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what's happening in this audio stream..."
                    />
                  </div>
                </div>

              </div>
              
              <div className="lg:col-span-1 space-y-6">
                <Suspense fallback={<LoadingSpinner />}>
                  {showChat && <LiveStreamChat streamId={currentStreamId} isLive={isLive} showDeleteButton={true} />}
                  <ViewersList streamId={currentStreamId} onToggleChat={() => setShowChat(!showChat)} showChat={showChat} />
                </Suspense>
              </div>
            </div>

            <div className="mt-6">
              <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Stream History</h3>
                </div>
                <div className="space-y-3">
                  {streamHistory.length > 0 ? (
                    streamHistory.slice(0, 5).map((stream) => {
                      const durationSeconds = stream.end_time && stream.start_time 
                        ? Math.floor((new Date(stream.end_time).getTime() - new Date(stream.start_time).getTime()) / 1000)
                        : 0;
                      const hours = Math.floor(durationSeconds / 3600);
                      const minutes = Math.floor((durationSeconds % 3600) / 60);
                      const seconds = durationSeconds % 60;
                      const durationStr = durationSeconds > 0 ? `${hours}h ${minutes}m ${seconds}s` : 'N/A';
                      const dateStr = stream.start_time ? new Date(stream.start_time).toLocaleDateString() : new Date(stream.created_at).toLocaleDateString();
                      
                      return (
                        <div key={stream.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium">{stream.title}</div>
                            <div className="text-xs text-gray-500">
                              {dateStr} • {durationStr}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">{stream.viewers || 0} viewers</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">No stream history yet</div>
                  )}
                </div>
                {totalHistoryPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <button
                      onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {historyPage} of {totalHistoryPages}
                    </span>
                    <button
                      onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                      disabled={historyPage === totalHistoryPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {showAudioDeviceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowAudioDeviceModal(false)}></div>
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Audio Device Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Input Device (Microphone)</label>
                  <select
                    value={selectedInputDevice}
                    onChange={(e) => setSelectedInputDevice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {audioDevices.inputDevices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Output Device (Speakers)</label>
                  <select
                    value={selectedOutputDevice}
                    onChange={(e) => setSelectedOutputDevice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {audioDevices.outputDevices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button onClick={() => setShowAudioDeviceModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    setAudioDeviceLoading(true);
                    await loadAudioDevices();
                    setAudioDeviceLoading(false);
                    setShowAudioDeviceModal(false);
                  }}
                  disabled={audioDeviceLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {audioDeviceLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
