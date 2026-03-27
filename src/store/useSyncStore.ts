import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../lib/apiClient';

// Maximum attempts before a stuck record is auto-discarded
const MAX_RETRY_ATTEMPTS = 3;

export interface PendingRecord {
  id: string;
  studentId: number | string;
  activityId?: string;
  type: 'attendance' | 'evaluation';
  value?: string;
  timestamp: number;
  /** Number of failed sync attempts — records are dropped after MAX_RETRY_ATTEMPTS */
  attempts?: number;
}

interface SyncState {
  pendingRecords: PendingRecord[];
  isOnline: boolean;
  addRecord: (record: Omit<PendingRecord, 'id' | 'timestamp' | 'attempts'>) => void;
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
          attempts: 0,
        };

        set((state) => {
          // Deduplicate: same student + type + activity → overwrite
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
        const { pendingRecords, isOnline } = get();
        if (!isOnline || pendingRecords.length === 0) return;

        const toRemove: string[] = [];
        const toIncrementAttempts: string[] = [];

        for (const record of pendingRecords) {
          // Auto-discard records that have failed too many times
          const attempts = record.attempts ?? 0;
          if (attempts >= MAX_RETRY_ATTEMPTS) {
            console.warn(
              `[syncStore] Discarding stuck record ${record.id} after ${attempts} failed attempts.`,
              record
            );
            toRemove.push(record.id);
            continue;
          }

          try {
            if (record.type === 'attendance') {
              await apiClient.post('/v1/attendance', {
                student_id: record.studentId,
                status: 'present',
                date: new Date(record.timestamp).toISOString().split('T')[0],
              });
            } else if (record.type === 'evaluation' && record.activityId) {
              // Parse value: numeric string → score, text → score_text
              const numericVal = record.value ? parseFloat(record.value) : NaN;
              const isNumeric = !isNaN(numericVal);

              await apiClient.post(`/v1/activities/${record.activityId}/grades`, {
                grades: [{
                  student_id: record.studentId,
                  score: isNumeric ? numericVal : null,
                  score_text: !isNumeric && record.value ? record.value : null,
                }],
              });
            }

            // Success → mark for removal
            toRemove.push(record.id);
          } catch (error: any) {
            const status = error?.status ?? error?.response?.status ?? 0;

            // 4xx client errors (bad payload, not found, etc.) → discard immediately,
            // retrying won't help since the payload is structurally wrong.
            if (status >= 400 && status < 500) {
              console.warn(`[syncStore] Discarding record ${record.id} — client error ${status}:`, error);
              toRemove.push(record.id);
            } else {
              // 5xx / network → increment attempt counter, keep for retry
              console.error(`[syncStore] Failed to sync record ${record.id} (attempt ${attempts + 1}/${MAX_RETRY_ATTEMPTS}):`, error);
              toIncrementAttempts.push(record.id);
            }
          }
        }

        // Apply removals and attempt increments in a single state update
        set((state) => ({
          pendingRecords: state.pendingRecords
            .filter((r) => !toRemove.includes(r.id))
            .map((r) =>
              toIncrementAttempts.includes(r.id)
                ? { ...r, attempts: (r.attempts ?? 0) + 1 }
                : r
            ),
        }));
      },

      clearAll: () => set({ pendingRecords: [] }),
    }),
    {
      name: 'nfc-sync-storage',
    }
  )
);
