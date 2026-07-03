export interface SpseSessionStatus {
    connected: boolean;
    is_active: boolean;
    message: string;
    lpse_slug?: string;
    last_validated_at?: string;
    expires_at?: string;
}

export interface ProcurementSyncRun {
    id: number;
    status: string;
    item_count: number;
    matched_count: number;
    error_log: string | null;
    started_at: string | null;
    finished_at: string | null;
}

export interface ProcurementStagingPaket {
    id: number;
    sync_run_id: number;
    sumber: string;
    kode_paket: string;
    nama_paket: string;
    status_paket: string | null;
    metode_pengadaan: string | null;
    jenis_paket: string | null;
    matched_pekerjaan_id: number | null;
    matched_kontrak_id: number | null;
    match_status: string;
    pekerjaan?: { id: number; nama_paket: string } | null;
    kontrak?: { id: number; kode_paket: string | null; spk: string | null } | null;
}

export interface ProcurementStagingDetail extends ProcurementStagingPaket {
    raw_row?: unknown[] | null;
    fetched_at?: string | null;
    spse_url?: string;
    pekerjaan?: {
        id: number;
        nama_paket: string;
        kode_rekening?: string | null;
        pagu?: number;
        kegiatan?: { id: number; nama_kegiatan: string; tahun_anggaran: string } | null;
        kecamatan?: { id: number; nama: string } | null;
        desa?: { id: number; nama: string } | null;
    } | null;
    kontrak?: {
        id: number;
        kode_paket: string | null;
        spk: string | null;
        nilai_kontrak?: number | null;
        tgl_spk?: string | null;
    } | null;
    sync_run?: ProcurementSyncRun | null;
}

export interface StagingPaginated {
    data: ProcurementStagingPaket[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface SpsePackageDocument {
    id: string;
    url: string;
    label: string;
    source_page: string;
    kind: 'download' | 'generated' | 'endpoint' | 'html_page' | string;
    doc_type: string;
}

export interface SpseDocumentImportResult {
    index: number;
    status: 'imported' | 'failed';
    url: string;
    reason?: string;
    berkas?: {
        id: number;
        jenis_dokumen: string;
        pekerjaan_id: number;
        berkas_url: string;
    };
}