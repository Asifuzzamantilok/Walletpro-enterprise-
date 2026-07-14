import { apiClient } from './client';

export const notificationsApi = {
  getNotifications: async (): Promise<any[]> => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/notifications/${id}/read`);
    return response.data;
  },

  getComplianceNotifications: async (): Promise<any[]> => {
    const response = await apiClient.get('/notifications/compliance');
    return response.data;
  },

  markComplianceAsRead: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/notifications/compliance/${id}/read`);
    return response.data;
  },
};
