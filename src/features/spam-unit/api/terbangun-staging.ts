import api from '@/lib/api-client';

export type TerbangunMatchStatus = 'matched' | 'unmatched' | 'invalid';

export interface TerbangunStagingRow {
    id: number;
    raw_id: number;
    kecamatan: string | null;
    desa_kelurahan: string | null;
    nama_desa: string | null;
    sistem_aliran: string | null;
    sumber_dana_raw: string | null;
    tahun_pembangunan_awal: number | null;
    kondisi_normalized: string | null;
    desa_id: number | null;
    unit_spam_id: number | null;
    match_status: TerbangunMatchStatus;
    sudah_diterapkan: boolean;
}

export interface TerbangunStagingResponse {
    batch_id: string | null;
    ringkasan: Record<TerbangunMatchStatus, number>;
    data: TerbangunStagingRow[];
}

export const getTerbangunStaging = async (params?: { batch?: string; status?: TerbangunMatchStatus }) => {
    const res = await api.get<TerbangunStagingResponse>('/spam-terbangun/staging', { params });
    return res;
};

export const mapTerbangunStaging = async (id: number, unitSpamId: number) => {
    return api.post<{ id: number; unit_spam_id: number; match_status: TerbangunMatchStatus }>(
        `/spam-terbangun/staging/${id}/map`,
        { unit_spam_id: unitSpamId },
    );
};

export const applyTerbangunStaging = async (batchId: string) => {
    return api.post<{ batch_id: string; unit_diubah: number; baris_diterapkan: number }>(
        '/spam-terbangun/staging/apply',
        { batch_id: batchId },
    );
};
