/**
 * Utility to generate crisp, high-resolution chart images using HTML5 Canvas
 * Ensures charts render reliably in Google Slides, PowerPoint, and PDF exports.
 */

export interface ChartDataPoint {
  day: string;
  fullDate?: string;
  jalur: number;
  team: number;
  prod: number;
  bobotMasuk: number;
  bobotFinish: number;
}

/**
 * Generates high-res image of Trend Jalur & Productivity Chart
 */
export function generateTrendJalurChartImage(
  data: ChartDataPoint[],
  width = 1200,
  height = 680
): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Border & subtle grid container
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Title & Subtitle
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 28px "Space Grotesk", Arial, sans-serif';
  ctx.fillText('TREND JALUR, TEAM & PRODUKTIVITAS', 40, 54);

  ctx.fillStyle = '#64748b';
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText('Volume Penugasan (Batang) & Rasio Produktivitas (Garis Amber)', 40, 80);

  // Legend
  const legendY = 50;
  // Jalur Legend
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(width - 450, legendY - 14, 18, 18);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(width - 450, legendY - 14, 18, 18);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText('Jalur', width - 425, legendY);

  // Team Legend
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(width - 340, legendY - 14, 18, 18);
  ctx.strokeRect(width - 340, legendY - 14, 18, 18);
  ctx.fillStyle = '#0f172a';
  ctx.fillText('Team', width - 315, legendY);

  // Prod Legend
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(width - 230, legendY - 5);
  ctx.lineTo(width - 195, legendY - 5);
  ctx.stroke();
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.arc(width - 212, legendY - 5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.fillText('Prod', width - 185, legendY);

  // Plot Area
  const paddingLeft = 70;
  const paddingRight = 70;
  const paddingTop = 120;
  const paddingBottom = 80;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Find max values
  const maxLeft = Math.max(10, ...data.map((d) => Math.max(d.jalur, d.team)));
  const maxLeftRound = Math.ceil(maxLeft / 5) * 5;
  const maxRight = Math.max(5, ...data.map((d) => d.prod));
  const maxRightRound = Math.ceil(maxRight);

  // Grid lines
  const gridSteps = 5;
  ctx.font = '14px Arial, sans-serif';
  for (let i = 0; i <= gridSteps; i++) {
    const yVal = paddingTop + (plotHeight / gridSteps) * i;
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, yVal);
    ctx.lineTo(width - paddingRight, yVal);
    ctx.stroke();

    // Left Y Axis labels (Jalur/Team)
    const leftLabel = Math.round(maxLeftRound * (1 - i / gridSteps));
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'right';
    ctx.fillText(String(leftLabel), paddingLeft - 12, yVal + 5);

    // Right Y Axis labels (Prod)
    const rightLabel = ((maxRightRound * (1 - i / gridSteps))).toFixed(1);
    ctx.fillStyle = '#d97706';
    ctx.textAlign = 'left';
    ctx.fillText(rightLabel, width - paddingRight + 12, yVal + 5);
  }

  // Draw Bars
  const count = Math.max(1, data.length);
  const groupWidth = plotWidth / count;
  const barWidth = Math.min(28, Math.max(8, (groupWidth - 12) / 2));

  // Determine interval for x-axis ticks
  const interval = count > 20 ? Math.ceil(count / 10) : 1;

  data.forEach((d, idx) => {
    const groupCenterX = paddingLeft + groupWidth * idx + groupWidth / 2;

    // Bar 1: Jalur
    const bar1Height = (d.jalur / maxLeftRound) * plotHeight;
    const bar1X = groupCenterX - barWidth - 2;
    const bar1Y = paddingTop + plotHeight - bar1Height;

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(bar1X, bar1Y, barWidth, bar1Height);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bar1X, bar1Y, barWidth, bar1Height);

    // Bar 2: Team
    const bar2Height = (d.team / maxLeftRound) * plotHeight;
    const bar2X = groupCenterX + 2;
    const bar2Y = paddingTop + plotHeight - bar2Height;

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(bar2X, bar2Y, barWidth, bar2Height);
    ctx.strokeRect(bar2X, bar2Y, barWidth, bar2Height);

    // X Axis Label
    if (idx % interval === 0 || idx === count - 1) {
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillText(d.day, groupCenterX, paddingTop + plotHeight + 25);
    }
  });

  // Draw Line for Produktivitas
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  data.forEach((d, idx) => {
    const groupCenterX = paddingLeft + groupWidth * idx + groupWidth / 2;
    const lineY = paddingTop + plotHeight - (d.prod / maxRightRound) * plotHeight;
    if (idx === 0) ctx.moveTo(groupCenterX, lineY);
    else ctx.lineTo(groupCenterX, lineY);
  });
  ctx.stroke();

  // Draw Line Points
  data.forEach((d, idx) => {
    const groupCenterX = paddingLeft + groupWidth * idx + groupWidth / 2;
    const lineY = paddingTop + plotHeight - (d.prod / maxRightRound) * plotHeight;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(groupCenterX, lineY, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  return canvas.toDataURL('image/png');
}

/**
 * Generates high-res image of Workload Clearance (Bobot Masuk vs Bobot Finish) Chart
 */
export function generateClearanceChartImage(
  data: ChartDataPoint[],
  width = 1200,
  height = 680
): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Border & subtle grid container
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Title & Subtitle
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 28px "Space Grotesk", Arial, sans-serif';
  ctx.fillText('CLEARANCE BEBAN KERJA (BOBOT MASUK VS FINISH)', 40, 54);

  ctx.fillStyle = '#64748b';
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText('Perbandingan Bobot Penugasan Baru dan Bobot yang Berhasil Diselesaikan', 40, 80);

  // Legend
  const legendY = 50;
  // Bobot Masuk Legend
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(width - 360, legendY - 14, 18, 18);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(width - 360, legendY - 14, 18, 18);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillText('Bobot Masuk', width - 335, legendY);

  // Bobot Finish Legend
  ctx.fillStyle = '#4f46e5';
  ctx.fillRect(width - 200, legendY - 14, 18, 18);
  ctx.strokeRect(width - 200, legendY - 14, 18, 18);
  ctx.fillStyle = '#0f172a';
  ctx.fillText('Bobot Finish', width - 175, legendY);

  // Plot Area
  const paddingLeft = 70;
  const paddingRight = 40;
  const paddingTop = 120;
  const paddingBottom = 80;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Find max values
  const maxVal = Math.max(10, ...data.map((d) => Math.max(d.bobotMasuk, d.bobotFinish)));
  const maxValRound = Math.ceil(maxVal / 10) * 10;

  // Grid lines
  const gridSteps = 5;
  ctx.font = '14px Arial, sans-serif';
  for (let i = 0; i <= gridSteps; i++) {
    const yVal = paddingTop + (plotHeight / gridSteps) * i;
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, yVal);
    ctx.lineTo(width - paddingRight, yVal);
    ctx.stroke();

    const label = Math.round(maxValRound * (1 - i / gridSteps));
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'right';
    ctx.fillText(String(label), paddingLeft - 12, yVal + 5);
  }

  // Draw Bars
  const count = Math.max(1, data.length);
  const groupWidth = plotWidth / count;
  const barWidth = Math.min(28, Math.max(8, (groupWidth - 12) / 2));
  const interval = count > 20 ? Math.ceil(count / 10) : 1;

  data.forEach((d, idx) => {
    const groupCenterX = paddingLeft + groupWidth * idx + groupWidth / 2;

    // Bar 1: Bobot Masuk
    const bar1Height = (d.bobotMasuk / maxValRound) * plotHeight;
    const bar1X = groupCenterX - barWidth - 2;
    const bar1Y = paddingTop + plotHeight - bar1Height;

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(bar1X, bar1Y, barWidth, bar1Height);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bar1X, bar1Y, barWidth, bar1Height);

    // Bar 2: Bobot Finish
    const bar2Height = (d.bobotFinish / maxValRound) * plotHeight;
    const bar2X = groupCenterX + 2;
    const bar2Y = paddingTop + plotHeight - bar2Height;

    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(bar2X, bar2Y, barWidth, bar2Height);
    ctx.strokeRect(bar2X, bar2Y, barWidth, bar2Height);

    // Clearance % badge above finish bar if space permits
    if (d.bobotMasuk > 0 && bar2Height > 20 && count <= 15) {
      const clearance = Math.round((d.bobotFinish / d.bobotMasuk) * 100);
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 11px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${clearance}%`, bar2X + barWidth / 2, Math.max(paddingTop + 14, bar2Y - 6));
    }

    // X Axis Label
    if (idx % interval === 0 || idx === count - 1) {
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillText(d.day, groupCenterX, paddingTop + plotHeight + 25);
    }
  });

  return canvas.toDataURL('image/png');
}
