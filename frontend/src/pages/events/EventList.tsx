import { useState, useEffect } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/types';
import LazyImage from '@/components/LazyImage';

export default function EventList() {
  const { getEvents } = useEvents();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents({});
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading events...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <i className="ri-calendar-line text-4xl mb-2"></i>
        <p>No events found</p>
      </div>
    );
  }


  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);

  const handleViewDetails = (eventId: number) => {
    setSelectedEvent(eventId);
    setShowDetailsModal(true);
  };

  const handleEdit = (eventId: number) => {
    setSelectedEvent(eventId);
    setShowEditModal(true);
  };

  const handleManageAttendees = (eventId: number) => {
    setSelectedEvent(eventId);
    setShowAttendeesModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Retreat': return 'bg-purple-100 text-purple-800';
      case 'Outreach': return 'bg-green-100 text-green-800';
      case 'Education': return 'bg-blue-100 text-blue-800';
      case 'Seminar': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <div key={event.id} className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status || '')}`}>
                    {event.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(event.category || '')}`}>
                    {event.category}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{event.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <i className="ri-calendar-line mr-2"></i>
                      {new Date(event.date).toLocaleDateString()}
                      {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="ri-time-line mr-2"></i>
                      {event.time}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="ri-map-pin-line mr-2"></i>
                      {event.location}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <i className="ri-user-line mr-2"></i>
                      Organized by {event.organizer}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="ri-group-line mr-2"></i>
                      {event.attendees}/{event.maxAttendees} registered
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="ri-calendar-check-line mr-2"></i>
                      Registration deadline: {new Date(event.registrationDeadline || '').toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Registration Progress</span>
                    <span className="text-sm text-gray-600">{event.attendees}/{event.maxAttendees}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${((event.attendees || 0) / (event.maxAttendees || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="ml-6 flex-shrink-0">
                <LazyImage 
                  className="h-24 w-32 rounded-lg object-top object-cover" 
                  src={`https://readdy.ai/api/search-image?query=church%20event%20activity%20featuring%20people%20gathering%20in%20community%20fellowship%20with%20warm%20friendly%20atmosphere%2C%20modern%20church%20interior%20or%20outdoor%20setting%2C%20diverse%20group%20of%20people%20participating%20in%20$%7Bevent.category.toLowerCase%28%29%7D%20activity&width=200&height=150&seq=event${event.id}&orientation=landscape`}
                  alt={event.title}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => handleViewDetails(event.id)}
                  className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-eye-line mr-1"></i>
                  View Details
                </button>
                <button 
                  onClick={() => handleEdit(event.id)}
                  className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-edit-line mr-1"></i>
                  Edit
                </button>
                <button 
                  onClick={() => handleManageAttendees(event.id)}
                  className="flex items-center px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-group-line mr-1"></i>
                  Manage Attendees
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 cursor-pointer">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-share-line"></i>
                  </div>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-more-2-line"></i>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* View Details Modal */}
      {showDetailsModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowDetailsModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                {events.find(e => e.id === selectedEvent) && (
                  <>
                    <h2 className="text-2xl font-bold">{events.find(e => e.id === selectedEvent)?.title}</h2>
                    <p className="text-gray-600">{events.find(e => e.id === selectedEvent)?.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Date:</strong> {new Date(events.find(e => e.id === selectedEvent)?.date || '').toLocaleDateString()}</div>
                      <div><strong>Time:</strong> {events.find(e => e.id === selectedEvent)?.time}</div>
                      <div><strong>Location:</strong> {events.find(e => e.id === selectedEvent)?.location}</div>
                      <div><strong>Organizer:</strong> {events.find(e => e.id === selectedEvent)?.organizer}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowEditModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Event</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <p className="text-gray-600">Edit form for event ID: {selectedEvent}</p>
              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Attendees Modal */}
      {showAttendeesModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowAttendeesModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Manage Attendees</h3>
                <button onClick={() => setShowAttendeesModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">Attendee list for event ID: {selectedEvent}</p>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">Attendee management interface would go here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
