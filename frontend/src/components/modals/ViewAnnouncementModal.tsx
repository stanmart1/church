import { Announcement } from '@/types';

interface ViewAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement;
}

export default function ViewAnnouncementModal({ isOpen, onClose, announcement }: ViewAnnouncementModalProps) {
  if (!isOpen) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-0">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{announcement.title}</h3>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                  {announcement.priority}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(announcement.status)}`}>
                  {announcement.status}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
          <div className="px-6 py-6 space-y-6">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {announcement.created_by_name && (
                <div className="flex items-center">
                  <i className="ri-user-line mr-1"></i>
                  {announcement.created_by_name}
                </div>
              )}
              <div className="flex items-center">
                <i className="ri-calendar-line mr-1"></i>
                {new Date((announcement.publish_date || announcement.publishDate) || '').toLocaleDateString()}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Content</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
            </div>
            {(announcement.expiry_date || announcement.expiryDate) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center text-sm text-yellow-800">
                  <i className="ri-time-line mr-2"></i>
                  Expires on {new Date((announcement.expiry_date || announcement.expiryDate) || '').toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
