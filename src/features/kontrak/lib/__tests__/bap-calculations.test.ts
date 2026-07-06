import { describe, expect, it } from 'vitest';
import { buildBapExportPayload, createDefaultBapForm } from '../bap-calculations';

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