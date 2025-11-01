import { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onManageAttendees: (id: number) => void;
}

export default function EventCard({ event, onEdit, onDelete, onManageAttendees }: EventCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Worship': return 'bg-purple-100 text-purple-800';
      case 'Youth': return 'bg-blue-100 text-blue-800';
      case 'Community': return 'bg-green-100 text-green-800';
      case 'Outreach': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
            {(event.category || event.type) && (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(event.category || event.type || '')}`}>
                {event.category || event.type}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{event.description}</p>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <i className="ri-calendar-line mr-2"></i>
          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <i className="ri-time-line mr-2"></i>
          {event.time || event.start_time || event.startTime || 'TBD'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <i className="ri-map-pin-line mr-2"></i>
          {event.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <i className="ri-group-line mr-2"></i>
          {event.attendees || event.registered_count || event.registeredCount || 0} attendees
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t">
        <button
          onClick={() => onManageAttendees(event.id)}
          className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 cursor-pointer"
        >
          <i className="ri-user-add-line mr-1"></i>
          Manage Attendees
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(event.id)}
            className="p-2 text-gray-400 hover:text-blue-600 cursor-pointer"
            title="Edit"
          >
            <i className="ri-edit-line"></i>
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="p-2 text-gray-400 hover:text-red-600 cursor-pointer"
            title="Delete"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
