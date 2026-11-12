import { describe, expect, it } from 'vitest';
import {
    SUKET_DESA_MAX_LENGTH,
    buildSuketDesaExportPayload,
    createDefaultSuketDesaForm,
    validateSuketDesaForm,
    type SuketDesaForm,
} from '../suket-desa';

const filledForm = (): SuketDesaForm => ({
    ...createDefaultSuketDesaForm(new Date(2026, 10, 11)),
    nomor_surat: '141/ /DESA-SMP/2026',
    nama_kepala_desa: 'Budi Santoso',
    alamat_kantor: 'Jl. Raya Simpang No. 1',
    serah_terima_kepada: 'Kepala Desa Simpang',
    nomor_ba: '010/BA/2026',
    tanggal_ba: '2026-11-10',
});

describe('createDefaultSuketDesaForm', () => {
    it('hanya mengisi tanggal surat dengan hari ini', () => {
        expect(createDefaultSuketDesaForm(new Date(2026, 10, 11))).toEqual({
            nomor_surat: '',
            tanggal_surat: '2026-11-11',
            nama_kepala_desa: '',
            alamat_kantor: '',
            serah_terima_kepada: '',
            nomor_ba: '',
            tanggal_ba: '',
        });
    });
});

describe('validateSuketDesaForm', () => {
    it('mengembalikan daftar kosong untuk isian lengkap', () => {
        expect(validateSuketDesaForm(filledForm())).toEqual([]);
    });

    it('melaporkan setiap field teks wajib yang kosong atau hanya spasi', () => {
        const errors = validateSuketDesaForm({
            ...filledForm(),
            nomor_surat: '',
            nama_kepala_desa: '   ',
            alamat_kantor: '',
            serah_terima_kepada: '',
            nomor_ba: '',
        });

        expect(errors).toEqual([
            { field: 'nomor_surat', message: 'Nomor surat wajib diisi.' },
            { field: 'nama_kepala_desa', message: 'Nama kepala desa wajib diisi.' },
            { field: 'alamat_kantor', message: 'Alamat kantor wajib diisi.' },
            { field: 'serah_terima_kepada', message: 'Diserahterimakan kepada wajib diisi.' },
            { field: 'nomor_ba', message: 'Nomor Berita Acara wajib diisi.' },
        ]);
    });

    it('menolak teks yang melebihi batas panjang dan menerima yang tepat di batas', () => {
        const over = validateSuketDesaForm({
            ...filledForm(),
            alamat_kantor: 'x'.repeat(SUKET_DESA_MAX_LENGTH.alamat_kantor + 1),
        });
        expect(over).toEqual([
            { field: 'alamat_kantor', message: `Alamat kantor maksimal ${SUKET_DESA_MAX_LENGTH.alamat_kantor} karakter.` },
        ]);

        const atLimit = validateSuketDesaForm({
            ...filledForm(),
            nama_kepala_desa: 'x'.repeat(SUKET_DESA_MAX_LENGTH.nama_kepala_desa),
        });
        expect(atLimit).toEqual([]);
    });

    it('melaporkan tanggal surat dan tanggal BA yang kosong atau tidak valid', () => {
        expect(validateSuketDesaForm({ ...filledForm(), tanggal_surat: '' })).toEqual([
            { field: 'tanggal_surat', message: 'Tanggal surat wajib diisi.' },
        ]);
        expect(validateSuketDesaForm({ ...filledForm(), tanggal_ba: '' })).toEqual([
            { field: 'tanggal_ba', message: 'Tanggal Berita Acara wajib diisi.' },
        ]);
        expect(validateSuketDesaForm({ ...filledForm(), tanggal_surat: '11/11/2026' })).toEqual([
            { field: 'tanggal_surat', message: 'Tanggal surat tidak valid.' },
        ]);
        expect(validateSuketDesaForm({ ...filledForm(), tanggal_ba: '2026-02-30' })).toEqual([
            { field: 'tanggal_ba', message: 'Tanggal Berita Acara tidak valid.' },
        ]);
    });
});

describe('buildSuketDesaExportPayload', () => {
    it('menghasilkan body sesuai kontrak API dengan teks di-trim', () => {
        expect(
            buildSuketDesaExportPayload({
                ...filledForm(),
                nomor_surat: '  141/ /DESA-SMP/2026 ',
                nama_kepala_desa: ' Budi Santoso ',
            }),
        ).toEqual({
            nomor_surat: '141/ /DESA-SMP/2026',
            tanggal_surat: '2026-11-11',
            nama_kepala_desa: 'Budi Santoso',
            alamat_kantor: 'Jl. Raya Simpang No. 1',
            serah_terima_kepada: 'Kepala Desa Simpang',
            nomor_ba: '010/BA/2026',
            tanggal_ba: '2026-11-10',
        });
    });
});
