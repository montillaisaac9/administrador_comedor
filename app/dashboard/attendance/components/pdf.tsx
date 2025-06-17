import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IAttendance } from '@/app/types/attendance';

interface AttendanceReport {
  title: string;
  date: string;
  dishName?: string;
  attendances: IAttendance[];
}

export const exportAttendanceToPDF = (data: AttendanceReport) => {
  const doc = new jsPDF();

  // Add title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('REPORTE DE ASISTENCIA', 105, 20, { align: 'center' });

  // Add subtitle with date and meal info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Fecha: ${data.date}`, 14, 30);
  if (data.dishName) {
    doc.text(`Menú: ${data.dishName}`, 14, 38);
  }

  // Add table with attendance data
  autoTable(doc, {
    startY: 50,
    head: [['#', 'Nombre', 'Apellido', 'Cédula', 'Asistencia', 'Hora']],
    body: data.attendances.map((att, index) => [
      (index + 1).toString(),
      att.user?.name || 'N/A',
      att.user?.lastName || 'N/A',
      att.user?.identification || 'N/A',
      'Presente',
      att.attendedAt 
        ? new Date(att.attendedAt).toLocaleTimeString('es-ES') 
        : '--:--:--',
    ]),
    styles: {
      fontSize: 10,
      cellPadding: 3,
      overflow: 'linebreak',
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [22, 101, 52],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 50 },
  });

  // Add page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() - 20,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Save the PDF with a meaningful name
  const fileName = `asistencia_${data.date.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
