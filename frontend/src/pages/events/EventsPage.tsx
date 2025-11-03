import { useState, useEffect, lazy, Suspense } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/types';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import EventCard from '@/components/events/EventCard';

const EventCalendar = lazy(() => import('./EventCalendar'));
const EventList = lazy(() => import('./EventList'));
const CreateEventModal = lazy(() => import('./CreateEventModal'));
const EditEventModal = lazy(() => import('@/components/modals/EditEventModal'));
const ManageAttendeesModal = lazy(() => import('@/components/modals/ManageAttendeesModal'));
const ConfirmDialog = lazy(() => import('@/components/modals/ConfirmDialog'));

const LoadingSpinner = () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;

export default function EventsPage() {
  const { getEvents, deleteEvent } = useEvents();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageAttendees, setShowManageAttendees] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents({ status: 'upcoming' });
      const data = response.data || response;
      setUpcomingEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setUpcomingEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      await deleteEvent(eventToDelete);
      setShowDeleteConfirm(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
                <p className="mt-2 text-sm text-gray-700">
                  Plan, organize, and manage church events and activities.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center space-x-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-1 rounded text-sm cursor-pointer whitespace-nowrap ${viewMode === 'calendar' ? 'bg-white shadow-sm' : ''}`}
                  >
                    Calendar
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded text-sm cursor-pointer whitespace-nowrap ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  >
                    List
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-add-line mr-2"></i>
                  New Event
                </button>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
                {loading ? (
                  <div className="text-center py-12">Loading events...</div>
                ) : upcomingEvents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <i className="ri-calendar-line text-4xl mb-2"></i>
                    <p>No upcoming events</p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={(id) => {
                        setSelectedEvent(id);
                        setShowEditModal(true);
                      }}
                      onDelete={(id) => {
                        setEventToDelete(id);
                        setShowDeleteConfirm(true);
                      }}
                      onManageAttendees={(id) => {
                        setSelectedEvent(id);
                        setShowManageAttendees(true);
                      }}
                    />
                  ))}
                </div>
                )}
              </div>
              
              <div>
                <Suspense fallback={<LoadingSpinner />}>
                  {viewMode === 'calendar' ? <EventCalendar /> : <EventList />}
                </Suspense>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showCreateModal && (
        <Suspense fallback={null}>
          <CreateEventModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={fetchEvents} />
        </Suspense>
      )}
      
      {selectedEvent && (
        <Suspense fallback={null}>
          <EditEventModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            eventId={selectedEvent}
          />
          <ManageAttendeesModal
            isOpen={showManageAttendees}
            onClose={() => setShowManageAttendees(false)}
            eventId={selectedEvent}
          />
        </Suspense>
      )}
      
      {showDeleteConfirm && (
        <Suspense fallback={null}>
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            title="Delete Event"
            message="Are you sure you want to delete this event? This action cannot be undone."
            confirmText="Delete"
            type="danger"
          />
        </Suspense>
      )}
    </div>
  );
}
