import { api } from '@/services/api';

export const useSettings = () => {
  const getSettings = (category?: string) =>
    api.get(`/settings${category ? `?category=${category}` : ''}`);

  const getSettingByKey = (key: string) =>
    api.get(`/settings/${key}`);

  const updateSetting = (key: string, value: string, category?: string) =>
    api.put(`/settings/${key}`, { value, category });

  const updateBulkSettings = (settings: Record<string, any>) =>
    api.post('/settings/bulk', settings);

  const getSystemStatus = () =>
    api.get('/settings/system/status');

  const getSecurityStats = () =>
    api.get('/settings/security/stats');

  const getRecentNotifications = () =>
    api.get('/settings/notifications/recent');

  const testEmail = (recipient?: string) =>
    api.post('/settings/notifications/test-email', { recipient });

  const getIntegrationStats = () =>
    api.get('/settings/integrations/stats');

  const testIntegration = (integration: string) =>
    api.post(`/settings/integrations/${integration}/test`, {});

  return { getSettings, getSettingByKey, updateSetting, updateBulkSettings, getSystemStatus, getSecurityStats, getRecentNotifications, testEmail, getIntegrationStats, testIntegration };
};
