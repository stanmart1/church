import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

export default function SystemSettings() {
  const { getSettings, updateBulkSettings, getSystemStatus } = useSettings();
  const [settings, setSettings] = useState<any>({});

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [systemStatus, setSystemStatus] = useState<any>({});

  useEffect(() => {
    loadSettings();
    loadSystemStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings('system');
      setSettings((prev: any) => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadSystemStatus = async () => {
    try {
      const data = await getSystemStatus();
      setSystemStatus(data);
    } catch (error) {
      console.error('Error loading system status:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (setting: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [setting]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateBulkSettings(settings, 'system');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };



  if (loadingData) {
    return (
      <div className="max-w-4xl flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <i className="ri-check-circle-line text-green-400 text-lg mr-3 flex-shrink-0"></i>
            <div>
              <p className="text-sm font-medium text-green-800">System settings updated successfully!</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* System Status */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-time-line text-green-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Database Uptime</p>
                  <p className="text-lg font-bold text-gray-900">{systemStatus.uptime}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-cpu-line text-blue-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                  <p className="text-lg font-bold text-gray-900">{systemStatus.cpuUsage}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="ri-database-line text-orange-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                  <p className="text-lg font-bold text-gray-900">{systemStatus.memoryUsage}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <i className="ri-user-line text-indigo-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-lg font-bold text-gray-900">{systemStatus.activeUsers}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Performance Settings */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Upload Size (MB)
              </label>
              <input
                type="number"
                value={settings.maxUploadSize || ''}
                onChange={(e) => handleChange('maxUploadSize', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="ri-save-line mr-2"></i>
            {loading ? 'Saving...' : 'Save System Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}