import { DailyRecord, MonthSummary, DetailPendingItem, DetailLkpbItem } from '../types';

export type ExportTheme = 'standard' | 'neo';
export type ExportFormat = 'xlsx' | 'ods' | 'pdf' | 'ppt' | 'odp';

export interface ExportTableData {
  title: string;
  subtitle?: string;
  poolName?: string;
  periodName: string;
  headers: string[];
  rows: (string | number)[][];
  summaryCards?: { label: string; value: string | number; note?: string }[];
}

/**
 * 1. Export to Excel (.xlsx) using SheetJS (dynamically imported for performance)
 */
export async function exportToXLSX(data: ExportTableData, filename: string): Promise<void> {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  // Create header & meta rows
  const metaRows: (string | number)[][] = [
    [data.title.toUpperCase()],
    [`Pool: ${data.poolName || 'Pool Singkawang'} | Periode: ${data.periodName}`],
    [],
  ];

  if (data.summaryCards && data.summaryCards.length > 0) {
    metaRows.push(['RINGKASAN METRIK:']);
    data.summaryCards.forEach((c) => {
      metaRows.push([c.label, c.value, c.note || '']);
    });
    metaRows.push([]);
  }

  // Combine with table
  const sheetContent = [...metaRows, data.headers, ...data.rows];
  const ws = XLSX.utils.aoa_to_sheet(sheetContent);

  // Set column widths
  const colWidths = data.headers.map((h, i) => {
    let maxLen = h.length;
    data.rows.forEach((r) => {
      const val = String(r[i] ?? '');
      if (val.length > maxLen) maxLen = val.length;
    });
    return { wch: Math.min(30, Math.max(10, maxLen + 2)) };
  });
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
  XLSX.writeFile(wb, `${filename}.xlsx`, { bookType: 'xlsx' });
}

/**
 * 2. Export to OpenDocument Spreadsheet (.ods) using SheetJS (dynamically imported)
 */
export async function exportToODS(data: ExportTableData, filename: string): Promise<void> {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  const metaRows: (string | number)[][] = [
    [data.title.toUpperCase()],
    [`Pool: ${data.poolName || 'Pool Singkawang'} | Periode: ${data.periodName}`],
    [],
  ];

  if (data.summaryCards && data.summaryCards.length > 0) {
    metaRows.push(['RINGKASAN METRIK:']);
    data.summaryCards.forEach((c) => {
      metaRows.push([c.label, c.value, c.note || '']);
    });
    metaRows.push([]);
  }

  const sheetContent = [...metaRows, data.headers, ...data.rows];
  const ws = XLSX.utils.aoa_to_sheet(sheetContent);

  XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
  XLSX.writeFile(wb, `${filename}.ods`, { bookType: 'ods' });
}

/**
 * 3. Export to PDF (.pdf) with Standard or Neo-Brutalism theme (dynamically imported)
 */
export async function exportToPDF(data: ExportTableData, filename: string, theme: ExportTheme): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = (autoTableModule.default || autoTableModule) as any;

  const isLandscape = data.headers.length > 7;
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  if (theme === 'standard') {
    // ----------------------------------------------------
    // FORMAT STANDAR (Gradient Biru-Putih Korporat)
    // ----------------------------------------------------
    // Blue Gradient Banner Simulation
    doc.setFillColor(30, 64, 175); // Deep Blue #1e40af
    doc.rect(0, 0, pageWidth, 54, 'F');
    doc.setFillColor(37, 99, 235); // Accent Blue
    doc.rect(0, 54, pageWidth, 4, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(data.title.toUpperCase(), 36, 32);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(224, 242, 254);
    doc.text(
      `Pool: ${data.poolName || 'Pool Singkawang'}  |  Periode: ${data.periodName}  |  Dibuat: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      36,
      46
    );

    let startY = 74;

    // Summary Metric Cards (Standard rounded soft blue)
    if (data.summaryCards && data.summaryCards.length > 0) {
      const cardCount = Math.min(4, data.summaryCards.length);
      const cardGap = 12;
      const totalGap = (cardCount - 1) * cardGap;
      const cardWidth = (pageWidth - 72 - totalGap) / cardCount;
      const cardHeight = 44;

      data.summaryCards.slice(0, 4).forEach((card, idx) => {
        const x = 36 + idx * (cardWidth + cardGap);
        // Soft blue background
        doc.setFillColor(240, 249, 255);
        doc.setDrawColor(191, 219, 254);
        doc.roundedRect(x, startY, cardWidth, cardHeight, 4, 4, 'FD');

        // Card Label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 64, 175);
        doc.text(card.label.toUpperCase(), x + 8, startY + 14);

        // Card Value
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text(String(card.value), x + 8, startY + 31);

        // Card Note
        if (card.note) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(100, 116, 139);
          doc.text(card.note, x + 8, startY + 40);
        }
      });

      startY += cardHeight + 16;
    }

    // Table with standard corporate styling
    autoTable(doc, {
      head: [data.headers],
      body: data.rows.map((row) => row.map((cell) => String(cell))),
      startY: startY,
      margin: { left: 36, right: 36 },
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
        cellPadding: 5,
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [15, 23, 42],
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      styles: {
        lineColor: [226, 232, 240],
        lineWidth: 0.5,
        overflow: 'linebreak',
      },
      didDrawPage: (dataArg) => {
        // Footer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        const footerText = `Dokumen Resmi Pool Singkawang - Halaman ${dataArg.pageNumber}`;
        doc.text(footerText, pageWidth - 36, pageHeight - 16, { align: 'right' });
      },
    });
  } else {
    // ----------------------------------------------------
    // FORMAT NEO BRUTALISM (Identik Tema Web)
    // ----------------------------------------------------
    // Heavy Black Header Box with Yellow Stamp
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(36, 24, pageWidth - 72, 48, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(2);
    doc.rect(36, 24, pageWidth - 72, 48, 'D');

    // Accent Yellow Stamp
    doc.setFillColor(254, 240, 138); // Yellow 200
    doc.rect(48, 32, 100, 14, 'F');
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(1);
    doc.rect(48, 32, 100, 14, 'D');

    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('NEO-BRUTALISM DOC', 52, 42);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(data.title.toUpperCase(), 160, 42);

    // Subtitle
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text(
      `POOL: ${data.poolName || 'SINGKAWANG'}  |  PERIODE: ${data.periodName.toUpperCase()}  |  DATE: ${new Date().toISOString().slice(0, 10)}`,
      48,
      62
    );

    let startY = 84;

    // Neo Brutalist Summary Cards (Heavy borders + Block Shadow)
    if (data.summaryCards && data.summaryCards.length > 0) {
      const cardCount = Math.min(4, data.summaryCards.length);
      const cardGap = 14;
      const totalGap = (cardCount - 1) * cardGap;
      const cardWidth = (pageWidth - 72 - totalGap) / cardCount;
      const cardHeight = 46;

      const cardColors = [
        [254, 240, 138], // Yellow #fef08a
        [165, 243, 252], // Cyan #a5f3fc
        [187, 247, 208], // Emerald #bbf7d0
        [224, 231, 255], // Indigo #e0e7ff
      ];

      data.summaryCards.slice(0, 4).forEach((card, idx) => {
        const x = 36 + idx * (cardWidth + cardGap);
        const bg = cardColors[idx % cardColors.length];

        // Hard Drop Shadow
        doc.setFillColor(15, 23, 42);
        doc.rect(x + 2, startY + 2, cardWidth, cardHeight, 'F');

        // Card Face
        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.rect(x, startY, cardWidth, cardHeight, 'F');
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(1.5);
        doc.rect(x, startY, cardWidth, cardHeight, 'D');

        // Card Label
        doc.setFont('courier', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42);
        doc.text(card.label.toUpperCase(), x + 6, startY + 14);

        // Card Value
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(String(card.value), x + 6, startY + 31);

        if (card.note) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(51, 65, 85);
          doc.text(card.note, x + 6, startY + 41);
        }
      });

      startY += cardHeight + 20;
    }

    // Neo Brutalist Table (High-contrast, bold lines, yellow/cyan headers)
    autoTable(doc, {
      head: [data.headers],
      body: data.rows.map((row) => row.map((cell) => String(cell))),
      startY: startY,
      margin: { left: 36, right: 36 },
      theme: 'plain',
      headStyles: {
        fillColor: [254, 240, 138], // Bright Yellow
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
        cellPadding: 5,
        lineColor: [15, 23, 42],
        lineWidth: 1.5,
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [15, 23, 42],
        cellPadding: 4,
        lineColor: [15, 23, 42],
        lineWidth: 0.75,
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
      },
      didDrawPage: (dataArg) => {
        // Neo Brutalist Footer
        doc.setFont('courier', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        const footerText = `[POOL SINGKAWANG DASHBOARD]  ::  PAGE ${dataArg.pageNumber}`;
        doc.text(footerText, pageWidth - 36, pageHeight - 16, { align: 'right' });
      },
    });
  }

  doc.save(`${filename}.pdf`);
}

/**
 * 4. Export to PowerPoint (.ppt / .pptx) with Standard or Neo-Brutalism theme (dynamically imported)
 */
export async function exportToPPT(
  data: ExportTableData,
  filename: string,
  theme: ExportTheme
): Promise<void> {
  const pptxgenModule = await import('pptxgenjs');
  const PptxGen = (pptxgenModule.default || pptxgenModule) as any;
  const pptx = new PptxGen();
  pptx.layout = 'LAYOUT_16x9';

  if (theme === 'standard') {
    // ----------------------------------------------------
    // FORMAT STANDAR (Gradient Biru-Putih Korporat)
    // ----------------------------------------------------
    // Slide 1: Cover Slide
    const slide1 = pptx.addSlide();
    slide1.background = { color: '1E3A8A' }; // Deep Blue

    slide1.addText(data.title.toUpperCase(), {
      x: 0.8,
      y: 2.2,
      w: 8.5,
      h: 1.2,
      fontSize: 28,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial',
    });

    slide1.addText(`Pool: ${data.poolName || 'Pool Singkawang'} | Periode: ${data.periodName}`, {
      x: 0.8,
      y: 3.5,
      w: 8.5,
      h: 0.6,
      fontSize: 14,
      color: '93C5FD',
      fontFace: 'Arial',
    });

    slide1.addText(
      `Tanggal Unduh: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      {
        x: 0.8,
        y: 4.2,
        w: 8.5,
        h: 0.5,
        fontSize: 11,
        color: 'DBEAFE',
        fontFace: 'Arial',
      }
    );

    // Slide 2: Data & Summary
    const slide2 = pptx.addSlide();
    slide2.background = { color: 'F8FAFC' };

    // Header banner
    slide2.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.9,
      fill: { color: '1E40AF' },
    });

    slide2.addText(data.title.toUpperCase(), {
      x: 0.6,
      y: 0.15,
      w: 8.0,
      h: 0.6,
      fontSize: 18,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial',
    });

    // Summary Cards
    if (data.summaryCards && data.summaryCards.length > 0) {
      const cardWidth = 2.1;
      const cardHeight = 0.85;
      data.summaryCards.slice(0, 4).forEach((card, idx) => {
        const x = 0.6 + idx * 2.3;
        slide2.addShape(pptx.ShapeType.roundRect, {
          x,
          y: 1.1,
          w: cardWidth,
          h: cardHeight,
          fill: { color: 'EFF6FF' },
          line: { color: '93C5FD', width: 1 },
          rectRadius: 0.08,
        });

        slide2.addText(card.label.toUpperCase(), {
          x: x + 0.1,
          y: 1.15,
          w: cardWidth - 0.2,
          h: 0.25,
          fontSize: 8.5,
          bold: true,
          color: '1E40AF',
          fontFace: 'Arial',
        });

        slide2.addText(String(card.value), {
          x: x + 0.1,
          y: 1.4,
          w: cardWidth - 0.2,
          h: 0.45,
          fontSize: 16,
          bold: true,
          color: '0F172A',
          fontFace: 'Arial',
        });
      });
    }

    // Table rows (Limit 15 for readable presentation slide)
    const tableRows = [
      data.headers.map((h) => ({
        text: h,
        options: {
          bold: true,
          fill: { color: '2563EB' },
          color: 'FFFFFF',
          fontSize: 8.5,
          align: 'center' as const,
        },
      })),
      ...data.rows.slice(0, 14).map((row, rIdx) =>
        row.map((cell) => ({
          text: String(cell),
          options: {
            fontSize: 7.5,
            fill: { color: rIdx % 2 === 0 ? 'FFFFFF' : 'F1F5F9' },
            color: '0F172A',
            align: 'center' as const,
          },
        }))
      ),
    ];

    slide2.addTable(tableRows, {
      x: 0.6,
      y: 2.15,
      w: 8.8,
      colW: data.headers.map(() => 8.8 / data.headers.length),
      border: { color: 'CBD5E1', pt: 0.5 },
    });
  } else {
    // ----------------------------------------------------
    // FORMAT NEO BRUTALISM (Identik Tema Web)
    // ----------------------------------------------------
    // Slide 1: Cover Slide
    const slide1 = pptx.addSlide();
    slide1.background = { color: 'F1F5F9' }; // Off white

    // Neo Card Shadow
    slide1.addShape(pptx.ShapeType.rect, {
      x: 0.9,
      y: 1.6,
      w: 8.2,
      h: 4.0,
      fill: { color: '0F172A' },
    });

    // Neo Card Body
    slide1.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.5,
      w: 8.2,
      h: 4.0,
      fill: { color: 'FFFFFF' },
      line: { color: '0F172A', width: 3 },
    });

    // Yellow Stamp Badge
    slide1.addShape(pptx.ShapeType.rect, {
      x: 1.2,
      y: 1.9,
      w: 2.8,
      h: 0.45,
      fill: { color: 'FEF08A' },
      line: { color: '0F172A', width: 1.5 },
    });

    slide1.addText('NEO-BRUTALISM PRESENTATION', {
      x: 1.25,
      y: 1.95,
      w: 2.7,
      h: 0.35,
      fontSize: 9,
      bold: true,
      color: '0F172A',
      fontFace: 'Courier New',
    });

    // Title
    slide1.addText(data.title.toUpperCase(), {
      x: 1.2,
      y: 2.6,
      w: 7.4,
      h: 1.4,
      fontSize: 28,
      bold: true,
      color: '0F172A',
      fontFace: 'Arial Black',
    });

    slide1.addText(`POOL: ${data.poolName || 'SINGKAWANG'}  |  PERIODE: ${data.periodName.toUpperCase()}`, {
      x: 1.2,
      y: 4.2,
      w: 7.4,
      h: 0.5,
      fontSize: 13,
      bold: true,
      color: '2563EB',
      fontFace: 'Courier New',
    });

    // Slide 2: Data & Neo Cards
    const slide2 = pptx.addSlide();
    slide2.background = { color: 'F8FAFC' };

    // Top Header Banner
    slide2.addShape(pptx.ShapeType.rect, {
      x: 0.6,
      y: 0.4,
      w: 8.8,
      h: 0.8,
      fill: { color: '0F172A' },
      line: { color: '0F172A', width: 2 },
    });

    slide2.addText(data.title.toUpperCase(), {
      x: 0.8,
      y: 0.5,
      w: 8.4,
      h: 0.5,
      fontSize: 16,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial Black',
    });

    // Neo Brutalist Summary Cards (Yellow, Cyan, Emerald)
    if (data.summaryCards && data.summaryCards.length > 0) {
      const cardColors = ['FEF08A', 'A5F3FC', 'BBF7D0', 'E0E7FF'];
      const cardWidth = 2.1;
      const cardHeight = 0.9;

      data.summaryCards.slice(0, 4).forEach((card, idx) => {
        const x = 0.6 + idx * 2.25;
        // Shadow
        slide2.addShape(pptx.ShapeType.rect, {
          x: x + 0.05,
          y: 1.35,
          w: cardWidth,
          h: cardHeight,
          fill: { color: '0F172A' },
        });

        // Face
        slide2.addShape(pptx.ShapeType.rect, {
          x,
          y: 1.3,
          w: cardWidth,
          h: cardHeight,
          fill: { color: cardColors[idx % cardColors.length] },
          line: { color: '0F172A', width: 2 },
        });

        slide2.addText(card.label.toUpperCase(), {
          x: x + 0.1,
          y: 1.35,
          w: cardWidth - 0.2,
          h: 0.25,
          fontSize: 8,
          bold: true,
          color: '0F172A',
          fontFace: 'Courier New',
        });

        slide2.addText(String(card.value), {
          x: x + 0.1,
          y: 1.6,
          w: cardWidth - 0.2,
          h: 0.45,
          fontSize: 16,
          bold: true,
          color: '0F172A',
          fontFace: 'Arial Black',
        });
      });
    }

    // Neo Brutalist Table
    const tableRows = [
      data.headers.map((h) => ({
        text: h,
        options: {
          bold: true,
          fill: { color: 'FEF08A' },
          color: '0F172A',
          fontSize: 8.5,
          align: 'center' as const,
        },
      })),
      ...data.rows.slice(0, 14).map((row, rIdx) =>
        row.map((cell) => ({
          text: String(cell),
          options: {
            fontSize: 7.5,
            fill: { color: rIdx % 2 === 0 ? 'FFFFFF' : 'F1F5F9' },
            color: '0F172A',
            align: 'center' as const,
          },
        }))
      ),
    ];

    slide2.addTable(tableRows, {
      x: 0.6,
      y: 2.35,
      w: 8.8,
      colW: data.headers.map(() => 8.8 / data.headers.length),
      border: { color: '0F172A', pt: 1.5 },
    });
  }

  await pptx.writeFile({ fileName: `${filename}.pptx` });
}

/**
 * 5. Export to OpenDocument Presentation (.odp)
 * Generates a fully standards-compliant OpenDocument Presentation archive
 * with widescreen 16:9 layout, master styles, styled KPI cards, and cleanly paginated tables.
 */
export async function exportToODP(
  data: ExportTableData,
  filename: string,
  theme: ExportTheme
): Promise<void> {
  const jszipModule = await import('jszip');
  const JSZip = (jszipModule.default || jszipModule) as any;
  const zip = new JSZip();

  // 1. mimetype (MUST be first and uncompressed STORE)
  zip.file('mimetype', 'application/vnd.oasis.opendocument.presentation', {
    compression: 'STORE',
  });

  // 2. META-INF/manifest.xml
  const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.presentation"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;
  zip.file('META-INF/manifest.xml', manifestXml);

  // 3. meta.xml
  const metaXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" office:version="1.2">
  <office:meta>
    <dc:title>${escapeXml(data.title)}</dc:title>
    <dc:creator>Pool Singkawang Dashboard</dc:creator>
    <dc:date>${new Date().toISOString()}</dc:date>
  </office:meta>
</office:document-meta>`;
  zip.file('meta.xml', metaXml);

  // 4. styles.xml: Define 16:9 Widescreen slide page dimensions (28cm x 15.75cm) and master styles
  const stylesXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
  xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:presentation="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0"
  xmlns:smil="urn:oasis:names:tc:opendocument:xmlns:smil-compatible:1.0"
  xmlns:anim="urn:oasis:names:tc:opendocument:xmlns:animation:1.0"
  xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" office:version="1.2">
  <office:styles>
    <style:default-style style:family="graphic">
      <style:graphic-properties draw:fill="none" draw:stroke="none"/>
    </style:default-style>
  </office:styles>
  <office:automatic-styles>
    <style:page-layout style:name="PM1">
      <style:page-layout-properties fo:page-width="28cm" fo:page-height="15.75cm" fo:margin-top="0cm" fo:margin-bottom="0cm" fo:margin-left="0cm" fo:margin-right="0cm" style:print-orientation="landscape"/>
    </style:page-layout>
  </office:automatic-styles>
  <office:master-styles>
    <style:master-page style:name="Default" style:page-layout-name="PM1"/>
  </office:master-styles>
</office:document-styles>`;
  zip.file('styles.xml', stylesXml);

  // 5. content.xml: Build presentation slides
  const isNeo = theme === 'neo';
  const pageBgColor = isNeo ? '#eff5ff' : '#f8fafc';
  const bannerBgColor = isNeo ? '#0f172a' : '#1e40af';
  const bannerTextColor = '#ffffff';
  const thBgColor = isNeo ? '#fef08a' : '#2563eb';
  const thTextColor = isNeo ? '#0f172a' : '#ffffff';
  const tableBorderColor = isNeo ? '#0f172a' : '#cbd5e1';
  const cardBorderColor = isNeo ? '#0f172a' : '#93c5fd';

  // Calculate table column width
  const totalTableWidthCm = 26;
  const colCount = Math.max(1, data.headers.length);
  const colWidthCm = (totalTableWidthCm / colCount).toFixed(2);

  // Paginate table rows: max 15 rows per slide for clean readability
  const rowsPerSlide = 15;
  const tableChunks: (string | number)[][][] = [];
  if (data.rows.length === 0) {
    tableChunks.push([]);
  } else {
    for (let i = 0; i < data.rows.length; i += rowsPerSlide) {
      tableChunks.push(data.rows.slice(i, i + rowsPerSlide));
    }
  }

  // Generate Slide 1: Cover & KPI Summary
  const cardColorsNeo = ['#fef08a', '#a5f3fc', '#bbf7d0', '#fed7aa'];
  const cardColorsStd = ['#eff6ff', '#eff6ff', '#eff6ff', '#eff6ff'];
  const activeCardColors = isNeo ? cardColorsNeo : cardColorsStd;

  let slide1SummaryCardsXml = '';
  if (data.summaryCards && data.summaryCards.length > 0) {
    const cardsToDisplay = data.summaryCards.slice(0, 4);
    const cardCount = cardsToDisplay.length;
    const cardGapCm = 0.5;
    const totalGap = (cardCount - 1) * cardGapCm;
    const cardWidthCm = ((26 - totalGap) / cardCount).toFixed(2);

    slide1SummaryCardsXml = cardsToDisplay
      .map((card, idx) => {
        const xPos = (1 + idx * (parseFloat(cardWidthCm) + cardGapCm)).toFixed(2);
        const cardBg = activeCardColors[idx % activeCardColors.length];
        return `
        <!-- Card Frame ${idx + 1} -->
        <draw:frame draw:name="CardFrame_${idx}" draw:style-name="Card_GStyle_${idx}" svg:x="${xPos}cm" svg:y="4.5cm" svg:width="${cardWidthCm}cm" svg:height="3.3cm">
          <draw:text-box>
            <text:p text:style-name="Card_Label_P">${escapeXml(card.label.toUpperCase())}</text:p>
            <text:p text:style-name="Card_Value_P">${escapeXml(String(card.value))}</text:p>
            ${card.note ? `<text:p text:style-name="Card_Note_P">${escapeXml(card.note)}</text:p>` : ''}
          </draw:text-box>
        </draw:frame>`;
      })
      .join('\n');
  }

  // Slide 1: Overview digest frame
  const visualFormatDesc = isNeo
    ? 'Neo Brutalism (Tampilan Warna dan Border Tegas Web)'
    : 'Standar Formal (Biru-Putih Gradien Korporat)';

  const overviewDigestXml = `
    <draw:frame draw:name="DigestFrame" draw:style-name="Digest_GStyle" svg:x="1cm" svg:y="8.4cm" svg:width="26cm" svg:height="6.2cm">
      <draw:text-box>
        <text:p text:style-name="Digest_Title_P">IKHTISAR LAPORAN OPERASIONAL</text:p>
        <text:p text:style-name="Digest_Body_P">- Pool Unit: ${escapeXml(data.poolName || 'Pool Singkawang')}</text:p>
        <text:p text:style-name="Digest_Body_P">- Periode Laporan: ${escapeXml(data.periodName)}</text:p>
        <text:p text:style-name="Digest_Body_P">- Total Baris Data: ${data.rows.length} catatan operasional</text:p>
        <text:p text:style-name="Digest_Body_P">- Format Visual: ${escapeXml(visualFormatDesc)}</text:p>
        <text:p text:style-name="Digest_Foot_P">Silakan lihat Slide 2 dan seterusnya untuk tabel data operasional lengkap.</text:p>
      </draw:text-box>
    </draw:frame>`;

  // Generate Table Slides (Slide 2, Slide 3, etc.)
  const tableSlidesXml = tableChunks
    .map((chunkRows, chunkIdx) => {
      const slideNum = chunkIdx + 2;
      const startRowIdx = chunkIdx * rowsPerSlide + 1;
      const endRowIdx = startRowIdx + chunkRows.length - 1;

      const rowsXml = chunkRows
        .map((row, rIdx) => {
          const isEven = rIdx % 2 === 0;
          const cellStyleName = isEven ? 'TD_Cell_Even' : 'TD_Cell_Odd';
          return `
          <table:table-row>
            ${row
              .map(
                (cell) => `
              <table:table-cell table:style-name="${cellStyleName}">
                <text:p text:style-name="TD_Text_P">${escapeXml(cell)}</text:p>
              </table:table-cell>`
              )
              .join('')}
          </table:table-row>`;
        })
        .join('');

      return `
      <!-- SLIDE ${slideNum}: DATA TABLE (Baris ${startRowIdx} - ${endRowIdx}) -->
      <draw:page draw:name="Slide_${slideNum}" draw:style-name="Page_Style" draw:master-page-name="Default">
        <!-- Top Title Bar -->
        <draw:frame draw:name="TableTitle_${slideNum}" draw:style-name="Banner_GStyle" svg:x="1cm" svg:y="0.8cm" svg:width="26cm" svg:height="1.5cm">
          <draw:text-box>
            <text:p text:style-name="Banner_Title_P">${escapeXml(data.title.toUpperCase())}</text:p>
            <text:p text:style-name="Banner_Sub_P">Periode: ${escapeXml(data.periodName)} | Tabel Data (Baris ${startRowIdx} - ${endRowIdx} dari ${data.rows.length})</text:p>
          </draw:text-box>
        </draw:frame>

        <!-- Structured Table with defined columns & cells -->
        <draw:frame draw:name="TableFrame_${slideNum}" draw:style-name="Table_Frame_GStyle" svg:x="1cm" svg:y="2.6cm" svg:width="26cm" svg:height="12.2cm">
          <table:table table:name="DataTable_${slideNum}">
            <table:table-column table:style-name="Col_Style" table:number-columns-repeated="${colCount}"/>
            <table:table-row>
              ${data.headers
                .map(
                  (h) => `
              <table:table-cell table:style-name="TH_Cell_Style">
                <text:p text:style-name="TH_Text_P">${escapeXml(h)}</text:p>
              </table:table-cell>`
                )
                .join('')}
            </table:table-row>
            ${rowsXml}
          </table:table>
        </draw:frame>
      </draw:page>`;
    })
    .join('\n');

  // Automatic Styles for content.xml
  const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
  xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"
  xmlns:presentation="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0"
  xmlns:smil="urn:oasis:names:tc:opendocument:xmlns:smil-compatible:1.0"
  xmlns:anim="urn:oasis:names:tc:opendocument:xmlns:animation:1.0"
  xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" office:version="1.2">
  <office:automatic-styles>
    <!-- Slide Drawing Page Style -->
    <style:style style:name="Page_Style" style:family="drawing-page">
      <style:drawing-page-properties draw:background-size="border" draw:fill="solid" draw:fill-color="${pageBgColor}"/>
    </style:style>

    <!-- Top Banner Graphic Style -->
    <style:style style:name="Banner_GStyle" style:family="graphic">
      <style:graphic-properties draw:fill="solid" draw:fill-color="${bannerBgColor}" draw:stroke="solid" svg:stroke-color="${isNeo ? '#0f172a' : '#1e3a8a'}" svg:stroke-width="${isNeo ? '2pt' : '0.5pt'}"/>
    </style:style>

    <!-- Table Frame Graphic Style -->
    <style:style style:name="Table_Frame_GStyle" style:family="graphic">
      <style:graphic-properties draw:fill="none" draw:stroke="none"/>
    </style:style>

    <!-- KPI Card Graphic Styles -->
    ${activeCardColors
      .map(
        (bg, idx) => `
    <style:style style:name="Card_GStyle_${idx}" style:family="graphic">
      <style:graphic-properties draw:fill="solid" draw:fill-color="${bg}" draw:stroke="solid" svg:stroke-color="${cardBorderColor}" svg:stroke-width="${isNeo ? '2pt' : '1pt'}"/>
    </style:style>`
      )
      .join('')}

    <!-- Digest Box Graphic Style -->
    <style:style style:name="Digest_GStyle" style:family="graphic">
      <style:graphic-properties draw:fill="solid" draw:fill-color="#ffffff" draw:stroke="solid" svg:stroke-color="${isNeo ? '#0f172a' : '#cbd5e1'}" svg:stroke-width="${isNeo ? '2pt' : '1pt'}"/>
    </style:style>

    <!-- Table Column Width Style -->
    <style:style style:name="Col_Style" style:family="table-column">
      <style:table-column-properties style:column-width="${colWidthCm}cm"/>
    </style:style>

    <!-- Table Cell Styles -->
    <style:style style:name="TH_Cell_Style" style:family="table-cell">
      <style:table-cell-properties fo:background-color="${thBgColor}" fo:border="1pt solid ${tableBorderColor}" fo:padding-top="1.5mm" fo:padding-bottom="1.5mm" fo:padding-left="1mm" fo:padding-right="1mm" style:vertical-align="middle"/>
    </style:style>
    <style:style style:name="TD_Cell_Even" style:family="table-cell">
      <style:table-cell-properties fo:background-color="#ffffff" fo:border="0.5pt solid ${tableBorderColor}" fo:padding-top="1mm" fo:padding-bottom="1mm" fo:padding-left="1mm" fo:padding-right="1mm" style:vertical-align="middle"/>
    </style:style>
    <style:style style:name="TD_Cell_Odd" style:family="table-cell">
      <style:table-cell-properties fo:background-color="${isNeo ? '#f8fafc' : '#f1f5f9'}" fo:border="0.5pt solid ${tableBorderColor}" fo:padding-top="1mm" fo:padding-bottom="1mm" fo:padding-left="1mm" fo:padding-right="1mm" style:vertical-align="middle"/>
    </style:style>

    <!-- Typography Styles -->
    <style:style style:name="Banner_Title_P" style:family="paragraph">
      <style:paragraph-properties fo:text-align="left" fo:margin-top="0cm" fo:margin-bottom="0cm"/>
      <style:text-properties fo:font-size="14pt" fo:font-weight="bold" fo:color="${bannerTextColor}" style:font-name="Arial"/>
    </style:style>
    <style:style style:name="Banner_Sub_P" style:family="paragraph">
      <style:paragraph-properties fo:text-align="left" fo:margin-top="0cm" fo:margin-bottom="0cm"/>
      <style:text-properties fo:font-size="9pt" fo:font-weight="normal" fo:color="${isNeo ? '#93c5fd' : '#bfdbfe'}" style:font-name="Arial"/>
    </style:style>
    <style:style style:name="Card_Label_P" style:family="paragraph">
      <style:paragraph-properties fo:text-align="left" fo:margin-top="0cm" fo:margin-bottom="0cm"/>
      <style:text-properties fo:font-size="8.5pt" fo:font-weight="bold" fo:color="#0f172a" style:font-name="Arial"/>
    </style:style>
    <style:style style:name="Card_Value_P" style:family="paragraph">
      <style:paragraph-properties fo:text-align="left" fo:margin-top="0.1cm" fo:margin-bottom="0cm"/>
      <style:text-properties fo:font-size="20pt" fo:font-weight="bold" fo:color="#0f172a" style:font-name="Arial Black"/>
    </style:style>
    <style:style style:name="Card_Note_P" style:family="paragraph">
      <style:paragraph-properties fo:text-align="left" fo:margin-top="0.1cm" fo:margin-bottom="0cm"/>
      <style:text-properties fo:font-size="7.5pt" fo:color="#475569" style:font-name="Arial"/>
    </style:style>
    <style:style style:name="Digest_Title_P" style:family="paragraph">
      <style:paragraph-properties fo:text-align="left" fo:margin-top="0cm" fo:margin-bottom="0.2cm"/>
      <style:text-properties fo:font-size="12pt" fo:font-weight="bold" fo:color="#0f172a" style:font-name="Arial"/>
    </style:style>
    <style:style style:name="Digest_Body_P" style:family="paragraph">
      <style:paragraph-properties fo:text-align="left" fo:margin-top="0cm" fo:margin-bottom="0.15cm"/>
      <style:text-properties fo:font-size="10pt" fo:color="#334155" style:font-name="Arial"/>
    </style:style>
    <style:style style:name="Digest_Foot_P" style:family="paragraph">
      <style:paragraph-properties fo:text-align="left" fo:margin-top="0.3cm" fo:margin-bottom="0cm"/>
      <style:text-properties fo:font-size="9pt" fo:font-weight="bold" fo:color="${isNeo ? '#2563eb' : '#1e40af'}" style:font-name="Arial"/>
    </style:style>
    <style:style style:name="TH_Text_P" style:family="paragraph">
      <style:paragraph-properties fo:text-align="center" fo:margin-top="0cm" fo:margin-bottom="0cm"/>
      <style:text-properties fo:font-size="7.5pt" fo:font-weight="bold" fo:color="${thTextColor}" style:font-name="Arial"/>
    </style:style>
    <style:style style:name="TD_Text_P" style:family="paragraph">
      <style:paragraph-properties fo:text-align="center" fo:margin-top="0cm" fo:margin-bottom="0cm"/>
      <style:text-properties fo:font-size="7pt" fo:color="#0f172a" style:font-name="Arial"/>
    </style:style>
  </office:automatic-styles>
  <office:body>
    <office:presentation>
      <!-- SLIDE 1: COVER & EXECUTIVE SUMMARY -->
      <draw:page draw:name="Slide_1" draw:style-name="Page_Style" draw:master-page-name="Default">
        <!-- Top Banner -->
        <draw:frame draw:name="TitleBanner_1" draw:style-name="Banner_GStyle" svg:x="1cm" svg:y="1cm" svg:width="26cm" svg:height="2.8cm">
          <draw:text-box>
            <text:p text:style-name="Banner_Title_P">${escapeXml(data.title.toUpperCase())}</text:p>
            <text:p text:style-name="Banner_Sub_P">Unit: ${escapeXml(data.poolName || 'Pool Singkawang')}  |  Periode: ${escapeXml(data.periodName)}  |  Gaya Tema: ${isNeo ? 'Neo-Brutalism' : 'Standar Formal'}  |  Dibuat: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</text:p>
          </draw:text-box>
        </draw:frame>

        <!-- KPI Metric Cards -->
        ${slide1SummaryCardsXml}

        <!-- Overview Digest Box -->
        ${overviewDigestXml}
      </draw:page>

      <!-- SLIDES 2+: DETAILED PAGINATED TABLES -->
      ${tableSlidesXml}
    </office:presentation>
  </office:body>
</office:document-content>`;
  zip.file('content.xml', contentXml);

  // Generate and trigger download of .odp blob
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.odp`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string | number | null | undefined): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
