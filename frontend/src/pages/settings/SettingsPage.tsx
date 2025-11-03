

import { useState, lazy, Suspense } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

const SystemSettings = lazy(() => import('./SystemSettings'));
const SecuritySettings = lazy(() => import('./SecuritySettings'));
const NotificationSettings = lazy(() => import('./NotificationSettings'));

const LoadingSpinner = () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('system');

  const tabs = [
    { id: 'system', name: 'System', icon: 'ri-server-line' },
    { id: 'security', name: 'Security', icon: 'ri-shield-check-line' },
    { id: 'notifications', name: 'Notifications', icon: 'ri-notification-3-line' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Administrator Settings</h1>
              <p className="mt-2 text-gray-600">
                Manage your church's system settings, users, and preferences.
              </p>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <i className={`${tab.icon} mr-2`}></i>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                <Suspense fallback={<LoadingSpinner />}>
                  {activeTab === 'system' && <SystemSettings />}
                  {activeTab === 'security' && <SecuritySettings />}
                  {activeTab === 'notifications' && <NotificationSettings />}
                </Suspense>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}