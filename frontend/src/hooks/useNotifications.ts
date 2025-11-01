import { api } from '@/services/api';

export const useNotifications = () => {
  const getRecentNotifications = (userId?: string | number) => 
    api.get(`/settings/notifications/recent${userId ? `?user_id=${userId}` : ''}`);
  
  const getUnreadCount = (userId: string | number) => 
    api.get(`/settings/notifications/unread-count?user_id=${userId}`);
  
  const markAsRead = (notificationId: string) => 
    api.put(`/settings/notifications/${notificationId}/read`, {});

  return { getRecentNotifications, getUnreadCount, markAsRead };
};
