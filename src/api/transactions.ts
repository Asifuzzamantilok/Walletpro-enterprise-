import { apiClient } from './client';

export const transactionsApi = {
  getTransactions: async (params?: any): Promise<any[]> => {
    const response = await apiClient.get('/transactions', { params });
    return response.data;
  },

  getTransactionById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  updateTransactionStatus: async (txId: string, status: string, notes: string): Promise<any> => {
    const response = await apiClient.patch(`/transactions/${txId}/status`, { status, notes });
    return response.data;
  },

  getLedger: async (params?: any): Promise<any[]> => {
    const response = await apiClient.get('/transactions/ledger', { params });
    return response.data;
  },

  getSettlements: async (params?: any): Promise<any[]> => {
    const response = await apiClient.get('/transactions/settlements', { params });
    return response.data;
  },

  updateSettlementStatus: async (settlementId: string, status: string): Promise<any> => {
    const response = await apiClient.patch(`/transactions/settlements/${settlementId}`, { status });
    return response.data;
  },

  getRefunds: async (params?: any): Promise<any[]> => {
    const response = await apiClient.get('/transactions/refunds', { params });
    return response.data;
  },

  processRefund: async (refundId: string, status: 'Approved' | 'Rejected', comments: string): Promise<any> => {
    const response = await apiClient.post(`/transactions/refunds/${refundId}/process`, { status, comments });
    return response.data;
  },

  createRefund: async (payload: { transactionId: string; walletId: string; customerName: string; currency: string; amount: number; reason: string }): Promise<any> => {
    const response = await apiClient.post('/transactions/refunds', payload);
    return response.data;
  },
};
