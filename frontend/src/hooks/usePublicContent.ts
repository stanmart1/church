import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export const usePublicContent = () => {
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await api.get('/content');
        const contentMap = Array.isArray(data) ? data.reduce((acc: any, item: any) => {
          acc[item.key] = item.value;
          return acc;
        }, {}) : data;
        setContent(contentMap);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading };
};
