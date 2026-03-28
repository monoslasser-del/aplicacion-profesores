import { apiClient } from '../lib/apiClient';

export interface FormativeField {
  id?: number;
  name: string;
  description?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export const formativeFieldService = {
  getFields: () => apiClient.get<FormativeField[]>('/v1/formative-fields'),
  createField: (data: Partial<FormativeField>) => apiClient.post<FormativeField>('/v1/formative-fields', data),
  updateField: (id: number | string, data: Partial<FormativeField>) => apiClient.put<FormativeField>(`/v1/formative-fields/${id}`, data),
  deleteField: (id: number | string) => apiClient.delete(`/v1/formative-fields/${id}`),
};
