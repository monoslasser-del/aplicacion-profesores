import { apiClient, AUTH_TOKEN_KEY } from '../lib/apiClient';

// ---- Tipos ----
export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  estado: string | null;
  municipio: string | null;
  google_id: string | null;
}

export interface AuthResponse {
  data: User;
  token: string;
  token_type: string;
}

// ---- Servicio ----
export const authService = {
  /**
   * Registra un nuevo usuario y guarda el token en localStorage.
   */
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    estado: string;
    municipio: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/v1/register', payload, { skipAuth: true });
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    return response;
  },

  /**
   * Inicia sesión y guarda el token en localStorage.
   */
  login: async (payload: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/v1/login', payload, { skipAuth: true });
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
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
    }
  },

  /**
   * Obtiene el perfil del usuario autenticado actualmente.
   */
  me: async (): Promise<User> => {
    const response = await apiClient.get<{ data: User }>('/v1/me');
    return response.data;
  },

  /**
   * Autentica al usuario con un Google ID token.
   * El token lo obtiene el frontend con el plugin Capacitor Google Auth.
   */
  loginWithGoogle: async (accessToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/v1/auth/google', { access_token: accessToken }, { skipAuth: true });
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    return response;
  },

  /**
   * Comprueba si hay un token guardado en localStorage.
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },
};
