import { useState, useEffect } from 'react';
import { useContent } from '@/hooks/useContent';

export default function ContactContent() {
  const { getContent, updateContent } = useContent();
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressLine3, setAddressLine3] = useState('');
  const [addressLine4, setAddressLine4] = useState('');
  const [email, setEmail] = useState('');
  const [serviceTime1, setServiceTime1] = useState('');
  const [serviceTime2, setServiceTime2] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const data = await getContent();
      const contentMap = Array.isArray(data) ? data.reduce((acc: any, item: any) => {
        acc[item.key] = item.value;
        return acc;
      }, {}) : data;
      setAddressLine1(contentMap.address_line1 || '');
      setAddressLine2(contentMap.address_line2 || '');
      setAddressLine3(contentMap.address_line3 || '');
      setAddressLine4(contentMap.address_line4 || '');
      setEmail(contentMap.contact_email || '');
      setServiceTime1(contentMap.service_time1 || '');
      setServiceTime2(contentMap.service_time2 || '');
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all([
        updateContent('address_line1', addressLine1),
        updateContent('address_line2', addressLine2),
        updateContent('address_line3', addressLine3),
        updateContent('address_line4', addressLine4),
        updateContent('contact_email', email),
        updateContent('service_time1', serviceTime1),
        updateContent('service_time2', serviceTime2)
      ]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loadingContent) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <i className="ri-check-circle-line text-green-400 text-lg mr-3"></i>
            <p className="text-sm font-medium text-green-800">Contact content saved successfully!</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Address Section */}
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Church Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5, Ali-Asekun Street,"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Olojojo Bus Stop,"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 3</label>
              <input
                type="text"
                value={addressLine3}
                onChange={(e) => setAddressLine3(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Oworonsoki,"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 4</label>
              <input
                type="text"
                value={addressLine4}
                onChange={(e) => setAddressLine4(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lagos, Nigeria."
              />
            </div>
          </div>
        </div>

        {/* Email Section */}
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Address</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="biblewayft@gmail.com"
            />
          </div>
        </div>

        {/* Service Times Section */}
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Times</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Time 1</label>
              <input
                type="text"
                value={serviceTime1}
                onChange={(e) => setServiceTime1(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Wednesdays @ 5:30pm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Time 2</label>
              <input
                type="text"
                value={serviceTime2}
                onChange={(e) => setServiceTime2(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sundays @ 8:30am"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          <i className="ri-save-line mr-2"></i>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
