import api from '@/lib/api-client';

export interface TenderReferensiRow {
    kode_paket: string;
    sumber: 'tender' | 'non_tender';
    nama_paket: string;
    jenis_paket: string | null;
    metode_pengadaan: string | null;
    tahun_anggaran: string | null;
    nilai_pagu: number | null;
    nilai_kontrak: number | null;
    tahap_paket: string | null;
    lokasi: string | null;
    nama_pemenang: string | null;
    url_detail: string | null;
}

export const getUnitTenderReferensi = async (unitId: number) => {
    return api.get<{ data: TenderReferensiRow[] }>(`/spam-units/${unitId}/tender-referensi`);
};

export const importTenderReferensi = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{
        dibaca: number;
        lokasi_desa_dikenali: number;
        lokasi_hanya_kabupaten_atau_kecamatan: number;
        terhubung_ke_unit: number;
    }>('/spam-tender-referensi/import', formData);
};
