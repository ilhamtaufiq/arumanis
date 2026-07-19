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

/**
 * Render SVG file → PNG buffer.
 * Jangan menimpa shape dengan rect putih di akhir SVG.
 */
export function svgToPngBuffer(svgPath, stepCount, targetW, targetH) {
  if (!fs.existsSync(svgPath)) return null
  let svg = fs.readFileSync(svgPath, 'utf8')

  // Pastikan width/height numerik (resvg butuh)
  if (/width="100%"/.test(svg)) {
    svg = svg.replace(/width="100%"/, `width="${FLOW_W}"`)
  }
  // Jika SVG sudah punya width/height sendiri (diagram TD baru), hormati aspect
  const vb = svg.match(/viewBox="0 0\s+([\d.]+)\s+([\d.]+)"/)
  const srcW = vb ? Number(vb[1]) : FLOW_W
  const srcH = vb ? Number(vb[2]) : stepCount * ROW_H

  const outW = targetW || Math.round(srcW * 2)
  const outH = targetH || Math.round(srcH * 2)

  // Set width/height output tanpa merusak isi
  if (/viewBox=/.test(svg)) {
    svg = svg.replace(/<svg\b([^>]*)>/i, (m, attrs) => {
      let a = attrs
        .replace(/\swidth="[^"]*"/g, '')
        .replace(/\sheight="[^"]*"/g, '')
      return `<svg${a} width="${outW}" height="${outH}">`
    })
  }

  try {
    const resvg = new Resvg(svg, {
      background: 'white',
      fitTo: { mode: 'width', value: outW },
    })
    return resvg.render().asPng()
  } catch (err) {
    console.warn('svgToPngBuffer gagal:', path.basename(svgPath), err.message?.slice(0, 120))
    return null
  }
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

export function pngBufferFromSvgString(svg, targetW) {
  const resvg = new Resvg(svg, {
    background: 'white',
    fitTo: targetW ? { mode: 'width', value: targetW } : undefined,
  })
  return resvg.render().asPng()
}
