import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import EventRegistrationModal from '@/components/modals/EventRegistrationModal';
import EventDetailsModal from '@/components/modals/EventDetailsModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';

export default function MemberEvents() {
  const { user } = useAuth();
  const { getMemberEvents, registerForEvent, unregisterFromEvent } = useEvents();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'registered'>('all');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    loadEvents();
  }, [filter]);

  const loadEvents = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getMemberEvents(user.id, filter === 'registered');
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user?.id) return;
    try {
      await registerForEvent(eventId, user.id);
      setShowRegistrationModal(false);
      loadEvents();
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  const handleUnregister = async () => {
    if (!user?.id || !selectedEvent?.id) return;
    try {
      await unregisterFromEvent(selectedEvent.id, user.id);
      setShowCancelConfirm(false);
      loadEvents();
    } catch (error) {
      console.error('Error unregistering:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Events</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('registered')}
            className={`px-3 py-2 text-sm rounded-lg cursor-pointer whitespace-nowrap ${
              filter === 'registered' 
                ? 'bg-blue-600 text-white' 
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Registered
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-2 text-sm rounded-lg cursor-pointer whitespace-nowrap ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Events
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="ri-calendar-line text-4xl mb-2"></i>
          <p>No events found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      event.is_registered 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {event.is_registered ? 'Registered' : 'Available'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <i className="ri-calendar-line mr-2"></i>
                    {new Date(event.date).toLocaleDateString()}
                    {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString()}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    <i className="ri-map-pin-line mr-2"></i>
                    {event.location}
                  </p>
                </div>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                  {event.type}
                </span>
              </div>
              <div className="flex space-x-3">
                {event.is_registered ? (
                  <>
                    <button 
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer whitespace-nowrap"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowCancelConfirm(true);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm cursor-pointer whitespace-nowrap"
                    >
                      Cancel Registration
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowRegistrationModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap"
                    >
                      Register
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer whitespace-nowrap"
                    >
                      Learn More
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEvent && (
        <>
          <EventRegistrationModal
            isOpen={showRegistrationModal}
            onClose={() => {
              setShowRegistrationModal(false);
              handleRegister(selectedEvent.id);
            }}
            eventTitle={selectedEvent.title}
          />
          
          <EventDetailsModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            event={selectedEvent}
          />

          <ConfirmDialog
            isOpen={showCancelConfirm}
            onClose={() => setShowCancelConfirm(false)}
            onConfirm={handleUnregister}
            title="Cancel Registration"
            message={`Are you sure you want to cancel your registration for "${selectedEvent.title}"?`}
            confirmText="Cancel Registration"
            type="warning"
          />
        </>
      )}
    </div>
  );
}
