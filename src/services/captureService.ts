/**
 * captureService.ts
 *
 * Servicio dedicado a la lógica de CAPTURA de evaluaciones.
 * Abstrae los tres modos de captura (Manual, QR, NFC) y centraliza:
 *   - La resolución de alumnos por identificador de hardware
 *   - El envío de evaluaciones individuales con fallback offline
 *   - El cierre/finalización de una sesión de captura
 *
 * El componente CaptureView.tsx delega aquí toda la lógica de negocio
 * y solo gestiona estado de UI.
 */

import { activityService, type GradePayload } from './activityService';
import { studentService, type Student } from './studentService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CaptureMode = 'manual' | 'qr' | 'nfc';

export type EvaluationScale = 'numeric' | 'levels';

export type ActivityType = 'registro' | 'participacion' | 'calificada';

export interface CaptureSession {
  activityId: number;
  activityType: ActivityType;
  evaluationScale: EvaluationScale;
  groupId?: number;
}

export interface EvaluationResult {
  gradeValue: string | null;   // Calificación numérica (ej. "8")
  levelValue: string | null;   // Nivel descriptivo (ej. "Logrado")
  statusValue: 'yes' | 'no' | null; // Para registro / participación
}

export interface CaptureRecord {
  studentId: number;
  activityId: string;
  type: 'evaluation';
  value?: string;
  timestamp: string;
  mode: CaptureMode;
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

/**
 * Convierte un EvaluationResult al payload de calificación esperado por el backend.
 */
function buildGradePayload(
  studentId: number,
  result: EvaluationResult,
  activityType: ActivityType,
  evaluationScale: EvaluationScale
): GradePayload {
  let score: number | null = null;
  let score_text: string | null = null;

  if (activityType === 'calificada') {
    if (evaluationScale === 'numeric' && result.gradeValue) {
      score = parseFloat(result.gradeValue);
    } else if (evaluationScale === 'levels' && result.levelValue) {
      score_text = result.levelValue;
    }
  } else {
    // registro | participacion → solo registramos si entregó o no
    score_text =
      result.statusValue === 'yes' ? 'Completado' :
      result.statusValue === 'no'  ? 'Pendiente'  : null;
  }

  return { student_id: studentId, score, score_text };
}

// ─── Service principal ────────────────────────────────────────────────────────

export const captureService = {

  // ── Resolución de alumno por modo de captura ───────────────────────────────

  /**
   * Dado un UID NFC (formato "XX:XX:XX:XX"), busca el alumno en la lista
   * local (offline-first). Si no lo encuentra localmente, hace la consulta
   * al backend como fallback.
   *
   * @param uid           UID leído por el lector NFC
   * @param localStudents Lista de alumnos ya cargados en memoria
   */
  resolveStudentByNfc: async (
    uid: string,
    localStudents: Student[]
  ): Promise<Student | null> => {
    // 1. Match local (rápido, sin latencia)
    const local = localStudents.find((s) => s.nfc_tag === uid);
    if (local) return local;

    // 2. Fallback al backend (por si el alumno fue añadido recientemente)
    try {
      const result = await studentService.lookupByNfc(uid);
      return result;
    } catch {
      return null;
    }
  },

  /**
   * Dado un código QR (raw value), busca el alumno en la lista local
   * comparando por qr_code o por id (para QR que contienen el ID numérico).
   *
   * @param code          Código leído por la cámara (BarcodeDetector)
   * @param localStudents Lista de alumnos ya cargados en memoria
   */
  resolveStudentByQr: async (
    code: string,
    localStudents: Student[]
  ): Promise<Student | null> => {
    // 1. Match local
    const local = localStudents.find(
      (s) => s.qr_code === code || s.id?.toString() === code
    );
    if (local) return local;

    // 2. Fallback al backend
    try {
      const result = await studentService.lookupByQr(code);
      return result;
    } catch {
      return null;
    }
  },

  // ── Envío de evaluación individual ────────────────────────────────────────

  /**
   * Envía la evaluación de un solo alumno al backend.
   * Si está offline o el request falla, devuelve un CaptureRecord para que
   * el store de sincronización lo persista localmente.
   *
   * @returns `{ success: true }` si se sincronizó, o `{ success: false, record }` si falló.
   */
  submitEvaluation: async (
    session: CaptureSession,
    studentId: number,
    result: EvaluationResult,
    mode: CaptureMode
  ): Promise<{ success: boolean; record?: CaptureRecord }> => {
    const payload = buildGradePayload(
      studentId,
      result,
      session.activityType,
      session.evaluationScale
    );

    const offlineRecord: CaptureRecord = {
      studentId,
      activityId: session.activityId.toString(),
      type: 'evaluation',
      value: payload.score_text ?? payload.score?.toString(),
      timestamp: new Date().toISOString(),
      mode,
    };

    // Sin conexión → devuelve record para sync posterior
    if (!navigator.onLine) {
      return { success: false, record: offlineRecord };
    }

    try {
      await activityService.submitSingleGrade(session.activityId, payload);
      return { success: true };
    } catch (err) {
      console.error(`[captureService] submitEvaluation failed (mode: ${mode}):`, err);
      return { success: false, record: offlineRecord };
    }
  },

  // ── Envío masivo al guardar y finalizar ───────────────────────────────────

  /**
   * Envía todas las evaluaciones acumuladas en la sesión y cierra la actividad.
   * Filtra automáticamente los alumnos sin evaluación asignada.
   *
   * @param session  Sesión de captura activa
   * @param students Lista de alumnos con sus valores de grade/level/status ya asignados
   */
  submitSessionAndClose: async (
    session: CaptureSession,
    students: Array<{
      id: number;
      grade: string;
      level: string;
      status: string | null;
    }>
  ): Promise<{ submitted: number }> => {
    const grades: GradePayload[] = students
      .map((s) =>
        buildGradePayload(
          s.id,
          { gradeValue: s.grade || null, levelValue: s.level || null, statusValue: s.status as any },
          session.activityType,
          session.evaluationScale
        )
      )
      .filter((g) => g.score !== null || (g.score_text !== null && g.score_text !== undefined));
      
    console.log('[DEBUG] Datos de Evaluación a Mandar:', {
      actividad_id: session.activityId,
      tipo_actividad: session.activityType,
      escala_evaluacion: session.evaluationScale,
      alumnos_evaluados: grades.length,
      payload_calificaciones: grades
    });

    if (grades.length > 0) {
      await activityService.submitGrades(session.activityId, grades);
    }

    // Marcar la actividad como terminada
    await activityService.closeActivity(session.activityId);

    return { submitted: grades.length };
  },

  // ── Helpers de UI / formateo ──────────────────────────────────────────────

  /**
   * Dado el estado de un alumno y el tipo de actividad,
   * devuelve la etiqueta de texto corta para mostrar en la lista.
   */
  getStudentDisplayValue: (
    student: { grade: string; level: string; status: string | null },
    activityType: ActivityType,
    evaluationScale: EvaluationScale
  ): string | null => {
    if (activityType === 'calificada') {
      return evaluationScale === 'numeric'
        ? student.grade || null
        : student.level || null;
    }
    return student.status === 'yes'
      ? 'Listo'
      : student.status === 'no'
      ? 'Pendiente'
      : null;
  },

  /**
   * Verifica si el dispositivo tiene soporte nativo para BarcodeDetector (QR).
   * En Android WebView (Capacitor) suele estar disponible.
   */
  isBarcodeDetectorSupported: (): boolean => {
    return typeof window !== 'undefined' && 'BarcodeDetector' in window;
  },

  /**
   * Convierte un raw UID NFC (Uint8Array) al formato legible "XX:XX:XX:XX".
   */
  formatNfcUid: (rawId: number[] | Uint8Array): string => {
    return Array.from(rawId)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(':');
  },
};
