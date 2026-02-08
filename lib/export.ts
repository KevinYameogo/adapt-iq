import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
// import { saveAs } from 'file-saver'; // Not needed, using manual download

interface SlideExportData {
  index: number;
  text: string;
  tables: string[][][];
}

/**
 * Export to Excel (XLSX)
 */
export const exportToExcel = async (data: SlideExportData[]) => {
  const wb = XLSX.utils.book_new();
  const rows: any[] = [];

  data.forEach((slide) => {
    rows.push(["Slide " + slide.index]);
    rows.push(["Text Content:"]);
    rows.push([slide.text]);
    
    slide.tables.forEach((table, tIdx) => {
      rows.push(["Table " + (tIdx + 1)]);
      table.forEach((row) => {
        rows.push(row);
      });
      rows.push([]); // Spacer
    });
    rows.push(["---"]); // Spacer
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Presentation Summary");
  
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadFile(blob, "Presentation_Audit.xlsx");
};

/**
 * Export to PDF
 */
export const exportToPDF = async (data: SlideExportData[]) => {
  const doc = new jsPDF() as any;
  let currentY = 15;

  data.forEach((slide, sIdx) => {
    if (sIdx > 0) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text(`Slide ${slide.index}`, 14, currentY);
    currentY += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const splitText = doc.splitTextToSize(slide.text, 180);
    doc.text(splitText, 14, currentY);
    currentY += splitText.length * 5 + 5;

    slide.tables.forEach((table) => {
      if (!table || table.length === 0) return;
      
      if (currentY > 250) {
         doc.addPage();
         currentY = 15;
      }
      
      doc.autoTable({
        startY: currentY,
        head: [table[0]],
        body: table.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 },
        margin: { top: 10 },
      });
      currentY = doc.lastAutoTable.finalY + 10;
    });
  });

  doc.save("Presentation_Audit.pdf");
};

/**
 * Export to Word (DOCX)
 */
export const exportToWord = async (data: SlideExportData[]) => {
  const sections = data.map((slide) => {
    const children: any[] = [
      new Paragraph({
        text: `Slide ${slide.index}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: slide.text,
            size: 24,
          }),
        ],
        spacing: { after: 400 },
      }),
    ];

    slide.tables.forEach((tableData) => {
      const rows = tableData.map((rowData) => {
        return new TableRow({
          children: rowData.map((cellText) => {
            return new TableCell({
              children: [new Paragraph({ text: cellText, spacing: { before: 100, after: 100 } })],
              width: { size: 100 / rowData.length, type: WidthType.PERCENTAGE },
            });
          }),
        });
      });

      children.push(
        new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          // Removed invalid spacing property
        })
      );
    });

    return {
      properties: {},
      children,
    };
  });

  const doc = new Document({
    sections,
  });

  const blob = await Packer.toBlob(doc);
  downloadFile(blob, "Presentation_Audit.docx");
};

/**
 * Helper to download file in browser context
 */
function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
