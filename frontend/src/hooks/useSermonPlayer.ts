import { api } from '@/services/api';

export const useSermonPlayer = () => {
  const incrementPlayCount = async (sermonId: string | number) => {
    try {
      await api.post(`/sermons/${sermonId}/play`, {});
    } catch (error) {
      console.error('Error incrementing play count:', error);
    }
  };

  const incrementDownloadCount = async (sermonId: string | number) => {
    try {
      await api.post(`/sermons/${sermonId}/download`, {});
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  };

  return {
    incrementPlayCount,
    incrementDownloadCount
  };
};
