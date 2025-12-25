// Export signature data type for PDF/Excel generators
export interface SignatureData {
    // Kolom Mengetahui
    namaMengetahui: string;
    nipMengetahui: string;
    jabatanMengetahui: string;
    instansiMengetahui: string;
    // Kolom Diperiksa
    namaDiperiksa: string;
    nipDiperiksa: string;
    jabatanDiperiksa: string;
    // Kolom Dibuat oleh
    namaPerusahaan: string;
    namaDirektur: string;
    tanggal: string;
    lokasi: string;
}

export interface DpaData {
    nomorDpa: string;
    tanggalDpa: string;
}

export const defaultSignatureData: SignatureData = {
    namaMengetahui: '',
    nipMengetahui: '',
    jabatanMengetahui: 'Pejabat Pelaksana Teknis Kegiatan',
    instansiMengetahui: 'Dinas Perumahan dan Kawasan Permukiman Kabupaten Cianjur',
    namaDiperiksa: '',
    nipDiperiksa: '',
    jabatanDiperiksa: 'Pengawas Lapangan',
    namaPerusahaan: '',
    namaDirektur: '',
    tanggal: '',
    lokasi: 'Cianjur',
};

export const defaultDpaData: DpaData = {
    nomorDpa: '',
    tanggalDpa: '',
};
