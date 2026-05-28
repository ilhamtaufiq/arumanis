import { describe, expect, it } from 'vitest';
import { applyAutoFill, detectJenisProyek, type EditableItem } from '../utils/construction-scheduler';
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
});
