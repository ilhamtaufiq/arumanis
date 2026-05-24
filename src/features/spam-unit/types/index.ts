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
    total_target: number;
    total_sr: number;
    total_kk: number;
    total_jiwa: number;
    total_bjp_kk: number;
    total_bjp_jiwa: number;
    funding_distribution: FundingDist[];
    coverage_percentage: number;
}
