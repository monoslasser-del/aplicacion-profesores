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

  generate911ReportPDF: (students: StudentStatsInput[], schoolYear: number = new Date().getFullYear()) => {
    const doc = new jsPDF('p', 'mm', 'letter');
    
    // ============================================
    // Paleta de Colores "Tiza & Datos"
    // ============================================
    const appBlue: [number, number, number] = [37, 99, 235]; // Fondo principal headers #2563EB
    const lightBlue: [number, number, number] = [239, 246, 255]; // Fondo fila alternativa #EFF6FF
    const softBlue: [number, number, number] = [219, 234, 254]; // Resaltado de totales #DBEAFE
    const textDark: [number, number, number] = [30, 41, 59]; // Texto Slate-800
    const textMuted: [number, number, number] = [100, 116, 139]; // Texto Slate-500
    const sepGold: [number, number, number] = [188, 149, 92]; // Dorado SEP

    // 1. Fondo de papel tenue
    doc.setFillColor(252, 253, 254);
    doc.rect(0, 0, 215.9, 279.4, 'F');
    
    // ============================================
    // ENCABEZADO MODERNO
    // ============================================
    // Franja Top ultra-delgada
    doc.setFillColor(appBlue[0], appBlue[1], appBlue[2]);
    doc.rect(0, 0, 215.9, 3, 'F');
    
    // Logo Izquierdo "Tiza & Datos"
    doc.setFillColor(appBlue[0], appBlue[1], appBlue[2]);
    doc.circle(20, 18, 5, 'F'); // Círculo Azul Logo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("TD", 20, 19.5, { align: "center" }); // Texto interior
    
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFontSize(14);
    doc.text("Tiza ", 28, 20);
    doc.setTextColor(appBlue[0], appBlue[1], appBlue[2]);
    doc.text("& Datos", 38.5, 20);
    
    // Título Central
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Formato Estadístico 911 - Inicio de Cursos (Ciclo ${schoolYear}-${schoolYear + 1})`, 108, 18, { align: "center" });
    
    // Escudo/Identificación Derecho SEP
    doc.setFillColor(sepGold[0], sepGold[1], sepGold[2]);
    doc.rect(175, 12, 4, 10, 'F');
    doc.setFillColor(152, 27, 51); // Guinda
    doc.rect(180, 12, 4, 10, 'F');
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Educación", 188, 15.5);
    doc.text("Pública", 188, 19.5);
    doc.text(`${new Date().toLocaleDateString('es-MX')}`, 175, 26);

    // ============================================
    // SECCIÓN DE METADATOS (Cajas Limpias)
    // ============================================
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 32, 188, 20, 2, 2, 'FD');

    // Iconos Simples hechos con dibujo
    // Docente Icon (Persona)
    doc.setFillColor(appBlue[0], appBlue[1], appBlue[2]);
    doc.circle(20, 42, 1.5, 'F');
    doc.rect(18, 44, 4, 3, 'F');
    // Escuela Icon (Edificio)
    doc.rect(84, 40, 4, 7, 'F');
    doc.triangle(86, 38, 83, 40, 89, 40, 'F');
    // Calendario Icon
    doc.rect(144, 40, 5, 6, 'FD');
    doc.line(144, 42, 149, 42);

    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("RESPONSABLE LOCAL", 26, 40);
    doc.text("CLAVE DE CENTRO (C.C.T.)", 92, 40);
    doc.text("FECHA CORTE EDADES", 152, 40);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text("Pendiente Designación", 26, 45);
    doc.text("NO ASIGNADO", 92, 45);
    doc.text(`1º Sep. ${schoolYear}`, 152, 45);

    // ============================================
    // MATRIZ Y TABLA
    // ============================================
    const matrix = generate911Matrix(students, schoolYear);
    let agesFound = Object.keys(matrix).filter(k => k !== 'totals').map(k => parseInt(k, 10)).filter(age => age > 0 && age < 100).sort((a, b) => a - b);
    if (agesFound.length === 0) agesFound = [6, 7, 8, 9, 10, 11, 12];

    const head = [
      [
        { content: 'EDAD', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: appBlue, textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'HOMBRES (H)', colSpan: 2, styles: { halign: 'center', fillColor: appBlue, textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'MUJERES (M)', colSpan: 2, styles: { halign: 'center', fillColor: appBlue, textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'TOTAL GENERAL', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: appBlue, textColor: [255, 255, 255], fontStyle: 'bold' } }
      ],
      [
        { content: 'Nuevo Ingreso', styles: { halign: 'center', fillColor: [59, 130, 246], textColor: [255, 255, 255], fontSize: 8 } }, 
        { content: 'Repetidores', styles: { halign: 'center', fillColor: [59, 130, 246], textColor: [255, 255, 255], fontSize: 8 } }, 
        { content: 'Nuevo Ingreso', styles: { halign: 'center', fillColor: [59, 130, 246], textColor: [255, 255, 255], fontSize: 8 } }, 
        { content: 'Repetidoras', styles: { halign: 'center', fillColor: [59, 130, 246], textColor: [255, 255, 255], fontSize: 8 } }
      ]
    ];

    const body = agesFound.map(age => {
      const data = matrix[age] || { hombresNI: 0, hombresR: 0, mujeresNI: 0, mujeresR: 0, total: 0 };
      return [
        { content: `${age} años`, styles: { fontStyle: 'bold', halign: 'center', textColor: textMuted } },
        { content: data.hombresNI.toString(), styles: { halign: 'center', textColor: data.hombresNI > 0 ? textDark : textMuted } },
        { content: data.hombresR.toString(), styles: { halign: 'center', textColor: data.hombresR > 0 ? textDark : textMuted } },
        { content: data.mujeresNI.toString(), styles: { halign: 'center', textColor: data.mujeresNI > 0 ? textDark : textMuted } },
        { content: data.mujeresR.toString(), styles: { halign: 'center', textColor: data.mujeresR > 0 ? textDark : textMuted } },
        { content: data.total.toString(), styles: { fontStyle: 'bold', halign: 'center', textColor: data.total > 0 ? appBlue : textMuted, fillColor: softBlue } }
      ];
    });

    body.push([
      { content: 'TOTALES', styles: { fontStyle: 'bold', halign: 'center', textColor: appBlue, fillColor: softBlue } },
      { content: matrix.totals.hombresNI.toString(), styles: { fontStyle: 'bold', halign: 'center', textColor: appBlue, fillColor: softBlue } },
      { content: matrix.totals.hombresR.toString(), styles: { fontStyle: 'bold', halign: 'center', textColor: appBlue, fillColor: softBlue } },
      { content: matrix.totals.mujeresNI.toString(), styles: { fontStyle: 'bold', halign: 'center', textColor: appBlue, fillColor: softBlue } },
      { content: matrix.totals.mujeresR.toString(), styles: { fontStyle: 'bold', halign: 'center', textColor: appBlue, fillColor: softBlue } },
      { content: matrix.totals.total.toString(), styles: { fontStyle: 'bold', halign: 'center', textColor: [255, 255, 255], fillColor: appBlue } }
    ]);

    autoTable(doc, {
      startY: 60,
      head: head as any,
      body: body as any,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 5,
        lineColor: [226, 232, 240], // Borde slate-200
        lineWidth: 0.1,
        font: "helvetica"
      },
      alternateRowStyles: {
        fillColor: lightBlue
      },
      headStyles: {
        lineWidth: 0, // Sin bordes entre celtas en header principal 
      }
    });

    // ============================================
    // FOOTER PROFESIONAL Y CÓDIGO QR SIMULADO
    // ============================================
    const startYFooter = (doc as any).lastAutoTable.finalY + 15 > 230 ? 230 : (doc as any).lastAutoTable.finalY + 25;
    
    // Linea divisoria fina
    doc.setDrawColor(226, 232, 240);
    doc.line(14, startYFooter, 202, startYFooter);

    // QR Mock (Matriz de cuadritos 8x8)
    doc.setFillColor(textDark[0], textDark[1], textDark[2]);
    let qrX = 14;
    let qrY = startYFooter + 6;
    for (let r=0; r<8; r++) {
      for (let c=0; c<8; c++) {
        if (Math.random() > 0.4 || (r<2&&c<2) || (r>5&&c<2) || (r<2&&c>5)) {
          doc.rect(qrX + (c*1.5), qrY + (r*1.5), 1.5, 1.5, 'F');
        }
      }
    }

    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.setFont("helvetica", "bold");
    doc.text("FORMATO VALIDADO", 30, qrY + 3);
    doc.setFont("helvetica", "normal");
    doc.text("Este documento fue procesado mediante algoritmos automatizados.", 30, qrY + 6);
    doc.text(`ID Validación: TIZADATOS-${Math.random().toString(36).substring(2,8).toUpperCase()}-${new Date().getTime().toString().slice(-4)}`, 30, qrY + 9);

    // Generado por
    doc.setFont("helvetica", "bold");
    doc.text("Generado automáticamente por Tiza & Datos", 202, qrY + 5, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text("Plataforma Integral de Gestión Educativa", 202, qrY + 8, { align: "right" });

    // Exportar
    const fileName = `911_Tiza_Datos_${schoolYear}.pdf`;
    const pdfOutput = doc.output('datauristring');
    const base64Data = pdfOutput.split(',')[1];
    
    hardwareServices.shareBase64File(base64Data, fileName).then(wasNativeShared => {
      if (!wasNativeShared) {
        doc.save(fileName); 
      }
    });
  }
};
