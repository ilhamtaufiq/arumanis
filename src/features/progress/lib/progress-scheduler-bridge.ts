import {
    detectJenisProyek,
    type EditableItem,
} from '../utils/construction-scheduler'
import type { EditableProgressItem } from '../types/progress-editor'

const LETTER_MARKER = /^[a-z]\.?$/i
const HIERARCHICAL_MARKER = /^[\d]+(?:[.,][\d]+)+$/

export function normalizeSchedulerGroupName(grup: string): string {
    if (!grup || grup === 'Tanpa Kategori') return grup

    const parts = grup
        .split(' › ')
        .map((part) => part.trim())
        .filter(Boolean)
        .filter((part) => !LETTER_MARKER.test(part))
        .filter((part) => !HIERARCHICAL_MARKER.test(part))

    return parts[0] || grup.trim()
}

export function buildSchedulerItems(editableItems: EditableProgressItem[]): EditableItem[] {
    const schedulerItems: EditableItem[] = []
    const seenGroups = new Set<string>()

    editableItems.forEach((item, index) => {
        const rawGroupName = item.nama_item || 'Tanpa Kategori'
        const groupName = normalizeSchedulerGroupName(rawGroupName)
        const itemId = item.id ?? `item-${index}`
        const groupId = `group-${groupName}`

        if (!seenGroups.has(groupName)) {
            seenGroups.add(groupName)
            schedulerItems.push({
                id: groupId,
                urutan: String(schedulerItems.length + 1),
                uraian: groupName,
                satuan: '',
                volume: 0,
                harga_satuan: 0,
                parent_id: null,
                rencana: {},
                realisasi: {},
            })
        }

        schedulerItems.push({
            id: itemId,
            urutan: `${groupName}-${index + 1}`,
            uraian: item.rincian_item || groupName,
            satuan: item.satuan || '-',
            volume: item.target_volume || 0,
            harga_satuan: item.harga_satuan || 0,
            parent_id: groupId,
            rencana: {},
            realisasi: {},
        })
    })

    return schedulerItems
}

export function detectProjectTypeFromProgressItems(editableItems: EditableProgressItem[]): string {
    const schedulerItems = buildSchedulerItems(editableItems)
    const groupContext = editableItems
        .map((item) => `${normalizeSchedulerGroupName(item.nama_item)} ${item.rincian_item}`)
        .join(' ')

    const detected = detectJenisProyek([
        ...schedulerItems,
        {
            id: 'context',
            urutan: '0',
            uraian: groupContext,
            satuan: '',
            volume: 0,
            harga_satuan: 0,
            parent_id: null,
            rencana: {},
            realisasi: {},
        },
    ])

    return detected
}

export function applyScheduledRencanaToProgressItems(
    editableItems: EditableProgressItem[],
    scheduledItems: EditableItem[],
    weekCount: number,
): EditableProgressItem[] {
    const newEditableItems = [...editableItems]

    scheduledItems.forEach((schedItem) => {
        const scheduledItemId = String(schedItem.id)
        if (scheduledItemId.startsWith('group-')) return

        const idx = newEditableItems.findIndex(
            (item, index) => String(item.id ?? `item-${index}`) === scheduledItemId,
        )
        if (idx === -1) return

        const currentWeekly = { ...(newEditableItems[idx].weekly_data || {}) }

        for (let week = 1; week <= weekCount; week += 1) {
            currentWeekly[week] = {
                ...(currentWeekly[week] || { rencana: 0, realisasi: 0 }),
                rencana: 0,
            }
        }

        if (schedItem.rencana) {
            for (const [weekKey, value] of Object.entries(schedItem.rencana)) {
                const week = parseInt(weekKey, 10)
                currentWeekly[week] = {
                    ...(currentWeekly[week] || { rencana: 0, realisasi: 0 }),
                    rencana: value as number,
                }
            }
        }

        newEditableItems[idx] = {
            ...newEditableItems[idx],
            weekly_data: currentWeekly,
        }
    })

    return newEditableItems
}