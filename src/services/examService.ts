import { apiClient } from '../lib/apiClient';

export interface ExamGenerationRequest {
  grado_escolar: string;
  cantidad_preguntas: number;
  proyectos_y_pdas: Array<{
    proyecto_asociado: string;
    campo_formativo: string;
    pda_evaluado: string;
  }>;
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
  // Llama al backend de Laravel para validar o crear el registro (opcional)
  buildExamRecord: async (projectIds: string[]) => {
    return apiClient.post('/exams/build', { project_ids: projectIds });
  },

  // Llama al backend de Laravel para usar el endpoint de IA (vía Controlador real)
  generateAiQuestions: async (promptConfig: ExamGenerationRequest): Promise<GeneratedExamPayload> => {
    return apiClient.post<GeneratedExamPayload>('/v1/exams/generate-ai', promptConfig);
  }
};
