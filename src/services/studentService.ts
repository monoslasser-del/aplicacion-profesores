import { apiClient } from '../lib/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Student {
  id?: number | string;
  name: string;
  curp?: string | null;
  nfc_tag?: string | null;
  /** Código QR único de 8 caracteres (auto-generado por el backend) */
  qr_code?: string | null;
  group_id?: number | string;
  is_active?: boolean;
  is_repeater?: boolean;
  disability?: string | null;
}

export interface StudentLookupResult extends Student {
  id: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const studentService = {
  // ── CRUD ──────────────────────────────────────────────────────────────────

  /** Lista todos los alumnos del grupo del maestro autenticado.
   *  Incluye `nfc_tag` y `qr_code` para los modos de captura. */
  getStudents: () => apiClient.get<Student[]>('/v1/students'),

  /** Devuelve un alumno específico con todo su perfil. */
  getStudent: (id: number | string) => apiClient.get<Student>(`/v1/students/${id}`),

  createStudent: (data: Omit<Student, 'id'>) =>
    apiClient.post<Student>('/v1/students', data),

  updateStudent: (id: number | string, data: Partial<Student>) =>
    apiClient.put<Student>(`/v1/students/${id}`, data),

  deleteStudent: (id: number | string) =>
    apiClient.delete(`/v1/students/${id}`),

  // ── Asignación de hardware ─────────────────────────────────────────────────

  /**
   * Asigna un tag NFC al alumno (reemplaza el anterior si ya tenía).
   * @param id       ID del alumno
   * @param nfc_tag  UID de la tarjeta NFC en formato "XX:XX:XX:XX"
   */
  assignNfc: (id: number | string, nfc_tag: string) =>
    apiClient.post<{ message: string; student: Student }>(
      `/v1/students/${id}/assign-nfc`,
      { nfc_tag }
    ),

  /**
   * Asigna un código QR personalizado al alumno, o solicita uno nuevo
   * (dejar `qr_code` vacío para que el backend auto-genere).
   */
  assignQr: (id: number | string, qr_code?: string) =>
    apiClient.post<{ message: string; qr_code: string; student: Student }>(
      `/v1/students/${id}/assign-qr`,
      { qr_code: qr_code ?? null }
    ),

  // ── Lookups por hardware (útil para verificar en servidor) ────────────────

  /**
   * Busca un alumno por UID NFC en el backend.
   * Útil para validar que el tag está registrado antes de mostrar el modal.
   */
  lookupByNfc: (uid: string) =>
    apiClient.get<StudentLookupResult>(`/v1/students/lookup-nfc?uid=${encodeURIComponent(uid)}`),

  /**
   * Busca un alumno por código QR en el backend.
   * Útil cuando el BarcodeDetector devuelve el raw value.
   */
  lookupByQr: (code: string) =>
    apiClient.get<StudentLookupResult>(`/v1/students/lookup-qr?code=${encodeURIComponent(code)}`),

  // ── Importación masiva ────────────────────────────────────────────────────

  /**
   * Importa alumnos desde un archivo Excel (multipart/form-data).
   */
  importExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('auth_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://tech.ecteam.mx/api';

    const response = await fetch(`${baseUrl}/v1/students/import`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });

    if (!response.ok) throw new Error('Error al subir el archivo Excel');
    return response.json();
  },

  /**
   * Importa alumnos desde un array JSON (bulk).
   */
  bulkImport: (
    students: Array<{
      name?: string;
      first_name?: string;
      last_name?: string;
      curp?: string;
      is_repetidor?: boolean;
    }>
  ) =>
    apiClient.post<{
      message: string;
      inserted: number;
      skipped: number;
      errors: string[];
    }>('/v1/students/bulk', { students }),

  // ── Perfil extendido ──────────────────────────────────────────────────────

  /** Devuelve actividades, calificaciones y estadísticas del alumno. */
  getStudentActivities: (id: number | string) =>
    apiClient.get<{
      student: Student;
      recent_activities: any[];
      stats: { average: number; attendance_rate: number; total_activities: number };
    }>(`/v1/students/${id}/activities`),
};
