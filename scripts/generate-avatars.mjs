#!/usr/bin/env node
/**
 * Generator avatar preset 3D (gaya "clay") untuk halaman profil.
 *
 * Output: public/avatars/3d/<id>.svg — dipakai oleh `AVATAR_PRESETS` di
 * `src/lib/user-avatar.ts`. Jalankan ulang setelah mengubah varian:
 *
 *   node scripts/generate-avatars.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'avatars', '3d')

// ── Palet ────────────────────────────────────────────────────────────────
const SKIN = {
    light: '#f5cfae',
    medium: '#e2a97e',
    tan: '#c68a5e',
    deep: '#8e5a3a',
}

function clamp(n) {
    return Math.max(0, Math.min(255, Math.round(n)))
}

/** Terangkan (amount > 0) atau gelapkan (amount < 0) warna hex. */
function shade(hex, amount) {
    const v = hex.replace('#', '')
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16))
    const t = amount < 0 ? 0 : 255
    const p = Math.abs(amount)
    return `#${[r, g, b]
        .map((c) => clamp(c + (t - c) * p).toString(16).padStart(2, '0'))
        .join('')}`
}

/** Gradien radial "3D": highlight kiri-atas → warna dasar → bayangan. */
function ball(id, base, { cx = '35%', cy = '30%', r = '75%' } = {}) {
    return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">
      <stop offset="0" stop-color="${shade(base, 0.35)}"/>
      <stop offset="0.55" stop-color="${base}"/>
      <stop offset="1" stop-color="${shade(base, -0.28)}"/>
    </radialGradient>`
}

function linear(id, base, { x1 = 0, y1 = 0, x2 = 0, y2 = 1 } = {}) {
    return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0" stop-color="${shade(base, 0.22)}"/>
      <stop offset="1" stop-color="${shade(base, -0.25)}"/>
    </linearGradient>`
}

// ── Bagian tubuh ─────────────────────────────────────────────────────────
function background() {
    return `<circle cx="128" cy="128" r="128" fill="url(#bg)"/>
    <circle cx="92" cy="70" r="70" fill="#fff" opacity="0.12"/>`
}

function body(v) {
    const parts = [
        `<path d="M24 262 C24 206 66 180 128 180 C190 180 232 206 232 262 Z" fill="url(#shirt)"/>`,
        // highlight bahu
        `<path d="M52 214 C66 196 92 188 116 186" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.18"/>`,
    ]

    if (v.outfit === 'vest') {
        parts.push(
            `<path d="M40 262 C40 220 60 198 92 188 L110 262 Z" fill="url(#vest)"/>`,
            `<path d="M216 262 C216 220 196 198 164 188 L146 262 Z" fill="url(#vest)"/>`,
            `<path d="M48 236 L104 232 L106 244 L46 248 Z" fill="#e8eef2" opacity="0.9"/>`,
            `<path d="M208 236 L152 232 L150 244 L210 248 Z" fill="#e8eef2" opacity="0.9"/>`,
        )
    }

    if (v.outfit === 'uniform') {
        // saku + kancing seragam
        parts.push(
            `<rect x="70" y="222" width="30" height="24" rx="4" fill="${shade(v.shirt, -0.12)}"/>`,
            `<rect x="156" y="222" width="30" height="24" rx="4" fill="${shade(v.shirt, -0.12)}"/>`,
            `<line x1="128" y1="200" x2="128" y2="256" stroke="${shade(v.shirt, -0.2)}" stroke-width="2"/>`,
            `<circle cx="128" cy="222" r="3" fill="${shade(v.shirt, -0.35)}"/>`,
            `<circle cx="128" cy="242" r="3" fill="${shade(v.shirt, -0.35)}"/>`,
        )
    }

    if (!v.hijab) {
        // kerah
        parts.push(
            `<path d="M104 182 L128 210 L114 216 L96 190 Z" fill="${shade(v.shirt, 0.25)}"/>`,
            `<path d="M152 182 L128 210 L142 216 L160 190 Z" fill="${shade(v.shirt, 0.15)}"/>`,
        )
    }

    return parts.join('\n    ')
}

function neck() {
    return `<path d="M106 150 L150 150 L152 186 C140 198 116 198 104 186 Z" fill="url(#neck)"/>`
}

function ears() {
    return `<ellipse cx="78" cy="122" rx="10" ry="14" fill="url(#skin)"/>
    <ellipse cx="178" cy="122" rx="10" ry="14" fill="url(#skin)"/>
    <ellipse cx="79" cy="123" rx="4.5" ry="7" fill="${'url(#skinShade)'}" opacity="0.6"/>
    <ellipse cx="177" cy="123" rx="4.5" ry="7" fill="${'url(#skinShade)'}" opacity="0.6"/>`
}

function head(v) {
    const [rx, ry, cy] = v.hijab ? [44, 50, 120] : [50, 56, 114]
    return `<ellipse cx="128" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#skin)"/>
    <ellipse cx="110" cy="${cy - 26}" rx="18" ry="10" fill="#fff" opacity="0.18"/>`
}

function face(v) {
    const eyeY = v.hijab ? 120 : 118
    const brow = v.hijab ? shade(v.skin, -0.55) : shade(v.hair ?? '#2b1d14', 0)
    const iris = v.iris ?? '#3b2416'
    const parts = []

    // pipi
    parts.push(
        `<ellipse cx="100" cy="${eyeY + 20}" rx="10" ry="6" fill="#ff7a7a" opacity="0.25"/>`,
        `<ellipse cx="156" cy="${eyeY + 20}" rx="10" ry="6" fill="#ff7a7a" opacity="0.25"/>`,
    )

    // mata
    for (const x of [108, 148]) {
        parts.push(
            `<ellipse cx="${x}" cy="${eyeY}" rx="8" ry="9" fill="#fff"/>`,
            `<circle cx="${x + 1}" cy="${eyeY + 1}" r="5.6" fill="${iris}"/>`,
            `<circle cx="${x + 1}" cy="${eyeY + 1}" r="2.6" fill="#120b07"/>`,
            `<circle cx="${x + 3}" cy="${eyeY - 2}" r="2" fill="#fff"/>`,
        )
        if (v.lashes) {
            const s = x < 128 ? -1 : 1
            parts.push(
                `<path d="M${x - 8} ${eyeY - 4} Q${x} ${eyeY - 12} ${x + 8} ${eyeY - 4}" stroke="#1d130d" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
                `<path d="M${x + 8 * s} ${eyeY - 4} l${4 * s} -3" stroke="#1d130d" stroke-width="2" stroke-linecap="round"/>`,
            )
        }
    }

    // alis
    parts.push(
        `<path d="M97 ${eyeY - 16} Q108 ${eyeY - 22} 118 ${eyeY - 16}" stroke="${brow}" stroke-width="${v.hijab ? 3 : 4}" fill="none" stroke-linecap="round"/>`,
        `<path d="M138 ${eyeY - 16} Q148 ${eyeY - 22} 159 ${eyeY - 16}" stroke="${brow}" stroke-width="${v.hijab ? 3 : 4}" fill="none" stroke-linecap="round"/>`,
    )

    // hidung
    parts.push(
        `<path d="M128 ${eyeY + 6} Q132 ${eyeY + 18} 126 ${eyeY + 20}" stroke="${shade(v.skin, -0.3)}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    )

    // mulut
    const my = eyeY + 30
    if (v.lashes) {
        parts.push(
            `<path d="M114 ${my} Q128 ${my + 14} 142 ${my} Q128 ${my + 5} 114 ${my} Z" fill="#c4465a"/>`,
            `<path d="M120 ${my + 5} Q128 ${my + 8} 136 ${my + 5}" stroke="#fff" stroke-width="1.6" opacity="0.5" fill="none" stroke-linecap="round"/>`,
        )
    } else {
        parts.push(
            `<path d="M114 ${my} Q128 ${my + 15} 142 ${my} Q128 ${my + 5} 114 ${my} Z" fill="#7a2e2a"/>`,
            `<path d="M118 ${my + 2} Q128 ${my + 6} 138 ${my + 2} L136 ${my + 4} Q128 ${my + 7} 120 ${my + 4} Z" fill="#fff"/>`,
        )
    }

    return parts.join('\n    ')
}

function beard(v) {
    if (!v.beard) return ''
    const c = shade(v.hair, 0.05)
    return `<path d="M80 120 C80 168 104 172 128 172 C152 172 176 168 176 120 C172 142 164 152 150 156 C140 146 116 146 106 156 C92 152 84 142 80 120 Z" fill="${c}" opacity="0.92"/>
    <path d="M110 150 Q128 140 146 150 Q128 146 110 150 Z" fill="${c}"/>`
}

function glasses(v) {
    if (!v.glasses) return ''
    const y = v.hijab ? 120 : 118
    const c = v.glasses
    return `<rect x="93" y="${y - 12}" width="30" height="24" rx="9" fill="#bfe3ff" fill-opacity="0.18" stroke="${c}" stroke-width="3.2"/>
    <rect x="133" y="${y - 12}" width="30" height="24" rx="9" fill="#bfe3ff" fill-opacity="0.18" stroke="${c}" stroke-width="3.2"/>
    <path d="M123 ${y - 2} Q128 ${y - 6} 133 ${y - 2}" stroke="${c}" stroke-width="3" fill="none"/>
    <path d="M98 ${y - 8} l8 0" stroke="#fff" stroke-width="2" opacity="0.6" stroke-linecap="round"/>
    <path d="M138 ${y - 8} l8 0" stroke="#fff" stroke-width="2" opacity="0.6" stroke-linecap="round"/>`
}

const HAIR = {
    short: `<path d="M76 116 C68 66 96 44 130 44 C164 44 190 66 180 116 C176 96 170 86 160 80 C138 90 110 88 92 80 C84 88 78 100 76 116 Z" fill="url(#hair)"/>`,
    quiff: `<path d="M76 118 C70 74 88 50 112 42 C130 30 168 34 176 56 C188 70 186 96 180 118 C176 98 168 86 158 80 C140 86 112 86 92 82 C84 90 78 102 76 118 Z" fill="url(#hair)"/>
    <path d="M112 44 C130 36 160 38 170 52" stroke="#fff" stroke-width="5" opacity="0.22" fill="none" stroke-linecap="round"/>`,
    side: `<path d="M76 118 C66 64 100 42 132 44 C166 46 192 70 180 118 C178 98 172 84 162 76 C150 80 130 80 112 70 C104 84 88 92 82 98 C79 104 77 110 76 118 Z" fill="url(#hair)"/>
    <path d="M112 70 C120 58 140 52 160 58" stroke="${'#000'}" stroke-width="2" opacity="0.2" fill="none"/>`,
    curly: `<g fill="url(#hair)">
      <circle cx="90" cy="86" r="18"/><circle cx="108" cy="66" r="20"/><circle cx="132" cy="58" r="22"/>
      <circle cx="156" cy="66" r="20"/><circle cx="172" cy="86" r="18"/><circle cx="80" cy="106" r="12"/>
      <circle cx="178" cy="106" r="12"/><circle cx="120" cy="76" r="16"/><circle cx="146" cy="78" r="16"/>
    </g>`,
    peci: `<path d="M78 112 C76 96 80 88 86 84 L172 84 C178 88 182 96 180 112 C176 100 168 92 160 90 L98 90 C88 92 80 100 78 112 Z" fill="url(#hair)"/>
    <path d="M82 88 L84 54 C104 44 152 44 172 54 L174 88 C150 80 106 80 82 88 Z" fill="url(#peci)"/>
    <path d="M84 60 C108 52 148 52 172 60" stroke="#fff" stroke-width="3" opacity="0.15" fill="none"/>
    <path d="M83 82 C108 76 148 76 173 82" stroke="#d4af37" stroke-width="2.4" opacity="0.7" fill="none"/>`,
}

function helmet(v) {
    const y = v.hijab ? 4 : 0
    return `<path d="M68 ${100 + y} C66 56 96 34 128 34 C160 34 190 56 188 ${100 + y} Z" fill="url(#helmet)"/>
    <path d="M58 ${100 + y} C58 ${92 + y} 64 ${90 + y} 72 ${90 + y} L184 ${90 + y} C192 ${90 + y} 198 ${92 + y} 198 ${100 + y} C198 ${106 + y} 192 ${108 + y} 184 ${108 + y} L72 ${108 + y} C64 ${108 + y} 58 ${106 + y} 58 ${100 + y} Z" fill="${shade(v.helmet, -0.12)}"/>
    <path d="M120 36 L136 36 L138 ${90 + y} L118 ${90 + y} Z" fill="${shade(v.helmet, 0.2)}" opacity="0.8"/>
    <path d="M86 70 C94 52 108 44 120 42" stroke="#fff" stroke-width="6" opacity="0.35" fill="none" stroke-linecap="round"/>`
}

function hijabBack(v) {
    return `<path d="M58 124 C52 62 88 36 128 36 C168 36 204 62 198 124 C198 150 208 172 218 194 C226 214 218 236 202 244 C170 258 86 258 54 244 C38 236 30 214 38 194 C48 172 58 150 58 124 Z" fill="url(#hijab)"/>
    <path d="M70 186 C86 206 104 218 128 222 C152 218 170 206 186 186" stroke="${shade(v.hijab, -0.35)}" stroke-width="3" opacity="0.35" fill="none" stroke-linecap="round"/>
    <path d="M50 214 C72 234 100 242 128 244" stroke="${shade(v.hijab, -0.35)}" stroke-width="3" opacity="0.3" fill="none" stroke-linecap="round"/>
    <path d="M74 80 C84 58 104 46 124 44" stroke="#fff" stroke-width="7" opacity="0.22" fill="none" stroke-linecap="round"/>`
}

function hijabFrame(v) {
    // tepi bukaan wajah + ciput
    return `<path d="M128 64 C96 64 78 88 78 122 C78 156 98 178 128 178 C158 178 178 156 178 122 C178 88 160 64 128 64 Z M128 70 C102 70 84 92 84 122 C84 154 102 172 128 172 C154 172 172 154 172 122 C172 92 154 70 128 70 Z" fill="${shade(v.hijab, -0.22)}" fill-rule="evenodd"/>
    <path d="M86 98 C96 78 112 72 128 72 C144 72 160 78 170 98 C156 88 142 84 128 84 C114 84 100 88 86 98 Z" fill="${v.ciput ?? shade(v.hijab, -0.4)}"/>
    ${v.brooch ? `<circle cx="128" cy="190" r="6" fill="${v.brooch}" stroke="#fff" stroke-width="1.5"/><circle cx="126" cy="188" r="2" fill="#fff" opacity="0.7"/>` : ''}`
}

function render(v) {
    const defs = [
        `<clipPath id="clip"><circle cx="128" cy="128" r="128"/></clipPath>`,
        ball('bg', v.bg, { cx: '30%', cy: '25%', r: '90%' }),
        ball('skin', v.skin),
        `<radialGradient id="skinShade"><stop offset="0" stop-color="${shade(v.skin, -0.3)}"/><stop offset="1" stop-color="${shade(v.skin, -0.1)}"/></radialGradient>`,
        linear('neck', shade(v.skin, -0.12)),
        ball('shirt', v.shirt, { cx: '40%', cy: '10%', r: '100%' }),
        `<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.22"/></filter>`,
    ]
    if (v.hair) defs.push(ball('hair', v.hair, { cx: '35%', cy: '20%', r: '85%' }))
    if (v.hijab) defs.push(ball('hijab', v.hijab, { cx: '35%', cy: '20%', r: '90%' }))
    if (v.hairStyle === 'peci') defs.push(ball('peci', '#1f1f24', { cx: '35%', cy: '20%', r: '90%' }))
    if (v.helmet) defs.push(ball('helmet', v.helmet, { cx: '35%', cy: '20%', r: '85%' }))
    if (v.outfit === 'vest') defs.push(linear('vest', '#ff7a1a'))

    const layers = [background()]
    if (v.hijab) {
        layers.push(body(v), hijabBack(v), head(v), hijabFrame(v), face(v), glasses(v))
    } else {
        layers.push(body(v), neck(), ears(), head(v), beard(v), face(v), HAIR[v.hairStyle] ?? '', glasses(v))
    }
    if (v.helmet) layers.push(helmet(v))

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-label="${v.label}">
  <defs>
    ${defs.join('\n    ')}
  </defs>
  <g clip-path="url(#clip)">
    ${layers[0]}
    <g filter="url(#soft)">
    ${layers.slice(1).filter(Boolean).join('\n    ')}
    </g>
  </g>
</svg>
`
}

// ── Varian ───────────────────────────────────────────────────────────────
// Sinkron dengan AVATAR_PRESETS di src/lib/user-avatar.ts.
const VARIANTS = [
    { id: 'male-01', label: 'Pria rambut pendek', skin: SKIN.light, hair: '#2b1d14', hairStyle: 'short', shirt: '#3b82f6', bg: '#bfdbfe' },
    { id: 'male-02', label: 'Pria berpeci, seragam', skin: SKIN.medium, hair: '#1c1410', hairStyle: 'peci', shirt: '#b59a6a', outfit: 'uniform', bg: '#fde68a' },
    { id: 'male-03', label: 'Pria berkacamata', skin: SKIN.tan, hair: '#1a1210', hairStyle: 'quiff', shirt: '#f1f5f9', glasses: '#1f2937', bg: '#c7d2fe' },
    { id: 'male-04', label: 'Pria berjanggut', skin: SKIN.medium, hair: '#3a2416', hairStyle: 'side', shirt: '#9f1239', beard: true, bg: '#fecdd3' },
    { id: 'male-05', label: 'Pria rambut keriting', skin: SKIN.deep, hair: '#140d0a', hairStyle: 'curly', shirt: '#0d9488', bg: '#99f6e4' },
    { id: 'male-06', label: 'Pria helm proyek', skin: SKIN.light, hair: '#4a3020', hairStyle: 'short', shirt: '#e2e8f0', outfit: 'vest', helmet: '#facc15', bg: '#fed7aa' },
    { id: 'female-01', label: 'Wanita berhijab merah muda', skin: SKIN.light, hijab: '#f472b6', shirt: '#f9a8d4', lashes: true, brooch: '#fde047', bg: '#fce7f3' },
    { id: 'female-02', label: 'Wanita berhijab navy berkacamata', skin: SKIN.medium, hijab: '#1e3a8a', shirt: '#334155', lashes: true, glasses: '#a16207', bg: '#bfdbfe' },
    { id: 'female-03', label: 'Wanita berhijab hijau sage', skin: SKIN.tan, hijab: '#84a98c', shirt: '#52796f', lashes: true, brooch: '#f8fafc', bg: '#dcfce7' },
    { id: 'female-04', label: 'Wanita berhijab, seragam', skin: SKIN.light, hijab: '#7f1d1d', shirt: '#b59a6a', outfit: 'uniform', lashes: true, bg: '#fde68a' },
    { id: 'female-05', label: 'Wanita berhijab krem', skin: SKIN.deep, hijab: '#d6c3a5', shirt: '#a68a64', lashes: true, ciput: '#8b6f4e', brooch: '#b45309', bg: '#fef3c7' },
    { id: 'female-06', label: 'Wanita berhijab helm proyek', skin: SKIN.medium, hijab: '#475569', shirt: '#e2e8f0', outfit: 'vest', helmet: '#facc15', lashes: true, bg: '#fed7aa' },
]

mkdirSync(OUT_DIR, { recursive: true })
for (const v of VARIANTS) {
    writeFileSync(join(OUT_DIR, `${v.id}.svg`), render(v))
}
console.log(`Generated ${VARIANTS.length} avatars → ${OUT_DIR}`)
