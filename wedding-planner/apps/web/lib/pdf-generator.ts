import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateSeatingPDF = (weddingName: string, tables: any[], unseatedGuests: any[]) => {
  const doc = new jsPDF();

  doc.text(`Seating Plan: ${weddingName}`, 14, 20);
  doc.text(`Total Guests: ${tables.reduce((acc, t) => acc + t.guests.length, 0)} seated`, 14, 30);

  let currentY = 40;

  tables.forEach(table => {
    doc.text(`${table.tableName} (${table.guests.length}/${table.capacity})`, 14, currentY);

    const tableData = table.guests.map((g: any) => [
      g.fullName,
      g.side.toUpperCase(),
      g.mealPreference || '-'
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Guest Name', 'Side', 'Meal']],
      body: tableData,
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
  });

  if (unseatedGuests.length > 0) {
    doc.text(`Unseated Guests (${unseatedGuests.length})`, 14, currentY);
    const unseatedData = unseatedGuests.map((g: any) => [g.fullName, g.side, g.rsvpStatus]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Guest Name', 'Side', 'Status']],
      body: unseatedData,
    });
  }

  doc.save('seating-chart.pdf');
};
