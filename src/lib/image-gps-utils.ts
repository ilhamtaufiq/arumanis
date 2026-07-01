import exifr from 'exifr'
import { createWorker, PSM, type Worker } from 'tesseract.js'
import { correctIndonesiaCoordSigns, formatKoordinat, parseKoordinatLoose } from '@/lib/koordinat-utils'

const OCR_MAX_WIDTH = 1800
const INDONESIA_LAT = { min: -12, max: 8 }
const INDONESIA_LNG = { min: 90, max: 145 }

type OcrSource = HTMLCanvasElement | File

function isIndonesiaCoord(lat: number, lng: number): boolean {
    return lat > INDONESIA_LAT.min && lat < INDONESIA_LAT.max && lng > INDONESIA_LNG.min && lng < INDONESIA_LNG.max
}

function formatCoordPair(lat: number, lng: number): string {
    const { lat: correctedLat, lng: correctedLng } = correctIndonesiaCoordSigns(lat, lng)
    return formatKoordinat(correctedLat, correctedLng)
}

export async function getGPSFromExif(file: File): Promise<string | null> {
    try {
        const gps = await exifr.gps(file)
        if (gps?.latitude != null && gps?.longitude != null) {
            return formatCoordPair(gps.latitude, gps.longitude)
        }

        const parsed = await exifr.parse(file, { gps: true })
        if (parsed?.latitude != null && parsed?.longitude != null) {
            return formatCoordPair(parsed.latitude, parsed.longitude)
        }

        return null
    } catch (err) {
        console.error('EXIF Error:', err)
        return null
    }
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const objectUrl = URL.createObjectURL(file)
        img.onload = () => {
            URL.revokeObjectURL(objectUrl)
            resolve(img)
        }
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            reject(new Error('Failed to load image'))
        }
        img.src = objectUrl
    })
}

async function fileToCanvas(file: File, maxWidth = OCR_MAX_WIDTH): Promise<HTMLCanvasElement> {
    const img = await loadImageFromFile(file)
    const scale = img.width > maxWidth ? maxWidth / img.width : 1
    const width = Math.max(1, Math.round(img.width * scale))
    const height = Math.max(1, Math.round(img.height * scale))

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
        throw new Error('Canvas context unavailable')
    }

    canvas.width = width
    canvas.height = height
    ctx.drawImage(img, 0, 0, width, height)
    return canvas
}

function cropRegion(
    source: HTMLCanvasElement,
    region: 'bottom' | 'top',
    percent: number,
): HTMLCanvasElement {
    const cropHeight = Math.max(1, Math.floor(source.height * percent))
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
        throw new Error('Canvas context unavailable')
    }

    canvas.width = source.width
    canvas.height = cropHeight

    const sourceY = region === 'bottom' ? source.height - cropHeight : 0
    ctx.drawImage(
        source,
        0, sourceY, source.width, cropHeight,
        0, 0, source.width, cropHeight,
    )

    return canvas
}

/** Watermark non-GPS Map Camera biasanya di kanan-bawah (hindari inset peta kiri). */
function cropBottomRight(
    source: HTMLCanvasElement,
    widthPercent = 0.55,
    heightPercent = 0.38,
): HTMLCanvasElement {
    const cropWidth = Math.max(1, Math.floor(source.width * widthPercent))
    const cropHeight = Math.max(1, Math.floor(source.height * heightPercent))
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
        throw new Error('Canvas context unavailable')
    }

    canvas.width = cropWidth
    canvas.height = cropHeight

    const sourceX = source.width - cropWidth
    const sourceY = source.height - cropHeight
    ctx.drawImage(
        source,
        sourceX, sourceY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight,
    )

    return canvas
}

function preprocessCanvas(
    source: HTMLCanvasElement,
    mode: 'threshold' | 'threshold-invert' | 'contrast',
): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
        throw new Error('Canvas context unavailable')
    }

    canvas.width = source.width
    canvas.height = source.height
    ctx.drawImage(source, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i] ?? 0
        const g = data[i + 1] ?? 0
        const b = data[i + 2] ?? 0
        const gray = (r + g + b) / 3

        let val = gray
        if (mode === 'threshold') {
            val = gray < 160 ? 0 : 255
        } else if (mode === 'threshold-invert') {
            val = gray > 120 ? 0 : 255
        } else {
            val = Math.min(255, Math.max(0, (gray - 80) * 2.2))
        }

        data[i] = data[i + 1] = data[i + 2] = val
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas
}

export function normalizeOcrText(text: string): string {
    return text
        .replace(/[\u2212\u2013\u2014]/g, '-')
        .replace(/[|[\]()]/g, ' ')
        .replace(/[°º]/g, '°')
        .replace(/1O7/gi, '107')
        .replace(/\bIO7\b/gi, '107')
        .replace(/\bLaf\b/gi, 'Lat')
        .replace(/\bL0ng\b/gi, 'Long')
        .replace(/\bLonq\b/gi, 'Long')
        .replace(/\bLat\b\s*(?![-−])(\d{1,2}\.\d{2,})/gi, 'Lat -$1')
        .replace(/\s+/g, ' ')
        .trim()
}

function parseDecimalWithSuffix(value: string, direction: 'lat' | 'lng'): number | null {
    const parsed = Number.parseFloat(value)
    if (!Number.isFinite(parsed)) {
        return null
    }

    if (direction === 'lat' && parsed > 0 && parsed <= 12) {
        return -parsed
    }

    return parsed
}

/** Contoh: 7.23865417S 107.1541178E (format watermark timestamp/kompas). */
export function parseGarbledLatitude(text: string): number | null {
    const clean = normalizeOcrText(text)

    let m = clean.match(/(\d{1,2}\.\d{4,})\s*S\b/i)
    if (m) {
        return parseDecimalWithSuffix(m[1] ?? '', 'lat')
    }

    m = clean.match(/\b7[\s.]+(\d[\d\s]{7,14})/i)
    if (m) {
        let digits = (m[1] ?? '').replace(/\D/g, '')
        if (digits.startsWith('1')) {
            digits = digits.slice(1)
        }
        if (digits.startsWith('7') && digits.length >= 8) {
            return parseDecimalWithSuffix(`7.${digits.slice(1, 9)}`, 'lat')
        }
        if (digits.length >= 7) {
            return parseDecimalWithSuffix(`7.${digits.slice(0, 8)}`, 'lat')
        }
    }

    m = clean.match(/\b(7\d{7,9})\b/)
    if (m) {
        const digits = (m[1] ?? '').replace(/\D/g, '')
        return parseDecimalWithSuffix(`${digits.slice(0, 1)}.${digits.slice(1, 9)}`, 'lat')
    }

    return null
}

export function parseGarbledLongitude(text: string): number | null {
    const clean = normalizeOcrText(text)

    let m = clean.match(/(\d{2,3}\.\d{4,})\s*E\b/i)
    if (m) {
        return Number.parseFloat(m[1] ?? '')
    }

    m = clean.match(/(?:107|10\s*7)\s*[\]\s.]*(\d{5,7})(?:\s*E\b|\s*[±+]|\s*\+)/i)
    if (m) {
        let fraction = m[1] ?? ''
        if (fraction.length >= 5 && fraction.startsWith('5') && !fraction.startsWith('154')) {
            fraction = `1${fraction}`
        }
        return Number.parseFloat(`107.${fraction}`)
    }

    m = clean.match(/(?:107|10\s*7)\s+(\d{5,7})\s*E\b/i)
    if (m) {
        let fraction = m[1] ?? ''
        if (fraction.length >= 5 && fraction.startsWith('5') && !fraction.startsWith('154')) {
            fraction = `1${fraction}`
        }
        return Number.parseFloat(`107.${fraction}`)
    }

    m = clean.match(/\b0?7\s+(\d{2})\s+(\d{2,4})\s*E\b/i)
    if (m) {
        const partA = m[1] ?? ''
        const partB = m[2] ?? ''
        const merged = partA.startsWith('1') ? `${partA}${partB}` : `1${partA}${partB}`
        return Number.parseFloat(`107.${merged}`)
    }

    return null
}

function parseSuffixStyleCoordinates(text: string): string | null {
    const lat = parseGarbledLatitude(text)
    const lng = parseGarbledLongitude(text)
    if (lat === null || lng === null) {
        return null
    }

    if (!isIndonesiaCoord(lat, lng)) {
        return null
    }

    return formatCoordPair(lat, lng)
}

export function parseCoordinatesFromText(text: string): string | null {
    if (!text) return null

    const clean = normalizeOcrText(text)

    const suffixCoords = parseSuffixStyleCoordinates(clean)
    if (suffixCoords) {
        return suffixCoords
    }

    let m = clean.match(/(?:Lat|Latitude|LS|Koordinat\s*Lat)[^\d-]*(-?\d+\.\d{3,})/i)
    const latCand = m ? Number.parseFloat(m[1] ?? '0') : null

    m = clean.match(/(?:Long|Longitude|Lon|BT|BTG|Koordinat\s*Long)[^\d-]*(-?\d+\.\d{3,})/i)
    const lonCand = m ? Number.parseFloat(m[1] ?? '0') : null

    if (latCand !== null && lonCand !== null && isIndonesiaCoord(latCand, lonCand)) {
        return formatCoordPair(latCand, lonCand)
    }

    m = clean.match(/(-?\d{1,2}\.\d{3,})\s*°?\s*([NS])\s+(-?\d{1,3}\.\d{3,})\s*°?\s*([EW])/i)
    if (m) {
        let lat = Number.parseFloat(m[1] ?? '0')
        const latDir = (m[2] ?? 'S').toUpperCase()
        let lng = Number.parseFloat(m[3] ?? '0')
        const lngDir = (m[4] ?? 'E').toUpperCase()
        if (latDir === 'S' && lat > 0) lat = -lat
        if (lngDir === 'W' && lng > 0) lng = -lng
        if (isIndonesiaCoord(lat, lng)) {
            return formatCoordPair(lat, lng)
        }
    }

    m = clean.match(/(-?\d{1,2}\.\d{4,})\s*[,\s|;]\s*(-?\d{1,3}\.\d{4,})/)
    if (m) {
        const lat = Number.parseFloat(m[1] ?? '0')
        const lng = Number.parseFloat(m[2] ?? '0')
        if (isIndonesiaCoord(lat, lng)) {
            return formatCoordPair(lat, lng)
        }
    }

    m = clean.match(/([NS])?\s*(\d+)[°\s]+(\d+)['′]\s*([\d.]+)["”]?\s*[,;\s]*([EW])?\s*(\d+)[°\s]+(\d+)['′]\s*([\d.]+)["”]?/i)
    if (m) {
        const latD = Number.parseInt(m[2] ?? '0', 10)
        const latM = Number.parseInt(m[3] ?? '0', 10)
        const latS = Number.parseFloat(m[4] ?? '0')
        const latDir = (m[1] || m[5] || 'S').toUpperCase()
        const lat = latD + latM / 60 + latS / 3600
        const finalLat = latDir === 'S' || latDir === 'W' ? -lat : lat

        const lonD = Number.parseInt(m[6] ?? '0', 10)
        const lonM = Number.parseInt(m[7] ?? '0', 10)
        const lonS = Number.parseFloat(m[8] ?? '0')
        const lonDir = (m[5] || m[9] || 'E').toUpperCase()
        const lon = lonD + lonM / 60 + lonS / 3600
        const finalLon = lonDir === 'W' || lonDir === 'S' ? -lon : lon

        if (isIndonesiaCoord(finalLat, finalLon)) {
            return formatCoordPair(finalLat, finalLon)
        }
    }

    const numbers = clean.match(/-?\d+\.\d{3,}/g)
    if (numbers && numbers.length >= 2) {
        for (let i = 0; i < numbers.length - 1; i++) {
            const a = Number.parseFloat(numbers[i] ?? '0')
            const b = Number.parseFloat(numbers[i + 1] ?? '0')
            if (isIndonesiaCoord(a, b)) {
                return formatCoordPair(a, b)
            }
            if (isIndonesiaCoord(b, a)) {
                return formatCoordPair(b, a)
            }
        }
    }

    const concatenated = clean.replace(/\s/g, '')
    const loose = parseKoordinatLoose(concatenated)
    if (loose && isIndonesiaCoord(loose.lat, loose.lng)) {
        return formatCoordPair(loose.lat, loose.lng)
    }

    return null
}

async function recognizeText(
    worker: Worker,
    source: OcrSource,
    pageSegMode: PSM,
): Promise<string> {
    await worker.setParameters({
        tessedit_pageseg_mode: pageSegMode,
    })
    const { data: { text } } = await worker.recognize(source)
    return text ?? ''
}

async function runOcrAttempts(worker: Worker, sources: Array<{ source: OcrSource; psm: PSM }>): Promise<string | null> {
    for (const attempt of sources) {
        try {
            const text = await recognizeText(worker, attempt.source, attempt.psm)
            const coords = parseCoordinatesFromText(text)
            if (coords) return coords
        } catch (err) {
            console.warn('OCR attempt failed:', err)
        }
    }
    return null
}

export async function getGPSFromOCR(file: File): Promise<string | null> {
    let worker: Worker | null = null
    try {
        worker = await createWorker('eng')
        const baseCanvas = await fileToCanvas(file)

        const bottomCrop = cropRegion(baseCanvas, 'bottom', 0.45)
        const bottomRightCrop = cropBottomRight(baseCanvas)
        const topCrop = cropRegion(baseCanvas, 'top', 0.18)

        const attempts: Array<{ source: OcrSource; psm: PSM }> = [
            { source: bottomRightCrop, psm: PSM.SINGLE_BLOCK },
            { source: bottomRightCrop, psm: PSM.SPARSE_TEXT },
            { source: preprocessCanvas(bottomRightCrop, 'threshold-invert'), psm: PSM.SINGLE_BLOCK },
            { source: preprocessCanvas(bottomRightCrop, 'threshold'), psm: PSM.SINGLE_BLOCK },
            { source: preprocessCanvas(bottomCrop, 'threshold-invert'), psm: PSM.SINGLE_BLOCK },
            { source: preprocessCanvas(bottomCrop, 'threshold'), psm: PSM.SINGLE_BLOCK },
            { source: bottomCrop, psm: PSM.SINGLE_BLOCK },
            { source: bottomCrop, psm: PSM.SPARSE_TEXT },
            { source: bottomCrop, psm: PSM.AUTO },
            { source: preprocessCanvas(baseCanvas, 'threshold-invert'), psm: PSM.SINGLE_BLOCK },
            { source: preprocessCanvas(baseCanvas, 'threshold'), psm: PSM.SINGLE_BLOCK },
            { source: topCrop, psm: PSM.SINGLE_BLOCK },
            { source: file, psm: PSM.AUTO },
        ]

        return await runOcrAttempts(worker, attempts)
    } catch (err) {
        console.error('OCR Error:', err)
        return null
    } finally {
        if (worker) {
            try {
                await worker.terminate()
            } catch {
                // ignore
            }
        }
    }
}

export async function extractCoordinates(file: File): Promise<string | null> {
    const exifCoord = await getGPSFromExif(file)
    if (exifCoord) return exifCoord

    return await getGPSFromOCR(file)
}

export async function extractFormattedCoordinates(file: File): Promise<string | null> {
    const raw = await extractCoordinates(file)
    if (!raw) return null

    const parsed = parseKoordinatLoose(raw)
    if (parsed) {
        return formatKoordinat(parsed.lat, parsed.lng)
    }

    return raw.trim()
}