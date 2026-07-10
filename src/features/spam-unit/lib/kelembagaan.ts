import * as XLSX from 'xlsx'
import type { UnitSpam } from '../types'
import { SPAM_ACCUMULATION_START_TAHUN, SPAM_BASELINE_CAP_TAHUN } from './baseline'

/** Baris pemantauan kelembagaan — mirror sheet "KELEMBAGAN SPAM POKMAS". */
export interface KelembagaanRow {
    id: number
    no: number
    kecamatan: string
    desa: string
    tahun_pembangunan: string
    sumber_dana: string
    program: string
    pengelola: string
    /** true jika nama POKMAS hanya placeholder (belum diisi di DB). */
    pengelola_is_fallback?: boolean
    perdes: string
    kepala: string
    bendahara: string
    sekretaris: string
    kap_mata_air: string
    gravitasi_pompa: string
    kap_air_tanah: string
    kap_lain: string
    tarif_dasar_hukum: string
    iuran_nominal: string
    pendapatan_bulan: string
    biaya_operasional: string
    jumlah_sr: number
    jumlah_kk: number
    jumlah_jiwa: number
    is_simspam: boolean
    unit_name: string
    capaian_tahun: string
}

/** Nama sheet persis seperti workbook resmi (ejaan asli). */
export const KELEMBAGAAN_SHEET_NAME = 'KELEMBAGAN SPAM POKMAS'

/** Jumlah kolom data A–V (22). */
export const KELEMBAGAAN_COL_COUNT = 22

function dash(value?: string | null): string {
    const v = `${value ?? ''}`.trim()
    return v && v !== '-' ? v : '-'
}

/** Untuk sel data: angka murni diekspor sebagai number, selain itu string (atau '-'). */
function cellValue(value: string | number | null | undefined): string | number {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : '-'
    }
    const v = `${value}`.trim()
    if (!v || v === '-') return '-'
    // "7,5" → 7.5; "1.500.000" biarkan string
    const normalized = v.replace(',', '.')
    if (/^-?\d+(\.\d+)?$/.test(normalized)) {
        const n = Number(normalized)
        if (Number.isFinite(n)) return n
    }
    return v
}

function normalizeYearToken(raw: string): string | null {
    const t = raw.trim()
    if (!t || t === '-') return null
    // Ambil 4 digit tahun jika ada (mis. "TA 2024")
    const m = t.match(/(19|20)\d{2}/)
    return m ? m[0] : t
}

/**
 * Tahun pembangunan untuk tampilan/export.
 * Prioritas: field unit (bisa multi "2024, 2025") → gabungan tahun achievement + budget + pekerjaan.
 */
export function resolveTahunPembangunan(unit: UnitSpam): string {
    const explicit = `${unit.tahun_pembangunan ?? ''}`.trim()
    if (explicit && explicit !== '-') {
        const parts = explicit
            .split(/[,;/|]+/)
            .map((p) => normalizeYearToken(p))
            .filter((p): p is string => Boolean(p))
        if (parts.length > 0) {
            return [...new Set(parts)].sort().join(', ')
        }
        return explicit
    }

    const years = new Set<string>()
    for (const a of unit.achievements ?? []) {
        const y = normalizeYearToken(String(a.tahun ?? ''))
        if (y) years.add(y)
    }
    for (const b of unit.budgets ?? []) {
        const y = normalizeYearToken(String(b.tahun ?? ''))
        if (y) years.add(y)
    }
    for (const p of unit.pekerjaan ?? []) {
        const y = normalizeYearToken(String(p.tahun_anggaran ?? ''))
        if (y) years.add(y)
    }

    const sorted = [...years].sort()
    return sorted.length > 0 ? sorted.join(', ') : '-'
}

export function pickCapaian(unit: UnitSpam, tahun?: string) {
    const list = unit.achievements ?? []
    if (list.length === 0) {
        return { sr: 0, kk: 0, jiwa: 0, bjpKk: 0, bjpJiwa: 0, tahunLabel: tahun || '-' }
    }
    if (tahun) {
        const match = list.find((a) => String(a.tahun) === String(tahun))
        return {
            sr: match?.jumlah_sr ?? 0,
            kk: match?.jumlah_kk ?? 0,
            jiwa: match?.jumlah_jiwa ?? 0,
            bjpKk: match?.jumlah_bjp_kk ?? 0,
            bjpJiwa: match?.jumlah_bjp_jiwa ?? 0,
            tahunLabel: tahun,
        }
    }
    // Snapshot tahun terbaru (capaian kelembagaan per unit)
    const sorted = [...list].sort((a, b) => String(b.tahun).localeCompare(String(a.tahun)))
    const latest = sorted[0]
    return {
        sr: latest?.jumlah_sr ?? 0,
        kk: latest?.jumlah_kk ?? 0,
        jiwa: latest?.jumlah_jiwa ?? 0,
        bjpKk: latest?.jumlah_bjp_kk ?? 0,
        bjpJiwa: latest?.jumlah_bjp_jiwa ?? 0,
        tahunLabel: latest?.tahun ?? '-',
    }
}

/**
 * Capaian untuk sheet SPM — selaras tab Capaian SPM / wilayah:
 * - filter tahun → baris tahun itu
 * - tanpa filter → jumlah achievement di scope (≤ baseline cap ATAU ≥ accumulation start)
 */
export function pickCapaianForSpm(unit: UnitSpam, tahun?: string) {
    const list = unit.achievements ?? []
    if (list.length === 0) {
        return { sr: 0, kk: 0, jiwa: 0, bjpKk: 0, bjpJiwa: 0, tahunLabel: tahun || '-' }
    }
    if (tahun) {
        return pickCapaian(unit, tahun)
    }

    const scoped = list.filter((a) => {
        const y = String(a.tahun ?? '')
        return y <= SPAM_BASELINE_CAP_TAHUN || y >= SPAM_ACCUMULATION_START_TAHUN
    })
    const source = scoped.length > 0 ? scoped : list
    const totals = source.reduce(
        (acc, a) => ({
            sr: acc.sr + (a.jumlah_sr ?? 0),
            kk: acc.kk + (a.jumlah_kk ?? 0),
            jiwa: acc.jiwa + (a.jumlah_jiwa ?? 0),
            bjpKk: acc.bjpKk + (a.jumlah_bjp_kk ?? 0),
            bjpJiwa: acc.bjpJiwa + (a.jumlah_bjp_jiwa ?? 0),
        }),
        { sr: 0, kk: 0, jiwa: 0, bjpKk: 0, bjpJiwa: 0 },
    )
    return {
        ...totals,
        tahunLabel: `Akumulasi s/d ${SPAM_BASELINE_CAP_TAHUN} + ${SPAM_ACCUMULATION_START_TAHUN}+`,
    }
}

/** Total resmi dari endpoint /spam-units/stats (tab Capaian SPM). */
export interface SpmOfficialTotals {
    target_kk: number
    jp_kk: number
    total_bjp_kk: number
    coverage_percentage: number
    /** Jumlah unit / KPSPAM (opsional, untuk kolom H). */
    unit_count?: number
}

/**
 * Nama POKMAS untuk tampilan — selaras Master Unit SPAM / tabel wilayah.
 * Jika `pengelola.pokmas` kosong di DB, master menampilkan placeholder
 * `KPSPAM {DESA} {KECAMATAN}` (bukan data tersimpan).
 */
export function resolvePokmasDisplay(unit: UnitSpam): {
    value: string
    /** true = placeholder UI, field pokmas di DB kosong */
    isFallback: boolean
} {
    const real = `${unit.pengelola?.pokmas ?? ''}`.trim()
    if (real && real !== '-') {
        return { value: real, isFallback: false }
    }
    const desa = (unit.desa?.n_desa || unit.desa?.nama_desa || '').trim()
    const kec = (
        unit.desa?.kecamatan?.n_kec ||
        unit.desa?.kecamatan?.nama_kecamatan ||
        ''
    ).trim()
    if (!desa && !kec) {
        return { value: '-', isFallback: true }
    }
    const parts = ['KPSPAM']
    if (desa) parts.push(desa.toUpperCase())
    if (kec) parts.push(kec.toUpperCase())
    return { value: parts.join(' '), isFallback: true }
}

/**
 * Program pembangunan: prioritas dari pekerjaan tertaut → tbl_kegiatan.nama_sub_kegiatan.
 * Beberapa sub kegiatan digabung koma; fallback field unit.program manual.
 */
export function resolveProgramDisplay(unit: UnitSpam): string {
    const fromLinks = new Set<string>()
    for (const p of unit.pekerjaan ?? []) {
        const sub = `${p.kegiatan?.nama_sub_kegiatan ?? ''}`.trim()
        if (sub && sub !== '-') {
            fromLinks.add(sub)
            continue
        }
        // Fallback ringkas bila nama_sub_kegiatan kosong
        const kegiatan = `${p.kegiatan?.nama_kegiatan ?? ''}`.trim()
        if (kegiatan && kegiatan !== '-') {
            fromLinks.add(kegiatan)
        }
    }
    if (fromLinks.size > 0) {
        return [...fromLinks].join(', ')
    }
    return dash(unit.program)
}

export function mapUnitToKelembagaanRow(unit: UnitSpam, no: number, tahun?: string): KelembagaanRow {
    const capaian = pickCapaian(unit, tahun)
    const sumberDana =
        unit.sumber_dana ||
        unit.pekerjaan?.find((p) => p.kegiatan?.sumber_dana)?.kegiatan?.sumber_dana ||
        unit.budgets?.[0]?.sumber_dana ||
        '-'
    const pokmas = resolvePokmasDisplay(unit)

    return {
        id: unit.id,
        no,
        kecamatan: unit.desa?.kecamatan?.n_kec || unit.desa?.kecamatan?.nama_kecamatan || '-',
        desa: unit.desa?.n_desa || unit.desa?.nama_desa || '-',
        tahun_pembangunan: resolveTahunPembangunan(unit),
        sumber_dana: dash(sumberDana),
        program: resolveProgramDisplay(unit),
        // Tampilkan sama seperti master; kelengkapan tetap cek is_pokmas_fallback
        pengelola: pokmas.value,
        pengelola_is_fallback: pokmas.isFallback,
        perdes: dash(unit.pengelola?.perdes),
        kepala: dash(unit.pengelola?.kepala),
        bendahara: dash(unit.pengelola?.bendahara),
        sekretaris: dash(unit.pengelola?.sekretaris),
        kap_mata_air: dash(unit.sumber_mata_air_kap),
        gravitasi_pompa: dash(unit.sistem_layanan),
        kap_air_tanah: dash(unit.sumber_air_tanah_kap),
        kap_lain: dash(unit.lain_lain_kap),
        tarif_dasar_hukum: dash(unit.tarif_dasar_hukum),
        iuran_nominal: dash(unit.iuran_nominal),
        pendapatan_bulan: dash(unit.pendapatan_bulan),
        biaya_operasional: dash(unit.biaya_operasional),
        jumlah_sr: capaian.sr,
        jumlah_kk: capaian.kk,
        jumlah_jiwa: capaian.jiwa,
        is_simspam: Boolean(unit.is_simspam),
        unit_name: unit.name || `SPAM ${unit.desa?.n_desa || unit.id}`,
        capaian_tahun: capaian.tahunLabel,
    }
}

/** Header flat (UI/legacy) — urutan kolom data A–V workbook. */
export const KELEMBAGAAN_EXPORT_HEADERS = [
    'No.',
    'LOKASI KECAMATAN',
    'DESA/ KELURAHAN',
    'TAHUN PEMBANGUNAN',
    'SUMBER DANA',
    'PROGRAM PEMBANGUNAN',
    'Pengelola',
    'Perdes Pembentukan Pokmas',
    'Kepala',
    'Bendahara',
    'Sekretaris',
    'Kap.L/det',
    'Gravitasi/Pompa',
    'Sumber air tanah Kap.L/det',
    'Lain-lain (Kap.L/det)',
    'Dasar Hukum',
    'Besarnya Iuran',
    'Pendapatan rata2/bulan (Rp)',
    'Biaya Operasional/Bulan (Rp)',
    'JUMLAH SR (UNIT)',
    'Jumlah KK Terlayani',
    'Jumlah Jiwa Terlayani',
] as const

/** Array data 22 kolom — tanpa kolom ekstra (Unit/SIMSPAM/Tahun). */
export function kelembagaanRowToExportArray(row: KelembagaanRow): (string | number)[] {
    return [
        row.no,
        row.kecamatan,
        row.desa,
        cellValue(row.tahun_pembangunan),
        cellValue(row.sumber_dana),
        cellValue(row.program),
        cellValue(row.pengelola),
        cellValue(row.perdes),
        cellValue(row.kepala),
        cellValue(row.bendahara),
        cellValue(row.sekretaris),
        cellValue(row.kap_mata_air),
        cellValue(row.gravitasi_pompa),
        cellValue(row.kap_air_tanah),
        cellValue(row.kap_lain),
        cellValue(row.tarif_dasar_hukum),
        cellValue(row.iuran_nominal),
        cellValue(row.pendapatan_bulan),
        cellValue(row.biaya_operasional),
        row.jumlah_sr || 0,
        row.jumlah_kk || 0,
        row.jumlah_jiwa || 0,
    ]
}

export function completenessScore(row: KelembagaanRow): number {
    // Placeholder POKMAS (KPSPAM DESA KEC) tidak dihitung sebagai data terisi
    const pengelolaFilled =
        row.pengelola && row.pengelola !== '-' && !row.pengelola_is_fallback
    const fields = [
        row.tahun_pembangunan,
        row.sumber_dana,
        row.program,
        pengelolaFilled ? row.pengelola : '-',
        row.perdes,
        row.kepala,
        row.gravitasi_pompa,
        row.iuran_nominal,
    ]
    const filled = fields.filter((f) => f && f !== '-').length
    return Math.round((filled / fields.length) * 100)
}

export interface KelembagaanKecamatanGroup {
    kecamatan: string
    /** Nomor urut kecamatan (kolom No. di workbook). */
    no: number
    items: KelembagaanRow[]
}

/** Group by kecamatan, urutan kemunculan pertama; No = indeks kecamatan. */
export function groupKelembagaanByKecamatan(rows: KelembagaanRow[]): KelembagaanKecamatanGroup[] {
    const order: string[] = []
    const map = new Map<string, KelembagaanRow[]>()
    for (const row of rows) {
        const key = row.kecamatan || '-'
        if (!map.has(key)) {
            map.set(key, [])
            order.push(key)
        }
        map.get(key)!.push(row)
    }
    return order.map((kecamatan, idx) => ({
        kecamatan,
        no: idx + 1,
        items: map.get(kecamatan)!,
    }))
}

type Cell = string | number | null

/**
 * Bangun worksheet format resmi workbook Cianjur sheet "KELEMBAGAN SPAM POKMAS":
 * - Header bertingkat (5 baris) + baris nomor kolom 1–22
 * - Data dikelompokkan per kecamatan; No + LOKASI KECAMATAN di-merge vertikal
 * - 22 kolom A–V (tanpa kolom ekstra)
 */
export function buildKelembagaanPokmasSheet(rows: KelembagaanRow[]): XLSX.WorkSheet {
    const empty = (): Cell[] => Array.from({ length: KELEMBAGAAN_COL_COUNT }, () => null)
    const aoa: Cell[][] = []

    // —— Row 1 (Excel R1): level 1 ——
    const r1 = empty()
    r1[0] = 'No.'
    r1[1] = 'LOKASI KECAMATAN'
    r1[2] = 'DESA/ KELURAHAN'
    r1[3] = 'TAHUN PEMBANGUNAN'
    r1[4] = 'SUMBER DANA'
    r1[5] = 'PROGRAM PEMBANGUNAN'
    r1[6] = 'KELEMBAGAAN POKMAS'
    r1[11] = 'DATA TEKNIS'
    r1[15] = 'PARAMETER'
    aoa.push(r1)

    // —— Row 2 ——
    const r2 = empty()
    r2[6] = 'Pengelola'
    r2[7] = 'Perdes Pembentukan Pokmas'
    r2[8] = 'Pengurus'
    r2[11] = 'Sumber Mata Air'
    r2[13] = 'Sumber air  tanah Kap.L/det'
    r2[14] = 'Lain-lain (Kap.L/det)'
    r2[15] = 'Tarif Air/Iuran per bulan'
    r2[17] = 'Pendapatan rata2/bulan (Rp)'
    r2[18] = 'Biaya Operasional/Bulan (Rp)'
    r2[19] = 'JUMLAH SR (UNIT)'
    r2[20] = 'Jumlah KK Terlayani '
    r2[21] = 'Jumlah Jiwa Terlayani '
    aoa.push(r2)

    // —— Row 3 ——
    const r3 = empty()
    r3[8] = 'Kepala'
    r3[9] = 'Bendahara'
    r3[10] = 'Sekretaris'
    r3[11] = 'Kap.L/det'
    r3[12] = 'Gravitasi/Pompa'
    r3[15] = 'Dasar Hukum'
    r3[16] = 'Besarnya Iuran'
    aoa.push(r3)

    // —— Row 4–5: kosong (ter-merge ke header di atas) ——
    aoa.push(empty())
    aoa.push(empty())

    // —— Row 6: nomor kolom 1–22 ——
    aoa.push(Array.from({ length: KELEMBAGAAN_COL_COUNT }, (_, i) => i + 1))

    // —— Data (mulai Excel R7) ——
    const groups = groupKelembagaanByKecamatan(rows)
    const merges: XLSX.Range[] = []
    const dataStartRow = 6 // 0-based index of first data row

    // Header merges (matching workbook)
    const headerMerges: XLSX.Range[] = [
        // A–F vertical R1:R5
        { s: { r: 0, c: 0 }, e: { r: 4, c: 0 } },
        { s: { r: 0, c: 1 }, e: { r: 4, c: 1 } },
        { s: { r: 0, c: 2 }, e: { r: 4, c: 2 } },
        { s: { r: 0, c: 3 }, e: { r: 4, c: 3 } },
        { s: { r: 0, c: 4 }, e: { r: 4, c: 4 } },
        { s: { r: 0, c: 5 }, e: { r: 4, c: 5 } },
        // G–K KELEMBAGAAN POKMAS
        { s: { r: 0, c: 6 }, e: { r: 0, c: 10 } },
        // L–O DATA TEKNIS
        { s: { r: 0, c: 11 }, e: { r: 0, c: 14 } },
        // P–V PARAMETER (sertakan Jiwa)
        { s: { r: 0, c: 15 }, e: { r: 0, c: 21 } },
        // Pengelola, Perdes
        { s: { r: 1, c: 6 }, e: { r: 4, c: 6 } },
        { s: { r: 1, c: 7 }, e: { r: 4, c: 7 } },
        // Pengurus I–K
        { s: { r: 1, c: 8 }, e: { r: 1, c: 10 } },
        // Sumber Mata Air L–M
        { s: { r: 1, c: 11 }, e: { r: 1, c: 12 } },
        // N, O vertical
        { s: { r: 1, c: 13 }, e: { r: 4, c: 13 } },
        { s: { r: 1, c: 14 }, e: { r: 4, c: 14 } },
        // Tarif P–Q
        { s: { r: 1, c: 15 }, e: { r: 1, c: 16 } },
        // R–V vertical
        { s: { r: 1, c: 17 }, e: { r: 4, c: 17 } },
        { s: { r: 1, c: 18 }, e: { r: 4, c: 18 } },
        { s: { r: 1, c: 19 }, e: { r: 4, c: 19 } },
        { s: { r: 1, c: 20 }, e: { r: 4, c: 20 } },
        { s: { r: 1, c: 21 }, e: { r: 4, c: 21 } },
        // Kepala / Bendahara / Sekretaris / Kap / Gravitasi / Dasar Hukum / Iuran
        { s: { r: 2, c: 8 }, e: { r: 4, c: 8 } },
        { s: { r: 2, c: 9 }, e: { r: 4, c: 9 } },
        { s: { r: 2, c: 10 }, e: { r: 4, c: 10 } },
        { s: { r: 2, c: 11 }, e: { r: 4, c: 11 } },
        { s: { r: 2, c: 12 }, e: { r: 4, c: 12 } },
        { s: { r: 2, c: 15 }, e: { r: 4, c: 15 } },
        { s: { r: 2, c: 16 }, e: { r: 4, c: 16 } },
    ]
    merges.push(...headerMerges)

    let rowIdx = dataStartRow
    for (const group of groups) {
        const start = rowIdx
        for (let i = 0; i < group.items.length; i++) {
            const item = group.items[i]
            const vals = kelembagaanRowToExportArray(item)
            // No + kecamatan hanya di baris pertama grup (sisanya di-merge)
            if (i === 0) {
                vals[0] = group.no
                vals[1] = group.kecamatan
            } else {
                vals[0] = null as unknown as number
                vals[1] = null as unknown as string
            }
            aoa.push(vals as Cell[])
            rowIdx++
        }
        const end = rowIdx - 1
        if (end > start) {
            merges.push({ s: { r: start, c: 0 }, e: { r: end, c: 0 } })
            merges.push({ s: { r: start, c: 1 }, e: { r: end, c: 1 } })
        }
    }

    const sheet = XLSX.utils.aoa_to_sheet(aoa)
    sheet['!merges'] = merges
    sheet['!cols'] = [
        { wch: 6 }, // No
        { wch: 22 }, // Kecamatan
        { wch: 20 }, // Desa
        { wch: 16 }, // Tahun (bisa multi: 2024, 2025)
        { wch: 12 }, // Sumber dana
        { wch: 16 }, // Program
        { wch: 22 }, // Pengelola
        { wch: 18 }, // Perdes
        { wch: 12 }, // Kepala
        { wch: 12 }, // Bendahara
        { wch: 12 }, // Sekretaris
        { wch: 10 }, // Kap mata air
        { wch: 12 }, // Gravitasi/Pompa
        { wch: 12 }, // Kap air tanah
        { wch: 12 }, // Lain-lain
        { wch: 12 }, // Dasar hukum
        { wch: 14 }, // Iuran
        { wch: 14 }, // Pendapatan
        { wch: 14 }, // Biaya
        { wch: 12 }, // SR
        { wch: 12 }, // KK
        { wch: 12 }, // Jiwa
    ]
    sheet['!rows'] = [
        { hpt: 18 },
        { hpt: 18 },
        { hpt: 18 },
        { hpt: 12 },
        { hpt: 12 },
        { hpt: 16 },
    ]

    return sheet
}

/** Nama sheet capaian SPM (ejaan benar; workbook contoh: " Capaiam SPM AMM"). */
export const CAPAIAN_SPM_AM_SHEET_NAME = 'Capaian SPM AM'

export interface SpmAmDesaRow {
    desaId: number
    kecamatan: string
    desa: string
    targetKk: number
    jpKk: number
    bjpKk: number
    jpJiwa: number
    bjpJiwa: number
    jumlahKpspam: number
}

/**
 * Agregasi per desa untuk sheet Capaian SPM AM (format workbook Cianjur).
 * TARGET = target KK desa; JP = sum capaian unit; BJP = master desa + sum unit BJP.
 */
export function buildSpmAmDesaRows(units: UnitSpam[], tahun?: string): SpmAmDesaRow[] {
    const byDesa = new Map<number, SpmAmDesaRow>()

    for (const unit of units) {
        const desaId = unit.desa_id
        if (!desaId) continue
        const kecamatan =
            unit.desa?.kecamatan?.n_kec || unit.desa?.kecamatan?.nama_kecamatan || '-'
        const desa = unit.desa?.n_desa || unit.desa?.nama_desa || '-'
        // Akumulasi capaian (bukan snapshot tahun terbaru) agar selaras tab SPM
        const capaian = pickCapaianForSpm(unit, tahun)
        const bjpMaster = unit.desa?.bjp_master ?? 0

        const existing = byDesa.get(desaId)
        if (!existing) {
            byDesa.set(desaId, {
                desaId,
                kecamatan,
                desa,
                targetKk: Number(unit.desa?.target ?? 0) || 0,
                jpKk: capaian.kk,
                bjpKk: bjpMaster + capaian.bjpKk,
                jpJiwa: capaian.jiwa,
                bjpJiwa: capaian.bjpJiwa,
                jumlahKpspam: 1,
            })
        } else {
            existing.jpKk += capaian.kk
            existing.bjpKk += capaian.bjpKk
            existing.jpJiwa += capaian.jiwa
            existing.bjpJiwa += capaian.bjpJiwa
            existing.jumlahKpspam += 1
            // target & bjp_master hanya dari master desa (jangan double-count master)
            if (existing.targetKk <= 0 && unit.desa?.target) {
                existing.targetKk = Number(unit.desa.target) || 0
            }
        }
    }

    // Urutkan kecamatan lalu desa
    return [...byDesa.values()].sort((a, b) => {
        const kc = a.kecamatan.localeCompare(b.kecamatan, 'id')
        if (kc !== 0) return kc
        return a.desa.localeCompare(b.desa, 'id')
    })
}

/**
 * Sheet "Capaian SPM AM" — mirror struktur workbook:
 * DATA CAPAIAN / SPM PEKERJAAN UMUM / Pemenuhan Kebutuhan Pokok Air Minum...
 * No | Kecamatan | Desa | TARGET | Terlayani JP | Terlayani BJP | Belum Terlayani | JUMLAH KPSPAM
 */
export function buildCapaianSpmAmSheet(
    units: UnitSpam[],
    tahun?: string,
    officialTotals?: SpmOfficialTotals | null,
): XLSX.WorkSheet {
    const sheet: XLSX.WorkSheet = {}
    const set = (r: number, c: number, cell: XLSX.CellObject) => {
        sheet[XLSX.utils.encode_cell({ r, c })] = cell
    }
    const setS = (r: number, c: number, v: string) => set(r, c, { t: 's', v })
    const setN = (r: number, c: number, v: number) => set(r, c, { t: 'n', v })

    // Judul
    setS(0, 0, 'DATA CAPAIAN')
    setS(1, 0, 'SPM PEKERJAAN UMUM')
    setS(2, 0, 'Pemenuhan Kebutuhan Pokok Air Minum Sehari-Hari Kabupaten/Kota')
    setS(
        3,
        0,
        tahun
            ? `Tahun capaian: ${tahun}`
            : `Scope: acuan s/d ${SPAM_BASELINE_CAP_TAHUN} + akumulasi ${SPAM_ACCUMULATION_START_TAHUN}+ (sama tab Capaian SPM)`,
    )

    // Header multi-level (baris Excel 5–7 → index 4–6)
    setS(4, 0, 'No')
    setS(4, 1, 'Kecamatan')
    setS(4, 2, 'Kelurahan/Desa')
    setS(4, 3, 'TARGET')
    setS(4, 4, 'REALISASI')
    setS(4, 7, 'JUMLAH KPSPAM JP')
    setS(5, 3, 'Total')
    setS(5, 4, 'Terlayani JP')
    setS(5, 5, 'Terlayani BJP')
    setS(5, 6, 'Belum Terlayani')
    setS(6, 3, '(KK)')
    setS(6, 4, '(KK)')
    setS(6, 5, '(KK)')
    setS(6, 6, '(KK)')

    // Nomor kolom
    for (let c = 0; c < 8; c++) setN(7, c, c + 1)

    const merges: XLSX.Range[] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } },
        { s: { r: 4, c: 0 }, e: { r: 6, c: 0 } },
        { s: { r: 4, c: 1 }, e: { r: 6, c: 1 } },
        { s: { r: 4, c: 2 }, e: { r: 6, c: 2 } },
        { s: { r: 4, c: 3 }, e: { r: 4, c: 3 } },
        { s: { r: 4, c: 4 }, e: { r: 4, c: 6 } },
        { s: { r: 4, c: 7 }, e: { r: 6, c: 7 } },
        { s: { r: 5, c: 3 }, e: { r: 6, c: 3 } },
    ]

    const desaRows = buildSpmAmDesaRows(units, tahun)
    type Group = { kecamatan: string; no: number; items: SpmAmDesaRow[] }
    const groups: Group[] = []
    for (const row of desaRows) {
        const last = groups[groups.length - 1]
        if (last && last.kecamatan === row.kecamatan) {
            last.items.push(row)
        } else {
            groups.push({ kecamatan: row.kecamatan, no: groups.length + 1, items: [row] })
        }
    }

    const dataStart = 8 // first data row (Excel row 9)
    let r = dataStart
    for (const group of groups) {
        const start = r
        for (let i = 0; i < group.items.length; i++) {
            const item = group.items[i]
            const excelRow = r + 1
            if (i === 0) {
                setN(r, 0, group.no)
                setS(r, 1, group.kecamatan)
            }
            setS(r, 2, item.desa)
            setN(r, 3, item.targetKk)
            setN(r, 4, item.jpKk)
            setN(r, 5, item.bjpKk)
            const belum = Math.max(0, item.targetKk - item.jpKk - item.bjpKk)
            set(r, 6, {
                t: 'n',
                f: `MAX(0,D${excelRow}-E${excelRow}-F${excelRow})`,
                v: belum,
            })
            setN(r, 7, item.jumlahKpspam)
            r++
        }
        const end = r - 1
        if (end > start) {
            merges.push({ s: { r: start, c: 0 }, e: { r: end, c: 0 } })
            merges.push({ s: { r: start, c: 1 }, e: { r: end, c: 1 } })
        }
    }

    // —— Footer rekap (format workbook: Total / Persentase Layanan / Capaian SPM) ——
    const dataEndExcel = r // 1-based exclusive end → last data excel row = r (0-based last = r-1 → excel = r)
    const firstDataExcel = dataStart + 1 // Excel row 9
    const lastDataExcel = Math.max(dataEndExcel, firstDataExcel - 1) // if no data, range collapses

    if (desaRows.length > 0) {
        const totalR = r // Total
        const pctR = r + 1 // Persentase Layanan
        const spmR = r + 2 // Capaian SPM
        const totalExcel = totalR + 1
        const pctExcel = pctR + 1
        const sumRange = (col: string) => `SUM(${col}${firstDataExcel}:${col}${lastDataExcel})`
        const rowSumTarget = desaRows.reduce((s, d) => s + d.targetKk, 0)
        const rowSumJp = desaRows.reduce((s, d) => s + d.jpKk, 0)
        const rowSumBjp = desaRows.reduce((s, d) => s + d.bjpKk, 0)
        const rowSumBelum = desaRows.reduce(
            (s, d) => s + Math.max(0, d.targetKk - d.jpKk - d.bjpKk),
            0,
        )
        const totalKpspam =
            officialTotals?.unit_count ??
            desaRows.reduce((s, d) => s + d.jumlahKpspam, 0)

        // Prioritas: angka resmi tab Capaian SPM (target seluruh desa wilayah + JP/BJP backend).
        // Tanpa itu, fallback SUM baris (hanya desa yang punya unit → bisa beda %).
        const useOfficial = Boolean(
            officialTotals &&
                Number.isFinite(officialTotals.target_kk) &&
                officialTotals.target_kk > 0,
        )
        const totalTarget = useOfficial ? officialTotals!.target_kk : rowSumTarget
        const totalJp = useOfficial ? officialTotals!.jp_kk : rowSumJp
        const totalBjp = useOfficial ? officialTotals!.total_bjp_kk : rowSumBjp
        const totalBelum = Math.max(0, totalTarget - totalJp - totalBjp)
        const pctJp = totalTarget > 0 ? totalJp / totalTarget : 0
        const pctBjp = totalTarget > 0 ? totalBjp / totalTarget : 0
        const pctBelum = totalTarget > 0 ? totalBelum / totalTarget : 0
        const capaianSpm = useOfficial
            ? officialTotals!.coverage_percentage / 100
            : pctJp + pctBjp

        // Total
        setS(totalR, 0, 'Total')
        if (useOfficial) {
            // Hardcoded values from stats (bukan SUM baris — target mencakup desa tanpa unit)
            setN(totalR, 3, totalTarget)
            setN(totalR, 4, totalJp)
            setN(totalR, 5, totalBjp)
            set(totalR, 6, {
                t: 'n',
                f: `MAX(0,D${totalExcel}-E${totalExcel}-F${totalExcel})`,
                v: totalBelum,
            })
            setN(totalR, 7, totalKpspam)
        } else {
            set(totalR, 3, { t: 'n', f: sumRange('D'), v: totalTarget })
            set(totalR, 4, { t: 'n', f: sumRange('E'), v: totalJp })
            set(totalR, 5, { t: 'n', f: sumRange('F'), v: totalBjp })
            set(totalR, 6, { t: 'n', f: sumRange('G'), v: totalBelum })
            set(totalR, 7, { t: 'n', f: sumRange('H'), v: totalKpspam })
        }

        // Persentase Layanan (JP%, BJP%, Belum%)
        setS(pctR, 0, 'Persentase Layanan')
        set(pctR, 4, {
            t: 'n',
            f: `IF(D${totalExcel}=0,0,E${totalExcel}/D${totalExcel})`,
            v: pctJp,
            z: '0.00%',
        })
        set(pctR, 5, {
            t: 'n',
            f: `IF(D${totalExcel}=0,0,F${totalExcel}/D${totalExcel})`,
            v: pctBjp,
            z: '0.00%',
        })
        set(pctR, 6, {
            t: 'n',
            f: `IF(D${totalExcel}=0,0,G${totalExcel}/D${totalExcel})`,
            v: pctBelum,
            z: '0.00%',
        })

        // Capaian SPM = (JP + BJP) / TARGET — sama tab Capaian SPM
        setS(spmR, 0, 'Capaian SPM')
        set(spmR, 4, {
            t: 'n',
            f: `E${pctExcel}+F${pctExcel}`,
            v: capaianSpm,
            z: '0.00%',
        })

        // Catatan selisih baris vs total resmi
        if (useOfficial) {
            const noteR = spmR + 1
            setS(
                noteR,
                0,
                'Catatan: baris Total & Capaian SPM memakai rumus tab Capaian SPM (target seluruh desa wilayah + JP/BJP backend). Jumlah baris desa di atas hanya unit yang tercatat (SUM baris bisa beda dari Total).',
            )
            merges.push({ s: { r: noteR, c: 0 }, e: { r: noteR, c: 7 } })
            r = noteR + 1
        } else {
            r = spmR + 1
        }

        merges.push(
            { s: { r: totalR, c: 0 }, e: { r: totalR, c: 2 } }, // Total label
            { s: { r: pctR, c: 0 }, e: { r: pctR, c: 3 } }, // Persentase Layanan
            { s: { r: spmR, c: 0 }, e: { r: spmR, c: 3 } }, // Capaian SPM
            { s: { r: spmR, c: 4 }, e: { r: spmR, c: 6 } }, // nilai capaian span JP–Belum
        )
    }

    sheet['!ref'] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: Math.max(r - 1, 7), c: 7 },
    })
    sheet['!merges'] = merges
    sheet['!cols'] = [
        { wch: 6 },
        { wch: 22 },
        { wch: 22 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
    ]
    return sheet
}

export function downloadKelembagaanPokmasWorkbook(
    rows: KelembagaanRow[],
    options?: {
        tahun?: string
        filename?: string
        units?: UnitSpam[]
        /** Total resmi dari /spam-units/stats agar Capaian SPM = tab Capaian SPM. */
        spmTotals?: SpmOfficialTotals | null
    },
): void {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, buildKelembagaanPokmasSheet(rows), KELEMBAGAAN_SHEET_NAME)

    // Sheet ke-2: Capaian SPM AM (dari unit yang sama + footer resmi stats)
    if (options?.units && options.units.length > 0) {
        XLSX.utils.book_append_sheet(
            wb,
            buildCapaianSpmAmSheet(options.units, options.tahun, options.spmTotals),
            CAPAIAN_SPM_AM_SHEET_NAME,
        )
    }

    const suffix = options?.tahun || 'all'
    const filename =
        options?.filename ||
        `Pemantauan_Kelembagaan_SPAM_Pokmas_Kab_Cianjur_${suffix}.xlsx`
    XLSX.writeFile(wb, filename)
}
