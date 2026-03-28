import { apiClient } from '../lib/apiClient';

export interface NotificationPayload {
  title: string;
  message: string;
  group_id?: number | string;
  student_id?: number;
}

export const notificationService = {
  // Profesor → padres
  send: (data: NotificationPayload) =>
    apiClient.post('/v1/notifications/send', data),

  getSent: () =>
    apiClient.get<any[]>('/v1/notifications/sent'),

  // Recibidas del admin (broadcasts)
  getInbox: () =>
    apiClient.get<any[]>('/v1/notifications/inbox'),

  // Badge: número de broadcasts sin leer (del último día)
  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/v1/notifications/unread-count'),
};
