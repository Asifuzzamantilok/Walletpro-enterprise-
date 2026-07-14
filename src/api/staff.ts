import { apiClient } from './client';

export const staffApi = {
  getStaff: async (params?: any): Promise<any[]> => {
    const response = await apiClient.get('/staff', { params });
    return response.data;
  },

  createStaff: async (data: any): Promise<any> => {
    const response = await apiClient.post('/staff', data);
    return response.data;
  },

  suspendStaff: async (id: string, reason: string): Promise<any> => {
    const response = await apiClient.post(`/staff/${id}/suspend`, { reason });
    return response.data;
  },

  deleteStaff: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/staff/${id}`);
    return response.data;
  },
};
