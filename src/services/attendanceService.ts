import { apiClient } from '../lib/apiClient';

export interface Attendance {
  id?: number;
  student_id: number;
  date: string;
  status: 'present' | 'absent' | 'late';
  time_scanned?: string;
}

export const attendanceService = {
  scanNfc: (nfc_tag: string) => apiClient.post<{message: string, student_name: string}>('/v1/attendance/scan-nfc', { nfc_tag }),
  markManual: (data: Attendance) => apiClient.post<Attendance>('/v1/attendance/manual', data),
  getToday: (group_id: number | string) => apiClient.get<Attendance[]>(`/v1/attendance/today/${group_id}`),
  getStats: (group_id: number | string) => apiClient.get<{present: number, total: number, percentage: number}>(`/v1/attendance/stats/${group_id}`),
};
