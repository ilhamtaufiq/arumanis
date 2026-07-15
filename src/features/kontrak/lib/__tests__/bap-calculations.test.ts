import { describe, expect, it } from 'vitest';
import { buildBapExportPayload, calculateBapTotals, createDefaultBapForm } from '../bap-calculations';

describe('buildBapExportPayload', () => {
    it('includes nomor and tanggal BASTP from register dokumen', () => {
        const payload = buildBapExportPayload({
            form: createDefaultBapForm(),
            nilaiKontrakEfektif: 111_000_000,
            nomorBastp: '001/BASTP/2026',
            tglBastp: '2026-03-15',
            addendum: null,
            jaminanUangMuka: null,
            uangMuka: null,
        });

        expect(payload.nomor_bastp).toBe('001/BASTP/2026');
        expect(payload.tgl_bastp).toBe('15 Maret 2026');
    });

    it('falls back to dash when nomor BASTP kosong', () => {
        const payload = buildBapExportPayload({
            form: createDefaultBapForm(),
            nilaiKontrakEfektif: 111_000_000,
            nomorBastp: '',
            tglBastp: '',
            addendum: null,
            jaminanUangMuka: null,
            uangMuka: null,
        });

        expect(payload.nomor_bastp).toBe('-');
        expect(payload.tgl_bastp).toBe('-');
    });
});

describe('calculateBapTotals', () => {
    it('does not round intermediate money values', () => {
        // 50% of 111_000_001 is not an integer after /111 and tax chain
        const nilaiKontrak = 111_000_001;
        const totals = calculateBapTotals(50, nilaiKontrak, 0);

        expect(totals.fisik_persen).toBe((50 / 111) * nilaiKontrak);
        expect(totals.dpp).toBe((11 / 12) * totals.fisik_persen);
        expect(totals.ppn_persen).toBe(totals.dpp * 0.12);
        expect(totals.kontrak_persen).toBe((50 / 100) * nilaiKontrak);
        expect(Number.isInteger(totals.fisik_persen)).toBe(false);
    });
});