import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type Student } from '../storage/db';
import { generate911Matrix, type StudentStatsInput } from '../utils/curpUtils';
import { hardwareServices } from '../utils/hardwareServices';

type ReportPeriod = 'Semanal' | 'Mensual' | 'Trimestral';

interface ReportData {
  title: string;
  period: ReportPeriod;
  dateStart: string;
  dateEnd: string;
  students: Student[];
}

/**
 * Wrapper para generación de PDFs. 
 * Aislar esto nos permite cambiar la librería o el diseño global de los reportes
 * sin tocar la lógica de la pantalla.
 */
export const pdfGenerator = {

  /**
   * Genera un reporte de lista y/o actividades por periodo.
   * Descarga automáticamente el PDF.
   */
  generateActivityReport: (data: ReportData) => {
    // 1. Inicializar documento en orientación vertical ('p'), unidad 'mm', tamaño carta ('letter')
    const doc = new jsPDF('p', 'mm', 'letter');

    // 2. Configurar colores y tipografía del reporte (Verde Nemo / Secretaría)
    // El documento NEM suele usar tonos guindas o verdes oscuro. Usaremos un guinda institucional sutil.
    const primaryColor: [number, number, number] = [152, 27, 51]; 

    // 3. Cabecera del Documento
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(data.title, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Periodo: ${data.period}`, 14, 28);
    doc.text(`Fechas: ${data.dateStart} al ${data.dateEnd}`, 14, 33);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-MX')}`, 14, 38);

    // 4. Preparar datos para la tabla
    const tableBody = data.students.map((student, index) => [
      (index + 1).toString(), // Número de lista
      student.name,
      student.curp || 'N/A',
      student.enrollment_date.split('T')[0],
      // Aquí podrías agregar columnas dinámicas (Lunes, Martes, etc.)
      // Para propósitos del demo, agregaremos una columna de "Promedio" y "Asistencias"
      '—', // Calificación Base
      '—'  // Faltas
    ]);

    // 5. Dibujar Tabla usando jspdf-autotable
    autoTable(doc, {
      startY: 45,
      head: [['No.', 'Nombre del Alumno', 'CURP', 'Fecha Ingreso', 'Actividades', 'Observaciones']],
      body: tableBody,
      theme: 'grid', // 'striped', 'grid', 'plain'
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 40 }
    });

    // 6. Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        const text = `Documento generado por Acompáñame - Página ${i} de ${pageCount}`;
        // Centrar texto al fondo
        const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
        const textOffset = (doc.internal.pageSize.width - textWidth) / 2;
        doc.text(text, textOffset, doc.internal.pageSize.height - 10);
    }

    // 7. Descargar o Compartir el archivo
    const fileName = `Reporte_${data.period}_${new Date().getTime()}.pdf`;
    
    // Convert to base64 Data URI string
    const pdfOutput = doc.output('datauristring');
    // Strip the "data:application/pdf;base64," prefix.
    const base64Data = pdfOutput.split(',')[1];
    
    // Intenta usar la UI nativa (WhatsApp, Email, etc), si falla (ej. Web) entra por la descarga normal
    hardwareServices.shareBase64File(base64Data, fileName).then(wasNativeShared => {
      if (!wasNativeShared) {
        doc.save(fileName); // Fallback Web
      }
    });
  },

  /**
   * Genera el Formato Estadístico 911 oficial de inicio de ciclo.
   */
  generate911ReportPDF: (students: StudentStatsInput[], schoolYear: number = new Date().getFullYear()) => {
    const doc = new jsPDF('p', 'mm', 'letter');
    const primaryColor: [number, number, number] = [152, 27, 51]; // Guinda SEP

    // Header
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Formato Estadístico 911 - Inicio de Ciclo Escolar', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Ciclo Escolar Calculado: ${schoolYear} - ${schoolYear + 1}`, 14, 28);
    doc.text(`Edades calculadas estrictamente al 1 de septiembre de ${schoolYear}`, 14, 33);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-MX')}`, 14, 38);

    // Processing Matrix
    const matrix = generate911Matrix(students, schoolYear);

    // Filter ages that actually have students to build dynamic rows, or build a fixed range (ej: 3 a 15)
    // To make it dynamic and clean, we extract the keys (ages) that exist.
    const agesFound = Object.keys(matrix)
      .filter(k => k !== 'totals')
      .map(k => parseInt(k, 10))
      .sort((a, b) => a - b);

    // Prepare arrays for autoTable
    const head = [
      [
        { content: 'Edad', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Hombres', colSpan: 2, styles: { halign: 'center' } },
        { content: 'Mujeres', colSpan: 2, styles: { halign: 'center' } },
        { content: 'Total', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
      ],
      [
        'N. Ingreso', 'Repetidores', 'N. Ingreso', 'Repetidores'
      ]
    ];

    const body = agesFound.map(age => {
      const data = matrix[age];
      return [
        age.toString(),
        data.hombresNI.toString(),
        data.hombresR.toString(),
        data.mujeresNI.toString(),
        data.mujeresR.toString(),
        data.total.toString()
      ];
    });

    // Add totals row
    body.push([
      'TOTAL',
      matrix.totals.hombresNI.toString(),
      matrix.totals.hombresR.toString(),
      matrix.totals.mujeresNI.toString(),
      matrix.totals.mujeresR.toString(),
      matrix.totals.total.toString()
    ]);

    // Draw table
    autoTable(doc, {
      startY: 45,
      head: head as any, // Type override for complex headers
      body: body,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: 'center',
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: 'bold'
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      // Highlight total row
      didParseCell: function(data) {
        if (data.section === 'body' && data.row.index === body.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = '#f3f4f6';
        }
      }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        const text = `Documento estadístico - Página ${i} de ${pageCount}`;
        const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
        const textOffset = (doc.internal.pageSize.width - textWidth) / 2;
        doc.text(text, textOffset, doc.internal.pageSize.height - 10);
    }

    const fileName = `Estadistica_911_${new Date().getTime()}.pdf`;
    
    // Output base64 and strip header
    const pdfOutput = doc.output('datauristring');
    const base64Data = pdfOutput.split(',')[1];
    
    // Intentar compartición nativa
    hardwareServices.shareBase64File(base64Data, fileName).then(wasNativeShared => {
      if (!wasNativeShared) {
        doc.save(fileName); // Fallback Web
      }
    });
  }
};
