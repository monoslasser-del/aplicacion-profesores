import { apiClient } from '../lib/apiClient';

export interface Group {
  id: number;
  name: string;
  grade: string;
}

export const groupService = {
  getAllGroups: async (): Promise<Group[]> => {
    try {
      const response = await apiClient.get<any>('/groups');
      // The backend probably returns something like { status: 'success', data: [...] } or just an array.
      // Let's assume it follows Laravel standard or similar:
      return response.data || response;
    } catch (error) {
      console.error('Error fetching groups from API:', error);
      throw error;
    }
  }
};
