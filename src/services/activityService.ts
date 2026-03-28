import { apiClient } from '../lib/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Activity {
  id?: number;
  title: string;
  description?: string;
  /** Campo Formativo — ej. 'Saberes y Pensamiento Científico' */
  subject: string;
  due_date?: string;
  group_id?: number | string;
  evaluation_scale?: 'numeric' | 'levels';
  type?: 'registro' | 'participacion' | 'calificada';
  period?: 1 | 2 | 3;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GradePayload {
  student_id: number;
  score?: number | null;
  score_text?: string | null;
  comments?: string | null;
}

export interface Grade {
  id?: number;
  student_id: number;
  activity_id: number;
  score?: number | null;
  score_text?: string | null;
  comments?: string | null;
  created_at?: string;
}

export interface KardexEntry {
  campo_formativo: string;
  promedio: number | null;
  calificaciones: {
    id: number;
    activity_id: number;
    activity: { title: string; subject: string; due_date: string; period: number } | null;
    score: number;
    comments: string | null;
    created_at: string;
  }[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const activityService = {
  // ── Actividades CRUD ───────────────────────────────────────────────────────

  /** Lista todas las actividades del grupo del maestro (más recientes primero). */
  getActivities: (params?: { group_id?: number; period?: number }) => {
    const qs = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
    return apiClient.get<Activity[]>(`/v1/activities${qs}`);
  },

  /**
   * Devuelve la actividad marcada como activa para el grupo del maestro.
   * Lanza 404 si no hay ninguna activa — el frontend debe manejarlo creando una.
   */
  getActiveActivity: () => apiClient.get<Activity>('/v1/activities/active'),

  getActivity: (id: number) => apiClient.get<Activity & { grades: Grade[] }>(`/v1/activities/${id}`),

  /**
   * Crea una nueva actividad.
   * El backend desactiva automáticamente las actividades previas del grupo.
   */
  createActivity: (data: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) =>
    apiClient.post<Activity>('/v1/activities', data),

  updateActivity: (id: number, data: Partial<Activity>) =>
    apiClient.put<Activity>(`/v1/activities/${id}`, data),

  deleteActivity: (id: number) => apiClient.delete(`/v1/activities/${id}`),

  // ── Calificaciones ────────────────────────────────────────────────────────

  /**
   * Envía calificaciones en bloque para una actividad.
   * Hace upsert (crea o actualiza) por student_id + activity_id.
   *
   * @param activityId - ID de la actividad
   * @param grades     - Array de objetos con student_id y score / score_text
   */
  submitGrades: (activityId: number, grades: GradePayload[]) =>
    apiClient.post<{ message: string; count: number; grades: Grade[] }>(
      `/v1/activities/${activityId}/grades`,
      { grades }
    ),

  /**
   * Envía la calificación de un solo alumno (wrapper sobre submitGrades).
   * Conveniente para los modos NFC y QR donde se evalúa de uno en uno.
   */
  submitSingleGrade: (activityId: number, payload: GradePayload) =>
    activityService.submitGrades(activityId, [payload]),

  /**
   * Devuelve el kardex completo de un alumno agrupado por campo formativo.
   */
  getStudentGrades: (studentId: number | string) =>
    apiClient.get<{
      student_id: number;
      promedio_global: number | null;
      total_actividades: number;
      kardex: KardexEntry[];
    }>(`/v1/students/${studentId}/grades`),

  /**
   * Cierra / finaliza una actividad (marca is_active = false).
   * Llama a updateActivity internamente para mantener la abstracción.
   */
  closeActivity: (id: number) =>
    activityService.updateActivity(id, { is_active: false }),
};
