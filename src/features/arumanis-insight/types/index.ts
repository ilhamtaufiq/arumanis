import type { ChartData } from '@/features/dashboard/types'

export type InsightScope = 'all' | 'kecamatan' | 'desa' | 'filera'
export type InsightBidang = 'air_minum' | 'sanitasi' | 'all'

export interface InsightScopeFilter {
    scope: InsightScope
    bidang?: InsightBidang
    kecamatan_id?: number
    desa_id?: number
    filera_id?: number
}

export interface InsightItem {
    title: string
    content: string
    source?: string
}

export interface KecamatanInsightData {
    kecamatan_id: number
    kecamatan_name: string
    highlight: InsightItem[]
    insight: InsightItem[]
    rekomendasi: InsightItem[]
    coverage_percentage?: number
    total_sr?: number
    total_kk?: number
    total_jiwa?: number
    total_target?: number
    nrd?: number
    desa_count?: number
    unit_count?: number
}

export interface ArumanisInsightData {
    total_kecamatan: number
    total_desa: number
    coverage_percentage: number
    total_sr: number
    total_kk: number
    total_jiwa: number
    total_target: number
    nrd?: number
    highlight: InsightItem[]
    insight: InsightItem[]
    rekomendasi: InsightItem[]
    kecamatan_data: KecamatanInsightData[]
    air_minum?: AirMinumInsight
    sanitasi?: SanitasiInsight
    regional_gaps?: ChartData[]
    funding_distribution?: ChartData[]
}

export interface AirMinumInsight {
    enabled: boolean
    total_sr: number
    total_kk: number
    total_jiwa: number
    total_target: number
    total_bjp_kk: number
    coverage_percentage: number
    total_units: number
    nrd?: number
    insight: {
        highlight: InsightItem[]
        insight: InsightItem[]
        rekomendasi: InsightItem[]
    }
}

export interface SanitasiInsight {
    enabled: boolean
    total_infrastruktur: number
    total_pemanfaat_kk: number
    total_pemanfaat_jiwa: number
    total_penduduk: number
    target_kk: number
    coverage_percentage: number
    gap_kk: number
    gap_jiwa: number
    desa_with_infrastruktur: number
    desa_without_infrastruktur: number
    by_jenis: Record<string, { unit_count: number; pemanfaat_kk: number; pemanfaat_jiwa: number }>
    insight: {
        highlight: InsightItem[]
        insight: InsightItem[]
        rekomendasi: InsightItem[]
    }
}
