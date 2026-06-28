import { useMemo } from 'react'
import { calculateProgressData, groupProgressItems } from '../lib/progress-calculations'
import type { EditableProgressItem } from '../types/progress-editor'

export function useProgressCalculations(editableItems: EditableProgressItem[], weekCount: number) {
    const calculatedData = useMemo(
        () => calculateProgressData(editableItems, weekCount),
        [editableItems, weekCount],
    )

    const groupedItems = useMemo(
        () => groupProgressItems(calculatedData.items),
        [calculatedData.items],
    )

    return { calculatedData, groupedItems }
}