import { apiClient } from '../lib/apiClient';

// ─── Tipos ─────────────────────────────────────────────────────────────────
export interface SubjectAvg {
  subject: string;
  avg: number | null;
  count: number;
}

export interface StudentAvg {
  student_id: number;
  name: string;
  avg: number | null;
  graded: number;
  pending: number;
}

export interface GroupGradeStats {
  overall_avg: number | null;
  by_subject: SubjectAvg[];
  by_student: StudentAvg[];
  total_graded: number;
  total_pending: number;
}

export interface StudentWork {
  id: number;
  title: string;
  field: string;
  type: string;
  score: number;      // normalizado a /10
  raw_score: number;
  max_score: number;
  date: string;
  feedback: string;
}

export interface StudentWorksResponse {
  student: { id: number; name: string };
  works: StudentWork[];
}

// ─── Service ───────────────────────────────────────────────────────────────
export const gradeStatsService = {
  /**
   * Promedios globales, por campo formativo y por alumno del grupo del profesor.
   */
  getGroupStats: (): Promise<GroupGradeStats> =>
    apiClient.get<GroupGradeStats>('/v1/stats/grades'),

  /**
   * Trabajos evaluados de un alumno específico.
   */
  getStudentWorks: (studentId: number | string): Promise<StudentWorksResponse> =>
    apiClient.get<StudentWorksResponse>(`/v1/stats/student/${studentId}`),
};
