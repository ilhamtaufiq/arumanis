import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getProgressReport, saveProgressReport } from '../api/progress'
import { calculateWeeksFromDates } from '../utils'
import { calculateProgressData, createEmptyProgressItems } from '../lib/progress-calculations'
import type { EditableProgressItem } from '../types/progress-editor'

type UseProgressReportOptions = {
    pekerjaanId: number
}

export function useProgressReport({ pekerjaanId }: UseProgressReportOptions) {
    const queryClient = useQueryClient()
    const [weekCount, setWeekCount] = useState(1)
    const [hasChanges, setHasChanges] = useState(false)
    const [editableItems, setEditableItems] = useState<EditableProgressItem[]>([])
    const [focusWeek, setFocusWeek] = useState(1)
    const [selectedPrintWeek, setSelectedPrintWeek] = useState(1)

    const { data: report, isLoading } = useQuery({
        queryKey: ['progress-report', pekerjaanId],
        queryFn: async () => {
            const response = await getProgressReport(pekerjaanId)
            const data = response.data

            if (data.kontrak?.tgl_spmk && data.kontrak?.tgl_selesai) {
                const calculatedWeeks = calculateWeeksFromDates(
                    data.kontrak.tgl_spmk,
                    data.kontrak.tgl_selesai,
                )
                const maxWeeks = Math.max(calculatedWeeks, data.max_minggu, 1)
                setWeekCount(maxWeeks)
                const currentWeek = Math.min(data.max_minggu || 1, maxWeeks)
                setFocusWeek(currentWeek)
                setSelectedPrintWeek(currentWeek)
            } else if (data.max_minggu > 0) {
                setWeekCount(Math.max(data.max_minggu, 1))
                setFocusWeek(data.max_minggu)
                setSelectedPrintWeek(data.max_minggu)
            }

            return data
        },
    })

    useEffect(() => {
        if (report?.items) {
            setEditableItems(JSON.parse(JSON.stringify(report.items)) as EditableProgressItem[])
            setHasChanges(false)
        } else if (report && report.items.length === 0) {
            setEditableItems(createEmptyProgressItems())
        }
    }, [report])

    useEffect(() => {
        setSelectedPrintWeek((prev) => Math.min(Math.max(prev, 1), weekCount))
        setFocusWeek((prev) => Math.min(Math.max(prev, 1), weekCount))
    }, [weekCount])

    const saveMutation = useMutation({
        mutationKey: ['progress', 'save', pekerjaanId],
        mutationFn: (data: unknown) => saveProgressReport(pekerjaanId, data),
        onSuccess: () => {
            toast.success('Progress berhasil disimpan')
            queryClient.invalidateQueries({ queryKey: ['progress-report', pekerjaanId] })
            queryClient.invalidateQueries({ queryKey: ['buat-laporan-pekerjaan'] })
            queryClient.invalidateQueries({ queryKey: ['pekerjaan', pekerjaanId] })
            setHasChanges(false)
        },
        onError: (error) => {
            console.error('Failed to save progress:', error)
            toast.error('Gagal menyimpan perubahan')
        },
    })

    const handleSaveAll = () => {
        const { items: calculatedItems } = calculateProgressData(editableItems, weekCount)
        const itemsToSave = editableItems
            .filter((item) => item.nama_item.trim() !== '')
            .map((item, idx) => ({
                nama_item: item.nama_item,
                rincian_item: item.rincian_item,
                satuan: item.satuan?.trim() || '-',
                harga_satuan: parseFloat(String(item.harga_satuan)) || 0,
                target_volume: parseFloat(String(item.target_volume)) || 0,
                bobot: calculatedItems[idx]?.bobot || 0,
                weekly_data: item.weekly_data,
            }))

        saveMutation.mutate({
            items: itemsToSave,
            week_count: weekCount,
        })
    }

    return {
        report,
        isLoading,
        weekCount,
        setWeekCount,
        hasChanges,
        setHasChanges,
        editableItems,
        setEditableItems,
        focusWeek,
        setFocusWeek,
        selectedPrintWeek,
        setSelectedPrintWeek,
        submitting: saveMutation.isPending,
        handleSaveAll,
        queryClient,
    }
}