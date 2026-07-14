import { apiClient } from './client';

export const dashboardApi = {
  getMetrics: async (): Promise<any> => {
    const response = await apiClient.get('/dashboard/metrics');
    return response.data;
  },

  getLiveStream: async (): Promise<any> => {
    const response = await apiClient.get('/dashboard/live-stream');
    return response.data;
  },

  getSystemStatus: async (): Promise<any> => {
    const response = await apiClient.get('/dashboard/system-status');
    return response.data;
  },
};
