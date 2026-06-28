import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPekerjaanById } from '@/features/pekerjaan/api/pekerjaan'
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard'
import type { BuatLaporanEditorSnapshot } from '../types'

export function useBuatLaporanPage(pekerjaanId: number) {
    const [editorSnapshot, setEditorSnapshot] = useState<BuatLaporanEditorSnapshot>({
        weightedProgress: 0,
        hasChanges: false,
    })

    const { data: pekerjaan, isLoading } = useQuery({
        queryKey: ['pekerjaan', pekerjaanId],
        queryFn: async () => {
            const response = await getPekerjaanById(pekerjaanId)
            return response.data
        },
        enabled: pekerjaanId > 0,
    })

    const { confirmLeave } = useUnsavedChangesGuard(editorSnapshot.hasChanges)

    const handleEditorSnapshotChange = useCallback((snapshot: Partial<BuatLaporanEditorSnapshot>) => {
        setEditorSnapshot((prev) => ({ ...prev, ...snapshot }))
    }, [])

    return {
        pekerjaan,
        isLoading,
        weightedProgress: editorSnapshot.weightedProgress,
        hasChanges: editorSnapshot.hasChanges,
        confirmLeave,
        handleEditorSnapshotChange,
    }
}