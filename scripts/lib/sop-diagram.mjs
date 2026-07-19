/**
 * Diagram alur SOP — bangun definisi flowchart, render ke SVG/PNG.
 * Output dokumen memakai gambar; label UI = "Diagram Alur" (tanpa menyebut engine).
 */

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const COL_LABEL = {
  admin: 'Admin',
  operator: 'Operator',
  pengawas: 'Pengawas',
  sistem: 'Sistem',
}

export function safeLabel(s, max = 42) {
  return String(s ?? '')
    .replace(/"/g, "'")
    .replace(/[\[\]{}|#;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

/** Definisi flowchart (syntax kompatibel engine diagram) dari steps SOP */
export function buildFlowDefinition(steps, title = '') {
  const lines = ['flowchart TD']
  if (title) lines.push(`  %% ${safeLabel(title, 80)}`)

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const flow = step.flow ?? {}
    const role = COL_LABEL[flow.col ?? 'operator'] ?? flow.col
    const label = safeLabel(flow.label || `L${i + 1}`, 24)
    const text = safeLabel(`${i + 1}. ${label}\\n(${role})`, 48)
    const id = `S${i + 1}`

    if (flow.type === 'decision') {
      lines.push(`  ${id}{"${text}"}`)
    } else {
      lines.push(`  ${id}["${text}"]`)
    }
  }

  for (let i = 0; i < steps.length - 1; i++) {
    const edge = steps[i].flow?.type === 'decision' ? '|Ya|' : ''
    lines.push(`  S${i + 1} -->${edge} S${i + 2}`)
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    if (step.flow?.type === 'decision' && step.tidakLoopTo != null) {
      lines.push(`  S${i + 1} -.->|Tidak| S${step.tidakLoopTo + 1}`)
    }
  }

  // classDef untuk warna (proses / aksi / keputusan)
  lines.push('  classDef process fill:#5B9BD5,stroke:#000,color:#fff')
  lines.push('  classDef action fill:#E74C3C,stroke:#000,color:#fff')
  lines.push('  classDef decision fill:#C6E0B4,stroke:#000,color:#000')

  for (let i = 0; i < steps.length; i++) {
    const t = steps[i].flow?.type
    const id = `S${i + 1}`
    if (t === 'decision') lines.push(`  class ${id} decision`)
    else if (t === 'red') lines.push(`  class ${id} action`)
    else lines.push(`  class ${id} process`)
  }

  return lines.join('\n')
}

/**
 * SVG flowchart mandiri (tanpa swimlane) — mermaid-style TD.
 * Dipakai fallback jika render engine gagal; selalu bisa di-PNG via resvg.
 */
export function buildFlowSvg(steps, opts = {}) {
  const W = opts.width ?? 480
  const nodeH = 48
  const gap = 28
  const padY = 24
  const n = steps.length
  const H = padY * 2 + n * nodeH + (n - 1) * gap

  const nodes = steps.map((step, i) => {
    const flow = step.flow ?? {}
    const role = COL_LABEL[flow.col ?? 'operator'] ?? flow.col
    const label = safeLabel(flow.label || `L${i + 1}`, 20)
    const y = padY + i * (nodeH + gap) + nodeH / 2
    return {
      i,
      x: W / 2,
      y,
      type: flow.type ?? 'process',
      line1: `${i + 1}. ${label}`,
      line2: `(${role})`,
      tidakLoopTo: step.tidakLoopTo,
    }
  })

  let body = `<defs>
  <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
    <path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/>
  </marker>
</defs>`

  // edges first
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i]
    const b = nodes[i + 1]
    const y1 = a.y + (a.type === 'decision' ? 28 : nodeH / 2)
    const y2 = b.y - (b.type === 'decision' ? 28 : nodeH / 2)
    const yaLabel = a.type === 'decision' ? 'Ya' : ''
    body += `<line x1="${a.x}" y1="${y1}" x2="${b.x}" y2="${y2}" stroke="#2F5597" stroke-width="2" marker-end="url(#arr)"/>`
    if (yaLabel) {
      body += `<text x="${a.x + 14}" y="${(y1 + y2) / 2}" font-size="11" font-weight="bold" fill="#2F5597" font-family="Arial">${yaLabel}</text>`
    }
  }

  for (const node of nodes) {
    if (node.type === 'decision' && node.tidakLoopTo != null) {
      const target = nodes[node.tidakLoopTo]
      if (target) {
        const xRight = node.x + 100
        body += `<path d="M${node.x + 32} ${node.y} L${xRight} ${node.y} L${xRight} ${target.y} L${target.x + 70} ${target.y}" fill="none" stroke="#2F5597" stroke-width="1.6" stroke-dasharray="5,3" marker-end="url(#arr)"/>`
        body += `<text x="${xRight + 4}" y="${node.y - 6}" font-size="11" font-weight="bold" fill="#2F5597" font-family="Arial">Tidak</text>`
      }
    }
  }

  for (const node of nodes) {
    if (node.type === 'decision') {
      const s = 28
      body += `<polygon points="${node.x},${node.y - s} ${node.x + s},${node.y} ${node.x},${node.y + s} ${node.x - s},${node.y}" fill="#C6E0B4" stroke="#000" stroke-width="1.5"/>`
      body += `<text x="${node.x}" y="${node.y - 2}" text-anchor="middle" font-size="11" font-weight="bold" font-family="Arial">${esc(node.line1)}</text>`
      body += `<text x="${node.x}" y="${node.y + 12}" text-anchor="middle" font-size="10" font-family="Arial" fill="#333">${esc(node.line2)}</text>`
    } else {
      const fill = node.type === 'red' ? '#E74C3C' : '#5B9BD5'
      const w = 150
      const h = nodeH
      body += `<rect x="${node.x - w / 2}" y="${node.y - h / 2}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="#000" stroke-width="1.5"/>`
      body += `<text x="${node.x}" y="${node.y - 4}" text-anchor="middle" font-size="12" font-weight="bold" fill="#fff" font-family="Arial">${esc(node.line1)}</text>`
      body += `<text x="${node.x}" y="${node.y + 14}" text-anchor="middle" font-size="11" fill="#fff" font-family="Arial">${esc(node.line2)}</text>`
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  ${body}
</svg>`
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function svgStringToPngBuffer(svg, scale = 2) {
  const resvg = new Resvg(svg, {
    background: 'white',
    fitTo: { mode: 'zoom', value: scale },
  })
  return resvg.render().asPng()
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Coba render lewat engine diagram + Playwright (jika mermaid terpasang).
 * Return PNG Buffer atau null. Gagal → pemanggil pakai SVG fallback.
 */
export async function renderWithDiagramEngine(definition, opts = {}) {
  let mermaidEsm
  try {
    const { createRequire } = await import('node:module')
    const require = createRequire(import.meta.url)
    const pkg = path.dirname(require.resolve('mermaid/package.json'))
    const esmFile = path.join(pkg, 'dist', 'mermaid.esm.min.mjs')
    if (!fs.existsSync(esmFile)) return null
    mermaidEsm = pathToFileURL(esmFile).href
  } catch {
    return null
  }

  let chromium
  try {
    const pw = await import('playwright')
    chromium = pw.chromium
  } catch {
    return null
  }

  const width = opts.width ?? 640
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    html, body { margin: 0; padding: 16px; background: #fff; font-family: Arial, Helvetica, sans-serif; }
    #wrap { display: inline-block; min-width: 200px; }
  </style>
</head>
<body>
  <div id="wrap"><pre class="diagram">${escapeHtml(definition)}</pre></div>
  <script type="module">
    import mermaid from '${mermaidEsm}';
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: '#5B9BD5',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#000000',
        lineColor: '#2F5597',
        secondaryColor: '#E74C3C',
        tertiaryColor: '#C6E0B4',
        fontFamily: 'Arial, Helvetica, sans-serif',
      },
      flowchart: { curve: 'basis', padding: 16, htmlLabels: false },
      securityLevel: 'loose',
    });
    const el = document.querySelector('.diagram');
    const def = el.textContent;
    const { svg } = await mermaid.render('flowdiag', def);
    el.outerHTML = svg;
    document.body.dataset.ready = '1';
  </script>
</body>
</html>`

  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({
      viewport: { width: width + 100, height: 1200 },
      deviceScaleFactor: 2,
    })
    await page.setContent(html, { waitUntil: 'load', timeout: 20000 })
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 20000 })
    // tunggu SVG layout
    await page.waitForSelector('#wrap svg', { timeout: 10000 })
    const png = await page.locator('#wrap').screenshot({ type: 'png' })
    return png
  } catch (err) {
    console.warn('  diagram engine fallback → SVG:', err.message?.slice(0, 100))
    return null
  } finally {
    await browser.close()
  }
}

/**
 * Render diagram steps → { svg, png, definition }
 */
export async function renderSopDiagram(steps, title = '', opts = {}) {
  const definition = buildFlowDefinition(steps, title)
  const svg = buildFlowSvg(steps, opts)
  let png = null

  if (opts.preferEngine !== false) {
    png = await renderWithDiagramEngine(definition, opts)
  }
  if (!png) {
    png = svgStringToPngBuffer(svg, opts.scale ?? 2)
  }

  return { definition, svg, png }
}

/** Overview integrasi (statis) */
export function buildOverviewSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="200" viewBox="0 0 720 200">
  <rect width="100%" height="100%" fill="#fff"/>
  <rect x="24" y="36" width="190" height="90" rx="8" fill="#5B9BD5" stroke="#000"/>
  <text x="119" y="72" text-anchor="middle" fill="#fff" font-family="Arial" font-size="13" font-weight="bold">Arumanis (Kantor)</text>
  <text x="119" y="94" text-anchor="middle" fill="#fff" font-family="Arial" font-size="11">Kegiatan → Pekerjaan</text>
  <text x="119" y="112" text-anchor="middle" fill="#fff" font-family="Arial" font-size="11">Kontrak → Assign</text>
  <rect x="265" y="36" width="190" height="90" rx="8" fill="#70AD47" stroke="#000"/>
  <text x="360" y="72" text-anchor="middle" fill="#fff" font-family="Arial" font-size="13" font-weight="bold">Panel Pengawasan</text>
  <text x="360" y="94" text-anchor="middle" fill="#fff" font-family="Arial" font-size="11">Foto GPS · Progress</text>
  <text x="360" y="112" text-anchor="middle" fill="#fff" font-family="Arial" font-size="11">Laporan · Tiket</text>
  <rect x="506" y="36" width="190" height="90" rx="8" fill="#ED7D31" stroke="#000"/>
  <text x="601" y="78" text-anchor="middle" fill="#fff" font-family="Arial" font-size="13" font-weight="bold">APIAMIS</text>
  <text x="601" y="100" text-anchor="middle" fill="#fff" font-family="Arial" font-size="11">MySQL apiamis</text>
  <defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2F5597"/></marker></defs>
  <line x1="214" y1="81" x2="265" y2="81" stroke="#2F5597" stroke-width="2" marker-end="url(#a)"/>
  <line x1="455" y1="81" x2="506" y2="81" stroke="#2F5597" stroke-width="2" marker-end="url(#a)"/>
  <text x="360" y="170" text-anchor="middle" font-family="Arial" font-size="12" fill="#333">Sinkron kantor ↔ lapangan · Role lapangan setara: pengawas · konsultan_pengawas · tfl</text>
</svg>`
}

export function writeDiagramFiles(outDir, slug, steps, title) {
  // sync write SVG always; PNG via async renderSopDiagram elsewhere
  const svg = buildFlowSvg(steps)
  fs.mkdirSync(outDir, { recursive: true })
  const svgPath = path.join(outDir, `${slug}.svg`)
  fs.writeFileSync(svgPath, svg, 'utf8')
  const defPath = path.join(outDir, `${slug}.flow.txt`)
  fs.writeFileSync(defPath, buildFlowDefinition(steps, title), 'utf8')
  return { svgPath, defPath, svg }
}
