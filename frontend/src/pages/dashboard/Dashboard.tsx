import { useState, lazy, Suspense } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

const QuickAccessPanel = lazy(() => import('@/components/dashboard/QuickAccessPanel'));
const RecentActivity = lazy(() => import('@/components/dashboard/RecentActivity'));
const StatsOverview = lazy(() => import('@/components/dashboard/StatsOverview'));

const LoadingSpinner = () => (
  <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
);

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Church Dashboard</h1>
              <p className="mt-2 text-sm text-gray-700">
                Welcome back! Here's what's happening at your church today.
              </p>
            </div>

            <Suspense fallback={<LoadingSpinner />}>
              <StatsOverview />
            </Suspense>
            
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Suspense fallback={<LoadingSpinner />}>
                  <QuickAccessPanel />
                </Suspense>
              </div>
              <div>
                <Suspense fallback={<LoadingSpinner />}>
                  <RecentActivity />
                </Suspense>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
