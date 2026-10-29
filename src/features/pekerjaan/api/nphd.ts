import api from '@/lib/api-client';

export type NphdExportParams = {
    /** Nomor NPHD dari Register Dokumen. */
    nomor: string;
    /** Tanggal NPHD, format `YYYY-MM-DD`. */
    tanggal: string;
    objek: string;
    nilai: number;
    pengelola_label: string;
    pengelola_1?: string;
    pengelola_2?: string;
};

/** Unduh NPHD dan BA serah terima sebagai `.docx` untuk satu pekerjaan. */
export const exportNphd = (pekerjaanId: number, params: NphdExportParams) =>
    api.get<Blob>(`/pekerjaan/${pekerjaanId}/nphd`, { params, responseType: 'blob' });
