import { useState, useEffect } from 'react';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useSermons } from '@/hooks/useSermons';

interface EditPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string | number;
  onSuccess?: () => void;
}

export default function EditPlaylistModal({ isOpen, onClose, playlistId, onSuccess }: EditPlaylistModalProps) {
  const { getPlaylist, updatePlaylist } = usePlaylists();
  const { sermons, fetchSermons } = useSermons();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    selectedSermons: [] as (string | number)[]
  });

  useEffect(() => {
    if (isOpen && playlistId) {
      fetchPlaylist();
      fetchSermons();
    }
  }, [isOpen, playlistId]);

  const fetchPlaylist = async () => {
    try {
      setLoadingData(true);
      const playlist = await getPlaylist(playlistId);
      setFormData({
        name: playlist.name || '',
        description: playlist.description || '',
        isPublic: playlist.is_public || false,
        selectedSermons: playlist.sermons?.map((s: any) => s.id) || []
      });
    } catch (error) {
      console.error('Error fetching playlist:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePlaylist(playlistId, {
        name: formData.name,
        description: formData.description,
        isPublic: formData.isPublic,
        sermons: formData.selectedSermons
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating playlist:', error);
      alert('Failed to update playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const toggleSermon = (sermonId: string | number) => {
    setFormData(prev => ({
      ...prev,
      selectedSermons: prev.selectedSermons.includes(sermonId)
        ? prev.selectedSermons.filter(id => id !== sermonId)
        : [...prev.selectedSermons, sermonId]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit Playlist</h3>
                <p className="text-sm text-gray-500 mt-1">Update your playlist details</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
          </div>

          {loadingData ? (
            <div className="text-center py-12">Loading playlist data...</div>
          ) : (
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            {/* Playlist Information */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <div className="flex items-center space-x-2 mb-4">
                <i className="ri-play-list-2-line text-blue-600 text-lg"></i>
                <h4 className="text-sm font-semibold text-gray-900">Playlist Information</h4>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Playlist Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter playlist name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  maxLength={500}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your playlist..."
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    id="is-public"
                    name="isPublic"
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is-public" className="ml-2 text-sm text-gray-700">
                    Make this playlist public (others can view and listen)
                  </label>
                </div>
              </div>
            </div>

            {/* Select Sermons */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-4">
                <i className="ri-music-2-line text-blue-600 text-lg"></i>
                <h4 className="text-sm font-semibold text-gray-900">Select Sermons</h4>
              </div>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                {sermons && sermons.length > 0 ? (
                  sermons.map((sermon) => (
                    <div
                      key={sermon.id}
                      className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
                        formData.selectedSermons.includes(sermon.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => toggleSermon(sermon.id)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedSermons.includes(sermon.id)}
                        onChange={() => toggleSermon(sermon.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">{sermon.title}</div>
                        <div className="text-xs text-gray-500">Speaker: {sermon.speaker}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">No sermons available</div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {formData.selectedSermons.length} sermon{formData.selectedSermons.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t -mx-6 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer whitespace-nowrap w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-1"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="ri-save-line mr-1"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
