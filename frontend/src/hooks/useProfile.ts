import { api } from '@/services/api';

export const useProfile = () => {
  const getProfile = (userId: string | number) =>
    api.get(`/profile/${userId}`);

  const updateProfile = (userId: string | number, data: any) =>
    api.put(`/profile/${userId}`, data);

  const changePassword = (userId: string | number, currentPassword: string, newPassword: string) =>
    api.post(`/profile/${userId}/change-password`, { currentPassword, newPassword });

  const uploadPhoto = (userId: string | number, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post(`/profile/${userId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  };

  const getNotificationPreferences = (userId: string | number) =>
    api.get(`/profile/${userId}/notifications`);

  const updateNotificationPreferences = (userId: string | number, preferences: any) =>
    api.put(`/profile/${userId}/notifications`, { preferences });

  return { getProfile, updateProfile, changePassword, uploadPhoto, getNotificationPreferences, updateNotificationPreferences };
};
