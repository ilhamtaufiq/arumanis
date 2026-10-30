import api from '@/lib/api-client';

export type NphdExportParams = {
    /** Nomor NPHD dari Register Dokumen. */
    nomor: string;
    /** Tanggal NPHD, format `YYYY-MM-DD`. */
    tanggal: string;
    objek: string;
    nilai: number;
    /** Jenis pengelola, misalnya `Penerima Manfaat MCK Individu`. */
    pengelola_label: string;
    /** Nama penerima manfaat, dipisah `;`. */
    penerima: string;
};

/** Data NPHD tersimpan untuk satu paket pekerjaan. */
export type NphdData = {
    pekerjaan_id: number;
    jenis_pengelola: string | null;
    penerima_manfaat: string[];
    nomor_nphd: string | null;
};

export type NphdDataInput = {
    jenis_pengelola: string;
    penerima_manfaat: string[];
    /** Diisi hanya saat NPHD dibuat. */
    nomor_nphd?: string;
};

/** Unduh NPHD dan BA serah terima sebagai `.docx` untuk satu pekerjaan. */
export const exportNphd = (pekerjaanId: number, params: NphdExportParams) =>
    api.get<Blob>(`/pekerjaan/${pekerjaanId}/nphd`, { params, responseType: 'blob' });

export const getNphdData = async (pekerjaanId: number): Promise<NphdData> => {
    const body = await api.get<{ data: NphdData }>(`/pekerjaan/${pekerjaanId}/nphd-data`);
    return body.data;
};

export const listNphdData = async (): Promise<NphdData[]> => {
    const body = await api.get<{ data: NphdData[] }>('/nphd-data');
    return body.data;
};

export const saveNphdData = async (pekerjaanId: number, input: NphdDataInput): Promise<NphdData> => {
    const body = await api.put<{ data: NphdData }>(`/pekerjaan/${pekerjaanId}/nphd-data`, input);
    return body.data;
};
