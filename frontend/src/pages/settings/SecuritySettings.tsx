

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

export default function SecuritySettings() {
  const { getSettings, updateBulkSettings, getSecurityStats } = useSettings();
  const [settings, setSettings] = useState({
    twoFactorRequired: false,
    passwordExpiry: '90',
    minPasswordLength: '8',
    requireSpecialChars: true,
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    lockoutDuration: '15',
    ipWhitelisting: false,
    auditLogging: true,
    encryptionEnabled: true,
    sslRequired: true,
    corsEnabled: false
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [securityStats, setSecurityStats] = useState<any>({});

  useEffect(() => {
    loadSettings();
    loadSecurityStats();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings('security');
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadSecurityStats = async () => {
    try {
      const data = await getSecurityStats();
      setSecurityStats(data);
    } catch (error) {
      console.error('Error loading security stats:', error);
    } finally {
      setLoadingData(false);
    }
  };



  const handleChange = (setting: string, value: string) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateBulkSettings(settings, 'security');
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
              <p className="text-sm font-medium text-green-800">Security settings updated successfully!</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Security Overview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-shield-check-line text-green-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Security Score</p>
                  <p className="text-2xl font-bold text-green-900">{securityStats.securityScore || 0}%</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-user-line text-blue-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-blue-900">{securityStats.activeSessions || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="ri-error-warning-line text-yellow-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">Security Alerts</p>
                  <p className="text-2xl font-bold text-yellow-900">{securityStats.securityAlerts || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <i className="ri-spam-line text-red-600 text-lg"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600">Blocked Attempts</p>
                  <p className="text-2xl font-bold text-red-900">{securityStats.blockedAttempts || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Session Security */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Security</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleChange('maxLoginAttempts', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lockout Duration (minutes)
              </label>
              <input
                type="number"
                value={settings.lockoutDuration}
                onChange={(e) => handleChange('lockoutDuration', e.target.value)}
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
            {loading ? 'Saving...' : 'Save Security Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}