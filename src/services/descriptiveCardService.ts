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
}

export const descriptiveCardService = {
  getGroupProgress: async (groupId: number) => {
    return apiClient.get<any>(`/v1/groups/${groupId}/descriptive-cards`);
  },
  getCard: async (studentId: number) => {
    return apiClient.get<DescriptiveCardData>(`/v1/students/${studentId}/descriptive-card`);
  },
  downloadPdfUrl: (studentId: number) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
    return `${baseUrl}/v1/students/${studentId}/descriptive-card/pdf`;
  }
};
