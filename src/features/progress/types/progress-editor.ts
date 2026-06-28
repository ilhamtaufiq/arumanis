export type WeeklyCell = {
    rencana: number
    realisasi: number | null
}

export type EditableProgressItem = {
    id: string | number
    nama_item: string
    rincian_item: string
    satuan: string
    harga_satuan: number
    target_volume: number
    bobot: number
    weekly_data: Record<number, WeeklyCell>
}

export type CalculatedProgressItem = EditableProgressItem & {
    bobot: number
    totalReal: number
    progressPercent: number
    weightedProgress: number
    originalIndex: number
}

export type ProgressCalculatedTotals = {
    totalRAB: number
    totalWeightedProgress: number
    weekly: Record<number, { rencana: number; realisasi: number }>
}

export type ProgressCalculatedData = {
    items: CalculatedProgressItem[]
    totals: ProgressCalculatedTotals
}

export type GroupedProgressItems = {
    groupName: string
    items: CalculatedProgressItem[]
}