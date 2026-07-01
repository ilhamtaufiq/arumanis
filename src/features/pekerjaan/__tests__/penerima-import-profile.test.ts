import { describe, expect, it } from 'vitest';
import {
    getKomunalImportHeaders,
    getPenerimaImportProfile,
    getUnitImportHeaders,
} from '../utils/penerima-import-profile';
import type { Output } from '@/features/output/types';

describe('getPenerimaImportProfile', () => {
    it('builds unit profile from volume', () => {
        const profile = getPenerimaImportProfile({
            id: 1,
            pekerjaan_id: 1,
            komponen: 'Sambungan Rumah',
            satuan: 'unit',
            volume: 60,
            penerima_is_optional: false,
            created_at: '',
            updated_at: '',
        } as Output);

        expect(profile.type).toBe('unit');
        expect(profile.targetRows).toBe(60);
    });

    it('builds komunal profile without recipient fields', () => {
        const profile = getPenerimaImportProfile({
            id: 2,
            pekerjaan_id: 1,
            komponen: 'Pipa Transmisi',
            satuan: 'unit',
            volume: 4,
            penerima_is_optional: true,
            created_at: '',
            updated_at: '',
        } as Output);

        expect(profile.type).toBe('komunal');
        expect(profile.targetRows).toBe(4);
    });

    it('includes five foto progress columns in headers', () => {
        const unitHeaders = getUnitImportHeaders();
        const komunalHeaders = getKomunalImportHeaders();

        expect(unitHeaders).toContain('nama_file_foto_0');
        expect(unitHeaders).toContain('nama_file_foto_100');
        expect(komunalHeaders).toContain('nama_file_foto_25');
        expect(komunalHeaders).toContain('nama_file_foto_75');
    });
});