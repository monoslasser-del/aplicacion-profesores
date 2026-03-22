// ─────────────────────────────────────────────────────────────────────────────
// Constantes del Perfil Educativo — NEM (Nueva Escuela Mexicana)
// ─────────────────────────────────────────────────────────────────────────────

export const EDUCATIONAL_LEVELS = ['Preescolar', 'Primaria', 'Secundaria'] as const;
export type EducationalLevel = typeof EDUCATIONAL_LEVELS[number];

export const GRADES_BY_LEVEL: Record<EducationalLevel, number[]> = {
  Preescolar: [1, 2, 3],
  Primaria:   [1, 2, 3, 4, 5, 6],
  Secundaria: [1, 2, 3],
};

export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export type GroupLetter = typeof GROUPS[number];

/** Helper: texto legible para mostrar en UI */
export function levelLabel(level: EducationalLevel): string {
  return level; // coincide con el valor
}

export function gradeLabel(grade: number): string {
  return `${grade}° Grado`;
}
