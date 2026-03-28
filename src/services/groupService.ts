import { apiClient } from '../lib/apiClient';

export interface Group {
  id?: number;
  name: string;
  grade?: string;
  level?: string;
  teacher_id?: number;
  school_cycle_id?: number;
  created_at?: string;
  updated_at?: string;
}

export const groupService = {
  getGroups: () => apiClient.get<Group[]>('/v1/groups'),
  getGroup: (id: number | string) => apiClient.get<Group>(`/v1/groups/${id}`),
  createGroup: (data: Partial<Group>) => apiClient.post<Group>('/v1/groups', data),
  updateGroup: (id: number | string, data: Partial<Group>) => apiClient.put<Group>(`/v1/groups/${id}`, data),
  deleteGroup: (id: number | string) => apiClient.delete(`/v1/groups/${id}`),
  
  getStudents: (groupId: number | string) => apiClient.get<any[]>(`/v1/groups/${groupId}/students`),
  getFormat911: (groupId: number | string) => apiClient.get<any>(`/v1/groups/${groupId}/format911`),
};
