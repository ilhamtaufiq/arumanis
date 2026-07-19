/**
 * Cetak / unduh dokumentasi foto pekerjaan.
 * - HTML print (A4) dengan layout profesional
 * - PDF native via jsPDF (fallback ke print bila gambar CORS gagal)
 */

import jsPDF from 'jspdf'
import type { Foto } from '@/features/foto/types'
import { hasFotoKoordinat, isFotoKoordinatInvalid } from '@/features/foto/lib/koordinat-status'
import {
    FOTO_PROGRESS_LEVELS,
    type FotoProgressLevel,
    type PenerimaFotoGroup,
} from './foto-tab'

export type FotoPrintLayout = 'grid2' | 'grid4' | 'grid6' | 'matrix'
export type FotoPrintScope = 'filtered' | 'selected'

export type FotoPrintOptions = {
    layout: FotoPrintLayout
    scope: FotoPrintScope
    includeKoordinat: boolean
    onlyValidGps: boolean
    /** Matriks: true = full URL, false = thumb */
    useFullQuality: boolean
}

export type FotoPrintGpsStatus = 'valid' | 'invalid' | 'none'

export type FotoPrintItem = {
    id: number
    url: string
    thumbUrl: string
    komponen: string
    penerima: string
    penerimaNik: string
    level: string
    koordinat: string
    gpsStatus: FotoPrintGpsStatus
}

export type FotoPrintMeta = {
    paketName: string
    lokasi: string
    tahun?: string
    komponenLabel: string
    printedAt: string
    totalLabel: string
    watermark?: string
}

export const DEFAULT_FOTO_PRINT_OPTIONS: FotoPrintOptions = {
    layout: 'grid2',
    scope: 'filtered',
    includeKoordinat: true,
    onlyValidGps: false,
    useFullQuality: false,
}

export function escapeHtml(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

export function gpsStatusOf(foto: Pick<Foto, 'koordinat' | 'validasi_koordinat'>): FotoPrintGpsStatus {
    if (!hasFotoKoordinat(foto)) return 'none'
    if (isFotoKoordinatInvalid(foto)) return 'invalid'
    return 'valid'
}

export function gpsStatusLabel(status: FotoPrintGpsStatus): string {
    if (status === 'valid') return 'GPS valid'
    if (status === 'invalid') return 'GPS invalid'
    return 'Tanpa GPS'
}

export function layoutLabel(layout: FotoPrintLayout): string {
    switch (layout) {
        case 'grid2':
            return '2 foto / halaman'
        case 'grid4':
            return '4 foto / halaman'
        case 'grid6':
            return '6 foto / halaman'
        case 'matrix':
            return 'Matriks progress 0–100%'
    }
}

function photoPassesGpsFilter(foto: Foto, onlyValidGps: boolean): boolean {
    if (!onlyValidGps) return true
    return gpsStatusOf(foto) === 'valid'
}

/** Kumpulkan item foto dari grup terfilter + opsi cetak */
export function collectFotoPrintItems(
    groups: PenerimaFotoGroup[],
    options: FotoPrintOptions,
    selectedIds: number[] = [],
): FotoPrintItem[] {
    const selectedSet = options.scope === 'selected' ? new Set(selectedIds) : null
    const items: FotoPrintItem[] = []

    for (const group of groups) {
        for (const level of FOTO_PROGRESS_LEVELS) {
            for (const foto of group.fotos[level]) {
                if (selectedSet && !selectedSet.has(foto.id)) continue
                if (!photoPassesGpsFilter(foto, options.onlyValidGps)) continue
                items.push({
                    id: foto.id,
                    url: foto.foto_url,
                    thumbUrl: foto.foto_thumb_url || foto.foto_url,
                    komponen: group.komponen_nama || foto.komponen?.komponen || '-',
                    penerima: group.penerima_nama || foto.penerima?.nama || '',
                    penerimaNik: group.penerima_nik || foto.penerima?.nik || '',
                    level,
                    koordinat: (foto.koordinat || '').trim(),
                    gpsStatus: gpsStatusOf(foto),
                })
            }
        }
    }

    return items
}

/** Filter grup matriks sesuai opsi (selected / GPS) */
export function filterGroupsForMatrix(
    groups: PenerimaFotoGroup[],
    options: FotoPrintOptions,
    selectedIds: number[] = [],
): PenerimaFotoGroup[] {
    const selectedSet = options.scope === 'selected' ? new Set(selectedIds) : null

    return groups
        .map((group) => {
            const fotos = { ...group.fotos } as Record<FotoProgressLevel, Foto[]>
            for (const level of FOTO_PROGRESS_LEVELS) {
                fotos[level] = group.fotos[level].filter((foto) => {
                    if (selectedSet && !selectedSet.has(foto.id)) return false
                    return photoPassesGpsFilter(foto, options.onlyValidGps)
                })
            }
            return { ...group, fotos }
        })
        .filter((group) => FOTO_PROGRESS_LEVELS.some((level) => group.fotos[level].length > 0))
}

function photosPerPage(layout: FotoPrintLayout): number {
    if (layout === 'grid4') return 4
    if (layout === 'grid6') return 6
    return 2
}

function gridImgHeightMm(layout: FotoPrintLayout): number {
    if (layout === 'grid6') return 58
    if (layout === 'grid4') return 78
    return 105
}

function sharedStyles(orientation: 'portrait' | 'landscape'): string {
    return `
        @page {
            size: A4 ${orientation};
            margin: 10mm 12mm 14mm 12mm;
        }
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            .page { break-after: page; page-break-after: always; }
            .page:last-child { break-after: auto; page-break-after: auto; }
        }
        * { box-sizing: border-box; }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            color: #0f172a;
            margin: 0;
            padding: 0;
        }
        .doc-header {
            border-bottom: 2px solid #1e3a5f;
            padding-bottom: 8px;
            margin-bottom: 10px;
        }
        .doc-header .brand {
            font-size: 10px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #64748b;
            margin: 0 0 4px;
        }
        .doc-header h1 {
            margin: 0;
            font-size: 15px;
            color: #0f172a;
        }
        .doc-header .meta {
            margin-top: 6px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2px 16px;
            font-size: 10px;
            color: #334155;
        }
        .doc-header .meta span { display: block; }
        .watermark {
            position: fixed;
            bottom: 4mm;
            left: 12mm;
            right: 12mm;
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #94a3b8;
            z-index: 0;
        }
        .page-num::after {
            content: counter(page);
        }
        .gps-valid { color: #15803d; font-weight: 600; }
        .gps-invalid { color: #b91c1c; font-weight: 600; }
        .gps-none { color: #64748b; }
    `
}

function headerHtml(meta: FotoPrintMeta, extraLine?: string): string {
    return `
      <div class="doc-header">
        <p class="brand">${escapeHtml(meta.watermark || 'Arumanis · Kabupaten Cianjur')}</p>
        <h1>Dokumentasi Foto Progress</h1>
        <div class="meta">
          <span><strong>Paket:</strong> ${escapeHtml(meta.paketName)}</span>
          <span><strong>Lokasi:</strong> ${escapeHtml(meta.lokasi)}</span>
          <span><strong>Komponen:</strong> ${escapeHtml(meta.komponenLabel)}</span>
          <span><strong>Dicetak:</strong> ${escapeHtml(meta.printedAt)}</span>
          ${meta.tahun ? `<span><strong>Tahun:</strong> ${escapeHtml(meta.tahun)}</span>` : '<span></span>'}
          <span><strong>Jumlah:</strong> ${escapeHtml(meta.totalLabel)}</span>
          ${extraLine ? `<span style="grid-column:1/-1">${escapeHtml(extraLine)}</span>` : ''}
        </div>
      </div>
    `
}

function footerFixedHtml(meta: FotoPrintMeta): string {
    return `
      <div class="watermark">
        <span>${escapeHtml(meta.watermark || 'Arumanis · Kabupaten Cianjur')} · Dokumentasi resmi progress lapangan</span>
        <span>Halaman <span class="page-num"></span></span>
      </div>
    `
}

function itemInfoHtml(item: FotoPrintItem, options: FotoPrintOptions): string {
    const gpsClass =
        item.gpsStatus === 'valid'
            ? 'gps-valid'
            : item.gpsStatus === 'invalid'
              ? 'gps-invalid'
              : 'gps-none'
    return `
      <div class="photo-info">
        <span><strong>Komponen:</strong> ${escapeHtml(item.komponen)}</span>
        ${item.penerima ? `<span><strong>Penerima:</strong> ${escapeHtml(item.penerima)}</span>` : ''}
        <span><strong>Progress:</strong> ${escapeHtml(item.level)}</span>
        <span class="${gpsClass}"><strong>GPS:</strong> ${escapeHtml(gpsStatusLabel(item.gpsStatus))}</span>
        ${
            options.includeKoordinat && item.koordinat
                ? `<span class="koordinat"><strong>Koordinat:</strong> ${escapeHtml(item.koordinat)}</span>`
                : ''
        }
      </div>
    `
}

function buildGridHtml(
    items: FotoPrintItem[],
    meta: FotoPrintMeta,
    options: FotoPrintOptions,
): string {
    const perPage = photosPerPage(options.layout)
    const imgH = gridImgHeightMm(options.layout)
    const cols = options.layout === 'grid2' ? 1 : options.layout === 'grid4' ? 2 : 3

    let pages = ''
    for (let i = 0; i < items.length; i += perPage) {
        const slice = items.slice(i, i + perPage)
        const cards = slice
            .map((item) => {
                const src = options.useFullQuality ? item.url : item.thumbUrl || item.url
                return `
                  <div class="photo-card">
                    <img src="${escapeHtml(src)}" alt="Foto ${escapeHtml(item.level)}" loading="eager" crossorigin="anonymous" />
                    ${itemInfoHtml(item, options)}
                  </div>
                `
            })
            .join('')

        pages += `
          <div class="page">
            ${i === 0 ? headerHtml(meta, `Layout: ${layoutLabel(options.layout)}`) : ''}
            <div class="grid cols-${cols}">${cards}</div>
          </div>
        `
    }

    if (!pages) {
        pages = `<div class="page">${headerHtml(meta)}<p>Tidak ada foto untuk dicetak.</p></div>`
    }

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <title>Dokumentasi Foto - ${escapeHtml(meta.komponenLabel)}</title>
  <style>
    ${sharedStyles('portrait')}
    .page { width: 100%; padding: 0 0 8mm; position: relative; }
    .grid {
      display: grid;
      gap: 6mm;
    }
    .grid.cols-1 { grid-template-columns: 1fr; }
    .grid.cols-2 { grid-template-columns: 1fr 1fr; }
    .grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
    .photo-card {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 3mm;
      background: #f8fafc;
      break-inside: avoid;
    }
    .photo-card img {
      width: 100%;
      height: ${imgH}mm;
      object-fit: cover;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
      display: block;
      background: #e2e8f0;
    }
    .photo-info {
      display: flex;
      flex-wrap: wrap;
      gap: 2px 12px;
      margin-top: 3mm;
      padding-top: 2mm;
      border-top: 1px solid #e2e8f0;
      font-size: 9px;
    }
    .koordinat { font-size: 8px; color: #64748b; word-break: break-all; }
  </style>
</head>
<body>
  ${footerFixedHtml(meta)}
  ${pages}
  <script>
    (function () {
      function done() {
        setTimeout(function () { window.focus(); window.print(); }, 200);
      }
      var imgs = Array.prototype.slice.call(document.images || []);
      if (!imgs.length) { done(); return; }
      var left = imgs.length;
      var finished = false;
      function tick() {
        left -= 1;
        if (left <= 0 && !finished) { finished = true; done(); }
      }
      imgs.forEach(function (img) {
        if (img.complete) { tick(); return; }
        img.addEventListener('load', tick);
        img.addEventListener('error', tick);
      });
      setTimeout(function () { if (!finished) { finished = true; done(); } }, 12000);
    })();
  </script>
</body>
</html>`
}

function buildMatrixHtml(
    groups: PenerimaFotoGroup[],
    meta: FotoPrintMeta,
    options: FotoPrintOptions,
): string {
    const rows = groups
        .map((group, index) => {
            const cells = FOTO_PROGRESS_LEVELS.map((level) => {
                const photos = group.fotos[level]
                if (!photos.length) {
                    return `<td class="slot empty">—</td>`
                }
                const thumbs = photos
                    .map((foto) => {
                        const src = options.useFullQuality
                            ? foto.foto_url
                            : foto.foto_thumb_url || foto.foto_url
                        const gps = gpsStatusOf(foto)
                        const gpsClass =
                            gps === 'valid' ? 'gps-valid' : gps === 'invalid' ? 'gps-invalid' : 'gps-none'
                        const coord =
                            options.includeKoordinat && foto.koordinat?.trim()
                                ? `<div class="coord">${escapeHtml(foto.koordinat.trim())}</div>`
                                : ''
                        return `
                          <div class="thumb-wrap">
                            <img src="${escapeHtml(src)}" alt="${escapeHtml(level)}" loading="eager" crossorigin="anonymous" />
                            <div class="${gpsClass}">${escapeHtml(gpsStatusLabel(gps))}</div>
                            ${coord}
                          </div>
                        `
                    })
                    .join('')
                return `<td class="slot">${thumbs}</td>`
            }).join('')

            return `
              <tr>
                <td class="num">${index + 1}</td>
                <td class="nama">${escapeHtml(group.penerima_nama || '—')}</td>
                <td class="nik">${escapeHtml(group.penerima_nik || '—')}</td>
                <td class="komp">${escapeHtml(group.komponen_nama || '—')}</td>
                ${cells}
              </tr>
            `
        })
        .join('')

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <title>Dokumentasi Foto - ${escapeHtml(meta.komponenLabel)}</title>
  <style>
    ${sharedStyles('landscape')}
    .page { width: 100%; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border: 1px solid #94a3b8; padding: 3px; vertical-align: top; font-size: 9px; }
    th { background: #1e40af; color: #fff; text-align: center; font-size: 9px; }
    td.num { width: 22px; text-align: center; }
    td.nama { width: 90px; word-break: break-word; }
    td.nik { width: 88px; font-family: ui-monospace, monospace; font-size: 8px; word-break: break-all; }
    td.komp { width: 80px; word-break: break-word; }
    td.slot { text-align: center; width: auto; }
    td.empty { color: #94a3b8; text-align: center; vertical-align: middle; }
    .thumb-wrap { margin-bottom: 3px; }
    .thumb-wrap img {
      width: 72px;
      height: 72px;
      object-fit: cover;
      border: 1px solid #cbd5e1;
      border-radius: 2px;
      display: block;
      margin: 0 auto 2px;
      background: #e2e8f0;
    }
    .coord { font-size: 7px; color: #64748b; word-break: break-all; max-width: 80px; margin: 0 auto; }
  </style>
</head>
<body>
  ${footerFixedHtml(meta)}
  <div class="page">
    ${headerHtml(meta, `Layout: ${layoutLabel('matrix')}`)}
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Penerima</th>
          <th>NIK</th>
          <th>Komponen</th>
          ${FOTO_PROGRESS_LEVELS.map((l) => `<th>${escapeHtml(l)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="9" style="text-align:center;padding:12px">Tidak ada data</td></tr>'}
      </tbody>
    </table>
  </div>
  <script>
    (function () {
      function done() {
        setTimeout(function () { window.focus(); window.print(); }, 200);
      }
      var imgs = Array.prototype.slice.call(document.images || []);
      if (!imgs.length) { done(); return; }
      var left = imgs.length;
      var finished = false;
      function tick() {
        left -= 1;
        if (left <= 0 && !finished) { finished = true; done(); }
      }
      imgs.forEach(function (img) {
        if (img.complete) { tick(); return; }
        img.addEventListener('load', tick);
        img.addEventListener('error', tick);
      });
      setTimeout(function () { if (!finished) { finished = true; done(); } }, 15000);
    })();
  </script>
</body>
</html>`
}

export function buildFotoPrintHtml(
    groups: PenerimaFotoGroup[],
    meta: FotoPrintMeta,
    options: FotoPrintOptions,
    selectedIds: number[] = [],
): { html: string; itemCount: number; groupCount: number } {
    if (options.layout === 'matrix') {
        const matrixGroups = filterGroupsForMatrix(groups, options, selectedIds)
        const itemCount = matrixGroups.reduce(
            (n, g) => n + FOTO_PROGRESS_LEVELS.reduce((a, l) => a + g.fotos[l].length, 0),
            0,
        )
        return {
            html: buildMatrixHtml(matrixGroups, { ...meta, totalLabel: `${itemCount} foto · ${matrixGroups.length} baris` }, options),
            itemCount,
            groupCount: matrixGroups.length,
        }
    }

    const items = collectFotoPrintItems(groups, options, selectedIds)
    return {
        html: buildGridHtml(items, { ...meta, totalLabel: `${items.length} foto` }, options),
        itemCount: items.length,
        groupCount: groups.length,
    }
}

export function openFotoPrintWindow(html: string): Window | null {
    const w = window.open('', '_blank')
    if (!w) return null
    w.document.open()
    w.document.write(html)
    w.document.close()
    return w
}

function loadImageDataUrl(url: string, timeoutMs = 10000): Promise<string | null> {
    return new Promise((resolve) => {
        if (!url) {
            resolve(null)
            return
        }
        const img = new Image()
        img.crossOrigin = 'anonymous'
        const timer = window.setTimeout(() => {
            resolve(null)
        }, timeoutMs)
        img.onload = () => {
            window.clearTimeout(timer)
            try {
                const canvas = document.createElement('canvas')
                canvas.width = img.naturalWidth || img.width
                canvas.height = img.naturalHeight || img.height
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    resolve(null)
                    return
                }
                ctx.drawImage(img, 0, 0)
                resolve(canvas.toDataURL('image/jpeg', 0.85))
            } catch {
                resolve(null)
            }
        }
        img.onerror = () => {
            window.clearTimeout(timer)
            resolve(null)
        }
        img.src = url
    })
}

function sanitizeFilePart(value: string): string {
    return value
        .replace(/[^\w\s\-À-ÿ]+/gi, '')
        .trim()
        .replace(/\s+/g, '_')
        .slice(0, 40) || 'paket'
}

export function buildFotoPdfFileName(paketName: string, date = new Date()): string {
    const d = date.toISOString().slice(0, 10)
    return `Dokumentasi_Foto_${sanitizeFilePart(paketName)}_${d}.pdf`
}

/**
 * Unduh PDF via jsPDF (grid). Matriks tetap lewat print HTML.
 * Return true jika PDF tersimpan; false jika perlu fallback print.
 */
export async function downloadFotoPdf(
    groups: PenerimaFotoGroup[],
    meta: FotoPrintMeta,
    options: FotoPrintOptions,
    selectedIds: number[] = [],
    onProgress?: (msg: string) => void,
): Promise<{ ok: boolean; reason?: string; fileName?: string }> {
    if (options.layout === 'matrix') {
        return { ok: false, reason: 'matrix_use_print' }
    }

    const items = collectFotoPrintItems(groups, options, selectedIds)
    if (items.length === 0) {
        return { ok: false, reason: 'empty' }
    }

    const perPage = photosPerPage(options.layout)
    const portrait = true
    const doc = new jsPDF({
        orientation: portrait ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4',
    })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 12
    const contentW = pageW - margin * 2

    const cols = options.layout === 'grid2' ? 1 : options.layout === 'grid4' ? 2 : 3
    const gap = 4
    const cardW = (contentW - gap * (cols - 1)) / cols
    const imgH = options.layout === 'grid6' ? 48 : options.layout === 'grid4' ? 62 : 95
    const infoH = options.includeKoordinat ? 18 : 14
    const cardH = imgH + infoH + 4

    onProgress?.(`Memuat ${items.length} foto…`)

    const dataUrls: Array<string | null> = []
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const src = options.useFullQuality ? item.url : item.thumbUrl || item.url
        dataUrls.push(await loadImageDataUrl(src))
        if ((i + 1) % 5 === 0) onProgress?.(`Memuat foto ${i + 1}/${items.length}…`)
    }

    const loaded = dataUrls.filter(Boolean).length
    if (loaded === 0) {
        return { ok: false, reason: 'cors' }
    }

    let pageIndex = 0
    const drawHeader = () => {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(100)
        doc.text(meta.watermark || 'Arumanis · Kabupaten Cianjur', margin, margin - 2)
        doc.setTextColor(15)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(13)
        doc.text('Dokumentasi Foto Progress', margin, margin + 6)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        const lines = [
            `Paket: ${meta.paketName}`,
            `Lokasi: ${meta.lokasi}`,
            `Komponen: ${meta.komponenLabel}`,
            `Dicetak: ${meta.printedAt}${meta.tahun ? ` · Tahun: ${meta.tahun}` : ''} · ${items.length} foto`,
            `Layout: ${layoutLabel(options.layout)}`,
        ]
        let y = margin + 12
        lines.forEach((line) => {
            const wrapped = doc.splitTextToSize(line, contentW)
            doc.text(wrapped, margin, y)
            y += wrapped.length * 4
        })
        doc.setDrawColor(30, 58, 95)
        doc.setLineWidth(0.4)
        doc.line(margin, y + 1, pageW - margin, y + 1)
        return y + 6
    }

    const drawFooter = (pageNo: number, totalPages: number) => {
        doc.setFontSize(7.5)
        doc.setTextColor(140)
        doc.text(
            `${meta.watermark || 'Arumanis · Kabupaten Cianjur'} · Dokumentasi resmi progress lapangan`,
            margin,
            pageH - 6,
        )
        doc.text(`Halaman ${pageNo}/${totalPages}`, pageW - margin, pageH - 6, { align: 'right' })
        doc.setTextColor(0)
    }

    // Pre-count pages for footer total
    const totalPages = Math.max(1, Math.ceil(items.length / perPage))

    for (let i = 0; i < items.length; i += perPage) {
        if (pageIndex > 0) doc.addPage()
        pageIndex += 1
        let y = drawHeader()
        const slice = items.slice(i, i + perPage)

        slice.forEach((item, idx) => {
            const col = idx % cols
            const row = Math.floor(idx / cols)
            const x = margin + col * (cardW + gap)
            const cardY = y + row * (cardH + gap)

            doc.setDrawColor(200)
            doc.setFillColor(248, 250, 252)
            doc.roundedRect(x, cardY, cardW, cardH, 1, 1, 'FD')

            const dataUrl = dataUrls[i + idx]
            if (dataUrl) {
                try {
                    doc.addImage(dataUrl, 'JPEG', x + 1.5, cardY + 1.5, cardW - 3, imgH, undefined, 'FAST')
                } catch {
                    doc.setFontSize(8)
                    doc.text('(gambar gagal)', x + 4, cardY + imgH / 2)
                }
            } else {
                doc.setFontSize(8)
                doc.setTextColor(150)
                doc.text('(tidak termuat)', x + 4, cardY + imgH / 2)
                doc.setTextColor(0)
            }

            let ty = cardY + imgH + 4
            doc.setFontSize(7.5)
            doc.setTextColor(30)
            const info = [
                `${item.komponen} · ${item.level}`,
                item.penerima ? `Penerima: ${item.penerima}` : '',
                `GPS: ${gpsStatusLabel(item.gpsStatus)}`,
                options.includeKoordinat && item.koordinat ? item.koordinat : '',
            ].filter(Boolean)
            info.forEach((line) => {
                const wrapped = doc.splitTextToSize(line, cardW - 4)
                doc.text(wrapped, x + 2, ty)
                ty += wrapped.length * 3.2
            })
        })

        drawFooter(pageIndex, totalPages)
    }

    const fileName = buildFotoPdfFileName(meta.paketName)
    doc.save(fileName)
    return { ok: true, fileName }
}
