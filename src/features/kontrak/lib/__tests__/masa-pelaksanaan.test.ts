import { describe, expect, it } from 'vitest';
import { hitungMasaPelaksanaan, hitungTargetSelesai } from '../masa-pelaksanaan';

describe('hitungTargetSelesai', () => {
    it('SPMK 11 November 2026 + 45 hari kalender = 26 Desember 2026', () => {
        expect(hitungTargetSelesai('2026-11-11', 45)).toBe('2026-12-26');
    });

    it('melewati pergantian tahun', () => {
        expect(hitungTargetSelesai('2026-12-20', 20)).toBe('2027-01-09');
    });

    it('kosong bila SPMK belum diisi atau hari tidak valid', () => {
        expect(hitungTargetSelesai('', 45)).toBe('');
        expect(hitungTargetSelesai('2026-11-11', -1)).toBe('');
        expect(hitungTargetSelesai('2026-11-11', 1.5)).toBe('');
    });
});

describe('hitungMasaPelaksanaan', () => {
    it('kebalikan dari hitungTargetSelesai', () => {
        expect(hitungMasaPelaksanaan('2026-11-11', '2026-12-26')).toBe(45);
    });

    it('null bila target selesai sebelum SPMK atau tidak lengkap', () => {
        expect(hitungMasaPelaksanaan('2026-11-11', '2026-11-01')).toBeNull();
        expect(hitungMasaPelaksanaan('', '2026-12-26')).toBeNull();
    });
});
