import { apiClient } from '../lib/apiClient';

export interface Plan {
  id?: number;
  name: string;
  price: number;
  stripe_price_id?: string;
  features?: string[] | object;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const planService = {
  getPlans: () => apiClient.get<Plan[]>('/v1/plans'),
  getPlan: (id: number | string) => apiClient.get<Plan>(`/v1/plans/${id}`),
  // Admin only routes
  getAdminPlans: () => apiClient.get<Plan[]>('/v1/admin/plans'),
  createPlan: (data: Partial<Plan>) => apiClient.post<Plan>('/v1/plans', data),
  updatePlan: (id: number | string, data: Partial<Plan>) => apiClient.put<Plan>(`/v1/plans/${id}`, data),
  deletePlan: (id: number | string) => apiClient.delete(`/v1/plans/${id}`),
};
