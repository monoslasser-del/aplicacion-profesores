import { apiClient } from '../lib/apiClient';

export interface Activity {
  id: string | number;
  group_id: number;
  title: string;
  subject: string;
  due_date: string;
}

export interface GradePayload {
  student_id: number;
  score: number;
  comments?: string;
}

export const activityService = {
  // Obtener actividades de un grupo
  getActivities: async (groupId: number): Promise<Activity[]> => {
    return apiClient.get<Activity[]>(`/activities?group_id=${groupId}`);
  },

  // Crear una nueva actividad
  createActivity: async (data: Partial<Activity>): Promise<Activity> => {
    return apiClient.post<Activity>('/activities', data);
  },

  // Subida masiva de promedios para una actividad
  submitGrades: async (activityId: string | number, grades: GradePayload[]) => {
    return apiClient.post(`/activities/${activityId}/grades`, { grades });
  },

  // Historial de notas de un estudiante
  getStudentGrades: async (studentId: number) => {
    return apiClient.get(`/students/${studentId}/grades`);
  }
};
