import { useState } from 'react';
import EditPlaylistModal from '@/components/modals/EditPlaylistModal';
import SharePlaylistModal from '@/components/modals/SharePlaylistModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import PlaylistMusicPlayer from '@/components/PlaylistMusicPlayer';
import { usePlaylists } from '@/hooks/usePlaylists';
import { Sermon } from '@/types';

interface PlaylistGridProps {
  viewMode: 'grid' | 'list';
  onRefresh?: () => void;
  onCreateClick?: () => void;
}

export default function PlaylistGrid({ viewMode, onRefresh, onCreateClick }: PlaylistGridProps) {
  const { playlists, loading, deletePlaylist, getPlaylist } = usePlaylists();
  const [playingPlaylist, setPlayingPlaylist] = useState<string | number | null>(null);
  const [playlistSermons, setPlaylistSermons] = useState<Sermon[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | number | null>(null);

  const togglePlay = async (playlistId: string | number) => {
    if (playingPlaylist === playlistId) {
      setPlayingPlaylist(null);
      setPlaylistSermons([]);
    } else {
      try {
        const playlist = await getPlaylist(playlistId);
        if (playlist.sermons && playlist.sermons.length > 0) {
          setPlaylistSermons(playlist.sermons);
          setPlayingPlaylist(playlistId);
        } else {
          alert('This playlist has no sermons');
        }
      } catch (error) {
        console.error('Error loading playlist:', error);
        alert('Failed to load playlist');
      }
    }
  };

  const handleEdit = (id: string | number) => {
    setSelectedPlaylist(id);
    setShowEditModal(true);
  };

  const handleShare = (id: string | number) => {
    setSelectedPlaylist(id);
    setShowShareModal(true);
  };

  const handleDelete = (id: string | number) => {
    setSelectedPlaylist(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedPlaylist) {
      await deletePlaylist(selectedPlaylist);
      setShowDeleteConfirm(false);
      setSelectedPlaylist(null);
      onRefresh?.();
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading playlists...</div>;
  }

  if (viewMode === 'list') {
    return (
      <>
      {playingPlaylist && playlistSermons.length > 0 && (
        <PlaylistMusicPlayer
          sermons={playlistSermons}
          onClose={() => {
            setPlayingPlaylist(null);
            setPlaylistSermons([]);
          }}
        />
      )}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <i className="ri-playlist-line text-white text-2xl"></i>
                    </div>
                    <button
                      onClick={() => togglePlay(playlist.id)}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <i className={`${playingPlaylist === playlist.id ? 'ri-pause-fill' : 'ri-play-fill'} text-white text-lg`}></i>
                    </button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{playlist.name}</h3>
                      {playlist.is_public && (
                        <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Public
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{playlist.description || 'No description'}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{playlist.sermon_count || 0} sermons</span>
                      <span>{playlist.plays || 0} plays</span>
                      <span>Updated {new Date(playlist.updated_at || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => togglePlay(playlist.id)}
                    className={`flex items-center px-3 py-1 rounded-md text-sm cursor-pointer whitespace-nowrap ${
                      playingPlaylist === playlist.id 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    <i className={`${playingPlaylist === playlist.id ? 'ri-pause-line' : 'ri-play-line'} mr-1`}></i>
                    {playingPlaylist === playlist.id ? 'Playing' : 'Play'}
                  </button>
                  <button onClick={() => handleDelete(playlist.id)} className="p-2 text-gray-400 hover:text-red-600 cursor-pointer">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-delete-bin-line"></i>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {playlists.map((playlist) => (
        <div key={playlist.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative">
            <div className="h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <button
                onClick={() => togglePlay(playlist.id)}
                className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors cursor-pointer"
              >
                <i className={`${playingPlaylist === playlist.id ? 'ri-pause-fill' : 'ri-play-fill'} text-white text-3xl`}></i>
              </button>
            </div>
            <div className="absolute top-4 right-4">
              {playlist.is_public && (
                <span className="inline-flex px-2 py-1 text-xs bg-white bg-opacity-20 text-white rounded-full backdrop-blur-sm">
                  Public
                </span>
              )}
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center text-white text-sm">
                <i className="ri-music-line mr-1"></i>
                {playlist.sermon_count || 0} sermons
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{playlist.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{playlist.description || 'No description'}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>Created {new Date(playlist.created_at || '').toLocaleDateString()}</span>
              <span>{playlist.plays || 0} plays</span>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => togglePlay(playlist.id)}
                className={`flex items-center px-3 py-1 rounded-md text-sm cursor-pointer whitespace-nowrap ${
                  playingPlaylist === playlist.id 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                <i className={`${playingPlaylist === playlist.id ? 'ri-pause-line' : 'ri-play-line'} mr-1`}></i>
                {playingPlaylist === playlist.id ? 'Playing' : 'Play All'}
              </button>
              
              <div className="flex items-center space-x-1">
                <button onClick={() => handleEdit(playlist.id)} className="p-2 text-gray-400 hover:text-blue-600 cursor-pointer">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-edit-line"></i>
                  </div>
                </button>
                <button onClick={() => handleShare(playlist.id)} className="p-2 text-gray-400 hover:text-green-600 cursor-pointer">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-share-line"></i>
                  </div>
                </button>
                <button onClick={() => handleDelete(playlist.id)} className="p-2 text-gray-400 hover:text-red-600 cursor-pointer">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-delete-bin-line"></i>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Playlist"
        message="Are you sure you want to delete this playlist? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      {selectedPlaylist && (
        <>
          <EditPlaylistModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            playlistId={selectedPlaylist}
            onSuccess={onRefresh}
          />
          <SharePlaylistModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            playlistId={selectedPlaylist}
          />
        </>
      )}

      {playlists.length === 0 && !loading && (
        <div className="col-span-full text-center py-12">
          <i className="ri-playlist-line text-gray-400 text-4xl mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No playlists yet</h3>
          <p className="text-gray-500 mb-4">Create your first playlist to organize your favorite sermons.</p>
          <button onClick={onCreateClick} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer whitespace-nowrap">
            Create Playlist
          </button>
        </div>
      )}

      {playingPlaylist && playlistSermons.length > 0 && (
        <PlaylistMusicPlayer
          sermons={playlistSermons}
          onClose={() => {
            setPlayingPlaylist(null);
            setPlaylistSermons([]);
          }}
        />
      )}
    </div>
  );
}
