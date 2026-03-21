/**
 * Interceptor/Wrapper genérico para realizar peticiones HTTP.
 *
 * Centralizar esto aquí nos permite:
 * 1. Agregar tokens de autenticación automáticamente a cada petición.
 * 2. Manejar errores globalmente (ej. si el token expira, redirigir al login).
 * 3. Base URL configurable por entornos de desarrollo/producción.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface RequestOptions extends RequestInit {
  data?: any;
  skipAuth?: boolean;
}

export const apiClient = {
  /**
   * Petición genérica
   */
  request: async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const url = `${BASE_URL}${endpoint}`;
    
    // Obtener el token desde localStorage
    const token = localStorage.getItem('token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(!options.skipAuth && token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    if (options.data) {
      config.body = JSON.stringify(options.data);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login'; // Force redirect to login
        }
        
        // Manejar errores de servidor (4xx, 5xx)
        const errorData = await response.json().catch(() => ({}));
        // Extraer el primer mensaje de error de validación si existe
        const firstValidationError = errorData.errors
          ? Object.values(errorData.errors as Record<string, string[]>)[0]?.[0]
          : null;
        throw new Error(firstValidationError || errorData.message || `Error HTTP: ${response.status}`);
      }

      // Si es un 204 No Content, no hay JSON que parsear
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient.request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data: any, options?: RequestOptions) =>
    apiClient.request<T>(endpoint, { ...options, method: 'POST', data }),

  put: <T>(endpoint: string, data: any, options?: RequestOptions) =>
    apiClient.request<T>(endpoint, { ...options, method: 'PUT', data }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient.request<T>(endpoint, { ...options, method: 'DELETE' }),
};
