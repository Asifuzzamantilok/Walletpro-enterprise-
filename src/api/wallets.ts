import { apiClient } from './client';

export const walletsApi = {
  getWallets: async (params?: any): Promise<any[]> => {
    const response = await apiClient.get('/wallets', { params });
    return response.data;
  },

  getWalletById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/wallets/${id}`);
    return response.data;
  },

  updateWalletStatus: async (walletId: string, status: string): Promise<any> => {
    const response = await apiClient.patch(`/wallets/${walletId}/status`, { status });
    return response.data;
  },

  adjustBalance: async (walletId: string, type: 'Credit' | 'Debit', amount: number, note: string): Promise<any> => {
    const response = await apiClient.post(`/wallets/${walletId}/adjust`, { type, amount, note });
    return response.data;
  },

  flagWallet: async (walletId: string, riskLevel: string, riskScore: number): Promise<any> => {
    const response = await apiClient.post(`/wallets/${walletId}/flag`, { riskLevel, riskScore });
    return response.data;
  },

  transferFunds: async (payload: { fromWalletId: string; toWalletId: string; amount: number; currency: string; description: string }): Promise<any> => {
    const response = await apiClient.post('/wallets/transfer', payload);
    return response.data;
  },
};
