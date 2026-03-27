import { apiClient } from '../lib/apiClient';

export interface DescriptiveCardData {
  id?: string;
  student_id: number;
  student_name: string;
  status: 'Pendiente' | 'Generada';
  fortalezas?: string;
  areas_oportunidad?: string;
  recomendaciones_generales?: string;
  recomendaciones_familia?: string;
  evaluaciones_count?: number;
}

export const descriptiveCardService = {
  getGroupProgress: async (groupId: number) => {
    return apiClient.get<any>(`/v1/groups/${groupId}/descriptive-cards`);
  },
  getCard: async (studentId: number) => {
    return apiClient.get<DescriptiveCardData>(`/v1/students/${studentId}/descriptive-card`);
  },
  generateBatch: async (groupId: number) => {
    return apiClient.post<{success: boolean, generated_count: number, message: string}>(`/v1/groups/${groupId}/descriptive-cards/batch`, {});
  },
  saveCard: async (studentId: number, data: Partial<DescriptiveCardData>) => {
    return apiClient.post<{success: boolean, message: string, status: string}>(`/v1/students/${studentId}/descriptive-card`, data);
  },
  downloadPdfUrl: (studentId: number) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
    return `${baseUrl}/v1/students/${studentId}/descriptive-card/pdf`;
  }
};
