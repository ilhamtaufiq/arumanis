import { describe, expect, it } from 'vitest';
import {
    applyAutoFill,
    calculateSchedule,
    detectJenisProyek,
    isSmkkRelatedText,
    type EditableItem,
} from '../utils/construction-scheduler';
import type { MasterFasePekerjaan } from '../types/master-fase';

const airMinumFases: MasterFasePekerjaan[] = [
    {
        id: 1,
        jenis_proyek: 'air_minum',
        kode_fase: 'sumber_air',
        nama_fase: 'Pekerjaan Sumber Air',
        prioritas: 1,
        overlap_persen: 0,
        durasi_faktor: 1,
        keywords: ['pemboran', 'sumur'],
        is_active: true,
    },
];

describe('construction scheduler', () => {
    it('detects air minum pekerjaan from SPAM item names', () => {
        const items: EditableItem[] = [
            {
                id: 'group-air-minum',
                uraian: 'Pekerjaan Air Minum',
                urutan: '1',
                satuan: '',
                volume: 0,
                harga_satuan: 0,
                parent_id: null,
                rencana: {},
                realisasi: {},
            },
            {
                id: 101,
                uraian: 'Pemboran sumur dalam',
                urutan: '1.1',
                satuan: 'm',
                volume: 30,
                harga_satuan: 1000,
                parent_id: 'group-air-minum',
                rencana: {},
                realisasi: {},
            },
        ];

        expect(detectJenisProyek(items)).toBe('air_minum');
    });

    it('applies rencana to air minum items with numeric ids', () => {
        const items: EditableItem[] = [
            {
                id: 'group-air-minum',
                uraian: 'Pekerjaan Sumber Air',
                urutan: '1',
                satuan: '',
                volume: 0,
                harga_satuan: 0,
                parent_id: null,
                rencana: {},
                realisasi: {},
            },
            {
                id: 101,
                uraian: 'Pemboran sumur dalam',
                urutan: '1.1',
                satuan: 'm',
                volume: 30,
                harga_satuan: 1000,
                parent_id: 'group-air-minum',
                rencana: {},
                realisasi: {},
            },
        ];

        const scheduledItems = applyAutoFill(items, airMinumFases, 3);
        const scheduledItem = scheduledItems.find(item => item.id === 101);

        expect(scheduledItem?.rencana).toEqual({
            1: 10,
            2: 10,
            3: 10,
        });
    });

    it('detects SMKK-related text from common RAB keywords', () => {
        expect(isSmkkRelatedText('PENYELENGGARAAN SISTEM MANAJEMEN KESELAMATAN KONSTRUKSI (SMKK)')).toBe(true);
        expect(isSmkkRelatedText('Induksi K3 pekerja')).toBe(true);
        expect(isSmkkRelatedText('Pengadaan APD (Rompi Keselamatan)')).toBe(true);
        expect(isSmkkRelatedText('Pemboran sumur dalam')).toBe(false);
    });

    it('pins SMKK groups to week 1 only during schedule calculation', () => {
        const items: EditableItem[] = [
            {
                id: 'group-smkk',
                uraian: 'PENYELENGGARAAN SISTEM MANAJEMEN KESELAMATAN KONSTRUKSI (SMKK)',
                urutan: '1',
                satuan: '',
                volume: 0,
                harga_satuan: 0,
                parent_id: null,
                rencana: {},
                realisasi: {},
            },
            {
                id: 201,
                uraian: 'Induksi K3',
                urutan: '1.1',
                satuan: 'OK',
                volume: 1,
                harga_satuan: 500000,
                parent_id: 'group-smkk',
                rencana: {},
                realisasi: {},
            },
            {
                id: 'group-pipa',
                uraian: 'Pekerjaan Pipa PVC',
                urutan: '2',
                satuan: '',
                volume: 0,
                harga_satuan: 0,
                parent_id: null,
                rencana: {},
                realisasi: {},
            },
            {
                id: 301,
                uraian: 'Pemasangan pipa PVC 4"',
                urutan: '2.1',
                satuan: 'm',
                volume: 100,
                harga_satuan: 50000,
                parent_id: 'group-pipa',
                rencana: {},
                realisasi: {},
            },
        ];

        const schedule = calculateSchedule(items, airMinumFases, 4);
        const smkkGroup = schedule.find(g => g.groupId === 'group-smkk');
        const pipaGroup = schedule.find(g => g.groupId === 'group-pipa');

        expect(smkkGroup?.startWeek).toBe(1);
        expect(smkkGroup?.endWeek).toBe(1);
        expect(pipaGroup?.startWeek).toBeGreaterThanOrEqual(1);
        expect(pipaGroup?.endWeek).toBeGreaterThan(1);
    });

    it('puts all SMKK item volume in week 1 via auto-fill', () => {
        const items: EditableItem[] = [
            {
                id: 'group-smkk',
                uraian: 'PENYELENGGARAAN SISTEM MANAJEMEN KESELAMATAN KONSTRUKSI (SMKK)',
                urutan: '1',
                satuan: '',
                volume: 0,
                harga_satuan: 0,
                parent_id: null,
                rencana: {},
                realisasi: {},
            },
            {
                id: 201,
                uraian: 'Induksi K3',
                urutan: '1.1',
                satuan: 'OK',
                volume: 1,
                harga_satuan: 500000,
                parent_id: 'group-smkk',
                rencana: {},
                realisasi: {},
            },
            {
                id: 202,
                uraian: 'Pengadaan APD',
                urutan: '1.2',
                satuan: 'ls',
                volume: 1,
                harga_satuan: 2000000,
                parent_id: 'group-smkk',
                rencana: {},
                realisasi: {},
            },
            {
                id: 'group-pipa',
                uraian: 'Pekerjaan Pipa PVC',
                urutan: '2',
                satuan: '',
                volume: 0,
                harga_satuan: 0,
                parent_id: null,
                rencana: {},
                realisasi: {},
            },
            {
                id: 301,
                uraian: 'Pemasangan pipa PVC 4"',
                urutan: '2.1',
                satuan: 'm',
                volume: 90,
                harga_satuan: 50000,
                parent_id: 'group-pipa',
                rencana: {},
                realisasi: {},
            },
        ];

        const scheduledItems = applyAutoFill(items, airMinumFases, 3);
        const smkkItems = scheduledItems.filter(item => item.id === 201 || item.id === 202);
        const pipaItem = scheduledItems.find(item => item.id === 301);

        smkkItems.forEach(item => {
            expect(item.rencana).toEqual({ 1: item.volume });
            expect(item.rencana[2]).toBeUndefined();
            expect(item.rencana[3]).toBeUndefined();
        });

        expect(Object.keys(pipaItem?.rencana ?? {})).toHaveLength(3);
    });

    it('pins orphan SMKK items to week 1 even outside SMKK group', () => {
        const items: EditableItem[] = [
            {
                id: 'group-persiapan',
                uraian: 'Pekerjaan Persiapan',
                urutan: '1',
                satuan: '',
                volume: 0,
                harga_satuan: 0,
                parent_id: null,
                rencana: {},
                realisasi: {},
            },
            {
                id: 401,
                uraian: 'Safety Talk / Tool Box Meeting',
                urutan: '1.1',
                satuan: 'OK',
                volume: 12,
                harga_satuan: 100000,
                parent_id: 'group-persiapan',
                rencana: {},
                realisasi: {},
            },
            {
                id: 402,
                uraian: 'Pembersihan lokasi',
                urutan: '1.2',
                satuan: 'm2',
                volume: 60,
                harga_satuan: 5000,
                parent_id: 'group-persiapan',
                rencana: {},
                realisasi: {},
            },
        ];

        const scheduledItems = applyAutoFill(items, airMinumFases, 3);
        const safetyItem = scheduledItems.find(item => item.id === 401);
        const prepItem = scheduledItems.find(item => item.id === 402);

        expect(safetyItem?.rencana).toEqual({ 1: 12 });
        expect(prepItem?.rencana).toEqual({ 1: 20, 2: 20, 3: 20 });
    });
});
