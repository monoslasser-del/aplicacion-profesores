import { db, type UserProfile } from '../storage/db';
import { apiClient } from '../lib/apiClient';

/**
 * Servicio encargado de la autenticación y registro de docentes.
 */
export const authService = {
  /**
   * Registra un nuevo docente tanto localmente como (opcionalmente) en el servidor.
   */
  register: async (data: { name: string; email: string; grade: string; password?: string }) => {
    try {
      // 1. Intentar registrarlo en la API en la nube
      try {
        const response = await apiClient.post<any>('/register', data);
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      } catch (apiError) {
        console.warn('No se pudo registrar en servidor (offline o error):', apiError);
      }

      // 2. Guardar perfil localmente en IndexedDB
      // Primero limpiamos perfiles anteriores para mantener solo 1 sesión activa
      await db.userProfile.clear();

      const newProfile: UserProfile = {
        name: data.name,
        email: data.email,
        phone: '0000000000', // Default o pedir en form
        role: 'Docente',
        grade: data.grade
      };

      const id = await db.userProfile.add(newProfile);
      
      // Simular tiempo de carga
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return id;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  /**
   * Inicia sesión validando contra la nube o local si está offline.
   */
  login: async (email: string, password?: string) => {
    try {
      // 1. Login en API en la nube
      try {
        const response = await apiClient.post<any>('/login', { email, password });
        if (response.token) {
          localStorage.setItem('token', response.token);
          
          if (response.data) {
            await db.userProfile.clear(); // Limpiamos perfiles anteriores
            const newProfile = {
              name: response.data.name || email,
              email: response.data.email || email,
              phone: response.data.phone || '0000000000',
              role: response.data.role || 'Docente',
              grade: response.data.grade || 'N/A'
            };
            await db.userProfile.add(newProfile);
          }
        }
      } catch (apiError) {
        console.warn('Login en la nube falló. Intentando offline fallback...', apiError);
      }
      
      // Simular tiempo de carga si no hubo API
      await new Promise(resolve => setTimeout(resolve, 800));

      // 2. Buscar si ya existe el usuario localmente
      const users = await db.userProfile.where('email').equals(email).toArray();
      
      if (users.length === 0) {
        throw new Error('Usuario no encontrado localmente');
      }

      return users[0];
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  /**
   * Obtiene el usuario activo actualmente
   */
  getActiveUser: async (): Promise<UserProfile | null> => {
    const users = await db.userProfile.toArray();
    return users.length > 0 ? users[users.length - 1] : null;
  },

  /**
   * Cierra la sesión (Limpia datos locales si es necesario)
   */
  logout: async () => {
    localStorage.removeItem('token');
    // await db.userProfile.clear();
  }
};
