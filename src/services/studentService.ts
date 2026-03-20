import { apiClient } from '../lib/apiClient';

export interface Student {
  id?: number | string;
  name: string;
  curp: string;
  nfc_tag?: string;
  group_id?: number | string;
  is_active?: boolean;
}

export const studentService = {
  getStudents: () => apiClient.get<Student[]>('/v1/students'),
  getStudent: (id: number | string) => apiClient.get<Student>(`/v1/students/${id}`),
  createStudent: (data: Student) => apiClient.post<Student>('/v1/students', data),
  updateStudent: (id: number | string, data: Partial<Student>) => apiClient.put<Student>(`/v1/students/${id}`, data),
  deleteStudent: (id: number | string) => apiClient.delete(`/v1/students/${id}`),
  
  // Servicios Especiales
  assignNfc: (id: number | string, nfc_tag: string) => apiClient.post(`/v1/students/${id}/assign-nfc`, { nfc_tag }),
  
  importExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // Nota: enviarlo usando fetch nativo para respetar el multipart/form-data correcto
    const token = localStorage.getItem('auth_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://tech.ecteam.mx/api';
    
    const response = await fetch(`${baseUrl}/v1/students/import`, {
      method: 'POST',
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      body: formData
    });
    
    if (!response.ok) throw new Error('Error al subir el archivo Excel');
    return response.json();
  }
};
