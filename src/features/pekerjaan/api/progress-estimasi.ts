import api from '@/lib/api-client';

export type ProgressHistoryEntry = {
    id?: number;
    tanggal: string;
    persen: number;
};

export type ProgressEstimasiSection = {
    rencana: ProgressHistoryEntry[];
    realisasi: ProgressHistoryEntry[];
    latest_rencana: number | null;
    latest_realisasi: number | null;
    deviasi: number | null;
};

export type PekerjaanProgressEstimasi = {
    pekerjaan_id: number;
    tahun_anggaran: number;
    fisik: ProgressEstimasiSection;
    keuangan: ProgressEstimasiSection;
    updated_at: string | null;
};

export type PuspenProgressFisikSnapshot = {
    kontrak_id: number;
    kode_paket: string | null;
    rencana: number | null;
    realisasi: number | null;
    deviasi: number | null;
    updated_at: string | null;
};

export type PekerjaanProgressEstimasiResponse = {
    data: PekerjaanProgressEstimasi;
    puspen_progress_fisik: PuspenProgressFisikSnapshot[];
};

export type SavePekerjaanProgressEstimasiPayload = {
    tahun: number;
    fisik: {
        rencana: Array<{ tanggal: string; persen: number }>;
        realisasi: Array<{ tanggal: string; persen: number }>;
    };
    keuangan: {
        rencana: Array<{ tanggal: string; persen: number }>;
        realisasi: Array<{ tanggal: string; persen: number }>;
    };
};

export async function getPekerjaanProgressEstimasi(
    pekerjaanId: number,
    tahun: number,
): Promise<PekerjaanProgressEstimasiResponse> {
    return api.get<PekerjaanProgressEstimasiResponse>(
        `/pekerjaan/${pekerjaanId}/progress-estimasi`,
        { params: { tahun } },
    );
}

export async function savePekerjaanProgressEstimasi(
    pekerjaanId: number,
    payload: SavePekerjaanProgressEstimasiPayload,
): Promise<PekerjaanProgressEstimasiResponse & { message: string }> {
    return api.put<PekerjaanProgressEstimasiResponse & { message: string }>(
        `/pekerjaan/${pekerjaanId}/progress-estimasi`,
        payload,
    );
}