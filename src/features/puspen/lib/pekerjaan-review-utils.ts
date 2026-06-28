import type { Foto } from '@/features/foto/types'
import type { PekerjaanProgressEstimasi } from '@/features/pekerjaan/api/progress-estimasi'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import type { Penerima } from '@/features/penerima/types'
import type { ProgressItemData, ProgressReportData } from '@/features/progress/types'
import { filterFotoWithCoords, parseKoordinat, type MapCoords } from '@/features/map/utils/map-utils'

export const FOTO_LEVELS = ['0%', '25%', '50%', '75%', '100%'] as const

export type PekerjaanReviewDetail = Pekerjaan & {
    foto?: Foto[]
    penerima?: Penerima[]
    berkas?: Array<{ id: number; jenis_dokumen?: string }>
    kontrak?: Array<{
        id: number
        spk?: string | null
        nilai_kontrak?: number | null
        penyedia?: { id: number; nama: string } | null
    }>
    foto_count?: number
    foto_required_count?: number | null
    foto_status?: 'belum_ada_foto' | 'belum_selesai' | 'selesai' | string | null
    progress?: {
        content?: {
            items?: Array<{
                nama_item?: string
                bobot?: number
                target_volume?: number
                weekly_data?: Record<string, { rencana?: number; realisasi?: number | null }>
            }>
        }
    } | null
}

export type ProgressEstimasiReviewSummary = {
    fisik: {
        latestRencana: number | null
        latestRealisasi: number | null
        deviasi: number | null
        entryCount: number
    }
    keuangan: {
        latestRencana: number | null
        latestRealisasi: number | null
        deviasi: number | null
        entryCount: number
    }
    updatedAt: string | null
    hasInput: boolean
}

export type ReviewStatSummary = {
    progressFisik: number
    progressRencana: number
    deviasi: number
    estimasiFisik: number | null
    estimasiFisikRencana: number | null
    estimasiFisikDeviasi: number | null
    estimasiKeuangan: number | null
    estimasiKeuanganRencana: number | null
    estimasiKeuanganDeviasi: number | null
    progressItemWeighted: number | null
    penerimaCount: number
    totalJiwa: number
    fotoCount: number
    fotoRequired: number | null
    fotoStatus: string | null
    outputCount: number
    pagu: number
    nilaiKontrak: number | null
}

export function buildProgressEstimasiSummary(
    data?: PekerjaanProgressEstimasi | null,
): ProgressEstimasiReviewSummary {
    const fisik = data?.fisik
    const keuangan = data?.keuangan

    const fisikEntryCount = (fisik?.rencana.length ?? 0) + (fisik?.realisasi.length ?? 0)
    const keuanganEntryCount = (keuangan?.rencana.length ?? 0) + (keuangan?.realisasi.length ?? 0)

    return {
        fisik: {
            latestRencana: fisik?.latest_rencana ?? null,
            latestRealisasi: fisik?.latest_realisasi ?? null,
            deviasi: fisik?.deviasi ?? null,
            entryCount: fisikEntryCount,
        },
        keuangan: {
            latestRencana: keuangan?.latest_rencana ?? null,
            latestRealisasi: keuangan?.latest_realisasi ?? null,
            deviasi: keuangan?.deviasi ?? null,
            entryCount: keuanganEntryCount,
        },
        updatedAt: data?.updated_at ?? null,
        hasInput: fisikEntryCount > 0 || keuanganEntryCount > 0,
    }
}

export function buildProgressReportWeightedTotal(report?: ProgressReportData | null): number | null {
    const total = report?.totals?.total_weighted_progress
    if (total === null || total === undefined) {
        return null
    }
    return Number(total.toFixed(2))
}

export function formatFotoStatus(status: string | null | undefined): string {
    switch (status) {
        case 'selesai':
            return 'Lengkap'
        case 'belum_selesai':
            return 'Belum lengkap'
        case 'belum_ada_foto':
            return 'Belum ada foto'
        default:
            return status ?? '-'
    }
}

export const RECENT_FOTO_PAGE_SIZE = 12

export function resolveFotoKomponenLabel(
    foto: Pick<Foto, 'komponen_id' | 'komponen'>,
    outputs: Pekerjaan['output'] = [],
): string {
    if (foto.komponen?.komponen) {
        return foto.komponen.komponen
    }

    const fromOutput = outputs?.find((output) => output.id === foto.komponen_id)?.komponen
    if (fromOutput) {
        return fromOutput
    }

    return '-'
}

export function sortFotosByLatest(fotos: Foto[] = []): Foto[] {
    return [...fotos].sort((left, right) => {
        const leftTime = Date.parse(left.created_at) || 0
        const rightTime = Date.parse(right.created_at) || 0

        if (rightTime !== leftTime) {
            return rightTime - leftTime
        }

        return right.id - left.id
    })
}

export type FotoGalleryFilterParams = {
    komponenId?: number | null
    slot?: string | null
}

export function buildFotoKomponenFilterOptions(
    fotos: Foto[] = [],
    outputs: Pekerjaan['output'] = [],
): Array<{ id: number; label: string; count: number }> {
    const counts = new Map<number, number>()

    fotos.forEach((foto) => {
        counts.set(foto.komponen_id, (counts.get(foto.komponen_id) ?? 0) + 1)
    })

    return Array.from(counts.entries())
        .map(([id, count]) => ({
            id,
            label: resolveFotoKomponenLabel({ komponen_id: id } as Foto, outputs),
            count,
        }))
        .sort((left, right) => left.label.localeCompare(right.label, 'id'))
}

export function buildFotoSlotFilterOptions(fotos: Foto[] = []): Array<{ slot: string; count: number }> {
    const counts = Object.fromEntries(FOTO_LEVELS.map((level) => [level, 0])) as Record<string, number>

    fotos.forEach((foto) => {
        if (counts[foto.keterangan] !== undefined) {
            counts[foto.keterangan] += 1
        }
    })

    return FOTO_LEVELS.map((slot) => ({ slot, count: counts[slot] }))
}

export function filterGalleryFotos(
    fotos: Foto[] = [],
    filters: FotoGalleryFilterParams = {},
): Foto[] {
    const komponenId = filters.komponenId ?? null
    const slot = filters.slot ?? null

    return fotos.filter((foto) => {
        if (komponenId !== null && foto.komponen_id !== komponenId) {
            return false
        }

        if (slot && foto.keterangan !== slot) {
            return false
        }

        return true
    })
}

export function paginateFotos<T>(
    items: T[],
    page: number,
    pageSize: number,
): {
    items: T[]
    total: number
    totalPages: number
    page: number
    pageSize: number
    from: number
    to: number
} {
    const total = items.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const start = (safePage - 1) * pageSize
    const end = Math.min(start + pageSize, total)

    return {
        items: items.slice(start, end),
        total,
        totalPages,
        page: safePage,
        pageSize,
        from: total === 0 ? 0 : start + 1,
        to: end,
    }
}

export function buildFotoByLevel(fotos: Foto[] = []): Array<{ level: string; count: number }> {
    const counts = Object.fromEntries(FOTO_LEVELS.map((level) => [level, 0])) as Record<string, number>

    fotos.forEach((foto) => {
        if (counts[foto.keterangan] !== undefined) {
            counts[foto.keterangan] += 1
        }
    })

    return FOTO_LEVELS.map((level) => ({ level, count: counts[level] }))
}

export function buildFotoByKomponen(
    fotos: Foto[] = [],
    outputs: Pekerjaan['output'] = [],
): Array<{ komponen: string; count: number }> {
    const counts = new Map<string, number>()

    fotos.forEach((foto) => {
        const label = resolveFotoKomponenLabel(foto, outputs)
        counts.set(label, (counts.get(label) ?? 0) + 1)
    })

    return Array.from(counts.entries())
        .map(([komponen, count]) => ({ komponen, count }))
        .sort((a, b) => b.count - a.count)
}

function calculateProgressFromContent(
    items: NonNullable<PekerjaanReviewDetail['progress']>['content']['items'] = [],
) {
    let progressFisik = 0
    let progressRencana = 0
    let maxReportedWeek = 0

    items.forEach((item) => {
        Object.entries(item.weekly_data ?? {}).forEach(([minggu, data]) => {
            if (data?.realisasi !== null && data?.realisasi !== undefined) {
                maxReportedWeek = Math.max(maxReportedWeek, Number(minggu))
            }
        })
    })

    items.forEach((item) => {
        const bobot = Number(item.bobot ?? 0)
        const targetVolume = Number(item.target_volume ?? 0)
        let totalReal = 0
        let totalRencana = 0

        Object.entries(item.weekly_data ?? {}).forEach(([minggu, data]) => {
            if (data?.realisasi !== null && data?.realisasi !== undefined) {
                totalReal += Number(data.realisasi)
            }
            if (Number(minggu) <= maxReportedWeek && data?.rencana !== null && data?.rencana !== undefined) {
                totalRencana += Number(data.rencana)
            }
        })

        const progressPercent = targetVolume > 0 ? (totalReal / targetVolume) * 100 : 0
        const rencanaPercent = targetVolume > 0 ? (totalRencana / targetVolume) * 100 : 0
        progressFisik += (progressPercent * bobot) / 100
        progressRencana += (rencanaPercent * bobot) / 100
    })

    return {
        progressFisik: Number(progressFisik.toFixed(2)),
        progressRencana: Number(progressRencana.toFixed(2)),
        deviasi: Number((progressFisik - progressRencana).toFixed(2)),
    }
}

export function buildReviewStats(
    detail: PekerjaanReviewDetail,
    options?: {
        progressEstimasi?: PekerjaanProgressEstimasi | null
        progressReport?: ProgressReportData | null
    },
): ReviewStatSummary {
    const progressFromContent = calculateProgressFromContent(detail.progress?.content?.items ?? [])
    const estimasi = buildProgressEstimasiSummary(options?.progressEstimasi)
    const progressItemWeighted = buildProgressReportWeightedTotal(options?.progressReport)
    const penerima = detail.penerima ?? []
    const totalJiwa = penerima.reduce((sum, item) => sum + (item.jumlah_jiwa ?? 0), 0)
    const kontrak = detail.kontrak?.[0]

    const progressFisik = estimasi.fisik.latestRealisasi
        ?? detail.progress_total
        ?? progressItemWeighted
        ?? progressFromContent.progressFisik

    const progressRencana = estimasi.fisik.latestRencana
        ?? progressFromContent.progressRencana

    const deviasi = estimasi.fisik.deviasi
        ?? detail.deviasi
        ?? progressFromContent.deviasi

    return {
        progressFisik,
        progressRencana,
        deviasi,
        estimasiFisik: estimasi.fisik.latestRealisasi,
        estimasiFisikRencana: estimasi.fisik.latestRencana,
        estimasiFisikDeviasi: estimasi.fisik.deviasi,
        estimasiKeuangan: estimasi.keuangan.latestRealisasi,
        estimasiKeuanganRencana: estimasi.keuangan.latestRencana,
        estimasiKeuanganDeviasi: estimasi.keuangan.deviasi,
        progressItemWeighted,
        penerimaCount: penerima.length || detail.penerima_count || 0,
        totalJiwa,
        fotoCount: detail.foto_count ?? detail.foto?.length ?? 0,
        fotoRequired: detail.foto_required_count ?? null,
        fotoStatus: detail.foto_status ?? null,
        outputCount: detail.output?.length ?? 0,
        pagu: detail.pagu ?? 0,
        nilaiKontrak: kontrak?.nilai_kontrak ?? null,
    }
}

export function buildProgressItemChart(
    report?: ProgressReportData | null,
): Array<{ name: string; progress: number; bobot: number }> {
    if (!report?.items?.length) {
        return []
    }

    return report.items.map((item: ProgressItemData) => {
        const targetVolume = Number(item.target_volume ?? 0)
        const totalReal = Object.values(item.weekly_data ?? {}).reduce((sum, week) => {
            if (week.realisasi === null || week.realisasi === undefined) {
                return sum
            }
            return sum + Number(week.realisasi)
        }, 0)
        const progress = targetVolume > 0
            ? Number(((totalReal / targetVolume) * 100).toFixed(1))
            : 0

        return {
            name: item.nama_item.length > 28 ? `${item.nama_item.slice(0, 28)}…` : item.nama_item,
            progress,
            bobot: Number(item.bobot ?? 0),
        }
    })
}

export function buildWeeklyProgressChart(
    report?: ProgressReportData | null,
): Array<{ minggu: string; rencana: number; realisasi: number }> {
    if (!report?.items?.length) {
        return []
    }

    const weekly = new Map<number, { rencana: number; realisasi: number }>()

    report.items.forEach((item) => {
        Object.entries(item.weekly_data ?? {}).forEach(([mingguKey, data]) => {
            const minggu = Number(mingguKey)
            const current = weekly.get(minggu) ?? { rencana: 0, realisasi: 0 }
            current.rencana += Number(data.rencana ?? 0)
            if (data.realisasi !== null && data.realisasi !== undefined) {
                current.realisasi += Number(data.realisasi)
            }
            weekly.set(minggu, current)
        })
    })

    return Array.from(weekly.entries())
        .sort(([a], [b]) => a - b)
        .map(([minggu, values]) => ({
            minggu: `M${minggu}`,
            rencana: Number(values.rencana.toFixed(2)),
            realisasi: Number(values.realisasi.toFixed(2)),
        }))
}

export type FotoMapPoint = {
    foto: Foto
    coords: MapCoords
}

export type KoordinatDesaSummary = {
    totalWithCoords: number
    dalamDesa: number
    diluarDesa: number
}

export function hasFotoKoordinat(foto: Pick<Foto, 'koordinat'>): boolean {
    return parseKoordinat(foto.koordinat) !== null
}

export function isFotoKoordinatDiluarDesa(
    foto: Pick<Foto, 'koordinat' | 'validasi_koordinat'>,
): boolean {
    if (!hasFotoKoordinat(foto)) {
        return false
    }

    return foto.validasi_koordinat === false
}

export function buildKoordinatDesaSummary(fotos: Foto[] = []): KoordinatDesaSummary {
    let totalWithCoords = 0
    let dalamDesa = 0
    let diluarDesa = 0

    fotos.forEach((foto) => {
        if (!hasFotoKoordinat(foto)) {
            return
        }

        totalWithCoords += 1
        if (foto.validasi_koordinat === false) {
            diluarDesa += 1
        } else if (foto.validasi_koordinat === true) {
            dalamDesa += 1
        }
    })

    return { totalWithCoords, dalamDesa, diluarDesa }
}

export type ReviewRecommendation = {
    severity: 'info' | 'warning' | 'critical'
    title: string
    detail: string
}

export type ReviewCompleteness = {
    score: number
    foto: number
    progress: number
    penerima: number
    koordinat: number
}

export function buildPaketOptionSearchText(item: Pekerjaan): string {
    return [
        item.nama_paket,
        item.kode_rekening,
        item.desa?.nama_desa,
        item.kecamatan?.nama_kecamatan,
        item.pengawas?.nama,
        item.pendamping?.nama,
        item.kegiatan?.nama_kegiatan,
    ]
        .filter(Boolean)
        .join(' ')
}

export function buildPaketOptionLabel(item: Pekerjaan): string {
    const lokasi = [item.desa?.nama_desa, item.kecamatan?.nama_kecamatan].filter(Boolean).join(', ')
    const rek = item.kode_rekening ? ` · ${item.kode_rekening}` : ''
    return `${item.nama_paket}${rek}${lokasi ? ` — ${lokasi}` : ''}`
}

export function buildFotoMapPoints(fotos: Foto[] = []): FotoMapPoint[] {
    return filterFotoWithCoords(fotos)
}

const COMPLETENESS_WEIGHTS = {
    foto: 35,
    penerima: 25,
    progress: 25,
    koordinat: 15,
} as const

export function buildRequiredFotoTarget(
    detail: PekerjaanReviewDetail,
    stats: Pick<ReviewStatSummary, 'fotoRequired'>,
): number | null {
    if (stats.fotoRequired && stats.fotoRequired > 0) {
        return stats.fotoRequired
    }

    const outputs = detail.output ?? []
    if (outputs.length === 0) {
        return null
    }

    return outputs.reduce((sum, output) => {
        const requiredUnits = output.penerima_is_optional
            ? 1
            : Math.max(1, Math.round(output.volume || 1))

        return sum + requiredUnits * 5
    }, 0)
}

export function buildRequiredPenerimaTarget(detail: PekerjaanReviewDetail): number | null {
    const unitOutputs = (detail.output ?? []).filter((output) => !output.penerima_is_optional)
    if (unitOutputs.length === 0) {
        return null
    }

    return unitOutputs.reduce(
        (sum, output) => sum + Math.max(1, Math.round(output.volume || 1)),
        0,
    )
}

export function buildFotoMapBounds(points: FotoMapPoint[]) {
    if (points.length === 0) {
        return null
    }

    let minLat = points[0].coords.lat
    let maxLat = points[0].coords.lat
    let minLng = points[0].coords.lng
    let maxLng = points[0].coords.lng

    points.forEach(({ coords }) => {
        minLat = Math.min(minLat, coords.lat)
        maxLat = Math.max(maxLat, coords.lat)
        minLng = Math.min(minLng, coords.lng)
        maxLng = Math.max(maxLng, coords.lng)
    })

    return { minLat, maxLat, minLng, maxLng }
}

export function buildCompletenessScore(
    detail: PekerjaanReviewDetail,
    stats: ReviewStatSummary,
): ReviewCompleteness {
    const fotoTarget = buildRequiredFotoTarget(detail, stats)
    const fotoApplicable = fotoTarget !== null && fotoTarget > 0
    const fotoRatio = fotoApplicable
        ? Math.min(1, stats.fotoCount / fotoTarget)
        : 0

    const penerimaTarget = buildRequiredPenerimaTarget(detail)
    const penerimaApplicable = penerimaTarget !== null && penerimaTarget > 0
    const penerimaRatio = penerimaApplicable
        ? Math.min(1, stats.penerimaCount / penerimaTarget)
        : 0

    const progressValue = Number(stats.progressFisik ?? 0)
    const progressApplicable = true
    const progressRatio = progressValue > 0
        ? Math.min(1, progressValue / 100)
        : 0

    const koordinatSummary = buildKoordinatDesaSummary(detail.foto ?? [])
    const koordinatApplicable = stats.fotoCount > 0
    const koordinatRatio = koordinatApplicable
        ? Math.min(1, koordinatSummary.dalamDesa / stats.fotoCount)
        : 0

    const dimensions = [
        { ratio: fotoRatio, weight: COMPLETENESS_WEIGHTS.foto, applicable: fotoApplicable },
        { ratio: penerimaRatio, weight: COMPLETENESS_WEIGHTS.penerima, applicable: penerimaApplicable },
        { ratio: progressRatio, weight: COMPLETENESS_WEIGHTS.progress, applicable: progressApplicable },
        { ratio: koordinatRatio, weight: COMPLETENESS_WEIGHTS.koordinat, applicable: koordinatApplicable },
    ]

    const applicableWeight = dimensions
        .filter((dimension) => dimension.applicable)
        .reduce((sum, dimension) => sum + dimension.weight, 0)

    const weightedSum = dimensions
        .filter((dimension) => dimension.applicable)
        .reduce((sum, dimension) => sum + dimension.ratio * dimension.weight, 0)

    const score = applicableWeight > 0
        ? Math.round((weightedSum / applicableWeight) * 100)
        : 0

    return {
        score,
        foto: fotoApplicable ? Math.round(fotoRatio * 100) : 0,
        progress: Math.round(progressRatio * 100),
        penerima: penerimaApplicable ? Math.round(penerimaRatio * 100) : 0,
        koordinat: koordinatApplicable ? Math.round(koordinatRatio * 100) : 0,
    }
}

export function buildReviewRecommendations(
    detail: PekerjaanReviewDetail,
    stats: ReviewStatSummary,
    mapPoints: FotoMapPoint[],
): ReviewRecommendation[] {
    const recommendations: ReviewRecommendation[] = []
    const fotos = detail.foto ?? []
    const missingLevels = FOTO_LEVELS.filter(
        (level) => !fotos.some((foto) => foto.keterangan === level),
    )

    if ((detail.output ?? []).length === 0) {
        recommendations.push({
            severity: 'critical',
            title: 'Komponen output belum diisi',
            detail: 'Tambahkan komponen output pekerjaan agar target foto dan penerima dapat diukur.',
        })
    }

    if (stats.fotoCount === 0) {
        recommendations.push({
            severity: 'critical',
            title: 'Belum ada foto dokumentasi',
            detail: 'Unggah foto progress minimal 0% agar pekerjaan dapat diverifikasi visual.',
        })
    } else if (stats.fotoRequired && stats.fotoCount < stats.fotoRequired) {
        recommendations.push({
            severity: 'warning',
            title: 'Foto belum mencapai target',
            detail: `Tercatat ${stats.fotoCount} dari ${stats.fotoRequired} slot foto yang dibutuhkan.`,
        })
    }

    if (missingLevels.length > 0 && stats.fotoCount > 0) {
        recommendations.push({
            severity: 'info',
            title: 'Slot progress foto belum lengkap',
            detail: `Level yang belum ada: ${missingLevels.join(', ')}.`,
        })
    }

    if (stats.fotoCount > 0 && mapPoints.length < stats.fotoCount) {
        const tanpaKoordinat = stats.fotoCount - mapPoints.length
        recommendations.push({
            severity: 'warning',
            title: 'Sebagian foto tanpa koordinat valid',
            detail: `${tanpaKoordinat} foto tidak dapat ditampilkan di peta. Periksa format koordinat (lat, lng).`,
        })
    }

    const koordinatSummary = buildKoordinatDesaSummary(fotos)
    if (koordinatSummary.diluarDesa > 0) {
        const desaName = detail.desa?.nama_desa ?? 'desa pekerjaan'
        const kecName = detail.kecamatan?.nama_kecamatan
        const lokasi = kecName ? `Desa ${desaName}, Kec. ${kecName}` : `Desa ${desaName}`
        recommendations.push({
            severity: 'warning',
            title: 'Koordinat foto di luar desa pekerjaan',
            detail: `${koordinatSummary.diluarDesa} foto memiliki koordinat di luar ${lokasi}. Periksa ulang lokasi pengambilan foto atau koreksi koordinat.`,
        })
    }

    if (stats.penerimaCount === 0 && (detail.output ?? []).some((output) => !output.penerima_is_optional)) {
        recommendations.push({
            severity: 'critical',
            title: 'Daftar penerima masih kosong',
            detail: 'Komponen per unit membutuhkan data penerima manfaat.',
        })
    }

    if (stats.estimasiFisik === null && stats.progressItemWeighted === null && stats.progressFisik <= 0) {
        recommendations.push({
            severity: 'warning',
            title: 'Progress estimasi belum terinput',
            detail: 'Isi rencana dan realisasi di tab Progress pekerjaan untuk memantau deviasi.',
        })
    } else if (stats.deviasi < -5) {
        recommendations.push({
            severity: 'warning',
            title: 'Deviasi progress cukup besar',
            detail: `Realisasi tertinggal ${Math.abs(stats.deviasi).toFixed(1)}% dari rencana.`,
        })
    } else if (stats.deviasi > 5) {
        recommendations.push({
            severity: 'info',
            title: 'Realisasi di atas rencana',
            detail: `Realisasi unggul ${stats.deviasi.toFixed(1)}% dari rencana.`,
        })
    }

    if (!detail.pengawas?.nama) {
        recommendations.push({
            severity: 'info',
            title: 'Pengawas belum ditetapkan',
            detail: 'Tetapkan pengawas agar penanggung jawab lapangan jelas.',
        })
    }

    if (!detail.kontrak?.[0]?.penyedia?.nama) {
        recommendations.push({
            severity: 'info',
            title: 'Data kontrak/penyedia belum lengkap',
            detail: 'Lengkapi SPK dan penyedia untuk melengkapi profil pekerjaan.',
        })
    }

    return recommendations
}

export function buildOutputRows(detail: PekerjaanReviewDetail) {
    const fotos = detail.foto ?? []
    const penerimaCount = detail.penerima?.length ?? detail.penerima_count ?? 0

    return (detail.output ?? []).map((output) => {
        const outputFotos = fotos.filter((foto) => foto.komponen_id === output.id)
        const requiredUnits = output.penerima_is_optional
            ? 1
            : Math.max(1, Math.round(output.volume || 1))

        return {
            id: output.id,
            komponen: output.komponen,
            volume: output.volume,
            satuan: output.satuan,
            tipe: output.penerima_is_optional ? 'Komunal' : 'Per unit',
            fotoCount: outputFotos.length,
            requiredFoto: requiredUnits * 5,
            requiredUnits,
        }
    }).map((row) => ({
        ...row,
        penerimaHint: row.tipe === 'Komunal' ? '-' : String(penerimaCount),
    }))
}