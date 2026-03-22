export interface StudentStatsInput {
  name: string;
  curp: string;
  isRepetidor?: boolean;
}

export interface Matrix911 {
  [age: number]: {
    hombresNI: number;  // Nuevo Ingreso
    hombresR: number;   // Repetidores
    mujeresNI: number;
    mujeresR: number;
    total: number;
  };
  totals: {
    hombresNI: number;
    hombresR: number;
    mujeresNI: number;
    mujeresR: number;
    total: number;
  };
}

/**
 * Parsea una CURP para obtener el sexo y la fecha de nacimiento.
 */
export function parseCurpData(curp: string): { gender: 'H' | 'M' | null, birthDate: Date | null } {
  if (!curp || curp.length < 18) return { gender: null, birthDate: null };

  const genderChar = curp[10];
  const gender = genderChar === 'H' ? 'H' : genderChar === 'M' ? 'M' : null;

  const yearStr = curp.substring(4, 6);
  const monthStr = curp.substring(6, 8);
  const dayStr = curp.substring(8, 10);

  let fullYear = parseInt(yearStr, 10);
  
  // Solución pragmática (protección vs CURPs falsos/mock de prueba):
  // Asume que si el año está entre 00 y 30 es de 2000+, de lo contrario 1900+
  if (fullYear >= 0 && fullYear <= 30) {
    fullYear += 2000;
  } else {
    fullYear += 1900;
  }

  const birthDate = new Date(fullYear, parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));

  return { gender, birthDate };
}

/**
 * Calcula la edad exacta de una persona cumplida al 1 de septiembre del ciclo escolar actual/indicado.
 */
export function calculateAgeAtSept1(birthDate: Date, targetYear: number = new Date().getFullYear()): number {
  // La SEP corta edades al 1 de septiembre
  const sept1st = new Date(targetYear, 8, 1); // Mes 8 = Septiembre (0-indexed)
  
  let age = sept1st.getFullYear() - birthDate.getFullYear();
  const m = sept1st.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && sept1st.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Agrupa la lista de alumnos en el formato estadístico 911 (Edades vs Sexo/Ingreso)
 */
export function generate911Matrix(students: StudentStatsInput[], currentSchoolYear: number = new Date().getFullYear()): Matrix911 {
  const matrix: Matrix911 = {
    totals: { hombresNI: 0, hombresR: 0, mujeresNI: 0, mujeresR: 0, total: 0 }
  };

  students.forEach(student => {
    const { gender, birthDate } = parseCurpData(student.curp);
    
    // Si la CURP es inválida, podríamos agruparlos en un cubo de error o ignorarlos de la estadística, 
    // pero para este MVP asumimos CURPs razonablemente válidas.
    if (!gender || !birthDate) return; 

    const age = calculateAgeAtSept1(birthDate, currentSchoolYear);
    const isR = !!student.isRepetidor;

    // Inicializar la fila de edad si no existe
    if (!matrix[age]) {
      matrix[age] = { hombresNI: 0, hombresR: 0, mujeresNI: 0, mujeresR: 0, total: 0 };
    }

    if (gender === 'H') {
      if (isR) {
        matrix[age].hombresR++;
        matrix.totals.hombresR++;
      } else {
        matrix[age].hombresNI++;
        matrix.totals.hombresNI++;
      }
    } else if (gender === 'M') {
      if (isR) {
        matrix[age].mujeresR++;
        matrix.totals.mujeresR++;
      } else {
        matrix[age].mujeresNI++;
        matrix.totals.mujeresNI++;
      }
    }

    matrix[age].total++;
    matrix.totals.total++;
  });

  return matrix;
}
