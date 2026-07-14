import { describe, expect, it } from 'vitest';
import {
    filterPlaceholderGroups,
    formatKontrakPlaceholder,
    KONTRAK_PLACEHOLDER_GROUPS,
} from '../constants/kontrak-template-placeholders';

describe('kontrak-template-placeholders', () => {
    it('formats placeholder tokens with braces', () => {
        expect(formatKontrakPlaceholder('nama_paket')).toBe('{nama_paket}');
    });

    it('filters groups by key or label', () => {
        const filtered = filterPlaceholderGroups('spk');
        const keys = filtered.flatMap((group) => group.items.map((item) => item.key));

        expect(keys).toContain('nomor_spk');
        expect(keys).toContain('tgl_spk');
    });

    it('exposes BASTP placeholders from register dokumen', () => {
        const kontrakGroup = KONTRAK_PLACEHOLDER_GROUPS.find((group) => group.id === 'kontrak');
        const keys = kontrakGroup?.items.map((item) => item.key) ?? [];

        expect(keys).toContain('nomor_bastp');
        expect(keys).toContain('tgl_bastp');
    });

    it('exposes grouped placeholder catalog', () => {
        expect(KONTRAK_PLACEHOLDER_GROUPS.length).toBeGreaterThan(3);
        expect(KONTRAK_PLACEHOLDER_GROUPS.some((group) => group.id === 'kontrak')).toBe(true);
    });

    it('exposes pejabat and ringkasan placeholders', () => {
        const kontrakGroup = KONTRAK_PLACEHOLDER_GROUPS.find((group) => group.id === 'kontrak');
        const pejabatGroup = KONTRAK_PLACEHOLDER_GROUPS.find((group) => group.id === 'pejabat');
        const kontrakKeys = kontrakGroup?.items.map((item) => item.key) ?? [];
        const pejabatKeys = pejabatGroup?.items.map((item) => item.key) ?? [];

        expect(kontrakKeys).toContain('nilai_kontrak_5persen');
        expect(kontrakKeys).toContain('nomor_jaminan_uang_muka');
        expect(kontrakKeys).toContain('nomor_jaminan_pelaksanaan');
        expect(pejabatKeys).toContain('nama_ppk');
        expect(pejabatKeys).toContain('nip_pptk');

        const instansiGroup = KONTRAK_PLACEHOLDER_GROUPS.find((group) => group.id === 'instansi');
        const pembayaranGroup = KONTRAK_PLACEHOLDER_GROUPS.find((group) => group.id === 'pembayaran');
        const ringkasanGroup = KONTRAK_PLACEHOLDER_GROUPS.find((group) => group.id === 'ringkasan');
        const instansiKeys = instansiGroup?.items.map((item) => item.key) ?? [];
        const pembayaranKeys = pembayaranGroup?.items.map((item) => item.key) ?? [];
        const ringkasanKeys = ringkasanGroup?.items.map((item) => item.key) ?? [];

        expect(instansiKeys).toContain('skpd');
        expect(instansiKeys).toContain('nomor_dpa');
        expect(pembayaranKeys).toContain('check_pembayaran_sekaligus');
        expect(ringkasanKeys).toContain('persen_tagih');
        expect(ringkasanKeys).toContain('nomor_jaminan_pelaksanaan');
        expect(ringkasanKeys).toContain('tanggal_jaminan_uang_muka');
    });
});