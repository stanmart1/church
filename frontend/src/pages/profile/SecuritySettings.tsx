

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { api } from '@/services/api';


export default function SecuritySettings() {
  const { user } = useAuth();
  const { changePassword } = useProfile();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (user?.id) {
      api.get(`/auth/login-history/${user.id}`)
        .then(data => {
          setLoginHistory(Array.isArray(data) ? data : []);
          setLoadingHistory(false);
        })
        .catch(err => {
          console.error('Failed to fetch login history:', err);
          setLoadingHistory(false);
        });
    }
  }, [user]);

  if (!user) return null;

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!user) return;
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await changePassword(user.id, passwordForm.currentPassword, passwordForm.newPassword);
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      setError(error?.error || 'Failed to change password');
    }
  };

  const handleLogoutAll = async () => {
    if (!user) return;
    if (confirm('Are you sure you want to log out from all devices?')) {
      try {
        await api.post(`/auth/logout-all/${user.id}`, {});
        alert('All devices logged out. You will be redirected to login.');
        window.location.href = '/login';
      } catch (error) {
        console.error('Failed to logout all devices:', error);
      }
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    if (!user || deleteConfirmText !== 'DELETE') return;
    try {
      await api.delete(`/profile/${user.id}`);
      setShowDeleteConfirm(false);
      alert('Account deleted successfully.');
      window.location.href = '/login';
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };



  return (
    <>
    <div className="max-w-2xl">
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
        {/* Password Settings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Password</h3>
              <p className="text-sm text-gray-500">Keep your account secure with a strong password</p>
            </div>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="bg-gray-50 rounded-lg p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Login History */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Login History</h3>
              <p className="text-sm text-gray-500">Recent login activity on your account</p>
            </div>
            <button
              onClick={handleLogoutAll}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 cursor-pointer whitespace-nowrap"
            >
              <i className="ri-logout-box-line mr-2"></i>
              Logout All Devices
            </button>
          </div>

          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <i className="ri-loader-4-line text-2xl text-blue-600 animate-spin"></i>
            </div>
          ) : loginHistory.length > 0 ? (
            <>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {loginHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((login: any) => (
                  <div key={login.id} className="p-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          login.event === 'Successful Login' ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{login.device || 'Unknown Device'}</p>
                          <p className="text-xs text-gray-500">{login.event}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{new Date(login.login_time).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {loginHistory.length > itemsPerPage && (
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
                    Page {currentPage} of {Math.ceil(loginHistory.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(loginHistory.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(loginHistory.length / itemsPerPage)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <i className="ri-arrow-right-s-line ml-1"></i>
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">No login history available</p>
          )}
        </div>

        {/* Account Deletion */}
        <div className="border-t border-gray-200 pt-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-700 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button 
              onClick={handleDeleteAccount}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 cursor-pointer whitespace-nowrap"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>

    {showDeleteConfirm && (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" onClick={() => setShowDeleteConfirm(false)}>
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <i className="ri-error-warning-line text-red-600 text-xl"></i>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Account</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    This action cannot be undone. This will permanently delete your account and remove all your data.
                  </p>
                  <p className="text-sm text-gray-700 mb-2 font-medium">
                    Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Type DELETE"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={confirmDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Delete Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}