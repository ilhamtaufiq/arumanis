/**
 * Helper agregasi capaian SPM (air minum & sanitasi) untuk rekap
 * total, per kecamatan, per desa, dan tren tahunan.
 */

export type SpmRekapDesaInput = {
    desaId: number
    desa: string
    kecamatan: string
    /** Target KK */
    target: number
    /** KK terlayani / pemanfaat */
    capaian: number
    jiwa: number
    unit: number
    sr?: number
    /** Bagian capaian yang berasal dari BJP (sudah termasuk di `capaian`) */
    bjp?: number
}

export type SpmRekapWilayahRow = {
    key: string
    nama: string
    kecamatan: string
    desaId?: number
    target: number
    capaian: number
    jiwa: number
    unit: number
    sr: number
    bjp: number
    gap: number
    /** Persentase capaian terhadap target; null jika target kosong */
    coverage: number | null
    desaCount: number
    desaTuntas: number
    desaTanpaCapaian: number
}

export type SpmCoverageTier = 'none' | 'low' | 'mid' | 'high' | 'full'

export const SPM_COVERAGE_TIERS: { tier: SpmCoverageTier; label: string; hint: string }[] = [
    { tier: 'full', label: 'Tuntas', hint: '≥ 100%' },
    { tier: 'high', label: 'Tinggi', hint: '70–99%' },
    { tier: 'mid', label: 'Sedang', hint: '40–69%' },
    { tier: 'low', label: 'Rendah', hint: '< 40%' },
    { tier: 'none', label: 'Belum ada', hint: '0%' },
]

export function coveragePercent(capaian: number, target: number): number | null {
    if (!target || target <= 0) return null
    return (capaian / target) * 100
}

export function getCoverageTier(coverage: number | null): SpmCoverageTier {
    if (coverage == null || coverage <= 0) return 'none'
    if (coverage >= 100) return 'full'
    if (coverage >= 70) return 'high'
    if (coverage >= 40) return 'mid'
    return 'low'
}

function toNumber(value: unknown): number {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
}

function finalizeRow(
    row: Omit<SpmRekapWilayahRow, 'gap' | 'coverage'>,
): SpmRekapWilayahRow {
    return {
        ...row,
        gap: Math.max(0, row.target - row.capaian),
        coverage: coveragePercent(row.capaian, row.target),
    }
}

export function buildDesaRows(inputs: SpmRekapDesaInput[]): SpmRekapWilayahRow[] {
    return inputs.map((input) => {
        const target = toNumber(input.target)
        const capaian = toNumber(input.capaian)
        const coverage = coveragePercent(capaian, target)
        return finalizeRow({
            key: `desa-${input.desaId}`,
            nama: input.desa,
            kecamatan: input.kecamatan,
            desaId: input.desaId,
            target,
            capaian,
            jiwa: toNumber(input.jiwa),
            unit: toNumber(input.unit),
            sr: toNumber(input.sr),
            bjp: toNumber(input.bjp),
            desaCount: 1,
            desaTuntas: coverage != null && coverage >= 100 ? 1 : 0,
            desaTanpaCapaian: capaian <= 0 ? 1 : 0,
        })
    })
}

export function aggregateByKecamatan(inputs: SpmRekapDesaInput[]): SpmRekapWilayahRow[] {
    const groups = new Map<string, Omit<SpmRekapWilayahRow, 'gap' | 'coverage'>>()

    for (const desaRow of buildDesaRows(inputs)) {
        const name = desaRow.kecamatan || 'Tanpa Kecamatan'
        const current = groups.get(name) ?? {
            key: `kec-${name}`,
            nama: name,
            kecamatan: name,
            target: 0,
            capaian: 0,
            jiwa: 0,
            unit: 0,
            sr: 0,
            bjp: 0,
            desaCount: 0,
            desaTuntas: 0,
            desaTanpaCapaian: 0,
        }
        current.target += desaRow.target
        current.capaian += desaRow.capaian
        current.jiwa += desaRow.jiwa
        current.unit += desaRow.unit
        current.sr += desaRow.sr
        current.bjp += desaRow.bjp
        current.desaCount += 1
        current.desaTuntas += desaRow.desaTuntas
        current.desaTanpaCapaian += desaRow.desaTanpaCapaian
        groups.set(name, current)
    }

    return [...groups.values()].map(finalizeRow)
}

export function summarizeRows(rows: SpmRekapWilayahRow[]) {
    const totals = rows.reduce(
        (acc, row) => {
            acc.target += row.target
            acc.capaian += row.capaian
            acc.jiwa += row.jiwa
            acc.unit += row.unit
            acc.sr += row.sr
            acc.bjp += row.bjp
            acc.desaCount += row.desaCount
            acc.desaTuntas += row.desaTuntas
            acc.desaTanpaCapaian += row.desaTanpaCapaian
            return acc
        },
        {
            target: 0,
            capaian: 0,
            jiwa: 0,
            unit: 0,
            sr: 0,
            bjp: 0,
            desaCount: 0,
            desaTuntas: 0,
            desaTanpaCapaian: 0,
        },
    )

    return {
        ...totals,
        gap: Math.max(0, totals.target - totals.capaian),
        coverage: coveragePercent(totals.capaian, totals.target),
    }
}

export function countTiers(rows: SpmRekapWilayahRow[]): Record<SpmCoverageTier, number> {
    const counts: Record<SpmCoverageTier, number> = { none: 0, low: 0, mid: 0, high: 0, full: 0 }
    for (const row of rows) {
        counts[getCoverageTier(row.coverage)] += 1
    }
    return counts
}

export type SpmRekapSortKey = 'coverage' | 'capaian' | 'gap' | 'target' | 'nama'

export function sortWilayahRows(
    rows: SpmRekapWilayahRow[],
    key: SpmRekapSortKey,
    direction: 'asc' | 'desc',
): SpmRekapWilayahRow[] {
    const factor = direction === 'asc' ? 1 : -1
    return [...rows].sort((left, right) => {
        if (key === 'nama') {
            return factor * left.nama.localeCompare(right.nama, 'id')
        }
        const a = key === 'coverage' ? (left.coverage ?? -1) : left[key]
        const b = key === 'coverage' ? (right.coverage ?? -1) : right[key]
        if (a === b) return left.nama.localeCompare(right.nama, 'id')
        return factor * (a - b)
    })
}

export type SpmYearlyInput = {
    tahun: string
    /** Tambahan KK terlayani pada tahun tersebut */
    capaian: number
    jiwa: number
    sr?: number
    unit?: number
}

export type SpmYearlyRow = {
    tahun: string
    capaian: number
    jiwa: number
    sr: number
    unit: number
    /** Akumulasi capaian dari tahun pertama s/d tahun ini */
    kumulatif: number
    /** Selisih tambahan dibanding tahun sebelumnya */
    delta: number | null
    deltaPct: number | null
    /** Kenaikan cakupan (poin persen) yang disumbang tahun ini */
    coverageGain: number | null
    /** Cakupan kumulatif terhadap target */
    coverageKumulatif: number | null
}

/**
 * @param baseline capaian yang tidak memiliki tahun / sebelum tahun pertama,
 *   dijadikan titik awal akumulasi.
 */
export function buildYearlyRows(
    inputs: SpmYearlyInput[],
    target: number,
    baseline = 0,
): SpmYearlyRow[] {
    const sorted = [...inputs].sort((a, b) => Number(a.tahun) - Number(b.tahun))
    let kumulatif = Math.max(0, toNumber(baseline))
    let previous: number | null = null

    return sorted.map((input) => {
        const capaian = toNumber(input.capaian)
        kumulatif += capaian
        const delta = previous == null ? null : capaian - previous
        const deltaPct =
            previous == null || previous <= 0 ? null : ((capaian - previous) / previous) * 100
        previous = capaian

        return {
            tahun: input.tahun,
            capaian,
            jiwa: toNumber(input.jiwa),
            sr: toNumber(input.sr),
            unit: toNumber(input.unit),
            kumulatif,
            delta,
            deltaPct,
            coverageGain: coveragePercent(capaian, target),
            coverageKumulatif: coveragePercent(kumulatif, target),
        }
    })
}

/** Tahun terakhir yang memiliki tambahan capaian (> 0). */
export function getLatestIncrease(rows: SpmYearlyRow[]): SpmYearlyRow | null {
    for (let i = rows.length - 1; i >= 0; i -= 1) {
        if (rows[i].capaian > 0) return rows[i]
    }
    return null
}

/** Tahun dengan tambahan capaian tertinggi. */
export function getPeakYear(rows: SpmYearlyRow[]): SpmYearlyRow | null {
    return rows.reduce<SpmYearlyRow | null>(
        (best, row) => (row.capaian > 0 && (!best || row.capaian > best.capaian) ? row : best),
        null,
    )
}

export function normalizeWilayahName(name?: string | null): string {
    return (name ?? '').trim().toLowerCase()
}

function escapeCsv(value: string | number): string {
    const text = String(value)
    return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function buildCsv(headers: string[], rows: (string | number)[][]): string {
    return [headers, ...rows].map((row) => row.map(escapeCsv).join(';')).join('\n')
}

export type SpmYearMatrixRow = {
    key: string
    nama: string
    kecamatan: string
    desaId?: number
    /** Tambahan capaian per tahun */
    values: Record<string, number>
    total: number
    /** Jumlah tahun dengan tambahan > 0 */
    activeYears: number
}

/**
 * Matriks tambahan capaian per wilayah × tahun.
 * `byYear[i]` berisi capaian per desa pada `years[i]`.
 */
export function buildYearMatrix(
    years: readonly string[],
    byYear: readonly (SpmRekapDesaInput[] | undefined)[],
    mode: 'kecamatan' | 'desa',
): SpmYearMatrixRow[] {
    const rows = new Map<string, SpmYearMatrixRow>()

    years.forEach((year, index) => {
        for (const input of byYear[index] ?? []) {
            const kecamatan = input.kecamatan || 'Tanpa Kecamatan'
            const key = mode === 'desa' ? `desa-${input.desaId}` : `kec-${kecamatan}`
            const row = rows.get(key) ?? {
                key,
                nama: mode === 'desa' ? input.desa : kecamatan,
                kecamatan,
                desaId: mode === 'desa' ? input.desaId : undefined,
                values: {},
                total: 0,
                activeYears: 0,
            }
            const value = toNumber(input.capaian)
            row.values[year] = (row.values[year] ?? 0) + value
            row.total += value
            rows.set(key, row)
        }
    })

    for (const row of rows.values()) {
        row.activeYears = years.filter((year) => (row.values[year] ?? 0) > 0).length
    }

    return [...rows.values()]
}

export type SpmProjectionPoint = {
    tahun: string
    /** Cakupan (%) bila mengikuti jalur lurus menuju target */
    targetPath: number | null
    /** Cakupan (%) bila laju rata-rata terakhir berlanjut */
    proyeksi: number | null
}

export type SpmProjection = {
    targetPercent: number
    targetYear: number
    lastYear: number
    current: number
    currentCoverage: number | null
    targetKk: number
    remaining: number
    yearsLeft: number
    /** Tambahan per tahun yang dibutuhkan agar target tercapai tepat waktu */
    requiredPerYear: number
    /** Rata-rata tambahan beberapa tahun terakhir */
    averagePerYear: number
    averageYears: number
    /** Perkiraan tahun target tercapai dengan laju rata-rata; null bila tidak tercapai */
    estimatedYear: number | null
    onTrack: boolean
    /** Kelipatan percepatan yang dibutuhkan (required / average) */
    accelerationFactor: number | null
    points: SpmProjectionPoint[]
}

/**
 * Proyeksi pencapaian target cakupan berdasarkan realisasi tahunan.
 * `rows` adalah hasil `buildYearlyRows` (urut naik).
 */
export function buildProjection(
    rows: SpmYearlyRow[],
    targetBase: number,
    options: { targetPercent: number; targetYear: number; averageYears?: number },
): SpmProjection | null {
    const last = rows.at(-1)
    if (!last || targetBase <= 0) return null

    const averageYears = Math.max(1, Math.min(options.averageYears ?? 3, rows.length))
    const lastYear = Number(last.tahun)
    const targetKk = (targetBase * options.targetPercent) / 100
    const current = last.kumulatif
    const remaining = Math.max(0, targetKk - current)
    const yearsLeft = Math.max(0, options.targetYear - lastYear)
    const requiredPerYear = remaining <= 0 ? 0 : yearsLeft > 0 ? remaining / yearsLeft : remaining
    const recent = rows.slice(-averageYears)
    const averagePerYear = recent.reduce((sum, row) => sum + row.capaian, 0) / recent.length

    let estimatedYear: number | null
    if (remaining <= 0) estimatedYear = lastYear
    else if (averagePerYear > 0) estimatedYear = lastYear + Math.ceil(remaining / averagePerYear)
    else estimatedYear = null

    const onTrack = remaining <= 0 || (yearsLeft > 0 && averagePerYear >= requiredPerYear)
    const accelerationFactor =
        remaining <= 0 ? null : averagePerYear > 0 ? requiredPerYear / averagePerYear : null

    const toPct = (kk: number) => (kk / targetBase) * 100
    const points: SpmProjectionPoint[] = []
    for (let year = lastYear; year <= Math.max(lastYear, options.targetYear); year += 1) {
        const step = year - lastYear
        points.push({
            tahun: String(year),
            targetPath: toPct(Math.min(targetKk, current + requiredPerYear * step)),
            proyeksi: toPct(current + averagePerYear * step),
        })
    }

    return {
        targetPercent: options.targetPercent,
        targetYear: options.targetYear,
        lastYear,
        current,
        currentCoverage: coveragePercent(current, targetBase),
        targetKk,
        remaining,
        yearsLeft,
        requiredPerYear,
        averagePerYear,
        averageYears,
        estimatedYear,
        onTrack,
        accelerationFactor,
        points,
    }
}
