import { apiClient } from '../lib/apiClient';

export type EventType = 'inicio_fin' | 'cte' | 'descarga' | 'festivo' | 'vacaciones' | 'registro' | 'taller' | 'custom';

export interface CalendarEvent {
  id?: number;
  date: string;       // YYYY-MM-DD
  title: string;
  type: EventType | string;
  bg_color?: string;
  text_color?: string;
  dot_color?: string;
  is_global?: boolean;
}

export const calendarService = {
  getEvents: async (): Promise<CalendarEvent[]> => {
    try {
      const response = await apiClient.get<CalendarEvent[]>('/v1/calendar-events');
      return response;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  },

  createEvent: async (event: CalendarEvent): Promise<CalendarEvent> => {
    try {
      const response = await apiClient.post<CalendarEvent>('/v1/calendar-events', event);
      return response;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  },

  updateEvent: async (id: number, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    try {
      const response = await apiClient.put<CalendarEvent>(`/v1/calendar-events/${id}`, event);
      return response;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  },

  deleteEvent: async (id: number): Promise<void> => {
    try {
      await apiClient.delete<void>(`/v1/calendar-events/${id}`);
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }
};
