import { apiClient } from '../lib/apiClient';

export interface ProjectResource {
  id: number;
  project_id: number;
  type: 'planeacion' | 'material' | 'recurso' | 'video';
  name: string;
  file_url: string;
  mime_type?: string;
  label?: string;
}

export interface ProjectData {
  id: number;
  title: string;
  field: string;       // "Lenguajes"
  field_id: string;    // "lenguajes"
  pda?: string;
  description?: string;
  problem?: string;
  product?: string;
  duration?: string;
  nivel_educativo?: string;
  grade?: number;
  is_active?: boolean;
  image_url?: string;
  resources?: ProjectResource[];
  resources_count?: number;
  created_at?: string;
  status?: 'active' | 'completed' | 'pending';
  progress?: number;
  startDate?: string;
  students?: number;
}

function labelFor(type: ProjectResource['type']): string {
  const map: Record<string, string> = {
    planeacion: 'Descargar Planeación',
    material:   'Ver Material',
    video:      'Ver Video',
    recurso:    'Descargar Recurso',
  };
  return map[type] ?? 'Descargar';
}

function normalize(raw: any): ProjectData {
  return {
    ...raw,
    status:   raw.status ?? (raw.is_active ? 'active' : 'pending'),
    progress: raw.progress ?? 0,
    startDate: raw.startDate ?? raw.created_at?.substring(0, 10) ?? '',
    students:  raw.students ?? 0,
    resources: (raw.resources ?? []).map((r: any) => ({
      ...r,
      label: r.label ?? labelFor(r.type),
    })),
  };
}

/** GET /v1/projects — catálogo público, filtrado por grado del docente */
export const projectService = {
  getProjects: async (): Promise<ProjectData[]> => {
    try {
      const res = await apiClient.get<any[]>('/v1/projects');
      return res.map(normalize);
    } catch {
      return []; // sin fallback en móvil — solo muestra vacío si hay error
    }
  },

  getProjectById: async (id: number): Promise<ProjectData> => {
    const res = await apiClient.get<any>(`/v1/projects/${id}`);
    return normalize(res);
  },

  openResource: (fileUrl: string) => {
    if (fileUrl && fileUrl !== '#') {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  },
};
