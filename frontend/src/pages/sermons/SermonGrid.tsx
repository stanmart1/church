import { useState, useEffect } from 'react';
import { useSermons } from '@/hooks/useSermons';
import { useSermonPlayer } from '@/hooks/useSermonPlayer';
import { Sermon } from '@/types';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { getMediaUrl } from '@/services/api';
import AudioPlayer from '@/components/AudioPlayer';
import EditSermonModal from './EditSermonModal';
import LazyImage from '@/components/LazyImage';

interface SermonGridProps {
  searchTerm: string;
  filterSeries: string;
  filterSpeaker: string;
  filterDateRange: string;
  sortBy: string;
  viewMode: 'grid' | 'list';
}

export default function SermonGrid({ 
  searchTerm, 
  filterSeries, 
  filterSpeaker, 
  sortBy, 
  viewMode 
}: SermonGridProps) {
  const { sermons: initialSermons, fetchSermons, deleteSermon } = useSermons();
  const [sermons, setSermons] = useState<Sermon[]>([]);

  useEffect(() => {
    setSermons(initialSermons);
  }, [initialSermons]);
  const [loading, setLoading] = useState(true);
  const [playingSermon, setPlayingSermon] = useState<Sermon | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sermonToDelete, setSermonToDelete] = useState<{ id: string | number; title: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sermonToEdit, setSermonToEdit] = useState<Sermon | null>(null);

  useEffect(() => {
    loadSermons();
  }, [searchTerm, filterSeries, filterSpeaker, sortBy]);

  const loadSermons = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterSeries !== 'all') params.series = filterSeries;
      if (filterSpeaker !== 'all') params.speaker = filterSpeaker;
      if (sortBy) params.sort = sortBy;
      await fetchSermons(params);
    } catch (error) {
      console.error('Error fetching sermons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!sermonToDelete) return;
    try {
      await deleteSermon(sermonToDelete.id);
      setShowDeleteConfirm(false);
      setSermonToDelete(null);
      loadSermons();
    } catch (error) {
      console.error('Error deleting sermon:', error);
    }
  };

  const togglePlay = (sermon: Sermon) => {
    if (playingSermon?.id === sermon.id) {
      setPlayingSermon(null);
    } else {
      setPlayingSermon(sermon);
      // Update local state immediately
      setSermons(prev => prev.map(s => 
        s.id === sermon.id ? { ...s, plays: (s.plays || 0) + 1 } : s
      ));
      // Increment play count on backend
      incrementPlayCount(sermon.id);
    }
  };

  const { incrementDownloadCount, incrementPlayCount } = useSermonPlayer();

  const downloadSermon = async (sermon: Sermon) => {
    try {
      const audioUrl = getMediaUrl(sermon.audio_url);
      if (!audioUrl) {
        alert('Audio file not available');
        return;
      }
      
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sermon.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Update local state immediately
      setSermons(prev => prev.map(s => 
        s.id === sermon.id ? { ...s, downloads: (s.downloads || 0) + 1 } : s
      ));
      await incrementDownloadCount(sermon.id);
    } catch (error) {
      console.error('Error downloading sermon:', error);
      alert('Failed to download sermon');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading sermons...</div>;
  }

  const filteredSermons = sermons;

  if (viewMode === 'list') {
    return (
      <>
      <AudioPlayer sermon={playingSermon} onClose={() => setPlayingSermon(null)} />
      {sermonToEdit && (
        <EditSermonModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSermonToEdit(null);
          }}
          onSuccess={loadSermons}
          sermon={sermonToEdit}
        />
      )}
      <div className="overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
          Showing {filteredSermons.length} sermons
        </div>
        <div className="divide-y divide-gray-200">
          {filteredSermons.map((sermon) => (
            <div key={sermon.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative">
                    {sermon.thumbnail_url ? (
                      <LazyImage 
                        className="w-16 h-16 rounded-lg object-top object-cover" 
                        src={getMediaUrl(sermon.thumbnail_url)}
                        alt={sermon.title}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                        {sermon.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button
                      onClick={() => togglePlay(sermon)}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <i className={`${playingSermon?.id === sermon.id ? 'ri-pause-fill' : 'ri-play-fill'} text-white text-lg`}></i>
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{sermon.title}</h3>
                    <p className="text-sm text-gray-500">{sermon.speaker}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{new Date(sermon.date.split('T')[0] + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>
                      <span>{sermon.duration}</span>
                      {sermon.series_name && (
                        <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {sermon.series_name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2 truncate">{sermon.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500 text-right">
                    <div className="flex items-center">
                      <i className="ri-play-line mr-1"></i>
                      {sermon.plays}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadSermon(sermon)}
                      className="p-2 text-gray-400 hover:text-blue-600 cursor-pointer"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-download-line"></i>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setSermonToEdit(sermon);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 cursor-pointer"
                      title="Edit"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-edit-line"></i>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        setSermonToDelete({ id: sermon.id, title: sermon.title });
                        setShowDeleteConfirm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 cursor-pointer"
                      title="Delete"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-delete-bin-line"></i>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Sermon"
          message={`Are you sure you want to delete "${sermonToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
        />
        {filteredSermons.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-file-search-line text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sermons found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
      </>
    );
  }

  return (
    <>
      <AudioPlayer sermon={playingSermon} onClose={() => setPlayingSermon(null)} />
      {sermonToEdit && (
        <EditSermonModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSermonToEdit(null);
          }}
          onSuccess={loadSermons}
          sermon={sermonToEdit}
        />
      )}
    <div className="p-6">
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredSermons.length} sermons
      </div>
      <div className="space-y-2 max-w-md w-full">
        {filteredSermons.map((sermon) => (
          <div key={sermon.id} className="bg-white hover:bg-gray-50 rounded-lg p-6 flex items-center gap-3 sm:gap-4 group transition-colors border border-gray-200">
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0">
              {sermon.thumbnail_url ? (
                <LazyImage 
                  className="w-full h-full object-cover rounded-md" 
                  src={getMediaUrl(sermon.thumbnail_url)}
                  alt={sermon.title}
                />
              ) : (
                <div className="w-full h-full rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
                  {sermon.title.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => togglePlay(sermon)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-md"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <i className={`${playingSermon?.id === sermon.id ? 'ri-pause-fill' : 'ri-play-fill'} text-gray-900 text-sm ml-0.5`}></i>
                </div>
              </button>
            </div>
            
            <div className="flex-1 min-w-0 max-w-xs">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{sermon.title}</h3>
              <p className="text-xs text-gray-500 truncate">{sermon.speaker}</p>
            </div>
            
            {sermon.series_name && (
              <span className="hidden lg:inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md flex-shrink-0">
                {sermon.series_name}
              </span>
            )}
            
            <div className="hidden md:flex items-center text-xs text-gray-500 gap-4 flex-shrink-0">
              <span>{sermon.duration}</span>
              <div className="flex items-center">
                <i className="ri-headphone-line mr-1"></i>
                {sermon.plays}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => togglePlay(sermon)}
                className={`p-2 rounded-full cursor-pointer transition-colors ${
                  playingSermon?.id === sermon.id 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={playingSermon?.id === sermon.id ? 'Pause' : 'Play'}
              >
                <i className={`${playingSermon?.id === sermon.id ? 'ri-pause-fill' : 'ri-play-fill'} text-lg`}></i>
              </button>
              <button
                onClick={() => downloadSermon(sermon)}
                className="p-2 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"
                title="Download"
              >
                <i className="ri-download-line text-lg"></i>
              </button>
              <button
                onClick={() => {
                  setSermonToEdit(sermon);
                  setShowEditModal(true);
                }}
                className="p-2 text-gray-400 hover:text-green-600 cursor-pointer transition-colors"
                title="Edit"
              >
                <i className="ri-edit-line text-lg"></i>
              </button>
              <button
                onClick={() => {
                  setSermonToDelete({ id: sermon.id, title: sermon.title });
                  setShowDeleteConfirm(true);
                }}
                className="p-2 text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
                title="Delete"
              >
                <i className="ri-delete-bin-line text-lg"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Sermon"
        message={`Are you sure you want to delete "${sermonToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      {filteredSermons.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-file-search-line text-gray-400 text-4xl mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sermons found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
    </>
  );
}


