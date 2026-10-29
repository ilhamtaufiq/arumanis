import api from '@/lib/api-client';

export type NphdJenis = 'mck' | 'spam';

export type NphdKegiatanSpam = 'operasi' | 'perpipaan' | 'bukan_perpipaan';

export type NphdExportParams = {
    /** Nomor NPHD dari Register Dokumen. */
    nomor: string;
    /** Tanggal NPHD, format `YYYY-MM-DD`. */
    tanggal: string;
    objek: string;
    nilai: number;
    jenis: NphdJenis;
    /** Hanya untuk SPAM. */
    kegiatan?: NphdKegiatanSpam;
    pengelola_label: string;
    pengelola_1?: string;
    pengelola_2?: string;
};

/** Unduh NPHD dan BA serah terima sebagai `.docx` untuk satu pekerjaan. */
export const exportNphd = (pekerjaanId: number, params: NphdExportParams) =>
    api.get<Blob>(`/pekerjaan/${pekerjaanId}/nphd`, { params, responseType: 'blob' });
