import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { getMasterFasePekerjaan } from '../api/master-fase'
import {
    applyAutoFill,
    calculateSchedule,
    type ScheduledGroup,
} from '../utils/construction-scheduler'
import {
    applyScheduledRencanaToProgressItems,
    buildSchedulerItems,
    detectProjectTypeFromProgressItems,
} from '../lib/progress-scheduler-bridge'
import type { EditableProgressItem } from '../types/progress-editor'

type UseProgressAutoFillOptions = {
    editableItems: EditableProgressItem[]
    weekCount: number
    setEditableItems: React.Dispatch<React.SetStateAction<EditableProgressItem[]>>
    setHasChanges: (value: boolean) => void
}

export function useProgressAutoFill({
    editableItems,
    weekCount,
    setEditableItems,
    setHasChanges,
}: UseProgressAutoFillOptions) {
    const [open, setOpen] = useState(false)
    const [previewGroups, setPreviewGroups] = useState<ScheduledGroup[]>([])
    const [detectedProjectType, setDetectedProjectType] = useState('')
    const [preparing, setPreparing] = useState(false)
    const [applying, setApplying] = useState(false)

    const prepareAutoFill = useCallback(async () => {
        if (editableItems.length === 0) {
            toast.error('Tidak ada data pekerjaan untuk di-autofill')
            return false
        }

        setPreparing(true)
        try {
            const schedulerItems = buildSchedulerItems(editableItems)
            const projectType = detectProjectTypeFromProgressItems(editableItems)
            setDetectedProjectType(projectType)

            const masterFases = await getMasterFasePekerjaan(projectType)
            if (masterFases.length === 0) {
                toast.error(`Tidak ada data Master Fase untuk proyek jenis: ${projectType}`)
                return false
            }

            const schedule = calculateSchedule(schedulerItems, masterFases, weekCount)
            setPreviewGroups(schedule)
            setOpen(true)
            return true
        } catch {
            toast.error('Gagal mengambil data master fase')
            return false
        } finally {
            setPreparing(false)
        }
    }, [editableItems, weekCount])

    const applyAutoFillPlan = useCallback(async () => {
        setApplying(true)
        try {
            const masterFases = await getMasterFasePekerjaan(detectedProjectType)
            const schedulerItems = buildSchedulerItems(editableItems)
            const scheduledItems = applyAutoFill(schedulerItems, masterFases, weekCount)
            const nextItems = applyScheduledRencanaToProgressItems(editableItems, scheduledItems, weekCount)

            setEditableItems(nextItems)
            setHasChanges(true)
            setOpen(false)
            toast.success('Rencana berhasil di-autofill berdasarkan fase konstruksi')
        } catch {
            toast.error('Gagal melakukan autofill')
        } finally {
            setApplying(false)
        }
    }, [detectedProjectType, editableItems, setEditableItems, setHasChanges, weekCount])

    return {
        open,
        setOpen,
        previewGroups,
        detectedProjectType,
        preparing,
        applying,
        prepareAutoFill,
        applyAutoFillPlan,
    }
}