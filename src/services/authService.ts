import { apiClient, AUTH_TOKEN_KEY } from '../lib/apiClient';

// ---- Tipos ----
export interface GroupInfo {
  id: number;
  name: string;
  level: string | null;
  grade: string | null;
  group_letter: string | null;
  school_cycle: string | null;
  students_count: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  estado: string | null;
  municipio: string | null;
  google_id?: string | null;
  // Perfil educativo
  level: string | null;
  grade: string | null;
  group: string | null;
  nivel_educativo: string | null;
  // Grupo activo del docente (del backend)
  group_info: GroupInfo | null;
}

export interface AuthResponse {
  data: User;
  token: string;
  token_type: string;
}

const USER_KEY = 'AUTH_USER';

/** Guarda el usuario en localStorage */
function persistUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ---- Servicio ----
export const authService = {
  /**
   * Registra un nuevo usuario y guarda el token y datos en localStorage.
   */
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    estado: string;
    municipio: string;
    level?: string;
    grade?: string;
    group?: string;
    nivel_educativo?: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/v1/register', payload, { skipAuth: true });
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    persistUser(response.data);
    return response;
  },

  /**
   * Inicia sesión y guarda el token y datos en localStorage.
   */
  login: async (payload: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/v1/login', payload, { skipAuth: true });
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    persistUser(response.data);
    return response;
  },

  /**
   * Cierra la sesión del usuario actual en el servidor y limpia el localStorage.
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/v1/logout', {});
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Obtiene el perfil del usuario autenticado actualmente (refresca desde backend).
   */
  me: async (): Promise<User> => {
    const response = await apiClient.get<{ data: User }>('/v1/me');
    persistUser(response.data);
    return response.data;
  },

  /**
   * Devuelve el usuario almacenado en localStorage (sin llamada al backend).
   */
  getStoredUser: (): User | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Autentica al usuario con un Google ID token.
   */
  loginWithGoogle: async (accessToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/v1/auth/google', { access_token: accessToken }, { skipAuth: true });
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    persistUser(response.data);
    return response;
  },

  /**
   * Comprueba si hay un token guardado en localStorage.
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },
};
