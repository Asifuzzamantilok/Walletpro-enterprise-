import { apiClient } from './client';

export const kycApi = {
  getApplications: async (params?: any): Promise<any[]> => {
    const response = await apiClient.get('/kyc/applications', { params });
    return response.data;
  },

  getApplicationById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/kyc/applications/${id}`);
    return response.data;
  },

  updateApplicationStatus: async (id: string, status: string, reason: string): Promise<any> => {
    const response = await apiClient.patch(`/kyc/applications/${id}/status`, { status, reason });
    return response.data;
  },

  addReviewerNote: async (id: string, noteText: string): Promise<any> => {
    const response = await apiClient.post(`/kyc/applications/${id}/notes`, { note: noteText });
    return response.data;
  },

  assignReviewer: async (id: string, reviewer: string): Promise<any> => {
    const response = await apiClient.post(`/kyc/applications/${id}/assign`, { reviewer });
    return response.data;
  },

  changePriority: async (id: string, priority: string): Promise<any> => {
    const response = await apiClient.patch(`/kyc/applications/${id}/priority`, { priority });
    return response.data;
  },

  getStats: async (): Promise<any> => {
    const response = await apiClient.get('/kyc/stats');
    return response.data;
  },
};
