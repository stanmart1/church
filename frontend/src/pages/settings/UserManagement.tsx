

import { useState, useEffect } from 'react';
import EditUserModal from '@/components/modals/EditUserModal';
import ResetPasswordModal from '@/components/modals/ResetPasswordModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';

export default function UserManagement() {
  const { users, loading, fetchUsers, createUser, deleteUser, getUserStats } = useUsers();
  const { getRoles, getPermissions, getRolePermissions, updateRole } = useRoles();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [showPermissions, setShowPermissions] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number | string; name: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    staffMembers: 0,
    volunteers: 0
  });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
    phone: '',
    status: 'active'
  });
  const [newRole, setNewRole] = useState({
    name: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    loadUsers();
    loadStats();
    loadRoles();
    loadPermissions();
  }, [searchTerm, selectedRole]);

  const loadRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data.map((r: any) => ({ 
        value: r.name, 
        label: r.name.charAt(0).toUpperCase() + r.name.slice(1) 
      })));
      for (const role of data) {
        const perms = await getRolePermissions(role.name);
        setRolePermissionsMap(prev => ({ ...prev, [role.name]: perms.permissions || [] }));
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadPermissions = async () => {
    try {
      const data = await getPermissions();
      setPermissions(Array.isArray(data) ? data : data.permissions || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const loadUsers = async () => {
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedRole !== 'all') params.role = selectedRole;
    await fetchUsers(params);
  };

  const loadStats = async () => {
    try {
      const data = await getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [rolePermissionsMap, setRolePermissionsMap] = useState<Record<string, any[]>>({});

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    pastor: 'bg-purple-100 text-purple-800',
    minister: 'bg-indigo-100 text-indigo-800',
    staff: 'bg-blue-100 text-blue-800',
    member: 'bg-gray-100 text-gray-800'
  };

  const handleAddUser = async () => {
    await createUser(newUser);
    setShowAddUser(false);
    setNewUser({ name: '', email: '', password: '', role: 'member', phone: '', status: 'active' });
    loadUsers();
    loadStats();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddRole = () => {
    setShowAddRole(false);
    setNewRole({ name: '', permissions: [] });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const togglePermission = (permission: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      loadUsers();
      loadStats();
    }
  };

  return (
    <div className="max-w-6xl">
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <i className="ri-check-circle-line text-green-400 text-lg mr-3 flex-shrink-0"></i>
            <div>
              <p className="text-sm font-medium text-green-800">User management action completed successfully!</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Users', value: (stats.totalUsers || 0).toString(), icon: 'ri-group-line', color: 'bg-blue-500' },
            { label: 'Active Users', value: (stats.activeUsers || 0).toString(), icon: 'ri-user-line', color: 'bg-green-500' },
            { label: 'Staff Members', value: (stats.staffMembers || 0).toString(), icon: 'ri-shield-user-line', color: 'bg-purple-500' }
          ].map((stat, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <i className={`${stat.icon} text-white text-lg`}></i>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <i className="ri-search-line absolute left-3 top-2.5 text-gray-400 text-sm"></i>
            </div>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="pr-8 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Roles</option>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddUser(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            Add New User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No users found</td>
                </tr>
              ) : (
                users.map((user) => {
                const roleConfig = { color: roleColors[user.role] || 'bg-gray-100 text-gray-800' };
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleConfig.color}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status?.toLowerCase() === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedUser(user.id);
                            setShowEditUser(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 cursor-pointer" 
                          title="Edit"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedUser(user.id);
                            setShowResetPassword(true);
                          }}
                          className="text-green-600 hover:text-green-900 cursor-pointer" 
                          title="Reset Password"
                        >
                          <i className="ri-key-line"></i>
                        </button>
                        <button 
                          onClick={() => {
                            setUserToDelete({ id: user.id, name: user.name });
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-900 cursor-pointer" 
                          title="Delete"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Role Management */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Role Management</h3>
              <p className="text-sm text-gray-600">Manage user roles and their permissions</p>
            </div>
            <button onClick={() => setShowAddRole(true)} className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 cursor-pointer whitespace-nowrap">
              <i className="ri-add-line mr-2"></i>
              Create Role
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.value} className="bg-white border-2 border-gray-300 rounded-md p-6 h-24 hover:border-gray-400 transition-colors">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${roleColors[role.value] || 'bg-gray-100 text-gray-800'}`}>
                    {role.label}
                  </span>
                  <button 
                    onClick={() => setShowPermissions(role.value)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    title="Manage permissions"
                  >
                    <i className="ri-settings-3-line text-lg"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
              <button
                onClick={() => setShowAddUser(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full pr-8 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleAddUser}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                >
                  Add User
                </button>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Role</h3>
              <button onClick={() => setShowAddRole(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Youth Leader"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {(Array.isArray(permissions) ? permissions : []).map((permission) => (
                    <div key={permission.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={permission.id}
                        checked={newRole.permissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={permission.id} className="ml-2 text-sm text-gray-700">{permission.description}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button onClick={handleAddRole} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                  Create Role
                </button>
                <button onClick={() => setShowAddRole(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 cursor-pointer whitespace-nowrap">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      {selectedUser && (
        <>
          <EditUserModal
            isOpen={showEditUser}
            onClose={() => setShowEditUser(false)}
            userId={selectedUser}
            onSuccess={() => {
              loadUsers();
              loadStats();
            }}
          />
          <ResetPasswordModal
            isOpen={showResetPassword}
            onClose={() => setShowResetPassword(false)}
            userId={selectedUser}
            onSuccess={() => {
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 3000);
            }}
          />
        </>
      )}

      {/* View/Edit Permissions Modal */}
      {showPermissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {roles.find(r => r.value === showPermissions)?.label} Permissions
              </h3>
              <button 
                onClick={() => {
                  setShowPermissions(null);
                  setEditMode(false);
                  setEditingPermissions([]);
                }} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <p className="text-sm text-gray-500">
                {editMode ? 'Select or deselect permissions' : 'View all permissions for this role'}
              </p>
              {!editMode && (
                <button
                  onClick={() => {
                    setEditMode(true);
                    setEditingPermissions(
                      (rolePermissionsMap[showPermissions] || []).map(p => p.name)
                    );
                  }}
                  className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-edit-line mr-1.5"></i>
                  Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {editMode ? (
                (Array.isArray(permissions) ? permissions : []).map((permission, index) => {
                  const isSelected = editingPermissions.includes(permission.name);
                  return (
                    <div
                      key={permission.id || index}
                      onClick={() => {
                        setEditingPermissions(prev =>
                          prev.includes(permission.name)
                            ? prev.filter(p => p !== permission.name)
                            : [...prev, permission.name]
                        );
                      }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <i className="ri-check-line text-white text-sm"></i>}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                (rolePermissionsMap[showPermissions] || []).map((permission, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-gray-200 bg-white rounded-lg"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {permission.description}
                    </p>
                  </div>
                ))
              )}
            </div>

            {(rolePermissionsMap[showPermissions] || []).length === 0 && !editMode && (
              <div className="text-center py-8 text-gray-500">
                <i className="ri-shield-line text-4xl mb-2"></i>
                <p className="text-sm">No permissions assigned to this role</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
              {editMode ? (
                <>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditingPermissions([]);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setSavingPermissions(true);
                        await updateRole(showPermissions, { permissions: editingPermissions });
                        await loadRoles();
                        setEditMode(false);
                        setEditingPermissions([]);
                        setShowSuccess(true);
                        setTimeout(() => setShowSuccess(false), 3000);
                      } catch (error) {
                        console.error('Error updating permissions:', error);
                      } finally {
                        setSavingPermissions(false);
                      }
                    }}
                    disabled={savingPermissions}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                  >
                    {savingPermissions ? (
                      <>
                        <i className="ri-loader-4-line mr-2 animate-spin"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="ri-save-line mr-2"></i>
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowPermissions(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}