import { describe, expect, it } from 'vitest'
import { calculateItemRabValue, calculateProgressData } from '../lib/progress-calculations'
import { RAB_PPN_RATE } from '@/features/rab-analyzer/types'
import type { EditableProgressItem } from '../types/progress-editor'

describe('progress-calculations', () => {
    it('uses RAB_PPN_RATE for item RAB value', () => {
        expect(calculateItemRabValue(2, 100000)).toBe(200000 * (1 + RAB_PPN_RATE))
    })

    it('calculates bobot from RAB-weighted items', () => {
        const items: EditableProgressItem[] = [
            {
                id: '1',
                nama_item: 'Grup A',
                rincian_item: 'Item 1',
                satuan: 'ls',
                harga_satuan: 100000,
                target_volume: 1,
                bobot: 0,
                weekly_data: { 1: { rencana: 0.5, realisasi: 0.25 } },
            },
            {
                id: '2',
                nama_item: 'Grup A',
                rincian_item: 'Item 2',
                satuan: 'ls',
                harga_satuan: 300000,
                target_volume: 1,
                bobot: 0,
                weekly_data: {},
            },
        ]

        const result = calculateProgressData(items, 2)
        expect(result.totals.totalRAB).toBeCloseTo(444000, 0)
        expect(result.items[0].bobot).toBeCloseTo(25, 0)
        expect(result.items[1].bobot).toBeCloseTo(75, 0)
    })
})