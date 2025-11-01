


import { useState, useEffect } from 'react';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useSermons } from '@/hooks/useSermons';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreatePlaylistModal({ isOpen, onClose, onSuccess }: CreatePlaylistModalProps) {
  const { createPlaylist, loading: playlistLoading } = usePlaylists();
  const { sermons, fetchSermons } = useSermons();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    selectedSermons: [] as (string | number)[]
  });

  useEffect(() => {
    if (isOpen) {
      fetchSermons();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPlaylist({
      name: formData.name,
      description: formData.description,
      isPublic: formData.isPublic,
      sermons: formData.selectedSermons
    });
    onClose();
    setFormData({
      name: '',
      description: '',
      isPublic: false,
      selectedSermons: []
    });
    onSuccess?.();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Create New Playlist</h3>
                <p className="text-sm text-gray-500 mt-1">Organize your favorite sermons</p>
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

          <form id="create-playlist-form" onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
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
                disabled={playlistLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {playlistLoading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-1"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="ri-add-line mr-1"></i>
                    Create Playlist
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
