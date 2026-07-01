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
    pekerjaan?: IntegrationPekerjaan[];
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

export interface SpamStatsMetricBlock {
    label: string;
    keterangan?: string;
    sr: number;
    kk: number;
    jiwa: number;
    nilai_kontrak: number;
}

export interface SpamStatsIntegrasiBlock {
    label: string;
    paket_tertaut: number;
    paket_tersedia: number;
    paket_belum_tertaut: number;
    unit_dengan_tautan: number;
    desa_terintegrasi: number;
    desa_partial: number;
    desa_tanpa_unit: number;
    desa_tanpa_pekerjaan: number;
}

export interface SpamStatsRingkasan {
    scope_label: string;
    baseline_cap_tahun?: string;
    accumulation_start_tahun?: string;
    baseline?: SpamStatsMetricBlock;
    capaian_integrasi?: SpamStatsMetricBlock;
    capaian: SpamStatsMetricBlock;
    integrasi: SpamStatsIntegrasiBlock;
    potensi: SpamStatsMetricBlock;
    dari_tautan: Omit<SpamStatsMetricBlock, 'keterangan'> & { label: string };
    selisih_potensi_capaian: {
        sr: number;
        kk: number;
        jiwa: number;
        nilai_kontrak: number;
    };
    spm: {
        target_kk: number;
        jp_kk: number;
        bjp_master_kk: number;
        bjp_unit_kk: number;
        total_bjp_kk: number;
        coverage_percentage: number;
    };
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
    wilayah_total_desa?: number;
    wilayah_total_kecamatan?: number;
    achievement_records?: number;
    total_pekerjaan_all?: number;
    total_foto_dokumentasi?: number;
    stats_generated_at?: string;
    total_pekerjaan?: number;
    linked_pekerjaan_count?: number;
    linked_units_count?: number;
    paket_belum_tertaut?: number;
    linked_sr?: number;
    linked_kk?: number;
    linked_jiwa?: number;
    linked_nilai_kontrak?: number;
    capaian_sr?: number;
    capaian_kk?: number;
    capaian_jiwa?: number;
    capaian_nilai_kontrak?: number;
    capaian_integrasi_sr?: number;
    capaian_integrasi_kk?: number;
    capaian_integrasi_jiwa?: number;
    capaian_integrasi_nilai_kontrak?: number;
    capaian_baseline_sr?: number;
    capaian_baseline_kk?: number;
    capaian_baseline_jiwa?: number;
    capaian_baseline_nilai_kontrak?: number;
    baseline_cap_tahun?: string;
    accumulation_start_tahun?: string;
    potensi_sr?: number;
    potensi_kk?: number;
    potensi_jiwa?: number;
    potensi_nilai_kontrak?: number;
    selisih_sr?: number;
    selisih_kk?: number;
    selisih_jiwa?: number;
    selisih_nilai_kontrak?: number;
    total_linked?: number;
    ringkasan?: SpamStatsRingkasan;
}

export type SyncStatus = 'matched' | 'partial' | 'no_unit' | 'no_pekerjaan' | 'no_data';

export type SpamAirMinumOutputType =
    | 'sambungan_rumah'
    | 'pipa_jaringan'
    | 'reservoir'
    | 'sumber_air'
    | 'bjp';

export type SpamCapaianMetric = 'jp' | 'bjp';

export interface AirMinumOutput {
    id: number;
    komponen: string;
    satuan?: string;
    volume: number;
    output_type?: SpamAirMinumOutputType;
    suggested_capaian_metric?: SpamCapaianMetric;
}

export type SyncMode = 'achievement' | 'budget' | 'all';

export interface DerivedMetrics {
    sr: number;
    kk: number;
    jiwa: number;
    bjp_kk?: number;
    bjp_jiwa?: number;
    capaian_metric?: SpamCapaianMetric;
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
    bjp_kk?: number;
    bjp_jiwa?: number;
    capaian_metric?: SpamCapaianMetric;
    penerima_count: number;
    foto_count: number;
    air_minum_outputs?: AirMinumOutput[];
    output_types?: SpamAirMinumOutputType[];
    derived?: DerivedMetrics & { pembiayaan_suggested?: number };
    is_linked?: boolean;
    linked_unit_ids?: number[];
}

export interface IntegrationUnit {
    id: number;
    name?: string;
    is_simspam: boolean;
    sistem_layanan?: string;
    pokmas?: string;
    kepala?: string;
    linked_pekerjaan_count?: number;
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
    linked_count?: number;
    pekerjaan: IntegrationPekerjaan[];
    output_types?: SpamAirMinumOutputType[];
    output_type_filter?: SpamAirMinumOutputType | null;
    derived: DerivedMetrics;
    manual: ManualMetrics;
    manual_integrasi?: ManualMetrics;
    baseline_cap_tahun?: string;
    accumulation_start_tahun?: string;
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
    total_linked?: number;
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

export interface SpamIntegrationOutputOption {
    komponen: string;
    output_type?: SpamAirMinumOutputType | null;
    is_integrasi: boolean;
    pekerjaan_count: number;
    label: string;
}

export interface SpamIntegrationFilters {
    tahun?: string;
    kecamatan_id?: number;
    desa_id?: number;
    search?: string;
    sync_status?: SyncStatus;
    output_type?: SpamAirMinumOutputType;
    komponen?: string;
    page?: number;
    per_page?: number;
}

export interface SpamAirMinumPekerjaanFilters {
    tahun?: string;
    kecamatan_id?: number;
    desa_id?: number;
    search?: string;
    output_type?: SpamAirMinumOutputType;
    unit_spam_id?: number;
    unlinked_only?: boolean;
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
