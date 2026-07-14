import { apiClient } from './client';

export const permissionsApi = {
  getPermissions: async (): Promise<any[]> => {
    const response = await apiClient.get('/permissions');
    return response.data;
  },

  getPermissionGroups: async (): Promise<any[]> => {
    const response = await apiClient.get('/permissions/groups');
    return response.data;
  },
};
