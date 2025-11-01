


import { useState, useEffect } from 'react';
import { useForms } from '@/hooks/useForms';
import { Form } from '@/types';
import ViewFormModal from '@/components/modals/ViewFormModal';
import ViewResponsesModal from '@/components/modals/ViewResponsesModal';
import ShareFormModal from '@/components/modals/ShareFormModal';
import EditFormModal from '@/components/modals/EditFormModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';

interface FormsListProps {
  filterStatus: string;
}

export default function FormsList({ filterStatus }: FormsListProps) {
  const { getForms, deleteForm, deleteForms } = useForms();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchForms();
  }, [filterStatus]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      const response = await getForms(params);
      setForms(response.data || []);
    } catch (error) {
      console.error('Error fetching forms:', error);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formToDelete) return;
    try {
      await deleteForm(formToDelete);
      setShowDeleteConfirm(false);
      setFormToDelete(null);
      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await deleteForms(selectedForms);
      setShowDeleteSelectedConfirm(false);
      setSelectedForms([]);
      fetchForms();
    } catch (error) {
      console.error('Error deleting forms:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading forms...</div>;
  }

  const handleViewForm = (id: string) => {
    setSelectedForm(id);
    setShowViewModal(true);
  };

  const handleEditForm = (id: string) => {
    setSelectedForm(id);
    setShowViewModal(false);
    setShowEditModal(true);
  };

  const handleViewResponses = (id: string) => {
    setSelectedForm(id);
    setShowResponsesModal(true);
  };

  const handleShare = (id: string) => {
    const form = forms.find(f => f.id === id);
    if (form?.status !== 'active') {
      alert('Only active forms can be shared');
      return;
    }
    setSelectedForm(id);
    setShowShareModal(true);
  };

  const confirmDeleteSelected = () => {
    setShowDeleteSelectedConfirm(true);
  };

  const handleExportData = () => {
    setShowExportModal(true);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setShowExportModal(false);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/forms/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ formIds: selectedForms, format })
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forms-export-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export forms');
    }
  };

  const filteredForms = forms;

  const toggleForm = (id: string) => {
    setSelectedForms(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedForms.length === filteredForms.length) {
      setSelectedForms([]);
    } else {
      setSelectedForms(filteredForms.map(f => f.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Event Registration': return 'bg-blue-100 text-blue-800';
      case 'Membership': return 'bg-purple-100 text-purple-800';
      case 'Survey': return 'bg-orange-100 text-orange-800';
      case 'Volunteer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedForms.length === filteredForms.length && filteredForms.length > 0}
              onChange={toggleAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              {selectedForms.length > 0 ? `${selectedForms.length} selected` : 'Select all'}
            </span>
          </div>
          {selectedForms.length > 0 && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={confirmDeleteSelected}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 cursor-pointer whitespace-nowrap"
              >
                Delete Selected
              </button>
              <button 
                onClick={handleExportData}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer whitespace-nowrap"
              >
                Export Data
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredForms.map((form) => (
          <div key={form.id} className="p-6 hover:bg-gray-50">
            <div className="flex items-start space-x-4">
              <input
                type="checkbox"
                checked={selectedForms.includes(form.id)}
                onChange={() => toggleForm(form.id)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(form.status)}`}>
                      {form.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(form.type)}`}>
                      {form.type}
                    </span>
                    {form.is_public && (
                      <span className="inline-flex px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full">
                        Public
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleViewForm(form.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 cursor-pointer"
                      title="View"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-eye-line"></i>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleEditForm(form.id)}
                      className="p-2 text-gray-400 hover:text-green-600 cursor-pointer"
                      title="Edit"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-edit-line"></i>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        setFormToDelete(form.id);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 cursor-pointer"
                      title="Delete"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-delete-bin-line"></i>
                      </div>
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{form.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <i className="ri-file-list-line mr-2"></i>
                    {form.responses} responses
                  </div>
                  <div className="flex items-center">
                    <i className="ri-calendar-line mr-2"></i>
                    Created {new Date(form.created_at || '').toLocaleDateString()}
                  </div>
                  {form.deadline && (
                    <div className="flex items-center">
                      <i className="ri-time-line mr-2"></i>
                      Deadline: {new Date(form.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => handleViewForm(form.id)}
                      className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-eye-line mr-1"></i>
                      View Form
                    </button>
                    <button 
                      onClick={() => handleViewResponses(form.id)}
                      className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-bar-chart-line mr-1"></i>
                      View Responses
                    </button>
                    <button 
                      onClick={() => handleShare(form.id)}
                      className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-share-line mr-1"></i>
                      Share
                    </button>
                  </div>

                  {form.status === 'active' && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm text-green-600">Live</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredForms.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-file-list-line text-gray-400 text-4xl mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
          <p className="text-gray-500">
            {filterStatus === 'all' 
              ? 'Create your first form to get started.' 
              : `No ${filterStatus} forms at the moment.`
            }
          </p>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Form"
        message="Are you sure you want to delete this form? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      <ConfirmDialog
        isOpen={showDeleteSelectedConfirm}
        onClose={() => setShowDeleteSelectedConfirm(false)}
        onConfirm={handleDeleteSelected}
        title="Delete Forms"
        message={`Are you sure you want to delete ${selectedForms.length} selected forms? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      {selectedForm && (
        <>
          <ViewFormModal
            isOpen={showViewModal}
            onClose={() => setShowViewModal(false)}
            onEdit={() => handleEditForm(selectedForm)}
            formId={selectedForm}
          />
          <EditFormModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            formId={selectedForm}
            onSuccess={fetchForms}
          />
          <ViewResponsesModal
            isOpen={showResponsesModal}
            onClose={() => setShowResponsesModal(false)}
            formId={selectedForm}
          />
          <ShareFormModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            formId={selectedForm}
          />
        </>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowExportModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-0">
              <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Export Forms</h3>
                  <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>
              </div>
              <div className="px-6 py-6">
                <p className="text-sm text-gray-600 mb-6">Choose export format for {selectedForms.length} selected form(s)</p>
                <div className="space-y-3">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full flex items-center justify-between px-4 py-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <i className="ri-file-excel-2-line text-2xl text-green-600"></i>
                      </div>
                      <div className="ml-4 text-left">
                        <p className="text-sm font-semibold text-gray-900">CSV Format</p>
                        <p className="text-xs text-gray-500">Excel compatible spreadsheet</p>
                      </div>
                    </div>
                    <i className="ri-arrow-right-line text-gray-400 group-hover:text-blue-600"></i>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full flex items-center justify-between px-4 py-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <i className="ri-file-pdf-line text-2xl text-red-600"></i>
                      </div>
                      <div className="ml-4 text-left">
                        <p className="text-sm font-semibold text-gray-900">PDF Format</p>
                        <p className="text-xs text-gray-500">Portable document format</p>
                      </div>
                    </div>
                    <i className="ri-arrow-right-line text-gray-400 group-hover:text-blue-600"></i>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
