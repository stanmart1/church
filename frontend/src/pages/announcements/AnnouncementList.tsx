import { useState, useEffect } from 'react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { Announcement } from '@/types';
import EditAnnouncementModal from '@/components/modals/EditAnnouncementModal';
import ViewAnnouncementModal from '@/components/modals/ViewAnnouncementModal';

interface AnnouncementListProps {
  filterStatus: string;
}

export default function AnnouncementList({ filterStatus }: AnnouncementListProps) {
  const { getAnnouncements } = useAnnouncements();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [filterStatus]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      const response = await getAnnouncements(params);
      setAnnouncements(response.data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading announcements...</div>;
  }



  const handleEdit = (id: string) => {
    setSelectedAnnouncement(id);
    setShowEditModal(true);
  };

  const handleShare = (id: string) => {
    setSelectedAnnouncement(id);
    setShowShareModal(true);
  };

  const handleViewDetails = (id: string) => {
    setSelectedAnnouncement(id);
    setShowDetailsModal(true);
  };

  const filteredAnnouncements = announcements;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {filteredAnnouncements.map((announcement) => (
        <div key={announcement.id} className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {announcement.title}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(announcement.status)}`}>
                    {announcement.status}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
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

                <p className="text-gray-700 line-clamp-2">
                  {announcement.content}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => handleViewDetails(announcement.id)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer whitespace-nowrap"
                  >
                    View Details
                  </button>
                  
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => handleEdit(announcement.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 cursor-pointer"
                      title="Edit"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-edit-line"></i>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleShare(announcement.id)}
                      className="p-2 text-gray-400 hover:text-green-600 cursor-pointer"
                      title="Share"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-share-line"></i>
                      </div>
                    </button>
                  </div>
                </div>

                {(announcement.expiry_date || announcement.expiryDate) && (
                  <div className="mt-3 text-sm text-gray-500">
                    <i className="ri-time-line mr-1"></i>
                    Expires on {new Date((announcement.expiry_date || announcement.expiryDate) || '').toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-megaphone-line text-gray-400 text-4xl mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
          <p className="text-gray-500">
            {filterStatus === 'all' 
              ? 'Create your first announcement to get started.' 
              : `No ${filterStatus} announcements at the moment.`
            }
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAnnouncement && (
        <EditAnnouncementModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          announcementId={selectedAnnouncement}
          announcement={announcements.find(a => a.id === selectedAnnouncement)!}
          onSuccess={fetchAnnouncements}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAnnouncement && (
        <ViewAnnouncementModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          announcement={announcements.find(a => a.id === selectedAnnouncement)!}
        />
      )}

      {/* Share Modal */}
      {showShareModal && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowShareModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Share Announcement</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">Share this announcement via:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <i className="ri-mail-line mr-2"></i>
                    Email
                  </button>
                  <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <i className="ri-message-line mr-2"></i>
                    SMS
                  </button>
                  <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <i className="ri-whatsapp-line mr-2"></i>
                    WhatsApp
                  </button>
                  <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <i className="ri-telegram-line mr-2"></i>
                    Telegram
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
