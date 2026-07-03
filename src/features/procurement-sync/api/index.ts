import api from '@/lib/api-client';
import type {
    ProcurementStagingDetail,
    ProcurementSyncRun,
    SpseDocumentImportResult,
    SpsePackageDocument,
    SpseSessionStatus,
    StagingPaginated,
} from '@/features/procurement-sync/types';

const BASE = '/procurement/spse';

export async function fetchSpseStatus() {
    return api.get<SpseSessionStatus>(`${BASE}/status`);
}

export async function saveSpseSession(payload: {
    cookie_header?: string;
    cookies?: Array<{ name: string; value: string; domain?: string; path?: string }>;
    lpse_slug?: string;
}) {
    return api.post<{ message: string }>(`${BASE}/session`, payload);
}

export async function revokeSpseSession() {
    return api.delete<{ message: string }>(`${BASE}/session`);
}

export async function triggerSpseSync(pageLength = 100) {
    return api.post<{ message: string; run: ProcurementSyncRun }>(`${BASE}/sync`, { page_length: pageLength });
}

export async function fetchSpseSyncRuns() {
    return api.get<{ data: ProcurementSyncRun[] }>(`${BASE}/sync/runs`);
}

export async function fetchSpseStagingDetail(id: number) {
    return api.get<{ data: ProcurementStagingDetail }>(`${BASE}/staging/${id}`);
}

export async function fetchSpseStaging(params?: {
    sync_run_id?: number;
    match_status?: string;
    search?: string;
    tahun?: string;
    per_page?: number;
    page?: number;
}) {
    return api.get<StagingPaginated>(`${BASE}/staging`, { params });
}

export async function applySpseStaging(ids: number[], overwrite = false) {
    return api.post<{ message: string; applied: number; skipped: number }>(`${BASE}/staging/apply`, {
        ids,
        overwrite,
    });
}

export async function mapSpseStaging(id: number, pekerjaanId: number) {
    return api.post<{ message: string }>(`${BASE}/staging/map`, {
        id,
        pekerjaan_id: pekerjaanId,
    });
}

export async function fetchSpsePackageDocuments(
    kodePaket: string,
    jenisPaket?: string,
) {
    return api.get<{ kode_paket: string; count: number; data: SpsePackageDocument[] }>(
        `${BASE}/packages/${encodeURIComponent(kodePaket)}/documents`,
        { params: jenisPaket ? { jenis_paket: jenisPaket } : undefined },
    );
}

export async function importSpsePackageDocuments(payload: {
    pekerjaan_id: number;
    kode_paket: string;
    documents: Array<{ url: string; jenis_dokumen: string; label?: string }>;
}) {
    return api.post<{
        message: string;
        imported: number;
        failed: number;
        results: SpseDocumentImportResult[];
    }>(`${BASE}/packages/import-documents`, payload);
}

export interface SpseKontrakPushResult {
    message: string;
    kontrak_id: number;
    spse_ids: {
        pl_id: string;
        sppbj_id?: string | null;
        spk_id?: string | null;
        rekanan_id?: string | null;
    };
    steps: Array<{ step: string; status: string }>;
}

export async function pushSpseKontrak(kontrakId: number) {
    return api.post<SpseKontrakPushResult>(`${BASE}/kontrak/push`, { kontrak_id: kontrakId });
}

export async function downloadSpsePackageZip(payload: {
    kode_paket: string;
    documents: Array<{ url: string; label?: string }>;
}) {
    return api.post<Blob>(`${BASE}/packages/download-zip`, payload, { responseType: 'blob' });
}