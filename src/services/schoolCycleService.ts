import { apiClient } from '../lib/apiClient';

export interface SchoolCycle {
  id?: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const schoolCycleService = {
  getCycles: () => apiClient.get<SchoolCycle[]>('/v1/school-cycles'),
  getActiveCycle: () => apiClient.get<SchoolCycle>('/v1/school-cycles/active'),
  createCycle: (data: Partial<SchoolCycle>) => apiClient.post<SchoolCycle>('/v1/school-cycles', data),
  updateCycle: (id: number | string, data: Partial<SchoolCycle>) => apiClient.put<SchoolCycle>(`/v1/school-cycles/${id}`, data),
  setActiveCycle: (id: number | string) => apiClient.put<SchoolCycle>(`/v1/school-cycles/${id}/active`, {}),
  deleteCycle: (id: number | string) => apiClient.delete(`/v1/school-cycles/${id}`),
};
