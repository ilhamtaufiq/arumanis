import { useCallback } from 'react'
import type { EditableProgressItem } from '../types/progress-editor'

type UseProgressItemActionsOptions = {
    editableItems: EditableProgressItem[]
    setEditableItems: React.Dispatch<React.SetStateAction<EditableProgressItem[]>>
    setHasChanges: (value: boolean) => void
}

export function useProgressItemActions({
    editableItems,
    setEditableItems,
    setHasChanges,
}: UseProgressItemActionsOptions) {
    const markChanged = useCallback(() => setHasChanges(true), [setHasChanges])

    const handleUpdateItem = useCallback((index: number, field: keyof EditableProgressItem, value: unknown) => {
        setEditableItems((prev) => {
            const next = [...prev]
            next[index] = { ...next[index], [field]: value }
            return next
        })
        markChanged()
    }, [markChanged, setEditableItems])

    const handleUpdateGroupName = useCallback((oldName: string, newName: string) => {
        setEditableItems((prev) => prev.map((item) => {
            const currentGroup = item.nama_item || 'Tanpa Kategori'
            if (currentGroup === oldName) {
                return { ...item, nama_item: newName }
            }
            return item
        }))
        markChanged()
    }, [markChanged, setEditableItems])

    const handleUpdateWeekly = useCallback((
        itemIndex: number,
        week: number,
        type: 'rencana' | 'realisasi',
        value: string,
    ) => {
        setEditableItems((prev) => {
            const next = [...prev]
            const item = { ...next[itemIndex] }
            const weeklyData = { ...(item.weekly_data || {}) }

            weeklyData[week] = {
                ...(weeklyData[week] || { rencana: 0, realisasi: 0 }),
                [type]: value === '' ? null : parseFloat(value),
            }

            item.weekly_data = weeklyData
            next[itemIndex] = item
            return next
        })
        markChanged()
    }, [markChanged, setEditableItems])

    const handleAddNewRow = useCallback((groupName?: string) => {
        setEditableItems((prev) => [
            ...prev,
            {
                id: `new-${Date.now()}`,
                nama_item: groupName || '',
                rincian_item: '',
                satuan: '',
                harga_satuan: 0,
                target_volume: 0,
                bobot: 0,
                weekly_data: {},
            },
        ])
        markChanged()
    }, [markChanged, setEditableItems])

    const handleRemoveRow = useCallback((index: number) => {
        setEditableItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
        markChanged()
    }, [markChanged, setEditableItems])

    const handleRemoveGroup = useCallback((groupName: string) => {
        setEditableItems((prev) => prev.filter((item) => item.nama_item !== groupName))
        markChanged()
    }, [markChanged, setEditableItems])

    return {
        handleUpdateItem,
        handleUpdateGroupName,
        handleUpdateWeekly,
        handleAddNewRow,
        handleRemoveRow,
        handleRemoveGroup,
    }
}