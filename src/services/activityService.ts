import { apiClient } from '../lib/apiClient';

export interface Activity {
  id?: number;
  title: string;
  description?: string;
  subject: string; // Campo Formativo (ej. 'Saberes', 'Lenguajes')
  due_date?: string;
  group_id?: number | string;
  evaluation_scale?: 'numeric' | 'levels';
}

export interface Grade {
  id?: number;
  student_id: number;
  activity_id: number;
  score?: number | null;
  score_text?: string | null;
  comments?: string;
}

export const activityService = {
  getActivities: () => apiClient.get<Activity[]>('/v1/activities'),
  createActivity: (data: Activity) => apiClient.post<Activity>('/v1/activities', data),
  updateActivity: (id: number, data: Partial<Activity>) => apiClient.put<Activity>(`/v1/activities/${id}`, data),
  deleteActivity: (id: number) => apiClient.delete(`/v1/activities/${id}`),
  
  // Evaluaciones Masivas / Individuales
  submitGrades: (activityId: number, grades: {student_id: number, score?: number | null, score_text?: string | null}[]) => 
    apiClient.post(`/v1/activities/${activityId}/grades`, { grades }),
  getStudentGrades: (studentId: number) => apiClient.get<Grade[]>(`/v1/students/${studentId}/grades`),
};
