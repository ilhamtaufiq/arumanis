import { describe, expect, it } from 'vitest';
import {
    BMD_NOMOR_SURAT_MAX_LENGTH,
    buildBmdExportPayload,
    createDefaultBmdForm,
    isValidIsoDateString,
    toIsoDateString,
    validateBmdForm,
} from '../bmd-surat-pernyataan';

const filledForm = () => ({
    ...createDefaultBmdForm(new Date(2026, 10, 11)),
    nomor_surat: '900/001/KEU-SP/DPKP/2026',
});

describe('createDefaultBmdForm', () => {
    it('mengisi kedua tanggal dengan tanggal hari ini dan nomor kosong', () => {
        expect(createDefaultBmdForm(new Date(2026, 10, 11))).toEqual({
            nomor_surat: '',
            tanggal_surat: '2026-11-11',
            tanggal_perolehan: '2026-11-11',
        });
    });
});

describe('validateBmdForm', () => {
    it('mengembalikan daftar kosong untuk isian lengkap', () => {
        expect(validateBmdForm(filledForm())).toEqual([]);
    });

    it('melaporkan nomor surat kosong atau hanya spasi', () => {
        expect(validateBmdForm({ ...filledForm(), nomor_surat: '' })).toEqual(['Nomor surat wajib diisi.']);
        expect(validateBmdForm({ ...filledForm(), nomor_surat: '   ' })).toEqual(['Nomor surat wajib diisi.']);
    });

    it('menolak nomor surat yang melebihi batas panjang', () => {
        expect(
            validateBmdForm({ ...filledForm(), nomor_surat: 'x'.repeat(BMD_NOMOR_SURAT_MAX_LENGTH + 1) }),
        ).toEqual([`Nomor surat maksimal ${BMD_NOMOR_SURAT_MAX_LENGTH} karakter.`]);
    });

    it('menerima nomor surat tepat sepanjang batas', () => {
        expect(
            validateBmdForm({ ...filledForm(), nomor_surat: 'x'.repeat(BMD_NOMOR_SURAT_MAX_LENGTH) }),
        ).toEqual([]);
    });

    it('melaporkan semua field wajib yang kosong', () => {
        expect(
            validateBmdForm({ nomor_surat: '', tanggal_surat: '', tanggal_perolehan: '' }),
        ).toEqual([
            'Nomor surat wajib diisi.',
            'Tanggal surat wajib diisi.',
            'Tanggal perolehan wajib diisi.',
        ]);
    });

    it('menolak tanggal yang tidak berformat atau tidak ada di kalender', () => {
        expect(validateBmdForm({ ...filledForm(), tanggal_surat: '11/11/2026' })).toEqual([
            'Tanggal surat tidak valid.',
        ]);
        expect(validateBmdForm({ ...filledForm(), tanggal_perolehan: '2026-02-30' })).toEqual([
            'Tanggal perolehan tidak valid.',
        ]);
    });
});

describe('toIsoDateString dan isValidIsoDateString', () => {
    it('menambahkan nol di depan bulan dan tanggal', () => {
        expect(toIsoDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('menerima tanggal kalender yang valid saja', () => {
        expect(isValidIsoDateString('2026-03-15')).toBe(true);
        expect(isValidIsoDateString('2028-02-29')).toBe(true);
        expect(isValidIsoDateString('2027-02-29')).toBe(false);
        expect(isValidIsoDateString('2026-3-5')).toBe(false);
        expect(isValidIsoDateString('')).toBe(false);
    });
});

describe('buildBmdExportPayload', () => {
    it('membentuk body sesuai kontrak API dan memangkas spasi nomor surat', () => {
        expect(
            buildBmdExportPayload({ ...filledForm(), nomor_surat: '  900/002/KEU-SP/DPKP/2026 ' }),
        ).toEqual({
            nomor_surat: '900/002/KEU-SP/DPKP/2026',
            tanggal_surat: '2026-11-11',
            tanggal_perolehan: '2026-11-11',
        });
    });
});
