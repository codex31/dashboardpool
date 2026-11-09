import { ChartDataPoint, generateTrendJalurChartImage, generateClearanceChartImage } from '../utils/chartImageGenerator';
import { DailyRecord } from '../types';
import { getAccessToken, googleSignIn, clearAccessToken } from './googleAuthService';

export interface ComprehensiveReportData {
  title: string;
  poolName: string;
  periodName: string;
  rangeKey: string;
  records: DailyRecord[];
  chartData: ChartDataPoint[];
  summary: {
    avgJalur: number | string;
    avgBobot: number | string;
    avgBobotPerJalur: number | string;
    totalBobotMasuk: number;
    totalBobotFinish: number;
    clearanceRate: number;
    totalPending: number;
    pendingRate: number;
    totalCancel: number;
    cancelRate: number;
    totalTarget: number;
    totalRealisation: number;
    achievementRate: number;
    activeDays: number;
    narrativeText: string;
  };
}

/**
 * Builds a 16:9 Presentation containing Page 1 (Trend Jalur, Clearance Beban Kerja, and Narrative Summary)
 * and Page 2 (Detailed Data Table and Operational Insights).
 */
export async function createComprehensivePresentation(data: ComprehensiveReportData): Promise<any> {
  const pptxgenModule = await import('pptxgenjs');
  const PptxGen = (pptxgenModule.default || pptxgenModule) as any;
  const pptx = new PptxGen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Pool Singkawang';
  pptx.company = 'Service Solution Pool Singkawang';
  pptx.title = data.title;

  // Generate high-resolution chart images
  const trendChartImg = generateTrendJalurChartImage(data.chartData, 1200, 680);
  const clearanceChartImg = generateClearanceChartImage(data.chartData, 1200, 680);

  // =========================================================================
  // SLIDE 1: RANGKUMAN EKSEKUTIF, DUA CHART UTAMA, DAN KALIMAT RINGKASAN
  // =========================================================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: 'F8FAFC' };

  // Top Dark Header Banner
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 0.35,
    w: 9.0,
    h: 0.75,
    fill: { color: '0F172A' },
    line: { color: '0F172A', width: 1.5 },
  });

  slide1.addText(data.title.toUpperCase(), {
    x: 0.7,
    y: 0.42,
    w: 6.0,
    h: 0.35,
    fontSize: 14,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial Black',
  });

  slide1.addText(`UNIT: ${data.poolName.toUpperCase()}  |  PERIODE: ${data.periodName.toUpperCase()}`, {
    x: 0.7,
    y: 0.77,
    w: 8.5,
    h: 0.25,
    fontSize: 8.5,
    bold: true,
    color: '93C5FD',
    fontFace: 'Courier New',
  });

  // Top KPI Metric Cards Bar (5 Cards across 9.0 inches width)
  const kpiCards = [
    { label: 'AVG JALUR / HARI', val: `${data.summary.avgJalur} Jalur`, bg: 'FEF08A' },
    { label: 'AVG BOBOT / HARI', val: `${data.summary.avgBobot}`, bg: 'A5F3FC' },
    { label: 'CLEARANCE BOBOT', val: `${data.summary.clearanceRate}%`, bg: 'BBF7D0' },
    { label: 'PENDING / CANCEL', val: `${data.summary.totalPending} / ${data.summary.totalCancel} DO`, bg: 'FED7AA' },
    { label: 'ACHIEVEMENT TARGET', val: `${data.summary.achievementRate}% (${data.summary.totalRealisation} DO)`, bg: 'E9D5FF' },
  ];

  kpiCards.forEach((kpi, idx) => {
    const cardX = 0.5 + idx * 1.82;
    // Card Shadow
    slide1.addShape(pptx.ShapeType.rect, {
      x: cardX + 0.04,
      y: 1.22,
      w: 1.72,
      h: 0.65,
      fill: { color: '0F172A' },
    });
    // Card Body
    slide1.addShape(pptx.ShapeType.rect, {
      x: cardX,
      y: 1.18,
      w: 1.72,
      h: 0.65,
      fill: { color: kpi.bg },
      line: { color: '0F172A', width: 1.5 },
    });

    slide1.addText(kpi.label, {
      x: cardX + 0.08,
      y: 1.22,
      w: 1.56,
      h: 0.2,
      fontSize: 6.8,
      bold: true,
      color: '0F172A',
      fontFace: 'Courier New',
    });

    slide1.addText(kpi.val, {
      x: cardX + 0.08,
      y: 1.4,
      w: 1.56,
      h: 0.35,
      fontSize: 10.5,
      bold: true,
      color: '0F172A',
      fontFace: 'Arial Black',
    });
  });

  // Mandatory Executive Narrative Box
  // "Di [week/periode] ini average jalur ada diangka ... dengan average bobot perhari ... dengan persentase pending ...% (.. DO) & persentase cancel ...% (.. DO)"
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0.54,
    y: 1.98,
    w: 8.92,
    h: 0.58,
    fill: { color: '0F172A' },
  });

  slide1.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 1.94,
    w: 8.92,
    h: 0.58,
    fill: { color: 'EFF6FF' },
    line: { color: '2563EB', width: 2 },
  });

  slide1.addText('RANGKUMAN EKSEKUTIF OPERASIONAL:', {
    x: 0.65,
    y: 1.98,
    w: 8.6,
    h: 0.18,
    fontSize: 7.5,
    bold: true,
    color: '1E40AF',
    fontFace: 'Courier New',
  });

  slide1.addText(`"${data.summary.narrativeText}"`, {
    x: 0.65,
    y: 2.16,
    w: 8.6,
    h: 0.32,
    fontSize: 9.5,
    bold: true,
    color: '0F172A',
    fontFace: 'Arial',
  });

  // Chart 1: Trend Jalur (Left)
  if (trendChartImg) {
    slide1.addImage({
      data: trendChartImg,
      x: 0.5,
      y: 2.65,
      w: 4.4,
      h: 2.75,
    });
  }

  // Chart 2: Clearance Beban Kerja (Right)
  if (clearanceChartImg) {
    slide1.addImage({
      data: clearanceChartImg,
      x: 5.05,
      y: 2.65,
      w: 4.4,
      h: 2.75,
    });
  }

  // =========================================================================
  // SLIDE 2: DETAIL BREAKDOWN HARIAN, TABEL KINERJA & BARIS REKAP TOTAL
  // =========================================================================
  const slide2 = pptx.addSlide();
  slide2.background = { color: 'F8FAFC' };

  // Top Banner
  slide2.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 0.35,
    w: 9.0,
    h: 0.65,
    fill: { color: '0F172A' },
    line: { color: '0F172A', width: 1.5 },
  });

  slide2.addText(`TABEL RINCIAN PERFORMA OPERASIONAL - ${data.title.toUpperCase()}`, {
    x: 0.7,
    y: 0.42,
    w: 8.5,
    h: 0.3,
    fontSize: 13,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial Black',
  });

  slide2.addText(`Total Hari Aktif: ${data.summary.activeDays} Hari  |  Clearance Bobot: ${data.summary.clearanceRate}%  |  Achievement DO: ${data.summary.achievementRate}% (${data.summary.totalRealisation.toLocaleString('id-ID')} / ${data.summary.totalTarget.toLocaleString('id-ID')} DO)`, {
    x: 0.7,
    y: 0.72,
    w: 8.5,
    h: 0.22,
    fontSize: 8.5,
    bold: true,
    color: '93C5FD',
    fontFace: 'Courier New',
  });

  // Table Data Headers (Clean without Kg)
  const headers = [
    'Tanggal',
    'Jalur',
    'Team',
    'Prod',
    'Bobot Masuk',
    'Bobot Finish',
    'Clearance',
    'Pending',
    'Cancel',
    'Achv %',
  ];

  // Up to 15 records for a comprehensive operational view
  const visibleRecords = data.records.slice(0, 15);
  const sumJalur = data.records.reduce((acc, r) => acc + (r.totalJalur || 0), 0);
  const sumTeam = data.records.reduce((acc, r) => acc + (r.totalTeam || 0), 0);

  const tableRows = [
    headers.map((h) => ({
      text: h,
      options: {
        bold: true,
        fill: { color: '2563EB' },
        color: 'FFFFFF',
        fontSize: 7.5,
        align: 'center' as const,
      },
    })),
    ...visibleRecords.map((rec, rIdx) => {
      const clearance = rec.bobotMasuk > 0 ? `${Math.round((rec.bobotFinish / rec.bobotMasuk) * 100)}%` : '-';
      return [
        rec.tanggal || `Tgl ${rec.dayNumber}`,
        rec.totalJalur,
        rec.totalTeam,
        (rec.totalTeam > 0 ? (rec.totalJalur / rec.totalTeam).toFixed(1) : '-'),
        rec.bobotMasuk.toLocaleString('id-ID'),
        rec.bobotFinish.toLocaleString('id-ID'),
        clearance,
        `${rec.totalPending} DO`,
        `${rec.cancel} DO`,
        rec.achv || `${rec.achievementRate}%`,
      ].map((cell) => ({
        text: String(cell),
        options: {
          fontSize: 7,
          fill: { color: rIdx % 2 === 0 ? 'FFFFFF' : 'F1F5F9' },
          color: '0F172A',
          align: 'center' as const,
        },
      }));
    }),
    // Highlighted Bottom Summary / Total Row (Clean without Kg)
    [
      { text: 'TOTAL / REKAP', options: { bold: true, fill: { color: '0F172A' }, color: 'FFFFFF', fontSize: 7, align: 'center' as const } },
      { text: `${sumJalur}`, options: { bold: true, fill: { color: '0F172A' }, color: 'FFFFFF', fontSize: 7, align: 'center' as const } },
      { text: `${sumTeam}`, options: { bold: true, fill: { color: '0F172A' }, color: 'FFFFFF', fontSize: 7, align: 'center' as const } },
      { text: `${data.summary.avgJalur} avg`, options: { bold: true, fill: { color: '0F172A' }, color: 'FFFFFF', fontSize: 7, align: 'center' as const } },
      { text: `${data.summary.totalBobotMasuk.toLocaleString('id-ID')}`, options: { bold: true, fill: { color: '0F172A' }, color: 'FFFFFF', fontSize: 7, align: 'center' as const } },
      { text: `${data.summary.totalBobotFinish.toLocaleString('id-ID')}`, options: { bold: true, fill: { color: '0F172A' }, color: 'FFFFFF', fontSize: 7, align: 'center' as const } },
      { text: `${data.summary.clearanceRate}%`, options: { bold: true, fill: { color: '0F172A' }, color: '86EFAC', fontSize: 7, align: 'center' as const } },
      { text: `${data.summary.totalPending} DO`, options: { bold: true, fill: { color: '0F172A' }, color: 'FCA5A5', fontSize: 7, align: 'center' as const } },
      { text: `${data.summary.totalCancel} DO`, options: { bold: true, fill: { color: '0F172A' }, color: 'FCA5A5', fontSize: 7, align: 'center' as const } },
      { text: `${data.summary.achievementRate}%`, options: { bold: true, fill: { color: '0F172A' }, color: 'FEF08A', fontSize: 7, align: 'center' as const } },
    ],
  ];

  slide2.addTable(tableRows, {
    x: 0.5,
    y: 1.15,
    w: 8.95,
    colW: [1.15, 0.7, 0.7, 0.7, 1.1, 1.1, 0.9, 0.8, 0.8, 1.0],
    border: { color: 'CBD5E1', pt: 0.5 },
  });

  // Clean, non-repetitive single-line footer
  slide2.addText('Sistem Monitoring DO Pool Singkawang  •  Data Terintegrasi Otomatis dari Spreadsheet Operasional', {
    x: 0.5,
    y: 5.15,
    w: 8.95,
    h: 0.25,
    fontSize: 7.5,
    color: '64748B',
    align: 'center',
    fontFace: 'Courier New',
  });

  return pptx;
}

/**
 * Exports directly to Google Slides in user's Google Drive.
 * Uses server-side proxy route with Bearer OAuth token to completely eliminate browser CORS NetworkErrors.
 */
export async function exportDirectlyToGoogleSlides(
  reportData: ComprehensiveReportData,
  filename: string
): Promise<{ presentationId: string; webViewLink: string; title: string }> {
  // Check access token
  let token = await getAccessToken();
  if (!token) {
    const authRes = await googleSignIn();
    if (!authRes || !authRes.accessToken) {
      throw new Error('Autentikasi Google diperlukan untuk menyimpan ke Google Slides.');
    }
    token = authRes.accessToken;
  }

  // 1. Build presentation
  const pptx = await createComprehensivePresentation(reportData);
  const base64 = (await pptx.write({ outputType: 'base64' })) as string;

  const cleanFilename = (filename || 'Laporan_Analytic_Pool_Singkawang')
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim();

  // 2. Call server proxy route (/api/export/google-slides)
  let response = await fetch('/api/export/google-slides', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      filename: cleanFilename,
      pptxBase64: base64,
    }),
  });

  // If token expired (401), clear token, re-authenticate, and retry once
  if (response.status === 401) {
    clearAccessToken();
    const authRes = await googleSignIn();
    if (authRes?.accessToken) {
      token = authRes.accessToken;
      response = await fetch('/api/export/google-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: cleanFilename,
          pptxBase64: base64,
        }),
      });
    }
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    const message = result.error || response.statusText || 'Gagal membuat presentasi Google Slides';
    throw new Error(message);
  }

  return {
    presentationId: result.presentationId,
    webViewLink: result.webViewLink,
    title: result.title || `${cleanFilename} - Google Slides`,
  };
}

/**
 * Downloads presentation as a .pptx file compatible with Google Slides and PowerPoint
 */
export async function downloadPowerPointFile(
  reportData: ComprehensiveReportData,
  filename: string
): Promise<void> {
  const pptx = await createComprehensivePresentation(reportData);
  await pptx.writeFile({ fileName: `${filename}.pptx` });
}
