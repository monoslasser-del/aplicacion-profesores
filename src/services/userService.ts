import { apiClient, AUTH_TOKEN_KEY } from '../lib/apiClient';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'https://tech.ecteam.mx/api';

export const userService = {
  updateProfile: async (name: string): Promise<{ message: string; user: any }> => {
    return apiClient.request<{ message: string; user: any }>('/v1/user/profile', {
      method: 'PATCH',
      data: { name },
    });
  },

  updatePassword: async (payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string; token: string }> => {
    return apiClient.request<{ message: string; token: string }>('/v1/user/password', {
      method: 'PUT',
      data: payload,
    });
  },

  /** POST /v1/user/avatar — Subir foto con multipart/form-data */
  updateAvatar: async (file: File): Promise<{ message: string; avatar_url: string }> => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const baseUrl = API_BASE;
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch(`${baseUrl}/v1/user/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any)?.message ?? `Error ${res.status}`);
    }
    return res.json();
  },

  /** DELETE /v1/user/avatar — Eliminar foto de perfil */
  deleteAvatar: async (): Promise<{ message: string }> => {
    return apiClient.request<{ message: string }>('/v1/user/avatar', { method: 'DELETE' });
  },
};
