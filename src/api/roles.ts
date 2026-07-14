import { apiClient } from './client';

export const rolesApi = {
  getRoles: async (): Promise<any[]> => {
    const response = await apiClient.get('/roles');
    return response.data;
  },

  getRoleById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },

  updateRolePermissions: async (id: string, permissions: string[]): Promise<any> => {
    const response = await apiClient.patch(`/roles/${id}/permissions`, { permissions });
    return response.data;
  },
};
