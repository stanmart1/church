import { useState, useEffect } from 'react';
import { useContent } from '@/hooks/useContent';

export default function ServiceContent() {
  const { getServiceTimes, createServiceTime, updateServiceTime, deleteServiceTime } = useContent();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [newService, setNewService] = useState({ day: 'Sunday', time: '', service: '', description: '' });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await getServiceTimes();
      setServices(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    setSaving(true);
    try {
      await createServiceTime(newService);
      setShowAddService(false);
      setNewService({ day: 'Sunday', time: '', service: '', description: '' });
      loadServices();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateService = async () => {
    await updateServiceTime(editingService.id, editingService);
    setEditingService(null);
    loadServices();
  };

  const handleDeleteService = async (id: number) => {
    await deleteServiceTime(id);
    loadServices();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Service Times</h3>
        <button
          onClick={() => setShowAddService(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 w-full sm:w-auto"
        >
          <i className="ri-add-line mr-2"></i>
          Add Service
        </button>
      </div>

      <div className="space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <i className="ri-calendar-line text-4xl text-gray-400 mb-3"></i>
            <p className="text-gray-600 font-medium">No service times added yet</p>
            <p className="text-sm text-gray-500 mt-1">Click "Add Service" to create your first service time</p>
          </div>
        ) : (
          services.map((service) => (
          <div key={service.id} className="flex flex-col sm:flex-row items-start justify-between p-4 border border-gray-200 rounded-lg gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 break-words">{service.service}</p>
              <p className="text-sm text-gray-600">{service.day} at {service.time}</p>
              {service.description && (
                <p className="text-sm text-gray-500 mt-1 break-words">{service.description}</p>
              )}
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <button
                onClick={() => setEditingService(service)}
                className="text-blue-600 hover:text-blue-800 p-2"
              >
                <i className="ri-edit-line text-lg"></i>
              </button>
              <button
                onClick={() => handleDeleteService(service.id)}
                className="text-red-600 hover:text-red-800 p-2"
              >
                <i className="ri-delete-bin-line text-lg"></i>
              </button>
            </div>
          </div>
        ))
        )}
      </div>

      {editingService && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setEditingService(null)}></div>
            <div className="relative bg-white rounded-lg px-4 pt-5 pb-4 shadow-xl w-full max-w-lg sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Service Time</h3>
                <button onClick={() => setEditingService(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                  <select
                    value={editingService.day}
                    onChange={(e) => setEditingService({ ...editingService, day: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option>Sunday</option>
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                    <option>Saturday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={editingService.time}
                    onChange={(e) => setEditingService({ ...editingService, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                  <input
                    type="text"
                    value={editingService.service}
                    onChange={(e) => setEditingService({ ...editingService, service: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={editingService.description || ''}
                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setEditingService(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateService}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Update Service
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddService && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowAddService(false)}></div>
            <div className="relative bg-white rounded-lg px-4 pt-5 pb-4 shadow-xl w-full max-w-lg sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Service Time</h3>
                <button onClick={() => setShowAddService(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                  <select
                    value={newService.day}
                    onChange={(e) => setNewService({ ...newService, day: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option>Sunday</option>
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                    <option>Saturday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={newService.time}
                    onChange={(e) => setNewService({ ...newService, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                  <input
                    type="text"
                    value={newService.service}
                    onChange={(e) => setNewService({ ...newService, service: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Sunday Morning Service"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Join us for inspiring worship..."
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave empty if no description needed</p>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowAddService(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddService}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                    {saving ? 'Adding...' : 'Add Service'}
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
