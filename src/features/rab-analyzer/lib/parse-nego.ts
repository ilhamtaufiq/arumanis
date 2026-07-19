/**
 * Parser format "Hasil Nego" (sheet Negosiasi).
 *
 * Struktur tipikal:
 * - Judul HASIL NEGOSIASI
 * - Header: No. | Uraian Pekerjaan | Satuan | Volume | HPS | Penawaran | Negosiasi
 * - Harga yang dipakai: kolom Negosiasi → Harga Satuan (sebelum PPN di progress)
 */

import * as XLSX from 'xlsx'
import type { RabParsedItem } from '../types'
import { parseIndonesianNumber } from './parse-indonesian-number'

function text(value: unknown): string {
    if (value === null || value === undefined) return ''
    return String(value).replace(/\s+/g, ' ').trim()
}

function isSummary(value: string): boolean {
    const n = value.toLowerCase()
    return (
        n.includes('sub total')
        || n.includes('sub jumlah')
        || n === 'jumlah'
        || n.includes('jumlah total')
        || n.includes('ppn')
        || n.includes('dibulatkan')
        || n.includes('dalam huruf')
        || n.includes('total harga')
        || n.includes('terbilang')
    )
}

const ROMAN = /^(?:XIV|XIII|XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)\.?$/i
const LETTER = /^[a-zA-Z]\.?$/

export type NegoColumnLayout = {
    no: number
    desc: number
    satuan: number
    volume: number
    /** Harga satuan Negosiasi (bukan HPS / penawaran) */
    hargaNego: number
}

const DEFAULT_NEGO: NegoColumnLayout = {
    no: 0,
    desc: 1,
    satuan: 3,
    volume: 4,
    // Kolom: 5-6 HPS, 7-8 Penawaran, 9-10 Negosiasi
    hargaNego: 9,
}

function looksLikeNegoTitle(rows: unknown[][]): boolean {
    return rows.slice(0, 8).some((row) => {
        const joined = (Array.isArray(row) ? row : [])
            .map((c) => text(c).toLowerCase())
            .join(' ')
        return (
            joined.includes('hasil negosiasi')
            || joined.includes('hasil nego')
            || (joined.includes('negosiasi') && joined.includes('hps'))
        )
    })
}

function isNegoHeaderRow(cells: unknown[]): boolean {
    const joined = cells.map((c) => text(c).toLowerCase()).join(' ')
    return (
        (joined.includes('uraian') || joined.includes('item'))
        && joined.includes('satuan')
        && joined.includes('volume')
        && (joined.includes('harga') || joined.includes('nego'))
    )
}

function isNegoMetaRow(cells: unknown[]): boolean {
    const joined = cells.map((c) => text(c).toLowerCase()).join(' ')
    if (!joined.trim()) return false
    return (
        joined.includes('( rp')
        || joined.includes('termasuk pajak')
        || (joined.includes('satuan') && joined.includes('jumlah harga') && !isNegoHeaderRow(cells))
        || joined === 'hps'
        || joined.includes('penawaran')
        || (joined.includes('negosiasi') && !joined.includes('uraian'))
    )
}

/**
 * Deteksi kolom: prefer harga di blok Negosiasi (paling kanan yang valid).
 * Header 3 baris sering: row "HPS | Penawaran | Negosiasi" lalu "Harga | Jumlah".
 */
export function detectNegoColumns(headerCells: unknown[]): NegoColumnLayout {
    const labels = headerCells.map((cell, index) => ({
        index,
        text: text(cell).toLowerCase(),
    }))

    const desc =
        labels.find(
            (l) =>
                (l.text.includes('uraian') && l.text.includes('pekerjaan'))
                || (l.text.includes('item') && l.text.includes('pekerjaan')),
        )?.index ?? DEFAULT_NEGO.desc

    const satuan =
        labels.find((l) => l.text === 'satuan' || l.text === 'sat')?.index
        ?? labels.find((l) => l.text.includes('satuan') && !l.text.includes('harga'))
            ?.index
        ?? DEFAULT_NEGO.satuan

    const volume =
        labels.find((l) => l.text === 'volume' || l.text.includes('volume'))?.index
        ?? DEFAULT_NEGO.volume

    // Cari semua "harga" — ambil yang paling kanan (blok Negosiasi)
    const hargaCandidates = labels
        .filter(
            (l) =>
                l.text === 'harga'
                || l.text.includes('harga satuan')
                || (l.text === 'harga' && !l.text.includes('jumlah')),
        )
        .map((l) => l.index)

    let hargaNego = DEFAULT_NEGO.hargaNego
    if (hargaCandidates.length > 0) {
        // Prefer index >= 8 (setelah HPS+Penawaran), else last candidate
        const preferred = hargaCandidates.filter((i) => i >= 8)
        hargaNego =
            preferred.length > 0
                ? preferred[preferred.length - 1]
                : hargaCandidates[hargaCandidates.length - 1]
    }

    const no =
        labels.find((l) => l.text === 'no' || l.text === 'no.' || l.text === 'no')
            ?.index ?? 0

    return { no, desc, satuan, volume, hargaNego }
}

function isGroupHeaderRow(
    cells: unknown[],
    layout: NegoColumnLayout,
): { isGroup: boolean; label: string } {
    const marker = text(cells[layout.no])
    const desc = text(cells[layout.desc]) || text(cells[1])
    const satuan = text(cells[layout.satuan])
    const volume = parseIndonesianNumber(cells[layout.volume])
    const harga = parseIndonesianNumber(cells[layout.hargaNego])

    // Roman main group: "I." + title, no volume/harga
    if (ROMAN.test(marker) && desc && volume <= 0 && harga <= 0) {
        return { isGroup: true, label: `${marker.replace(/\.$/, '')}. ${desc}`.trim() }
    }

    // Section without marker but title-only (no satuan/volume/harga)
    if (!satuan && volume <= 0 && harga <= 0 && desc && !isSummary(desc)) {
        // letter subgroup "a" / "b"
        if (LETTER.test(marker) && desc) {
            return {
                isGroup: true,
                label: `${marker.replace(/\.$/, '')}. ${desc}`.trim(),
            }
        }
        // plain section like "Pekerjaan Persiapan", "SMKK"
        if (!marker && looksLikeSectionTitle(desc)) {
            return { isGroup: true, label: desc }
        }
        if (marker && looksLikeSectionTitle(desc) && volume <= 0) {
            return { isGroup: true, label: desc }
        }
    }

    return { isGroup: false, label: '' }
}

function looksLikeSectionTitle(value: string): boolean {
    if (!value || value.length > 100) return false
    if (isSummary(value)) return false
    // Title-like: starts capital / all caps words, few numbers
    if (/^\d+(\.\d+)*$/.test(value)) return false
    return true
}

/**
 * Parse baris sheet Hasil Nego → item progress (harga = Negosiasi).
 */
export function parseNegoRows(rows: unknown[][]): RabParsedItem[] {
    if (!rows.length) return []

    let layout = DEFAULT_NEGO
    let currentGroup = 'Tanpa Kategori'
    const items: RabParsedItem[] = []
    let headerSeen = false

    for (const row of rows) {
        const cells = Array.isArray(row) ? row : []
        if (cells.every((c) => !text(c))) continue

        const joined = cells.map((c) => text(c).toLowerCase()).join(' ')

        if (isNegoHeaderRow(cells)) {
            layout = detectNegoColumns(cells)
            headerSeen = true
            continue
        }

        // Meta identitas hanya sebelum header tabel
        if (!headerSeen) {
            if (
                joined.includes('hasil negosiasi')
                || joined.includes('hasil nego')
                || joined.includes('kegiatan')
                || joined.includes('sub kegiatan')
                || joined.includes('sumber dana')
                || joined.includes('l o k a s i')
                || (joined.includes('lokasi') && !joined.includes('uraian'))
                || (joined.includes('nomor') && joined.includes('/'))
                || joined.includes('pekerjaan') && joined.includes('spam')
            ) {
                continue
            }
            // Belum header: skip baris non-data
            if (isNegoMetaRow(cells)) continue
            continue
        }

        if (isNegoMetaRow(cells)) continue
        if (isSummary(text(cells[layout.desc])) || isSummary(text(cells[1]))) continue

        const groupInfo = isGroupHeaderRow(cells, layout)
        if (groupInfo.isGroup) {
            currentGroup = groupInfo.label
            continue
        }

        const desc =
            text(cells[layout.desc])
            || text(cells[1])
            || text(cells[2])
        const satuan = text(cells[layout.satuan])
        const volume = parseIndonesianNumber(cells[layout.volume])
        // Prefer nego; fallback penawaran (7) then HPS (5)
        let hargaSatuan = parseIndonesianNumber(cells[layout.hargaNego])
        if (hargaSatuan <= 0) {
            hargaSatuan = parseIndonesianNumber(cells[7])
        }
        if (hargaSatuan <= 0) {
            hargaSatuan = parseIndonesianNumber(cells[5])
        }

        if (!desc || isSummary(desc)) continue
        if (!satuan || volume <= 0 || hargaSatuan <= 0) continue
        // Satuan shouldn't be pure number
        if (/^\d+([.,]\d+)?$/.test(satuan)) continue

        items.push({
            grup: currentGroup,
            uraian: desc.replace(/^["']+|["']+$/g, '').trim(),
            satuan,
            volume,
            hargaSatuan,
        })
    }

    return items
}

export function isNegoWorkbook(workbook: XLSX.WorkBook): boolean {
    if (workbook.SheetNames.some((n) => /nego/i.test(n))) return true
    // Judul di baris awal sheet pertama
    const first = workbook.SheetNames[0]
    if (!first) return false
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[first], {
        header: 1,
        defval: null,
    }) as unknown[][]
    return looksLikeNegoTitle(rows)
}

export function parseNegoWorkbook(workbook: XLSX.WorkBook): RabParsedItem[] {
    const sheetName =
        workbook.SheetNames.find((n) => /^nego$/i.test(n))
        ?? workbook.SheetNames.find((n) => /nego/i.test(n))
        ?? workbook.SheetNames[0]

    if (!sheetName) return []

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
        defval: null,
    }) as unknown[][]

    return parseNegoRows(rows)
}
