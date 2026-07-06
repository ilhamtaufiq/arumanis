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
});