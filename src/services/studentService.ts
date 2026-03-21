import { db, type Student } from '../storage/db';
import { apiClient } from '../lib/apiClient';

/**
 * Servicio encargado de la lógica de negocio relacionada con Estudiantes.
 * Esto separa la lógica de acceso a datos de los componentes de React.
 */
export const studentService = {
  
  /**
   * Obtiene la lista completa de estudiantes
   */
  getAllStudents: async (): Promise<Student[]> => {
    try {
      return await db.students.toArray();
    } catch (error) {
      console.error('Error fetching students from local DB:', error);
      throw error;
    }
  },

  /**
   * Agrega un nuevo estudiante a la base de datos local
   */
  addStudent: async (studentData: Omit<Student, 'id'>): Promise<number> => {
    try {
      const id = await db.students.add(studentData as Student);
      return id as number;
    } catch (error) {
      console.error('Error adding new student:', error);
      throw error;
    }
  },

  /**
   * Agrega múltiples estudiantes a la base de datos local (Bulk Import)
   */
  addStudents: async (studentsData: Omit<Student, 'id'>[]): Promise<void> => {
    try {
      await db.students.bulkAdd(studentsData as Student[]);
    } catch (error) {
      console.error('Error adding students in bulk:', error);
      throw error;
    }
  },

  /**
   * Elimina un estudiante por su ID
   */
  deleteStudent: async (id: number): Promise<void> => {
    try {
      await db.students.delete(id);
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  /**
   * Intenta sincronizar los estudiantes locales pendientes con la nube (API)
   */
  syncPendingStudents: async (): Promise<void> => {
    try {
      // 1. Obtener todos los estudiantes con status 'PENDING'
      const pendingStudents = await db.students.where('sync_status').equals('PENDING').toArray();
      
      if (pendingStudents.length === 0) return;

      console.log(`Syncing ${pendingStudents.length} students to the cloud...`);

      for (const student of pendingStudents) {
        try {
          // 2. Enviar a la API externa
          await apiClient.post('/students', {
            name: student.name,
            enrollment_date: student.enrollment_date,
            curp: student.curp || null,
            nl: student.nl,
            group_id: student.group_id || null, // from Dashboard updates
            has_nfc: student.hasNfc,
            nfc_tag_id: student.nfc_tag_id,
            is_repetidor: student.isRepetidor,
          });

          // 3. Si tiene éxito, actualizar el estado local a 'SYNCED'
          await db.students.update(student.id, { sync_status: 'SYNCED' });
        } catch (apiError) {
          console.error(`Failed to sync student ${student.id}:`, apiError);
          // Opcional: Marcar como 'FAILED' o simplemente dejarlo 'PENDING' para reintentar después
        }
      }
    } catch (error) {
      console.error('Error during synchronization process:', error);
    }
  }
};
