

interface PrayerRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
}

export default function PrayerRequestDetailsModal({ isOpen, onClose, request }: PrayerRequestDetailsModalProps) {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Prayer Request Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                request.status === 'Answered' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {request.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {request.author ? `by ${request.author} • ` : ''}{request.date}
            </p>
            <p className="text-gray-700">
              {request.description || 'Please keep this request in your prayers. Your support means everything during this time.'}
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                <i className="ri-heart-line mr-2"></i>
                {request.prayers} people praying
              </span>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                <i className="ri-heart-line mr-2"></i>
                Pray for this
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
