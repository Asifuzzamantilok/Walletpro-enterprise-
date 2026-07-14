import { apiClient } from './client';

export const cardsApi = {
  getCards: async (params?: any): Promise<any[]> => {
    const response = await apiClient.get('/cards', { params });
    return response.data;
  },

  getCardOrders: async (params?: any): Promise<any[]> => {
    const response = await apiClient.get('/cards/orders', { params });
    return response.data;
  },

  getCardTransactions: async (params?: any): Promise<any[]> => {
    const response = await apiClient.get('/cards/transactions', { params });
    return response.data;
  },

  getCardFraudAlerts: async (): Promise<any[]> => {
    const response = await apiClient.get('/cards/fraud-alerts');
    return response.data;
  },

  issueCard: async (payload: any): Promise<any> => {
    const response = await apiClient.post('/cards/issue', payload);
    return response.data;
  },

  updateCardStatus: async (cardId: string, status: string, note?: string): Promise<any> => {
    const response = await apiClient.patch(`/cards/${cardId}/status`, { status, note });
    return response.data;
  },

  updateLimits: async (cardId: string, limits: any): Promise<any> => {
    const response = await apiClient.patch(`/cards/${cardId}/limits`, limits);
    return response.data;
  },

  updateSecurity: async (cardId: string, security: any): Promise<any> => {
    const response = await apiClient.patch(`/cards/${cardId}/security`, security);
    return response.data;
  },

  updateRestrictions: async (cardId: string, restrictions: { blockedMerchants: string[]; blockedCountries: string[]; blockedCategories: string[] }): Promise<any> => {
    const response = await apiClient.patch(`/cards/${cardId}/restrictions`, restrictions);
    return response.data;
  },

  regenerateCard: async (cardId: string): Promise<any> => {
    const response = await apiClient.post(`/cards/${cardId}/regenerate`);
    return response.data;
  },
};
