import type { RabParsedItem } from '../types'
import { parseIndonesianNumber } from './parse-indonesian-number'

/**
 * Format rincian RAB (sheet "RAB" pada file RAB SPAM): kolom NO, URAIAN PEKERJAAN, SAT, VOLUME,
 * HARGA SATUAN, dan JUMLAH. Setiap bagian (I, II, III, ...) diakhiri baris SUB TOTAL.
 * Bagian dengan subtotal 0 adalah alternatif yang tidak masuk rekap, sehingga dilewati.
 */

type Kolom = { no: number; uraian: number; sat: number; volume: number; harga: number; jumlah: number; header: number }

// Angka romawi bagian (I sampai XXIX). Huruf seperti A, B, atau C adalah sub-bagian, bukan bagian.
const ROMAWI = /^X{0,2}(IX|IV|V?I{0,3})$/

function teks(cell: unknown): string {
    return cell === null || cell === undefined ? '' : String(cell).replace(/\s+/g, ' ').trim()
}

function angka(cell: unknown): number | null {
    if (typeof cell === 'number') return Number.isFinite(cell) ? cell : null
    const s = teks(cell)
    if (!s || !/\d/.test(s)) return null
    const n = parseIndonesianNumber(s)
    return Number.isFinite(n) ? n : null
}

function cariKolom(rows: unknown[][]): Kolom | null {
    // Pakai header paling bawah: sheet rekap biasanya berada di atas rincian.
    let hasil: Kolom | null = null
    for (let h = 0; h < rows.length; h++) {
        const row = Array.isArray(rows[h]) ? rows[h] : []
        const cells = row.map((c) => teks(c).toUpperCase())
        const cari = (...nama: string[]) => cells.findIndex((c) => nama.includes(c))
        const uraian = cari('URAIAN PEKERJAAN', 'ITEM PEKERJAAN')
        const sat = cari('SAT', 'SATUAN')
        const volume = cari('VOLUME')
        const harga = cari('HARGA', 'HARGA SATUAN')
        const jumlah = cells.findIndex((c) => c === 'JUMLAH' || c.startsWith('JUMLAH HARGA'))
        if (uraian >= 0 && sat >= 0 && volume >= 0 && harga >= 0 && jumlah >= 0) {
            // Header NO bisa muncul dua kali (kolom nomor urut dan kolom penanda bagian); yang dipakai terakhir.
            const no = cells.lastIndexOf('NO')
            hasil = { no: no >= 0 ? no : 0, uraian, sat, volume, harga, jumlah, header: h }
        }
    }
    return hasil
}

/** Apakah baris-baris ini memakai format rincian RAB (header kolom dan minimal satu bagian ber-SUB TOTAL). */
export function looksLikeRabRincian(rows: unknown[][]): boolean {
    const kolom = cariKolom(rows)
    if (!kolom) return false
    return rows.slice(kolom.header + 1).some((row) => teks(row?.[kolom.uraian]).toUpperCase().startsWith('SUB TOTAL'))
}

export type RabRincianHasil = {
    items: RabParsedItem[]
    warnings: string[]
    /** True bila setiap bagian punya SUB TOTAL dan jumlah itemnya cocok. Hanya hasil lengkap yang dipakai. */
    lengkap: boolean
}

/** Membaca rincian RAB. Item hanya diambil dari bagian yang subtotalnya lebih dari nol. */
export function parseRabRincian(rows: unknown[][]): RabRincianHasil {
    const warnings: string[] = []
    const kolom = cariKolom(rows)
    if (!kolom) return { items: [], warnings, lengkap: false }

    const items: RabParsedItem[] = []
    let lengkap = true
    let bagian: { judul: string; items: RabParsedItem[] } | null = null

    const tutupBagian = (subtotal: number | null) => {
        if (!bagian) return
        const jumlahItem = bagian.items.reduce((total, item) => total + item.volume * item.hargaSatuan, 0)
        if (subtotal === null) {
            if (bagian.items.length > 0) lengkap = false
            // Bagian tanpa baris SUB TOTAL tidak bisa dicocokkan, jadi itemnya tetap dipakai dengan peringatan.
            if (bagian.items.length > 0) {
                warnings.push(`Bagian "${bagian.judul}" tidak punya SUB TOTAL, jumlahnya tidak bisa dicocokkan.`)
                items.push(...bagian.items)
            }
        } else if (subtotal > 0) {
            items.push(...bagian.items)
            if (Math.abs(jumlahItem - subtotal) > 1) {
                lengkap = false
                warnings.push(`Bagian "${bagian.judul}": jumlah item ${Math.round(jumlahItem)} tidak sama dengan subtotal ${Math.round(subtotal)}.`)
            }
        } else if (bagian.items.length > 0) {
            warnings.push(`Bagian "${bagian.judul}" dilewati karena subtotalnya 0 (tidak masuk rekap).`)
        }
        bagian = null
    }

    for (const row of rows.slice(kolom.header + 1)) {
        const cells = Array.isArray(row) ? row : []
        const no = teks(cells[kolom.no])
        const uraianC = teks(cells[kolom.uraian])
        const uraianD = teks(cells[kolom.uraian + 1])
        const uraianUpper = uraianC.toUpperCase()

        if (uraianUpper.startsWith('SUB TOTAL') || uraianUpper === 'JUMLAH') {
            if (bagian) tutupBagian(angka(cells[kolom.jumlah]) ?? 0)
            continue
        }

        if (no && ROMAWI.test(no) && uraianC) {
            tutupBagian(null)
            bagian = { judul: `${no}. ${uraianC}`, items: [] }
            continue
        }
        if (!bagian) continue

        const satuan = teks(cells[kolom.sat])
        const volume = angka(cells[kolom.volume])
        const harga = angka(cells[kolom.harga])
        if (!satuan || volume === null || harga === null) continue

        const uraian = uraianD || uraianC
        if (!uraian) continue
        bagian.items.push({ grup: bagian.judul, uraian, satuan, volume, hargaSatuan: harga })
    }
    tutupBagian(null)

    return { items, warnings, lengkap }
}
