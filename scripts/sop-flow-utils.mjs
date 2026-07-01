import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'

export const ROW_H = 78
export const FLOW_W = 320

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

export function svgToPngBuffer(svgPath, stepCount) {
    if (!fs.existsSync(svgPath)) return null
    let svg = fs.readFileSync(svgPath, 'utf8')
    svg = svg.replace(/width="100%"/, `width="${FLOW_W}"`)
    svg = injectPelaksanaGrid(svg, stepCount)
    const resvg = new Resvg(svg, {
        fitTo: { mode: 'width', value: FLOW_W * 2 },
        background: 'white',
    })
    return resvg.render().asPng()
}

export function ensureFlowPng(slug, stepCount, svgDir, pngDir) {
    const svgPath = path.join(svgDir, `${slug}.svg`)
    const pngPath = path.join(pngDir, `${slug}.png`)
    const png = svgToPngBuffer(svgPath, stepCount)
    if (!png) return null
    fs.mkdirSync(pngDir, { recursive: true })
    fs.writeFileSync(pngPath, png)
    return pngPath
}