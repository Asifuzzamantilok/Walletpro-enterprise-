import { apiClient } from './client';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authApi = {
  login: async (credentials: any): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  getProfile: async (): Promise<any> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};
