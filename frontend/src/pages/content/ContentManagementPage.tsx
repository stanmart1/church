import { useState, lazy, Suspense } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

const HomeContent = lazy(() => import('./HomeContent'));
const AboutContent = lazy(() => import('./AboutContent'));
const ContactContent = lazy(() => import('./ContactContent'));
const ServiceContent = lazy(() => import('./ServiceContent'));

const LoadingSpinner = () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;

export default function ContentManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Home', icon: 'ri-home-line' },
    { id: 'about', label: 'About', icon: 'ri-information-line' },
    { id: 'contact', label: 'Contact', icon: 'ri-mail-line' },
    { id: 'service', label: 'Service Times', icon: 'ri-time-line' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your church's website content and messaging.
              </p>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <i className={`${tab.icon} mr-2`}></i>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-4 sm:p-6">
                <Suspense fallback={<LoadingSpinner />}>
                  {activeTab === 'home' && <HomeContent />}
                  {activeTab === 'about' && <AboutContent />}
                  {activeTab === 'contact' && <ContactContent />}
                  {activeTab === 'service' && <ServiceContent />}
                </Suspense>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
