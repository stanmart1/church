import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { User } from '@/types/user';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) => {
    setLoading(true);
    try {
      const response = await api.get(`/users?${new URLSearchParams(params as any).toString()}`);
      setUsers(response.data || response);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getUserStats = () =>
    api.get('/users/stats');

  const getUser = (id: string | number) =>
    api.get(`/users/${id}`);

  const createUser = async (data: any) => {
    const result = await api.post('/users', data);
    await fetchUsers();
    return result;
  };

  const updateUser = async (id: string | number, data: any) => {
    const result = await api.put(`/users/${id}`, data);
    await fetchUsers();
    return result;
  };

  const deleteUser = async (id: string | number) => {
    await api.delete(`/users/${id}`);
    await fetchUsers();
  };

  const resetPassword = (id: string | number, password: string) =>
    api.post(`/users/${id}/reset-password`, { password });

  return { users, loading, fetchUsers, getUserStats, getUser, createUser, updateUser, deleteUser, resetPassword };
};
