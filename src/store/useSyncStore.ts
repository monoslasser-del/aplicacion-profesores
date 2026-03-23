import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../lib/apiClient';

export interface PendingRecord {
  id: string; // Un UUID local
  studentId: string;
  activityId?: string; // Para tareas o rúbricas
  type: 'attendance' | 'evaluation';
  value?: string; // Ej: 'B', 'P', 'E'
  timestamp: number;
}

interface SyncState {
  pendingRecords: PendingRecord[];
  isOnline: boolean;
  addRecord: (record: Omit<PendingRecord, 'id' | 'timestamp'>) => void;
  removeRecord: (id: string) => void;
  setOnlineStatus: (status: boolean) => void;
  syncData: () => Promise<void>;
  clearAll: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      pendingRecords: [],
      isOnline: navigator.onLine,

      addRecord: (record) => {
        const newRecord: PendingRecord = {
          ...record,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };

        set((state) => {
          // Si estamos tomando asistencia, evitar duplicados del mismo día para el mismo alumno (sobrescribir)
          const filtered = state.pendingRecords.filter(r => 
            !(r.studentId === record.studentId && r.type === record.type && r.activityId === record.activityId)
          );
          return { pendingRecords: [...filtered, newRecord] };
        });
      },

      removeRecord: (id) => {
        set((state) => ({
          pendingRecords: state.pendingRecords.filter((r) => r.id !== id),
        }));
      },

      setOnlineStatus: (status) => {
        set({ isOnline: status });
      },

      syncData: async () => {
        const { pendingRecords, removeRecord, isOnline } = get();
        if (!isOnline || pendingRecords.length === 0) return;

        // Intentar sincronizar cada registro
        for (const record of pendingRecords) {
          try {
            if (record.type === 'attendance') {
              // Asumiendo un endpoint de asistencia
              await apiClient.post('/v1/attendance', {
                student_id: record.studentId,
                status: 'present',
                date: new Date(record.timestamp).toISOString().split('T')[0]
              });
            } else if (record.type === 'evaluation') {
              // Asumiendo un endpoint de evaluación
              await apiClient.post('/v1/activities/grades', {
                activity_id: record.activityId,
                grades: [{
                  student_id: record.studentId,
                  score: record.value === 'E' ? 10 : record.value === 'B' ? 8 : record.value === 'I' ? 6 : record.value === 'P' ? 5 : 0
                }]
              });
            }
            // Si la petición fue exitosa, eliminamos de la cola
            removeRecord(record.id);
          } catch (error) {
            console.error('Error sincronizando registro', record.id, error);
            // Si falla, se queda en la cola de pendingRecords
          }
        }
      },
      
      clearAll: () => set({ pendingRecords: [] })
    }),
    {
      name: 'nfc-sync-storage', // Clave de localStorage
    }
  )
);
