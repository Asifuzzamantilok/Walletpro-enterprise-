import { apiClient } from './client';

export const settingsApi = {
  getSystemSettings: async (): Promise<any> => {
    const response = await apiClient.get('/settings/system');
    return response.data;
  },

  updateSystemSettings: async (settings: any): Promise<any> => {
    const response = await apiClient.put('/settings/system', settings);
    return response.data;
  },

  getApiKeys: async (): Promise<any[]> => {
    const response = await apiClient.get('/settings/api-keys');
    return response.data;
  },

  generateApiKey: async (name: string, expires: string, permissions: string[]): Promise<any> => {
    const response = await apiClient.post('/settings/api-keys', { name, expires, permissions });
    return response.data;
  },

  deleteApiKey: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/settings/api-keys/${id}`);
    return response.data;
  },
};
