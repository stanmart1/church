import { useState, lazy, Suspense } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

const MemberList = lazy(() => import('./MemberList'));
const AddMemberModal = lazy(() => import('./AddMemberModal'));
const ExportModal = lazy(() => import('./ExportModal'));

const LoadingSpinner = () => (
  <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
);

export default function MembershipPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-bold text-gray-900">Membership Management</h1>
                <p className="mt-2 text-sm text-gray-700">
                  Manage your church members, track attendance, and maintain member records.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 cursor-pointer whitespace-nowrap"
                >
                  Add Member
                </button>
              </div>
            </div>

            <div className="mt-8 bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <i className="ri-search-line text-gray-400 text-sm"></i>
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setShowExportModal(true)}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                      title="Export"
                    >
                      <i className="ri-file-download-line sm:mr-2"></i>
                      <span className="hidden sm:inline">Export</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <Suspense fallback={<LoadingSpinner />}>
                <MemberList searchTerm={searchTerm} filterRole="member" />
              </Suspense>
            </div>
          </div>
        </main>
      </div>

      {showAddModal && (
        <Suspense fallback={null}>
          <AddMemberModal 
            isOpen={showAddModal} 
            onClose={() => setShowAddModal(false)} 
            onSuccess={() => window.location.reload()} 
          />
        </Suspense>
      )}

      {showExportModal && (
        <Suspense fallback={null}>
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            searchTerm={searchTerm}
            filterRole="member"
          />
        </Suspense>
      )}
    </div>
  );
}
