import { useState } from 'react';

interface SharePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: number | string;
}

export default function SharePlaylistModal({ isOpen, onClose, playlistId }: SharePlaylistModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://bibleway.church/playlists/${playlistId}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Share Playlist</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Playlist Link</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Share via</p>
              <div className="grid grid-cols-3 gap-3">
                <button className="flex flex-col items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50">
                  <i className="ri-mail-line text-2xl text-gray-600 mb-1"></i>
                  <span className="text-xs text-gray-600">Email</span>
                </button>
                <button className="flex flex-col items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50">
                  <i className="ri-facebook-fill text-2xl text-blue-600 mb-1"></i>
                  <span className="text-xs text-gray-600">Facebook</span>
                </button>
                <button className="flex flex-col items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50">
                  <i className="ri-twitter-fill text-2xl text-blue-400 mb-1"></i>
                  <span className="text-xs text-gray-600">Twitter</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-6 border-t mt-6">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
