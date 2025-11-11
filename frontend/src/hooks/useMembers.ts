import { api } from '@/services/api';
import { getToken } from '@/utils/auth';

export const useMembers = () => {
  const transformMember = (member: any) => ({
    ...member,
    membershipStatus: member.membership_status,
    dateJoined: member.date_joined,
    maritalStatus: member.marital_status
  });

  const getMembers = async (params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== '')
    );
    const query = new URLSearchParams(cleanParams as any).toString();
    const response = await api.get(`/members${query ? `?${query}` : ''}`);
    const data = response.data || response;
    return Array.isArray(data) ? data.map(transformMember) : data;
  };

  const getMember = async (id: string) => {
    const member = await api.get(`/members/${id}`);
    return transformMember(member);
  };

  const createMember = (data: any) =>
    api.post('/members', data);

  const updateMember = async (id: string, data: any) => {
    const result = await api.put(`/members/${id}`, data);
    return transformMember(result);
  };

  const deleteMember = (id: string) =>
    api.delete(`/members/${id}`);

  const exportMembers = async (format: 'csv' | 'pdf', search?: string, role?: string) => {
    const params: any = { format };
    if (search) params.search = search;
    if (role && role !== 'all') params.role = role;
    
    const query = new URLSearchParams(params).toString();
    const token = getToken();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/members/export?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  };

  return { getMembers, getMember, createMember, updateMember, deleteMember, exportMembers };
};
