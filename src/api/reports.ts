import { apiClient } from './client';

export const reportsApi = {
  getFinancialReports: async (): Promise<any[]> => {
    const response = await apiClient.get('/reports/financial');
    return response.data;
  },

  generateFinancialReport: async (payload: { type: string; reportingPeriod: string }): Promise<any> => {
    const response = await apiClient.post('/reports/financial/generate', payload);
    return response.data;
  },

  getCustomReports: async (): Promise<any[]> => {
    const response = await apiClient.get('/reports/custom');
    return response.data;
  },
};
