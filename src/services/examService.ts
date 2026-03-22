import { apiClient } from '../lib/apiClient';

export interface ExamGenerationRequest {
  grado_escolar: string;
  cantidad_preguntas: number;
  proyectos_y_pdas: any[];
}

export interface GeneratedQuestion {
  id_pregunta: number;
  campo_formativo: string;
  pda_evaluado: string;
  situacion_contexto: string;
  pregunta_directa: string;
  opciones: Record<string, string>;
  respuesta_correcta: string;
  justificacion_docente: string;
}

export interface GeneratedExamPayload {
  metadatos_documento: {
    titulo_sugerido: string;
    instrucciones_examen: string;
    instrucciones_hoja_respuestas: string;
  };
  examen_para_word: GeneratedQuestion[];
  clave_ocr_pdf: Record<string, string>;
}

export const examService = {
  generateAiQuestions: async (promptConfig: ExamGenerationRequest): Promise<GeneratedExamPayload> => {
    // Mapeamos los keys de español (frontend) a inglés estructurado (backend expect)
    const payload = {
      grade: promptConfig.grado_escolar,
      num_questions: promptConfig.cantidad_preguntas,
      projects: promptConfig.proyectos_y_pdas,
    };
    return apiClient.post<GeneratedExamPayload>('/v1/exams/generate-ai', payload);
  }
};
