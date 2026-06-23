import type { Foto } from '@/features/foto/types'
import type { Output } from '@/features/output/types'
import type { Pekerjaan } from '@/features/pekerjaan/types'

export type PekerjaanOutputItem = NonNullable<Pekerjaan['output']>[number]

export type MapCoords = { lat: number; lng: number }

export const PROGRESS_MARKER_COLORS: Record<string, string> = {
    '0%': '#94a3b8',
    '25%': '#f59e0b',
    '50%': '#3b82f6',
    '75%': '#8b5cf6',
    '100%': '#10b981',
}

export function parseKoordinat(koordinat?: string | null): MapCoords | null {
    if (!koordinat) return null
    const parts = koordinat.split(',')
    if (parts.length !== 2) return null
    const lat = parseFloat(parts[0].trim())
    const lng = parseFloat(parts[1].trim())
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null
    return { lat, lng }
}

export function normalizeVillageKey(name?: string | null) {
    return (name || '').toUpperCase().replace(/\s+/g, '')
}

export function getProgressColor(label?: string | null) {
    return PROGRESS_MARKER_COLORS[label || ''] ?? '#6366f1'
}

export function filterFotoWithCoords(fotos: Foto[] = []) {
    return fotos
        .map((foto) => {
            const coords = parseKoordinat(foto.koordinat)
            if (!coords) return null
            return { foto, coords }
        })
        .filter((entry): entry is { foto: Foto; coords: MapCoords } => entry !== null)
}

export function buildJobsByVillage(jobs: Pekerjaan[] = []) {
    const counts: Record<string, number> = {}
    jobs.forEach((job) => {
        const villageKey = normalizeVillageKey(job.desa?.nama_desa)
        if (!villageKey) return
        counts[villageKey] = (counts[villageKey] || 0) + 1
    })
    return counts
}

export function choroplethFillColor(intensity: number, selected: boolean, villageSelected: boolean) {
    if (villageSelected) return '#10b981'
    if (selected) return '#4f46e5'
    const clamped = Math.max(0, Math.min(1, intensity))
    const hue = 234
    const saturation = 62 + clamped * 24
    const lightness = 92 - clamped * 44
    return `hsl(${hue} ${saturation}% ${lightness}%)`
}

export function formatProgressLabel(label?: string | null) {
    return label || 'Tanpa tahap'
}

const PROGRESS_ORDER = ['0%', '25%', '50%', '75%', '100%'] as const

function progressSortIndex(label?: string | null) {
    const index = PROGRESS_ORDER.indexOf((label || '') as (typeof PROGRESS_ORDER)[number])
    return index === -1 ? 0 : index
}

export function getHighestProgressLabel(fotos: Foto[] = []) {
    let highest = PROGRESS_ORDER[0]
    let highestIndex = 0
    fotos.forEach((foto) => {
        const index = progressSortIndex(foto.keterangan)
        if (index >= highestIndex) {
            highestIndex = index
            highest = PROGRESS_ORDER[index]
        }
    })
    return highest
}

export function sortFotosForGallery(fotos: Foto[] = []) {
    return [...fotos].sort((left, right) => {
        const progressDiff = progressSortIndex(right.keterangan) - progressSortIndex(left.keterangan)
        if (progressDiff !== 0) return progressDiff
        return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    })
}

export type MapPekerjaanPin = {
    pekerjaanId: number
    namaPaket: string
    coords: MapCoords
    fotos: Foto[]
    highestProgress: string
    job: Pekerjaan | null
    outputs: NonNullable<Pekerjaan['output']>
    lokasi: string
    progressTotal: number | null
}

export function buildOutputsByPekerjaan(outputs: Output[] = []) {
    const map = new Map<number, PekerjaanOutputItem[]>()
    outputs.forEach((output) => {
        const current = map.get(output.pekerjaan_id) ?? []
        current.push({
            id: output.id,
            komponen: output.komponen,
            volume: output.volume,
            satuan: output.satuan,
            penerima_is_optional: output.penerima_is_optional,
        })
        map.set(output.pekerjaan_id, current)
    })
    return map
}

function resolvePekerjaanOutputs(
    pekerjaanId: number,
    job: Pekerjaan | null,
    outputsByPekerjaan: Map<number, PekerjaanOutputItem[]>,
) {
    if (job?.output?.length) return job.output
    return outputsByPekerjaan.get(pekerjaanId) ?? []
}

export function buildPekerjaanPins(
    mappedPhotos: Array<{ foto: Foto; coords: MapCoords }>,
    jobs: Pekerjaan[] = [],
    outputs: Output[] = [],
): MapPekerjaanPin[] {
    const jobsById = new Map(jobs.map((job) => [job.id, job]))
    const outputsByPekerjaan = buildOutputsByPekerjaan(outputs)
    const groups = new Map<number, { fotos: Foto[]; coords: MapCoords[] }>()

    mappedPhotos.forEach(({ foto, coords }) => {
        const pekerjaanId = foto.pekerjaan_id
        const group = groups.get(pekerjaanId) ?? { fotos: [], coords: [] }
        group.fotos.push(foto)
        group.coords.push(coords)
        groups.set(pekerjaanId, group)
    })

    return Array.from(groups.entries()).map(([pekerjaanId, group]) => {
        const job = jobsById.get(pekerjaanId) ?? group.fotos[0]?.pekerjaan ?? null
        const fotos = sortFotosForGallery(group.fotos)
        const lat = group.coords.reduce((sum, coord) => sum + coord.lat, 0) / group.coords.length
        const lng = group.coords.reduce((sum, coord) => sum + coord.lng, 0) / group.coords.length

        return {
            pekerjaanId,
            namaPaket: job?.nama_paket ?? fotos[0]?.pekerjaan?.nama_paket ?? 'Tanpa nama paket',
            coords: { lat, lng },
            fotos,
            highestProgress: getHighestProgressLabel(fotos),
            job,
            outputs: resolvePekerjaanOutputs(pekerjaanId, job, outputsByPekerjaan),
            lokasi: [job?.desa?.nama_desa, job?.kecamatan?.nama_kecamatan].filter(Boolean).join(', '),
            progressTotal: job?.progress_total ?? null,
        }
    })
}