/**
 * Bungkus screenshot ke mockup poster (web) atau bingkai Android.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const BRAND = {
  purple: '#5B2D8E',
  purpleLight: '#7B4BB7',
  purpleDark: '#3D1F6E',
  cream: '#F8F4EC',
  ink: '#1A1A2E',
  accent: '#E8B84A',
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function posterSvg({ width, height, title, subtitle, shotW, shotH, shotY }) {
  const titleY = 72
  const subY = 118
  const frameX = Math.round((width - shotW) / 2) - 8
  const frameY = shotY - 8
  const frameW = shotW + 16
  const frameH = shotH + 16 + 36

  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${BRAND.purpleDark}"/>
      <stop offset="55%" style="stop-color:${BRAND.purple}"/>
      <stop offset="100%" style="stop-color:${BRAND.purpleLight}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="0" y="${height - 56}" width="100%" height="56" fill="${BRAND.ink}" opacity="0.55"/>
  <text x="${width / 2}" y="${titleY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#FFFFFF">${escapeXml(title)}</text>
  <text x="${width / 2}" y="${subY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#E8D9F5">${escapeXml(subtitle)}</text>
  <g filter="url(#shadow)">
    <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" rx="14" ry="14" fill="#FFFFFF"/>
    <rect x="${frameX + 12}" y="${frameY + 12}" width="${frameW - 24}" height="28" rx="8" fill="#F0F0F5"/>
    <circle cx="${frameX + 28}" cy="${frameY + 26}" r="5" fill="#FF6B6B"/>
    <circle cx="${frameX + 44}" cy="${frameY + 26}" r="5" fill="#FFD166"/>
    <circle cx="${frameX + 60}" cy="${frameY + 26}" r="5" fill="#06D6A0"/>
    <text x="${frameX + frameW / 2}" y="${frameY + 31}" text-anchor="middle" font-family="Consolas, monospace" font-size="11" fill="#666666">arumanis.cianjur.space</text>
  </g>
  <text x="${width / 2}" y="${height - 22}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#FFFFFF" opacity="0.9">ARUMANIS · Alat Kerja Inovasi · Dinas Perkim Kab. Cianjur</text>
</svg>`)
}

function androidSvg({ width, height, title, subtitle, phoneX, phoneY, phoneW, phoneH }) {
  const titleY = 64
  const subY = 108
  const r = 42
  const bezel = 14
  const screenX = phoneX + bezel
  const screenY = phoneY + bezel + 8
  const screenW = phoneW - bezel * 2
  const screenH = phoneH - bezel * 2 - 16

  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1A1A2E"/>
      <stop offset="100%" style="stop-color:#2D1B4E"/>
    </linearGradient>
    <filter id="pshadow" x="-30%" y="-20%" width="160%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#mbg)"/>
  <text x="${width / 2}" y="${titleY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="#FFFFFF">${escapeXml(title)}</text>
  <text x="${width / 2}" y="${subY}" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="#C9B8E8">${escapeXml(subtitle)}</text>
  <g filter="url(#pshadow)">
    <rect x="${phoneX}" y="${phoneY}" width="${phoneW}" height="${phoneH}" rx="${r}" fill="#111111"/>
    <rect x="${phoneX + 6}" y="${phoneY + 6}" width="${phoneW - 12}" height="${phoneH - 12}" rx="${r - 4}" fill="#1E1E1E"/>
    <rect x="${screenX}" y="${screenY}" width="${screenW}" height="${screenH}" rx="8" fill="#000000"/>
    <ellipse cx="${phoneX + phoneW / 2}" cy="${phoneY + 28}" rx="10" ry="10" fill="#0A0A0A"/>
    <rect x="${phoneX + phoneW / 2 - 36}" y="${phoneY + phoneH - 22}" width="72" height="5" rx="2.5" fill="#333333"/>
  </g>
  <text x="${width / 2}" y="${height - 28}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#AAAAAA">Android · Arumanis Pengawasan · space.cianjur.pengawas</text>
</svg>`)
}

/**
 * @param {{ inputPath: string, outputPath: string, title: string, subtitle: string }} opts
 */
export async function wrapPosterMockup(opts) {
  const width = 1100
  const pad = 56
  const headerSpace = 160
  const footerSpace = 72
  const shotMaxW = width - pad * 2

  const input = sharp(opts.inputPath)
  const meta = await input.metadata()
  const ratio = meta.height / meta.width
  const shotW = shotMaxW
  const shotH = Math.min(Math.round(shotW * ratio), 900)
  const height = headerSpace + shotH + 56 + footerSpace + 40

  const resized = await input
    .resize(shotW, shotH, { fit: 'fill' })
    .png()
    .toBuffer()

  const shotY = headerSpace + 44
  const bg = posterSvg({
    width,
    height,
    title: opts.title,
    subtitle: opts.subtitle,
    shotW,
    shotH,
    shotY,
  })

  const frameX = Math.round((width - shotW) / 2)
  const screenX = frameX
  const screenY = shotY + 44

  fs.mkdirSync(path.dirname(opts.outputPath), { recursive: true })

  await sharp(bg)
    .composite([{ input: resized, left: screenX, top: screenY }])
    .png()
    .toFile(opts.outputPath)

  return { width, height, outputPath: opts.outputPath }
}

/**
 * @param {{ inputPath: string, outputPath: string, title: string, subtitle: string }} opts
 */
export async function wrapAndroidMockup(opts) {
  const width = 900
  const height = 1200
  const phoneW = 340
  const phoneH = 720
  const phoneX = Math.round((width - phoneW) / 2)
  const phoneY = 200
  const bezel = 14
  const screenX = phoneX + bezel
  const screenY = phoneY + bezel + 8
  const screenW = phoneW - bezel * 2
  const screenH = phoneH - bezel * 2 - 16

  const resized = await sharp(opts.inputPath)
    .resize(screenW, screenH, { fit: 'cover', position: 'top' })
    .png()
    .toBuffer()

  const bg = androidSvg({
    width,
    height,
    title: opts.title,
    subtitle: opts.subtitle,
    phoneX,
    phoneY,
    phoneW,
    phoneH,
  })

  fs.mkdirSync(path.dirname(opts.outputPath), { recursive: true })

  await sharp(bg)
    .composite([{ input: resized, left: screenX, top: screenY }])
    .png()
    .toFile(opts.outputPath)

  return { width, height, outputPath: opts.outputPath }
}