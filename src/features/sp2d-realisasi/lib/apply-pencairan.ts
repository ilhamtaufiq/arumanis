import {
    getPekerjaanProgressEstimasi,
    savePekerjaanProgressEstimasi,
    type ProgressHistoryEntry,
    type SavePekerjaanProgressEstimasiPayload,
} from '@/features/pekerjaan/api/progress-estimasi'
import type { Sp2dMatchedRow } from '../types'
import { isRekapPencairanRow } from './match-sp2d'
import { parseSp2dDate } from './parse-sp2d-date'

function resolvePersen(row: { persenPembayaran?: number | null; kategori: string }): number {
    const p = row.persenPembayaran
    if (p === 30 || p === 65 || p === 95 || p === 100) return p
    if (row.kategori === 'uang_muka') return 30
    return 95
}

export type PencairanEntry = {
    tanggal: string
    persen: number
    brutoOnDate: number
    cumulativeBruto: number
    /** Semua nomor SP2D yang masuk pada tanggal ini */
    nomorSp2dList: string[]
    /** Tanggal pembuatan SP2D (dari baris pertama pada tanggal ini) */
    tanggalPembuatan: string | null
}

export type PencairanApplyPlan = {
    pekerjaanId: number
    namaPaket: string
    penyediaLabel: string | null
    nilaiKontrak: number
    totalBruto: number
    sp2dCount: number
    /** Final cumulative % (capped 100) */
    finalPersen: number
    uncappedPersen: number
    capped: boolean
    entries: PencairanEntry[]
    skippedNoDate: number
    reason?: string
}

export type PencairanApplyResult = {
    pekerjaanId: number
    namaPaket: string
    ok: boolean
    message: string
    finalPersen?: number
}

export function round2(n: number) {
    return Math.round(n * 100) / 100
}

function stripIds(entries: ProgressHistoryEntry[]): Array<{ tanggal: string; persen: number }> {
    return entries.map(({ tanggal, persen }) => ({ tanggal, persen }))
}

/**
 * Build pencairan (keuangan realisasi) plan per pekerjaan from matched SP2D rows.
 * Uses cumulative bruto / nilai_kontrak * 100, stepped by tanggal pencairan.
 *
 * Hanya baris **30% / 65% / 95% / 100%** (bukan SILPA 5%).
 */
export function buildPencairanPlans(
    rows: Sp2dMatchedRow[],
    options?: {
        onlyPekerjaanIds?: number[]
        /** Composite keys `pekerjaanId::persen` from rekap selection */
        onlyKeys?: string[]
    },
): PencairanApplyPlan[] {
    const only = options?.onlyPekerjaanIds ? new Set(options.onlyPekerjaanIds) : null
    const onlyKeys = options?.onlyKeys ? new Set(options.onlyKeys) : null
    type Bucket = {
        pekerjaanId: number
        namaPaket: string
        penyediaLabel: string | null
        nilaiKontrak: number | null
        items: Array<{
            tanggal: string | null
            bruto: number
            rawDate: string
            nomorSp2d: string
            tanggalPembuatan: string
        }>
    }

    const map = new Map<number, Bucket>()

    for (const row of rows) {
        if (!row.matchedPekerjaan) continue
        if (row.isNonPekerjaan) continue
        if (!isRekapPencairanRow(row)) continue

        const id = row.matchedPekerjaan.id
        const persen = resolvePersen(row)
        const key = `${id}::${persen}`
        if (onlyKeys && !onlyKeys.has(key)) continue
        if (!onlyKeys && only && !only.has(id)) continue

        const existing = map.get(id)
        const tanggal = parseSp2dDate(row.tanggalPencairan) ?? parseSp2dDate(row.tanggalPembuatan)
        const parsedTanggalPembuatan = parseSp2dDate(row.tanggalPembuatan)
        if (existing) {
            existing.items.push({
                tanggal,
                bruto: row.bruto,
                rawDate: row.tanggalPencairan,
                nomorSp2d: row.nomorSp2d,
                tanggalPembuatan: parsedTanggalPembuatan ?? row.tanggalPembuatan,
            })
            if (existing.nilaiKontrak == null && row.nilaiKontrak != null) {
                existing.nilaiKontrak = row.nilaiKontrak
            }
            if (!existing.penyediaLabel && row.matchedPenyedia) {
                existing.penyediaLabel = row.matchedPenyedia.label
            }
        } else {
            map.set(id, {
                pekerjaanId: id,
                namaPaket: row.matchedPekerjaan.label,
                penyediaLabel: row.matchedPenyedia?.label ?? null,
                nilaiKontrak: row.nilaiKontrak,
                items: [{
                    tanggal,
                    bruto: row.bruto,
                    rawDate: row.tanggalPencairan,
                    nomorSp2d: row.nomorSp2d,
                    tanggalPembuatan: parsedTanggalPembuatan ?? row.tanggalPembuatan,
                }],
            })
        }
    }

    const plans: PencairanApplyPlan[] = []

    for (const bucket of map.values()) {
        const nilaiKontrak = bucket.nilaiKontrak
        if (!nilaiKontrak || nilaiKontrak <= 0) {
            plans.push({
                pekerjaanId: bucket.pekerjaanId,
                namaPaket: bucket.namaPaket,
                penyediaLabel: bucket.penyediaLabel,
                nilaiKontrak: 0,
                totalBruto: bucket.items.reduce((s, i) => s + i.bruto, 0),
                sp2dCount: bucket.items.length,
                finalPersen: 0,
                uncappedPersen: 0,
                capped: false,
                entries: [],
                skippedNoDate: 0,
                reason: 'Nilai kontrak tidak tersedia — tidak bisa hitung % pencairan',
            })
            continue
        }

        let skippedNoDate = 0
        const byDate = new Map<string, number>()
        const nomorByDate = new Map<string, string[]>()
        const pembuatanByDate = new Map<string, string>()
        for (const item of bucket.items) {
            if (!item.tanggal) {
                skippedNoDate += 1
                continue
            }
            byDate.set(item.tanggal, (byDate.get(item.tanggal) ?? 0) + item.bruto)
            if (item.nomorSp2d) {
                const list = nomorByDate.get(item.tanggal) ?? []
                if (!list.includes(item.nomorSp2d)) list.push(item.nomorSp2d)
                nomorByDate.set(item.tanggal, list)
            }
            if (!pembuatanByDate.has(item.tanggal) && item.tanggalPembuatan) {
                pembuatanByDate.set(item.tanggal, item.tanggalPembuatan)
            }
        }

        const dates = Array.from(byDate.keys()).sort()
        if (dates.length === 0) {
            plans.push({
                pekerjaanId: bucket.pekerjaanId,
                namaPaket: bucket.namaPaket,
                penyediaLabel: bucket.penyediaLabel,
                nilaiKontrak,
                totalBruto: bucket.items.reduce((s, i) => s + i.bruto, 0),
                sp2dCount: bucket.items.length,
                finalPersen: 0,
                uncappedPersen: 0,
                capped: false,
                entries: [],
                skippedNoDate,
                reason: 'Tidak ada tanggal pencairan yang bisa diparse',
            })
            continue
        }

        let cumulative = 0
        const entries: PencairanEntry[] = []
        for (const tanggal of dates) {
            const brutoOnDate = byDate.get(tanggal) ?? 0
            cumulative += brutoOnDate
            const uncapped = (cumulative / nilaiKontrak) * 100
            const persen = round2(Math.min(100, uncapped))
            entries.push({
                tanggal,
                persen,
                brutoOnDate,
                cumulativeBruto: cumulative,
                nomorSp2dList: nomorByDate.get(tanggal) ?? [],
                tanggalPembuatan: pembuatanByDate.get(tanggal) ?? null,
            })
        }

        const totalBruto = cumulative
        const uncappedPersen = round2((totalBruto / nilaiKontrak) * 100)
        const finalPersen = round2(Math.min(100, uncappedPersen))

        plans.push({
            pekerjaanId: bucket.pekerjaanId,
            namaPaket: bucket.namaPaket,
            penyediaLabel: bucket.penyediaLabel,
            nilaiKontrak,
            totalBruto,
            sp2dCount: bucket.items.length,
            finalPersen,
            uncappedPersen,
            capped: uncappedPersen > 100,
            entries,
            skippedNoDate,
        })
    }

    return plans.sort((a, b) => b.totalBruto - a.totalBruto)
}

/**
 * Merge realisasi keuangan: entri SP2D menimpa jika tanggal sama,
 * jika tanggal baru maka ditambahkan.
 * Fisik + rencana keuangan tetap dipertahankan.
 */
export function replaceKeuanganRealisasiFromSp2d(
    pencairanEntries: PencairanEntry[],
): Array<{ tanggal: string; persen: number; nomor_sp2d?: string | null; tanggal_pembuatan?: string | null; tanggal_pencairan?: string | null; nilai?: number | null }> {
    // Collapse same tanggal (last wins) then sort
    const map = new Map<string, PencairanEntry>()
    for (const e of pencairanEntries) {
        map.set(e.tanggal, e)
    }
    return Array.from(map.values())
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
        .map((e) => ({
            tanggal: e.tanggal,
            persen: e.persen,
            nomor_sp2d: (e.nomorSp2dList?.length ?? 0) > 0 ? e.nomorSp2dList.join(', ') : null,
            tanggal_pembuatan: e.tanggalPembuatan ?? null,
            tanggal_pencairan: e.tanggal,
            nilai: Math.round(e.cumulativeBruto),
        }))
}

/**
 * Merge SP2D entries with existing keuangan.realisasi by tanggal.
 * Same tanggal → overwrite. New tanggal → append.
 * Returns the full merged array sorted by tanggal.
 */
export function mergeKeuanganRealisasiWithSp2d(
    existing: Array<{ tanggal: string; persen: number; nomor_sp2d?: string | null; tanggal_pembuatan?: string | null; tanggal_pencairan?: string | null; nilai?: number | null }>,
    pencairanEntries: PencairanEntry[],
): Array<{ tanggal: string; persen: number; nomor_sp2d?: string | null; tanggal_pembuatan?: string | null; tanggal_pencairan?: string | null; nilai?: number | null }> {
    const map = new Map<string, typeof pencairanEntries[number]>()
    for (const e of existing) {
        map.set(e.tanggal, {
            tanggal: e.tanggal,
            persen: e.persen,
            cumulativeBruto: e.nilai ?? 0,
            nomorSp2dList: e.nomor_sp2d ? e.nomor_sp2d.split(', ') : [],
            tanggalPembuatan: e.tanggal_pembuatan ?? null,
        } as PencairanEntry)
    }
    for (const e of pencairanEntries) {
        map.set(e.tanggal, e)
    }
    return Array.from(map.values())
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
        .map((e) => ({
            tanggal: e.tanggal,
            persen: e.persen,
            nomor_sp2d: (e.nomorSp2dList?.length ?? 0) > 0 ? e.nomorSp2dList.join(', ') : null,
            tanggal_pembuatan: e.tanggalPembuatan ?? null,
            tanggal_pencairan: e.tanggal,
            nilai: Math.round(e.cumulativeBruto),
        }))
}

/**
 * @deprecated Use replaceKeuanganRealisasiFromSp2d — kept for tests/compat name.
 * Merge by tanggal (overwrite same date, keep other dates).
 */
export function mergeKeuanganRealisasi(
    existing: Array<{ tanggal: string; persen: number }>,
    pencairanEntries: PencairanEntry[],
): Array<{ tanggal: string; persen: number }> {
    const map = new Map<string, number>()
    for (const e of existing) {
        map.set(e.tanggal, e.persen)
    }
    for (const e of pencairanEntries) {
        map.set(e.tanggal, e.persen)
    }
    return Array.from(map.entries())
        .map(([tanggal, persen]) => ({ tanggal, persen }))
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
}

/**
 * Load current progress estimasi, **replace** keuangan.realisasi with SP2D plan, save.
 * Re-sync always overwrites previous SP2D/manual realisasi keuangan for that year.
 */
export async function applyPencairanPlan(
    plan: PencairanApplyPlan,
    tahun: number,
): Promise<PencairanApplyResult> {
    if (plan.reason || plan.entries.length === 0) {
        return {
            pekerjaanId: plan.pekerjaanId,
            namaPaket: plan.namaPaket,
            ok: false,
            message: plan.reason || 'Tidak ada entri pencairan',
        }
    }

    try {
        const current = await getPekerjaanProgressEstimasi(plan.pekerjaanId, tahun)
        const data = current.data

        const sp2dOnly = replaceKeuanganRealisasiFromSp2d(plan.entries)
        const nextRealisasi = mergeKeuanganRealisasiWithSp2d(data.keuangan.realisasi, plan.entries)

        const payload: SavePekerjaanProgressEstimasiPayload = {
            tahun,
            fisik: {
                rencana: stripIds(data.fisik.rencana),
                realisasi: stripIds(data.fisik.realisasi),
            },
            keuangan: {
                rencana: stripIds(data.keuangan.rencana),
                realisasi: nextRealisasi,
            },
        }

        await savePekerjaanProgressEstimasi(plan.pekerjaanId, payload)

        const newCount = nextRealisasi.length - data.keuangan.realisasi.length
        const addedLabel = newCount > 0 ? ` (+${newCount} baru)` : ''
        return {
            pekerjaanId: plan.pekerjaanId,
            namaPaket: plan.namaPaket,
            ok: true,
            message: `Realisasi keuangan diperbarui → ${plan.finalPersen}% (${plan.entries.length} tanggal SP2D, ${nextRealisasi.length} total entri)${addedLabel}`,
            finalPersen: plan.finalPersen,
        }
    } catch (error) {
        console.error('applyPencairanPlan', plan.pekerjaanId, error)
        return {
            pekerjaanId: plan.pekerjaanId,
            namaPaket: plan.namaPaket,
            ok: false,
            message: error instanceof Error ? error.message : 'Gagal menyimpan progress',
        }
    }
}

export async function applyPencairanPlans(
    plans: PencairanApplyPlan[],
    tahun: number,
    onProgress?: (done: number, total: number, last: PencairanApplyResult) => void,
): Promise<PencairanApplyResult[]> {
    const applicable = plans.filter((p) => !p.reason && p.entries.length > 0)
    const results: PencairanApplyResult[] = []

    // Include skipped as failed results for report
    for (const p of plans.filter((x) => x.reason || x.entries.length === 0)) {
        results.push({
            pekerjaanId: p.pekerjaanId,
            namaPaket: p.namaPaket,
            ok: false,
            message: p.reason || 'Tidak ada entri',
        })
    }

    let done = 0
    const total = applicable.length
    for (const plan of applicable) {
        const result = await applyPencairanPlan(plan, tahun)
        results.push(result)
        done += 1
        onProgress?.(done, total, result)
    }

    return results
}
