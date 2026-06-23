import type { Desa } from '../../desa/types';

export interface SpamAchievement {
    id: number;
    unit_spam_id: number;
    tahun: string;
    jumlah_sr: number;
    jumlah_kk: number;
    jumlah_jiwa: number;
    jumlah_bjp_kk: number;
    jumlah_bjp_jiwa: number;
    catatan?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Pengelola {
    id: number;
    unit_spam_id: number;
    pokmas?: string;
    perdes?: string;
    kepala?: string;
    bendahara?: string;
    sekretaris?: string;
    created_at?: string;
    updated_at?: string;
}

export interface UnitChecklist {
    id: number;
    unit_spam_id: number;
    item: string;
    is_checked: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface SpamBudget {
    id: number;
    unit_spam_id: number;
    nilai_kontrak: number;
    tahun: string;
    nama_paket?: string;
    sumber_dana?: string;
    created_at?: string;
    updated_at?: string;
}

export interface UnitSpam {
    id: number;
    desa_id: number;
    name?: string;
    is_simspam: boolean;
    sistem_layanan?: string;
    sumber_mata_air_kap?: string;
    sumber_air_tanah_kap?: string;
    lain_lain_kap?: string;
    created_at?: string;
    updated_at?: string;
    desa?: Desa;
    pengelola?: Pengelola;
    achievements?: SpamAchievement[];
    checklists?: UnitChecklist[];
    budgets?: SpamBudget[];
}

export interface UnitSpamResponse {
    success: boolean;
    data: UnitSpam[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface FundingDist {
    sumber_dana: string;
    count: number;
}

export interface UnitSpamStats {
    total_units: number;
    simspam_count: number;
    non_simspam_count: number;
    target_year: string;
    manual_scope_label?: string;
    manual_cap_tahun?: string;
    total_target: number;
    total_sr: number;
    total_kk: number;
    total_jiwa: number;
    total_bjp_kk: number;
    total_bjp_jiwa: number;
    funding_distribution: FundingDist[];
    coverage_percentage: number;
    pekerjaan_air_minum_count?: number;
    derived_sr?: number;
    derived_kk?: number;
    derived_jiwa?: number;
    derived_nilai_kontrak?: number;
    manual_sr?: number;
    manual_kk?: number;
    manual_jiwa?: number;
    manual_nilai_kontrak?: number;
    matched_count?: number;
    partial_count?: number;
    no_unit_count?: number;
    no_pekerjaan_count?: number;
}

export type SyncStatus = 'matched' | 'partial' | 'no_unit' | 'no_pekerjaan';

export type SyncMode = 'achievement' | 'budget' | 'all';

export interface DerivedMetrics {
    sr: number;
    kk: number;
    jiwa: number;
    nilai_kontrak: number;
    progress_avg?: number;
}

export interface ManualMetrics {
    sr: number;
    kk: number;
    jiwa: number;
    nilai_kontrak: number;
}

export interface IntegrationPekerjaan {
    id: number;
    nama_paket: string;
    pagu: number;
    tahun_anggaran: string;
    sumber_dana: string;
    progress_total: number;
    nilai_kontrak: number;
    sr: number;
    kk: number;
    jiwa: number;
    penerima_count: number;
    foto_count: number;
}

export interface IntegrationUnit {
    id: number;
    name?: string;
    is_simspam: boolean;
    sistem_layanan?: string;
    pokmas?: string;
    kepala?: string;
}

export interface SpamDesaIntegration {
    desa: {
        id: number;
        n_desa: string;
        target?: number;
        bjp_master?: number;
        kecamatan: { id: number; n_kec: string };
    };
    units: IntegrationUnit[];
    unit_count: number;
    pekerjaan_count: number;
    pekerjaan: IntegrationPekerjaan[];
    derived: DerivedMetrics;
    manual: ManualMetrics;
    sync_status: SyncStatus;
}

export interface IntegrationSummary {
    total_desa: number;
    matched_count: number;
    partial_count: number;
    no_unit_count: number;
    no_pekerjaan_count: number;
    total_pekerjaan: number;
    total_units: number;
}

export interface SpamIntegrationResponse {
    success: boolean;
    data: SpamDesaIntegration[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary?: IntegrationSummary;
}

export interface SpamIntegrationFilters {
    tahun?: string;
    kecamatan_id?: number;
    desa_id?: number;
    search?: string;
    sync_status?: SyncStatus;
    page?: number;
    per_page?: number;
}

export interface SpamUnitFilters {
    page?: number;
    per_page?: number;
    search?: string;
    kecamatan_id?: number;
    desa_id?: number;
    is_simspam?: string | number;
    tahun?: string;
}
