import { apiClient } from './client';

export const usersApi = {
  getCustomers: async (params?: any): Promise<any[]> => {
    const response = await apiClient.get('/users/customers', { params });
    return response.data;
  },

  getCustomerById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/users/customers/${id}`);
    return response.data;
  },

  updateCustomer: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/users/customers/${id}`, data);
    return response.data;
  },

  suspendCustomer: async (id: string, reason: string): Promise<any> => {
    const response = await apiClient.post(`/users/customers/${id}/suspend`, { reason });
    return response.data;
  },
};
