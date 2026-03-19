import Dexie, { type EntityTable } from 'dexie';

// Interfaz para definir la estructura de un estudiante en la base de datos
export interface Student {
  id: number;
  name: string;
  enrollment_date: string;
  curp?: string; // Optional field according to NEM standard or similar
  sync_status: 'PENDING' | 'SYNCED' | 'FAILED'; // Estado para la nube
}

// Interfaz para el perfil del maestro/usuario principal
export interface UserProfile {
  id?: number;
  phone: string;
  name: string;
  email: string;
  role: string;
  grade: string;
}

// Configuración de la base de datos local usando Dexie (IndexedDB)
class MyAppDatabase extends Dexie {
  students!: EntityTable<Student, 'id'>;
  userProfile!: EntityTable<UserProfile, 'id'>;

  constructor() {
    super('NEM_SchoolAppDB');
    
    // Define las tablas y sus índices.
    // Importante: 'sync_status' está indexado para poder buscar rápidamente los pendientes de sincronizar
    this.version(3).stores({
      students: '++id, name, enrollment_date, sync_status',
      userProfile: '++id, &phone' // El teléfono debe ser único para evitar multiples registros
    });
  }
}

// Exportar una instancia única para ser utilizada en toda la app
export const db = new MyAppDatabase();
