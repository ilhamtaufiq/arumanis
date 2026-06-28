import { RAB_PPN_RATE } from '@/features/rab-analyzer/types'
import type {
    EditableProgressItem,
    GroupedProgressItems,
    ProgressCalculatedData,
} from '../types/progress-editor'

export function calculateItemRabValue(volume: number, hargaSatuan: number): number {
    return volume * hargaSatuan * (1 + RAB_PPN_RATE)
}

export function calculateProgressData(
    editableItems: EditableProgressItem[],
    weekCount: number,
): ProgressCalculatedData {
    const totalRABBase = editableItems.reduce((sum, item) => {
        return sum + calculateItemRabValue(item.target_volume || 0, item.harga_satuan || 0)
    }, 0)

    const items = editableItems.map((item, index) => {
        const itemRab = calculateItemRabValue(item.target_volume || 0, item.harga_satuan || 0)
        const bobot = totalRABBase > 0 ? (itemRab / totalRABBase) * 100 : 0

        let totalReal = 0
        Object.values(item.weekly_data || {}).forEach((week) => {
            totalReal += parseFloat(String(week?.realisasi)) || 0
        })

        const progressPercent = item.target_volume > 0 ? (totalReal / item.target_volume) * 100 : 0
        const weightedProgress = (progressPercent * bobot) / 100

        return {
            ...item,
            originalIndex: index,
            bobot: Math.round(bobot * 100) / 100,
            totalReal,
            progressPercent: Math.round(progressPercent * 100) / 100,
            weightedProgress: Math.round(weightedProgress * 100) / 100,
        }
    })

    const totals = {
        totalRAB: totalRABBase,
        totalWeightedProgress: items.reduce((sum, item) => sum + item.weightedProgress, 0),
        weekly: {} as Record<number, { rencana: number; realisasi: number }>,
    }

    for (let week = 1; week <= weekCount; week += 1) {
        let totalRenc = 0
        let totalReal = 0
        items.forEach((item) => {
            const weekly = item.weekly_data[week]
            totalRenc += parseFloat(String(weekly?.rencana)) || 0
            totalReal += parseFloat(String(weekly?.realisasi)) || 0
        })
        totals.weekly[week] = { rencana: totalRenc, realisasi: totalReal }
    }

    return { items, totals }
}

export function groupProgressItems(items: ProgressCalculatedData['items']): GroupedProgressItems[] {
    const result: GroupedProgressItems[] = []
    const seenGroups = new Set<string>()

    items.forEach((item) => {
        const key = item.nama_item || 'Tanpa Kategori'
        if (!seenGroups.has(key)) {
            seenGroups.add(key)
            result.push({ groupName: key, items: [item] })
            return
        }

        const group = result.find((entry) => entry.groupName === key)
        if (group) group.items.push(item)
    })

    return result
}

export function createEmptyProgressItems(count = 5): EditableProgressItem[] {
    const importedAt = Date.now()
    return Array.from({ length: count }).map((_, index) => ({
        id: `new-${importedAt}-${index}`,
        nama_item: '',
        rincian_item: '',
        satuan: '',
        harga_satuan: 0,
        target_volume: 0,
        bobot: 0,
        weekly_data: {},
    }))
}