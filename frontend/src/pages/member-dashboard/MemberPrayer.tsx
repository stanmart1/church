import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePrayers } from '@/hooks/usePrayers';
import AddPrayerRequestModal from '@/components/modals/AddPrayerRequestModal';
import PrayerRequestDetailsModal from '@/components/modals/PrayerRequestDetailsModal';

export default function MemberPrayer() {
  const { user } = useAuth();
  const { getMemberPrayerRequests, getPrayerRequests, prayForRequest } = usePrayers();
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [communityRequests, setCommunityRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  useEffect(() => {
    loadPrayerRequests();
  }, []);

  const loadPrayerRequests = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [myData, communityResponse] = await Promise.all([
        getMemberPrayerRequests(user.id),
        getPrayerRequests({ status: 'active', limit: 20 })
      ]);
      setMyRequests(myData || []);
      const communityData = Array.isArray(communityResponse) ? communityResponse : (communityResponse?.data || []);
      setCommunityRequests(communityData.filter((r: any) => r.member_id !== user.id));
    } catch (error) {
      console.error('Error loading prayer requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePray = async (id: string) => {
    try {
      await prayForRequest(id);
      loadPrayerRequests();
    } catch (error) {
      console.error('Error praying:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Prayer Requests</h3>
        <button 
          onClick={() => setShowPrayerModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap"
        >
          Add Prayer Request
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">My Prayer Requests</h4>
            {myRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <i className="ri-heart-line text-4xl mb-2"></i>
                <p>No prayer requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-1">{request.title}</h5>
                        <p className="text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        request.status === 'answered' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{request.prayer_count || 0} people praying</span>
                      <button 
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Community Prayer Wall</h4>
            {communityRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <i className="ri-heart-line text-4xl mb-2"></i>
                <p>No community requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {communityRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-900 mb-1">{request.title}</h5>
                      <p className="text-sm text-gray-500">
                        by {request.member_name || 'Anonymous'} • {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{request.prayer_count || 0} prayers</span>
                      <button 
                        onClick={() => handlePray(request.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-heart-line mr-1"></i>
                        Pray
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <AddPrayerRequestModal
        isOpen={showPrayerModal}
        onClose={() => setShowPrayerModal(false)}
        onSuccess={loadPrayerRequests}
      />

      <PrayerRequestDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        request={selectedRequest}
      />
    </div>
  );
}
