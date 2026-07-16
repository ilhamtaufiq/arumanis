export type DataQualityIssue =
    | 'no_coordinates'
    | 'no_photos'
    | 'started_no_photos'
    | 'no_contracts'

export interface DataQualityItem {
    id: number
    nama_paket: string
    kode_rekening: string | null
    pagu: number | null
    kecamatan: string | null
    desa: string | null
    pengawas: string | null
    issue: DataQualityIssue
    href: string
}

export interface DataQualityItemsResponse {
    success: boolean
    data: DataQualityItem[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
}

export interface ActionInboxItem {
    id: string
    source: string
    title: string
    detail: string
    severity: 'high' | 'medium' | 'low'
    count: number
    href: string
}

export interface ActionInboxResponse {
    success: boolean
    data: {
        generated_at: string
        stats: Record<string, number>
        actions: ActionInboxItem[]
        total_actions: number
    }
}

export const DATA_QUALITY_ISSUE_LABELS: Record<DataQualityIssue, string> = {
    no_coordinates: 'Tanpa koordinat',
    no_photos: 'Tanpa foto',
    started_no_photos: 'Berkontrak tanpa foto',
    no_contracts: 'Tanpa kontrak',
}
