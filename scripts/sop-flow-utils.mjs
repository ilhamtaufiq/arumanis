import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'

export const ROW_H = 78
export const FLOW_W = 320
/** Tinggi baris data dalam twips Word (78px @ 96dpi) */
export const ROW_H_TWIPS = 1170
/** Tinggi baris data dalam poin Excel (≈ 78px) */
export const ROW_H_EXCEL_PT = 58.5

/** Konversi DXA/twips Word → piksel tampilan @96dpi */
export function dxaToPx(dxa) {
    return Math.round((dxa / 1440) * 96)
}

/** Lebar kolom Excel (satuan karakter) → piksel (Arial default xlsxwriter) */
export function excelColsToPx(charWidths) {
    return charWidths.reduce((sum, w) => sum + Math.trunc(7 * w + 5), 0)
}

/** Ukuran area Pelaksana untuk Word: lebar DXA kolom C–F, tinggi = n × baris */
export function wordPelaksanaSize(stepCount, pelaksanaWidthDxa) {
    return {
        w: dxaToPx(pelaksanaWidthDxa),
        h: stepCount * ROW_H,
    }
}

export function injectPelaksanaGrid(svg, stepCount) {
    const h = stepCount * ROW_H
    const lines = [
        `<rect x="0" y="0" width="${FLOW_W}" height="${h}" fill="none" stroke="#000" stroke-width="1"/>`,
    ]
    for (let i = 1; i < 4; i++) {
        const x = (FLOW_W / 4) * i
        lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="#000" stroke-width="1"/>`)
    }
    for (let i = 1; i < stepCount; i++) {
        const y = i * ROW_H
        lines.push(`<line x1="0" y1="${y}" x2="${FLOW_W}" y2="${y}" stroke="#000" stroke-width="1"/>`)
    }
    return svg.replace(/<\/svg>\s*$/i, `${lines.join('')}</svg>`)
}

function normalizeSvg(svg, stepCount, targetW, targetH) {
    const h = stepCount * ROW_H
    let s = svg.replace(/width="100%"/, `width="${FLOW_W}"`)
    s = injectPelaksanaGrid(s, stepCount)
    // Paksa viewBox & dimensi output = area sel Pelaksana (stretch seragam ke sel)
    s = s.replace(/viewBox="[^"]*"/, `viewBox="0 0 ${FLOW_W} ${h}"`)
    s = s.replace(/width="[^"]*"/, `width="${targetW}"`)
    s = s.replace(/height="[^"]*"/, `height="${targetH}"`)
    if (!/height="/.test(s)) {
        s = s.replace('<svg ', `<svg height="${targetH}" `)
    }
    return s
}

/**
 * Render PNG dengan ukuran piksel tepat (lebar × tinggi area sel Pelaksana).
 */
export function svgToPngBuffer(svgPath, stepCount, targetW, targetH) {
    if (!fs.existsSync(svgPath)) return null
    const raw = fs.readFileSync(svgPath, 'utf8')
    const svg = normalizeSvg(raw, stepCount, targetW, targetH)
    const resvg = new Resvg(svg, {
        background: 'white',
    })
    return resvg.render().asPng()
}

export function ensureFlowPng(slug, stepCount, svgDir, pngDir, targetW, targetH) {
    const svgPath = path.join(svgDir, `${slug}.svg`)
    const pngPath = path.join(pngDir, `${slug}.png`)
    const png = svgToPngBuffer(svgPath, stepCount, targetW, targetH)
    if (!png) return null
    fs.mkdirSync(pngDir, { recursive: true })
    fs.writeFileSync(pngPath, png)
    return pngPath
}