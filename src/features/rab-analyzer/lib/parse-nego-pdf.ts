/**
 * Import Hasil Nego dari PDF (Lampiran BA Klarifikasi / Negosiasi).
 * Teks diekstrak via pdfjs-dist, lalu diparse ke item progress.
 *
 * Format baris tipikal:
 *   Uraian  Satuan  Volume  HargaPenawaran  Pajak%  PajakRp  Total  HargaNego  Pajak%  PajakRp  Total
 */

import type { RabParsedItem } from '../types'
import { parseIndonesianNumber } from './parse-indonesian-number'

async function loadPdfJs() {
    // Browser (Vite): worker via ?url. Node/tests: legacy build tanpa worker URL Vite.
    if (typeof window !== 'undefined') {
        const pdfjsLib = await import('pdfjs-dist')
        try {
            const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
            pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default
        } catch {
            // worker optional in some environments
        }
        return pdfjsLib
    }
    return import('pdfjs-dist/legacy/build/pdf.mjs')
}

const UNIT_HINTS =
    /^(ls|ltr|bh|set|unit|m|m2|m²|m3|m³|org|psg|kg|titik|paket|titk|buah|glg|batang|rol|dus|unit\.?)$/i

const NUMBER_TOKEN = /(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?/g

function normalizeUnit(raw: string): string {
    return raw
        .trim()
        .replace(/m2/gi, 'm²')
        .replace(/m3/gi, 'm³')
        .replace(/²/g, '²')
        .replace(/³/g, '³')
}

function isValidUnit(raw: string): boolean {
    if (!raw) return false
    // tolak sisa pecahan volume yang putus di PDF: ",84" / "0,84" sebagai unit
    if (/^[\d,.\s]+$/.test(raw)) return false
    if (raw.startsWith(',') || raw.startsWith('.')) return false
    const u = normalizeUnit(raw)
    if (UNIT_HINTS.test(u)) return true
    // unit pendek huruf saja (1–6)
    return /^[A-Za-zµ°]{1,6}$/.test(raw)
}

function isSummaryLine(line: string): boolean {
    const n = line.toLowerCase()
    return (
        n.includes('jumlah')
        || n.includes('sub total')
        || n.includes('ppn')
        || n.includes('dibulatkan')
        || n.includes('terbilang')
        || n.includes('total harga')
        || n.includes('harga penawaran')
        || n.includes('harga negosiasi')
        || n.includes('jenis barang')
        || n.includes('lampiran')
        || n.includes('nomor:')
        || n.includes('paket pekerjaan')
        || n.includes('pajak (%)')
    )
}

function looksLikeGroupTitle(line: string): boolean {
    if (!line || line.length > 140) return false
    if (isSummaryLine(line)) return false
    const nums = line.match(NUMBER_TOKEN) || []
    if (nums.length >= 3) return false
    const letters = line.replace(/[^A-Za-zÀ-ÿ]/g, '')
    if (letters.length < 4) return false
    // Judul seksi sering FULL CAPS atau diawali "Pekerjaan"
    return true
}

/**
 * Ambil teks per baris dari PDF (urutan atas→bawah per halaman).
 */
export async function extractPdfTextLines(file: ArrayBuffer | Uint8Array): Promise<string[]> {
    const pdfjsLib = await loadPdfJs()
    const data = file instanceof Uint8Array ? file : new Uint8Array(file)
    const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise
    const lines: string[] = []

    for (let p = 1; p <= doc.numPages; p += 1) {
        const page = await doc.getPage(p)
        const content = await page.getTextContent()
        // Bucket by rounded Y; also merge near-Y rows (PDF often splits one logical line)
        const byY = new Map<number, Array<{ x: number; str: string }>>()

        for (const item of content.items) {
            if (!('str' in item) || !item.str?.trim()) continue
            const transform = 'transform' in item ? (item.transform as number[]) : null
            if (!transform || transform.length < 6) continue
            const y = Math.round(transform[5])
            const x = transform[4]
            // Snap to nearest existing bucket within 2pt to rejoin split lines
            let key = y
            for (const existing of byY.keys()) {
                if (Math.abs(existing - y) <= 2) {
                    key = existing
                    break
                }
            }
            const bucket = byY.get(key) ?? []
            bucket.push({ x, str: item.str })
            byY.set(key, bucket)
        }

        const sortedY = [...byY.keys()].sort((a, b) => b - a)
        for (const y of sortedY) {
            const parts = (byY.get(y) ?? []).sort((a, b) => a.x - b.x)
            const line = parts
                .map((p) => p.str)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim()
            if (line) lines.push(line)
        }
    }

    return lines
}

const ID_NUMBER = /^(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?$/
/** Volume pecahan yang terpotong di PDF: ",84" → 0,84 */
const LEADING_COMMA_NUM = /^,\d+$/

function isNumberToken(t: string): boolean {
    return ID_NUMBER.test(t) || LEADING_COMMA_NUM.test(t)
}

function parseNumToken(t: string): number {
    if (LEADING_COMMA_NUM.test(t)) {
        return parseIndonesianNumber(`0${t}`)
    }
    return parseIndonesianNumber(t)
}

/**
 * Parse satu baris item PDF Nego.
 * Return null jika bukan baris item.
 */
export function parseNegoPdfItemLine(
    line: string,
    currentGroup: string,
): RabParsedItem | null {
    if (!line || isSummaryLine(line)) return null

    const tokens = line.split(/\s+/).filter(Boolean)
    if (tokens.length < 5) return null

    // Kumpulkan token angka dari belakang (termasuk ",84")
    const numberTokens: string[] = []
    let i = tokens.length - 1
    while (i >= 0 && numberTokens.length < 12) {
        const t = tokens[i]
        if (isNumberToken(t)) {
            numberTokens.unshift(t)
            i -= 1
            continue
        }
        break
    }

    // Ideal: volume + 4 penawaran + 4 nego = 9 angka
    if (numberTokens.length < 9) {
        return null
    }

    const unitToken = tokens[i]
    if (!unitToken || !isValidUnit(unitToken)) return null

    const descTokens = tokens.slice(0, i)
    let desc = descTokens.join(' ').trim()
    // buang nomor urut di depan deskripsi ("1 Pembuatan…")
    desc = desc.replace(/^\d{1,3}[.)]?\s+/, '').trim()
    if (!desc || desc.length < 2) return null

    // [0]=volume [1..4]=penawaran [5]=negoHarga [6]=pajak% …
    const nums = numberTokens.map(parseNumToken)
    const volume = nums[0]
    const pajakNego = nums[6]
    const hargaNego = nums[5]
    const totalNego = nums[8]

    if (volume <= 0 || hargaNego <= 0) return null
    if (pajakNego > 0 && (pajakNego < 1 || pajakNego > 30)) return null
    if (volume >= 100_000) return null
    if (hargaNego < 10) return null
    if (hargaNego === 11 || hargaNego === 10 || hargaNego === 12) return null

    // Validasi: total ≈ volume * harga * 1.11 (toleransi 3%)
    if (totalNego > 0 && volume > 0) {
        const expected = volume * hargaNego * 1.11
        const ratio = totalNego / expected
        if (ratio < 0.9 || ratio > 1.15) {
            // kadang total di PDF dibulatkan beda; longgarkan sedikit
            // jika sangat jauh, kemungkinan parse salah
            if (ratio < 0.5 || ratio > 2) return null
        }
    }

    return {
        grup: currentGroup || 'Tanpa Kategori',
        uraian: desc.replace(/^["'\-–—]+\s*/, '').trim(),
        satuan: normalizeUnit(unitToken),
        volume,
        hargaSatuan: hargaNego,
    }
}

/**
 * Gabung baris PDF yang terpotong (deskripsi di baris 1, angka di baris 2).
 */
export function coalesceNegoPdfLines(lines: string[]): string[] {
    const raw = lines.map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean)
    const out: string[] = []

    for (const line of raw) {
        if (out.length === 0) {
            out.push(line)
            continue
        }
        const prev = out[out.length - 1]
        const prevOk = parseNegoPdfItemLine(prev, 'g') !== null
        const curOk = parseNegoPdfItemLine(line, 'g') !== null

        // Jangan gabung judul seksi (PEKERJAAN PERSIAPAN, dll.) ke baris item
        if (
            !prevOk
            && !isSummaryLine(prev)
            && !looksLikeGroupTitle(prev)
        ) {
            const merged = `${prev} ${line}`
            if (parseNegoPdfItemLine(merged, 'g')) {
                out[out.length - 1] = merged
                continue
            }
        }

        // lanjutan potongan di tengah deskripsi (bukan judul grup)
        if (
            !curOk
            && !prevOk
            && !isSummaryLine(line)
            && !looksLikeGroupTitle(line)
            && !looksLikeGroupTitle(prev)
        ) {
            const merged = `${prev} ${line}`
            if (parseNegoPdfItemLine(merged, 'g')) {
                out[out.length - 1] = merged
                continue
            }
            // simpan merge sementara untuk baris berikutnya
            if (
                /^(siap |penutup|campuran|,|m2 |m² |- |dll)/i.test(line)
                || (line.length < 40 && !/^[A-Z][A-Z\s]{8,}$/.test(line))
            ) {
                out[out.length - 1] = `${prev} ${line}`
                continue
            }
        }

        out.push(line)
    }

    return out
}

/** Ambil TOTAL NILAI NEGOSIASI dari footer PDF (termasuk PPN). */
export function extractPdfNegoGrandTotal(lines: string[]): number | null {
    for (const line of lines) {
        const m = line.match(
            /TOTAL\s+NILAI\s+NEGOSIASI\s+([\d.]+,\d+)/i,
        )
        if (m) {
            const n = parseIndonesianNumber(m[1])
            return n > 0 ? n : null
        }
    }
    return null
}

export type NegoPdfParseResult = {
    items: RabParsedItem[]
    /** Total nilai negosiasi di PDF (termasuk PPN), jika terbaca */
    pdfGrandTotal: number | null
    /** Grand total impor (volume × harga × 1,11) */
    importGrandTotal: number
}

/**
 * Parse daftar baris teks PDF → item Nego.
 */
export function parseNegoPdfLines(lines: string[]): RabParsedItem[] {
    return parseNegoPdfLinesDetailed(lines).items
}

export function parseNegoPdfLinesDetailed(lines: string[]): NegoPdfParseResult {
    const coalesced = coalesceNegoPdfLines(lines)
    const pdfGrandTotal = extractPdfNegoGrandTotal(lines)

    let currentGroup = 'Tanpa Kategori'
    const items: RabParsedItem[] = []

    for (const line of coalesced) {
        if (!line) continue
        if (isSummaryLine(line)) continue

        const item = parseNegoPdfItemLine(line, currentGroup)
        if (item) {
            items.push(item)
            continue
        }

        if (looksLikeGroupTitle(line)) {
            const lower = line.toLowerCase()
            if (
                lower.includes('lampiran')
                || lower.includes('nomor')
                || lower.includes('paket pekerjaan')
                || lower.includes('satuan volume')
                || lower.includes('menyetujui')
                || lower.includes('pejabat')
            ) {
                continue
            }
            currentGroup = line
        }
    }

    const importGrandTotal = items.reduce(
        (sum, it) => sum + it.volume * it.hargaSatuan * 1.11,
        0,
    )

    return { items, pdfGrandTotal, importGrandTotal }
}

/**
 * Ekstrak + parse file PDF Hasil Nego.
 */
export async function parseNegoPdfFile(
    file: File | ArrayBuffer | Uint8Array,
): Promise<NegoPdfParseResult> {
    let data: ArrayBuffer | Uint8Array
    if (file instanceof File) {
        data = await file.arrayBuffer()
    } else {
        data = file
    }
    const lines = await extractPdfTextLines(data)
    return parseNegoPdfLinesDetailed(lines)
}
