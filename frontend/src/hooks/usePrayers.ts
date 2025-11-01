import { api } from '@/services/api';

export const usePrayers = () => {
  const getPrayerRequests = (params?: { status?: string; limit?: number }) =>
    api.get(`/prayers?${new URLSearchParams(params as any).toString()}`);

  const getMemberPrayerRequests = (memberId: string | number) =>
    api.get(`/prayers/member/${memberId}`);

  const getPrayerRequest = (id: string) =>
    api.get(`/prayers/${id}`);

  const createPrayerRequest = (data: any) =>
    api.post('/prayers', data);

  const updatePrayerRequest = (id: string, data: any) =>
    api.put(`/prayers/${id}`, data);

  const deletePrayerRequest = (id: string) =>
    api.delete(`/prayers/${id}`);

  const prayForRequest = (id: string) =>
    api.post(`/prayers/${id}/pray`, {});

  return { getPrayerRequests, getMemberPrayerRequests, getPrayerRequest, createPrayerRequest, updatePrayerRequest, deletePrayerRequest, prayForRequest };
};
