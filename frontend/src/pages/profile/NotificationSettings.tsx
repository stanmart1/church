

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export default function NotificationSettings() {
  const { user } = useAuth();
  const { getNotificationPreferences, updateNotificationPreferences } = useProfile();
  const [settings, setSettings] = useState({
    emailNotifications: {
      announcements: true,
      events: true,
      sermons: false,
      membership: true,
      forms: false,
      reminders: true
    },
    pushNotifications: {
      announcements: true,
      events: false,
      sermons: true,
      membership: false,
      forms: true,
      reminders: true
    },
    frequency: 'immediate'
  });
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user?.id) {
      getNotificationPreferences(user.id)
        .then(data => {
          if (data?.preferences && Object.keys(data.preferences).length > 0) {
            setSettings(data.preferences);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch notification preferences:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) return null;

  const handleToggle = (category: string, setting: string) => {
    setSettings(prev => {
      const categorySettings = prev[category as keyof typeof prev];
      if (typeof categorySettings === 'object' && categorySettings !== null) {
        return {
          ...prev,
          [category]: {
            ...categorySettings,
            [setting]: !(categorySettings as any)[setting]
          }
        };
      }
      return prev;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateNotificationPreferences(user.id, settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin"></i>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <i className="ri-check-circle-line text-green-400 text-lg mr-3 flex-shrink-0"></i>
            <div>
              <p className="text-sm font-medium text-green-800">Notification settings updated!</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Email Notifications */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
          <div className="space-y-4">
            {Object.entries(settings.emailNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <p className="text-sm text-gray-500">
                    Receive email notifications for {key.toLowerCase()}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('emailNotifications', key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    value ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h3>
          <div className="space-y-4">
            {Object.entries(settings.pushNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <p className="text-sm text-gray-500">
                    Receive push notifications for {key.toLowerCase()}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('pushNotifications', key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    value ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-save-line mr-2"></i>
            Save Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
}