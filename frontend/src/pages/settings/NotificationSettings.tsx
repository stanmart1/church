

import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

export default function NotificationSettings() {
  const { getSettings, updateBulkSettings, getRecentNotifications, testEmail } = useSettings();
  const [settings, setSettings] = useState({
    emailEnabled: true,
    pushEnabled: true,
    resend_api_key: '',
    resend_from_email: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [testingEmail, setTestingEmail] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadSettings();
    loadRecentNotifications();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings('notifications');
      setSettings({
        emailEnabled: data.emailEnabled ?? true,
        pushEnabled: data.pushEnabled ?? true,
        resend_api_key: data.resend_api_key || '',
        resend_from_email: data.resend_from_email || ''
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadRecentNotifications = async () => {
    try {
      const data = await getRecentNotifications();
      setRecentNotifications(data);
    } catch (error) {
      console.error('Error loading recent notifications:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleToggle = (setting: 'emailEnabled' | 'pushEnabled') => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateBulkSettings(settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setTestingEmail(true);
    try {
      await testEmail(settings.resend_from_email);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Test email error:', error);
    } finally {
      setTestingEmail(false);
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
              <p className="text-sm font-medium text-green-800">Notification settings updated successfully!</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* General Notification Settings */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-500">Send notifications via email</p>
              </div>
              <button
                onClick={() => handleToggle('emailEnabled')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.emailEnabled ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.emailEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-500">Browser push notifications</p>
              </div>
              <button
                onClick={() => handleToggle('pushEnabled')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.pushEnabled ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.pushEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>





        {/* Resend Configuration */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration (Resend)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resend API Key</label>
              <input
                type="password"
                value={settings.resend_api_key}
                onChange={(e) => setSettings(prev => ({ ...prev, resend_api_key: e.target.value }))}
                placeholder="re_xxxxxxxxxxxx"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Get your API key from <a href="https://resend.com/api-keys" target="_blank" className="text-blue-600 hover:underline">resend.com</a></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
              <input
                type="email"
                value={settings.resend_from_email}
                onChange={(e) => setSettings(prev => ({ ...prev, resend_from_email: e.target.value }))}
                placeholder="noreply@yourdomain.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Must be a verified domain in Resend</p>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleTestNotification}
                disabled={testingEmail}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className={`${testingEmail ? 'ri-loader-4-line animate-spin' : 'ri-send-plane-line'} mr-2`}></i>
                {testingEmail ? 'Sending...' : 'Test Email'}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            {recentNotifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((notification, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{notification.type}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{Math.round(parseFloat(notification.time))} {notification.time.includes('minutes') ? 'min' : notification.time.includes('hours') ? 'hrs' : 'days'} ago</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    notification.status === 'sent' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {notification.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {recentNotifications.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="ri-arrow-left-s-line mr-1"></i>
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {Math.ceil(recentNotifications.length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(recentNotifications.length / itemsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(recentNotifications.length / itemsPerPage)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <i className="ri-arrow-right-s-line ml-1"></i>
              </button>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="ri-save-line mr-2"></i>
            {loading ? 'Saving...' : 'Save Notification Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}