/**
 * PDF417 Barcode Utilities
 * Uses @bwip-js/browser to render real, scannable PDF417 barcodes onto a canvas.
 */
import bwipjs from '@bwip-js/browser';
import QRCode from 'qrcode';

export type BarcodeRenderResult = {
  dataUrl: string;
  svgLike: string;
};

/** Render QR Code for in-app display */
export async function renderQRCode(value: string): Promise<string> {
  return QRCode.toDataURL(value, {
    margin: 2,
    scale: 8,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
}

/** Render PDF417 for in-app display (dark theme) */
export async function renderPDF417(value: string): Promise<BarcodeRenderResult> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      bwipjs.toCanvas(canvas, {
        bcid:            'pdf417',
        text:            value,
        scale:           3,
        height:          12,
        includetext:     true,
        textxalign:      'center',
        textsize:        8,
        backgroundcolor: '111827',
        barcolor:        'f1f5f9',
        textcolor:       '94a3b8',
      });
      const dataUrl = canvas.toDataURL('image/png');
      resolve({
        dataUrl,
        svgLike: `<img src="${dataUrl}" style="width:100%;border-radius:8px;display:block" alt="${value}" />`,
      });
    } catch (err) {
      reject(err);
    }
  });
}

/** Generate a unique barcode string for a procurement item. */
export function generateItemBarcode(id: string, category: string): string {
  const prefix = category.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4).padEnd(4, 'X');
  const shortId = id.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `UNIV-${prefix}-${shortId}`;
}

/**
 * Download a print-ready sticker PNG.
 *
 * Fixed canvas: 2.5" × 1.5" @ 300 DPI  →  750 × 450 px
 *
 * Pixel budget (top → bottom, no overflow):
 *   4   top accent bar
 *   26  header (org name | institution)
 *   1   divider
 *   130 PDF417 barcode  ← sized to fit, not to overflow
 *   1   divider
 *   22  Item Name row
 *   1   divider
 *   22  Assigned To row
 *   1   divider
 *   22  Category row
 *   1   divider
 *   22  Location row
 *   1   divider
 *   18  Barcode string strip
 *   4   bottom accent bar
 *  ──────
 *   276  used  (fits inside 450 px)
 */
export async function downloadBarcode(
  barcode: string,
  itemName: string,
  assignedTo: string,
  category: string,
  location: string,
): Promise<void> {

  // ── 1. Render PDF417 — black on white for printing ──────────────────────
  const bcCanvas = document.createElement('canvas');
  bwipjs.toCanvas(bcCanvas, {
    bcid:            'pdf417',
    text:            barcode,
    scale:           3,
    height:          8,           // compact height
    includetext:     false,
    backgroundcolor: 'ffffff',
    barcolor:        '000000',
  });
  const bcImg = await loadImage(bcCanvas.toDataURL('image/png'));

  // ── 2. Fixed sticker canvas: 750 × 450 px ────────────────────────────────
  const W = 750;   // 2.5" × 300 DPI
  const H = 450;   // 1.5" × 300 DPI

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Outer cut border
  ctx.strokeStyle = '#bbbbbb';
  ctx.lineWidth   = 1.5;
  ctx.strokeRect(0.75, 0.75, W - 1.5, H - 1.5);

  // ── Zone heights (px) — must sum to ≤ H ─────────────────────────────────
  const ACCENT  = 6;    // top/bottom accent bars
  const HDR     = 28;   // header row
  const DIV     = 1;    // divider lines
  const BC_H    = 148;  // barcode zone (fixed)
  const ROW_H   = 24;   // each info row
  const STR_H   = 20;   // barcode string strip

  // Total = 6+28+1+148+1+24+1+24+1+24+1+24+1+20+6 = 310 px  ✓ fits in 450
  // Remaining 140 px = natural padding distributed as margins

  const MARGIN_TOP    = 14;  // gap above header
  const GAP_BC        = 10;  // gap between header and barcode
  const GAP_INFO      = 10;  // gap between barcode and info rows
  const GAP_STR       = 10;  // gap between last row and string strip

  let y = 0;

  // ── Top accent bar ───────────────────────────────────────────────────────
  const g1 = ctx.createLinearGradient(0, 0, W, 0);
  g1.addColorStop(0, '#6366f1');
  g1.addColorStop(1, '#06b6d4');
  ctx.fillStyle = g1;
  ctx.fillRect(0, y, W, ACCENT);
  y += ACCENT + MARGIN_TOP;

  // ── Header row ───────────────────────────────────────────────────────────
  ctx.fillStyle    = '#f5f4ff';
  ctx.fillRect(0, y, W, HDR);

  ctx.textBaseline = 'middle';
  ctx.textAlign    = 'left';
  ctx.fillStyle    = '#4f46e5';
  ctx.font         = 'bold 14px sans-serif';
  ctx.fillText('PROCUREMENT TRACKER', 10, y + HDR / 2);

  ctx.textAlign    = 'right';
  ctx.fillStyle    = '#6b7280';
  ctx.font         = '10px sans-serif';
  ctx.fillText('Mahad al Zahra · Al Jamea Tus Saifiyah, Galiakot', W - 10, y + HDR / 2);

  y += HDR;

  // divider
  ctx.fillStyle = '#d1d5db';
  ctx.fillRect(0, y, W, DIV);
  y += DIV + GAP_BC;

  // ── PDF417 barcode — scaled to fit width, fixed height ───────────────────
  const BC_W = W - 20;  // 10px padding each side
  // Scale barcode proportionally but cap at BC_H
  const naturalH = Math.round((bcImg.height / bcImg.width) * BC_W);
  const drawH    = Math.min(naturalH, BC_H);
  const drawW    = Math.round((drawH / bcImg.height) * bcImg.width);
  const bcX      = Math.round((W - drawW) / 2);  // center horizontally

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bcX, y, drawW, drawH);
  ctx.drawImage(bcImg, bcX, y, drawW, drawH);

  y += BC_H + GAP_INFO;

  // ── Info rows ─────────────────────────────────────────────────────────────
  const PAD_L = 10;
  const rows  = [
    { label: 'Item Name:',   value: itemName },
    { label: 'Assigned To:', value: assignedTo },
    { label: 'Category:',    value: category },
    { label: 'Location:',    value: location },
  ];

  rows.forEach((row, i) => {
    // Alternating bg
    ctx.fillStyle = i % 2 === 0 ? '#f9f9ff' : '#ffffff';
    ctx.fillRect(0, y, W, ROW_H);

    // Left accent stripe
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(0, y, 3, ROW_H);

    // Label — bold indigo
    ctx.fillStyle    = '#4338ca';
    ctx.font         = 'bold 11px sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(row.label, PAD_L + 4, y + ROW_H / 2);

    const labelW = ctx.measureText(row.label).width;

    // Value — dark, regular
    ctx.fillStyle = '#111827';
    ctx.font      = '11px sans-serif';
    const maxW    = W - PAD_L - 4 - labelW - 8 - 8;
    let   val     = row.value;
    while (ctx.measureText(val).width > maxW && val.length > 3) {
      val = val.slice(0, -2) + '…';
    }
    ctx.fillText(val, PAD_L + 4 + labelW + 6, y + ROW_H / 2);

    y += ROW_H;

    // Row divider (except after last)
    if (i < rows.length - 1) {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(3, y, W - 3, DIV);
      y += DIV;
    }
  });

  y += GAP_STR;

  // ── Barcode string strip ──────────────────────────────────────────────────
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(0, y, W, STR_H);

  ctx.fillStyle    = '#c7d2fe';
  ctx.font         = 'bold 10px monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(barcode, W / 2, y + STR_H / 2);

  y += STR_H;

  // Fill remaining space white before bottom bar
  if (y < H - ACCENT) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, y, W, H - ACCENT - y);
  }

  // ── Bottom accent bar ─────────────────────────────────────────────────────
  const g2 = ctx.createLinearGradient(0, 0, W, 0);
  g2.addColorStop(0, '#06b6d4');
  g2.addColorStop(1, '#6366f1');
  ctx.fillStyle = g2;
  ctx.fillRect(0, H - ACCENT, W, ACCENT);

  // ── Download ──────────────────────────────────────────────────────────────
  const link = document.createElement('a');
  link.href     = canvas.toDataURL('image/png');
  link.download = `sticker-${barcode}.png`;
  link.click();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img   = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src     = src;
  });
}

/** Export items as CSV. */
export function exportCSV(items: Array<{
  name: string; assignedTo: string; location: string;
  category: string; barcode: string; createdAt: string; createdBy: string;
}>): void {
  const headers = ['Barcode', 'Name', 'Category', 'Assigned To', 'Location', 'Created At', 'Created By'];
  const rows    = items.map(i => [
    i.barcode, i.name, i.category, i.assignedTo, i.location, i.createdAt, i.createdBy,
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `ProcurementTracker-Barcodes-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
