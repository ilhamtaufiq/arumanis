import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, CheckSquare, CloudUpload, FileDown, FileSpreadsheet, Loader2, RefreshCw, Search, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useAuthStore } from '@/stores/auth-stores'
import {
    getPublicPuspenProgressFisik,
    getPuspenProgressFisik,
    savePuspenProgressFisik,
    type PuspenProgressFisikItem,
    type PuspenProgressFisikOutput,
    type PuspenProgressFisikResponse,
} from '../api/progress-fisik'
import { PuspenToolLayout } from './PuspenToolLayout'
import { PUSPEN_TOOLS } from '../lib/tool-meta'
import { exportProgressFisikPdf } from '../utils/export-pdf'
import { exportProgressFisikExcel } from '../utils/export-excel'
import {
    resolveSubKegiatanKey,
    type ExportOptions,
} from '../utils/export-shared'
import { ProgressFisikExportPeriodDialog } from './ProgressFisikExportPeriodDialog'

type EditableValue = {
    rencana: string
    realisasi: string
    phoCompleted: boolean
}

type OutputEditableValue = {
    realisasi: string
}

type RowSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

const outputDraftKey = (kontrakId: number, outputId: number) => `${kontrakId}-${outputId}`

const AUTO_SAVE_DELAY_MS = 700
const currentYear = new Date().getFullYear()
const ALL_SUB_KEGIATAN = ''

const toInputValue = (value: number | null) => (value === null || value === undefined ? '' : String(value))

const parsePercent = (value: string): number | null => {
    const normalized = value.replace(',', '.').trim()
    if (normalized === '') return null

    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
}

const parseVolume = (value: string): number | null => {
    const normalized = value.replace(',', '.').trim()
    if (normalized === '') return null

    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
}

const sanitizeDecimalInput = (value: string) => {
    let sanitized = value.replace(/[^0-9,.]/g, '')
    const firstSeparatorIndex = sanitized.search(/[,.]/)

    if (firstSeparatorIndex !== -1) {
        const beforeSeparator = sanitized.slice(0, firstSeparatorIndex)
        const separator = sanitized[firstSeparatorIndex]
        const afterSeparator = sanitized
            .slice(firstSeparatorIndex + 1)
            .replace(/[,.]/g, '')

        sanitized = `${beforeSeparator}${separator}${afterSeparator}`
    }

    return sanitized
}

const formatVolume = (value: number | null) => {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value)
}

const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value)
}

const formatCurrency = (value: number | null | undefined) => {
    if (value == null || !Number.isFinite(value)) return '-'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

const formatTimestamp = (value: string | null | undefined) => {
    if (!value) return '-'
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return '-'

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

const calculateDeviation = (draft: EditableValue) => {
    const rencana = parsePercent(draft.rencana)
    const realisasi = parsePercent(draft.realisasi)

    if (rencana === null || realisasi === null) return null
    return Number((realisasi - rencana).toFixed(2))
}

const computeOutputCapaianPercent = (
    output: PuspenProgressFisikOutput,
    realisasiDraft: string,
) => {
    if (output.volume <= 0) return null
    const realisasi = parseVolume(realisasiDraft)
    if (realisasi === null) return null
    return Number(((realisasi / output.volume) * 100).toFixed(2))
}

const valuesEqual = (left: EditableValue, right: EditableValue) => (
    left.rencana === right.rencana
    && left.realisasi === right.realisasi
    && left.phoCompleted === right.phoCompleted
)

const outputValuesEqual = (left: OutputEditableValue, right: OutputEditableValue) => (
    left.realisasi === right.realisasi
)

const isDraftValid = (item: PuspenProgressFisikItem, values: EditableValue, outputDrafts: Record<string, OutputEditableValue>) => {
    const trimmedRencana = values.rencana.trim()
    if (trimmedRencana !== '') {
        const parsed = parsePercent(trimmedRencana)
        if (parsed === null || parsed < 0 || parsed > 100) {
            return false
        }
    }

    const trimmedRealisasi = values.realisasi.trim()
    if (trimmedRealisasi !== '') {
        const parsed = parsePercent(trimmedRealisasi)
        if (parsed === null || parsed < 0 || parsed > 100) {
            return false
        }
    }

    for (const output of item.outputs) {
        const draft = outputDrafts[outputDraftKey(item.kontrakId, output.outputId)]
        const trimmed = draft?.realisasi.trim() ?? ''
        if (trimmed === '') continue

        const parsed = parseVolume(trimmed)
        if (parsed === null || parsed < 0) {
            return false
        }
    }

    return true
}

const toBaseline = (item: PuspenProgressFisikItem): EditableValue => ({
    rencana: toInputValue(item.rencana),
    realisasi: toInputValue(item.realisasi),
    phoCompleted: item.phoCompleted,
})

const toOutputBaseline = (output: PuspenProgressFisikOutput): OutputEditableValue => ({
    realisasi: toInputValue(output.realisasi),
})

const buildOutputBaselines = (items: PuspenProgressFisikItem[]) => {
    const next: Record<string, OutputEditableValue> = {}

    items.forEach((item) => {
        item.outputs.forEach((output) => {
            next[outputDraftKey(item.kontrakId, output.outputId)] = toOutputBaseline(output)
        })
    })

    return next
}

const hasOutputDraftChanges = (
    item: PuspenProgressFisikItem,
    outputDrafts: Record<string, OutputEditableValue>,
    outputBaselines: Record<string, OutputEditableValue>,
) => item.outputs.some((output) => {
    const key = outputDraftKey(item.kontrakId, output.outputId)
    const draft = outputDrafts[key]
    const baseline = outputBaselines[key]
    if (!draft || !baseline) return false
    return !outputValuesEqual(draft, baseline)
})

export function PuspenProgressFisikPage() {
    const queryClient = useQueryClient()
    const { tahunAnggaran } = useAppSettingsValues()
    const { auth } = useAuthStore()
    const tool = PUSPEN_TOOLS.progressFisik
    const isPublicView = !auth.isSessionActive
    const [tahun, setTahun] = useState(currentYear)
    const [search, setSearch] = useState('')
    const [subKegiatanFilter, setSubKegiatanFilter] = useState(ALL_SUB_KEGIATAN)
    const [page, setPage] = useState(1)
    const [showAll, setShowAll] = useState(false)
    const [drafts, setDrafts] = useState<Record<number, EditableValue>>({})
    const [baselines, setBaselines] = useState<Record<number, EditableValue>>({})
    const [outputDrafts, setOutputDrafts] = useState<Record<string, OutputEditableValue>>({})
    const [outputBaselines, setOutputBaselines] = useState<Record<string, OutputEditableValue>>({})
    const [rowStatus, setRowStatus] = useState<Record<number, RowSaveStatus>>({})
    const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)
    const [exportDialogFormat, setExportDialogFormat] = useState<'pdf' | 'excel' | null>(null)
    /** Kolom pagu / nilai kontrak / sisa / retensi — default tampil */
    const [showAnggaranColumns, setShowAnggaranColumns] = useState(true)
    const [isManualSyncing, setIsManualSyncing] = useState(false)
    const draftsRef = useRef(drafts)
    const baselinesRef = useRef(baselines)
    const outputDraftsRef = useRef(outputDrafts)
    const outputBaselinesRef = useRef(outputBaselines)
    const rowsRef = useRef<PuspenProgressFisikItem[]>([])
    const saveTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
    const savedResetTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
    const perPage = showAll ? 1000 : 15

    useEffect(() => {
        if (isPublicView) {
            setTahun(Number(tahunAnggaran) || currentYear)
        }
    }, [isPublicView, tahunAnggaran])

    useEffect(() => {
        setPage(1)
    }, [tahun, search, subKegiatanFilter, showAll])

    const subKegiatanParam = subKegiatanFilter.trim() || undefined

    const subKegiatanOptionsQuery = useQuery({
        queryKey: ['puspen-progress-fisik-sub-kegiatan', isPublicView ? 'public' : 'auth', tahun],
        queryFn: () => (
            isPublicView
                ? getPublicPuspenProgressFisik({ page: 1, per_page: 1 })
                : getPuspenProgressFisik({ tahun, page: 1, per_page: 1 })
        ),
    })

    const subKegiatanOptions = useMemo(() => {
        const names = new Set<string>()
        const summary = subKegiatanOptionsQuery.data?.summary

        summary?.perSubKegiatan.forEach((item) => names.add(item.subKegiatan))
        summary?.perSubKegiatanOutput.forEach((item) => names.add(item.subKegiatan))

        return Array.from(names).sort((left, right) => left.localeCompare(right, 'id'))
    }, [subKegiatanOptionsQuery.data?.summary])

    const progressQuery = useQuery({
        queryKey: [
            'puspen-progress-fisik',
            isPublicView ? 'public' : 'auth',
            tahun,
            search,
            subKegiatanFilter,
            page,
            perPage,
        ],
        queryFn: () => (
            isPublicView
                ? getPublicPuspenProgressFisik({
                    search: search.trim() || undefined,
                    sub_kegiatan: subKegiatanParam,
                    page,
                    per_page: perPage,
                })
                : getPuspenProgressFisik({
                    tahun,
                    search: search.trim() || undefined,
                    sub_kegiatan: subKegiatanParam,
                    page,
                    per_page: perPage,
                })
        ),
    })

    const rows = progressQuery.data?.data ?? []
    const meta = progressQuery.data?.meta
    const totalPages = meta?.last_page ?? 1
    const totalRows = meta?.total ?? rows.length

    draftsRef.current = drafts
    baselinesRef.current = baselines
    outputDraftsRef.current = outputDrafts
    outputBaselinesRef.current = outputBaselines
    rowsRef.current = rows

    const fetchAllData = useCallback(async (opts?: {
        /** Jika true, ambil semua sub kegiatan (untuk export) */
        ignoreSubFilter?: boolean
        search?: string
    }) => {
        const batchSize = 1000
        const searchTerm = (opts?.search ?? search).trim() || undefined
        const subFilter = opts?.ignoreSubFilter ? undefined : subKegiatanParam
        let currentPage = 1
        let allData: PuspenProgressFisikItem[] = []

        while (true) {
            const result = isPublicView
                ? await getPublicPuspenProgressFisik({
                    search: searchTerm,
                    sub_kegiatan: subFilter,
                    page: currentPage,
                    per_page: batchSize,
                })
                : await getPuspenProgressFisik({
                    tahun,
                    search: searchTerm,
                    sub_kegiatan: subFilter,
                    page: currentPage,
                    per_page: batchSize,
                })

            allData = allData.concat(result.data ?? [])

            const resultMeta = result.meta
            if (!resultMeta || currentPage >= resultMeta.last_page) break
            currentPage++
        }

        return allData
    }, [isPublicView, search, subKegiatanParam, tahun])

    useEffect(() => {
        const items = progressQuery.data?.data ?? []
        if (items.length === 0) return

        setBaselines((current) => {
            const next = { ...current }
            items.forEach((item) => {
                const status = rowStatus[item.kontrakId]
                if (status === 'pending' || status === 'saving' || status === 'saved') return
                next[item.kontrakId] = toBaseline(item)
            })
            return next
        })

        setDrafts((current) => {
            const next = { ...current }
            items.forEach((item) => {
                const status = rowStatus[item.kontrakId]
                if (status === 'pending' || status === 'saving' || status === 'saved') return
                next[item.kontrakId] = toBaseline(item)
            })
            return next
        })

        setOutputBaselines((current) => {
            const next = { ...current }
            const fresh = buildOutputBaselines(items)
            Object.entries(fresh).forEach(([key, value]) => {
                const kontrakId = Number(key.split('-')[0])
                const status = rowStatus[kontrakId]
                if (status === 'pending' || status === 'saving') return
                next[key] = value
            })
            return next
        })

        setOutputDrafts((current) => {
            const next = { ...current }
            const fresh = buildOutputBaselines(items)
            Object.entries(fresh).forEach(([key, value]) => {
                const kontrakId = Number(key.split('-')[0])
                const status = rowStatus[kontrakId]
                if (status === 'pending' || status === 'saving') return
                next[key] = value
            })
            return next
        })
    }, [progressQuery.data, rowStatus])

    useEffect(() => () => {
        Object.values(saveTimersRef.current).forEach(clearTimeout)
        Object.values(savedResetTimersRef.current).forEach(clearTimeout)
    }, [])

    const buildSavePayload = useCallback((kontrakId: number) => {
        const item = rowsRef.current.find((row) => row.kontrakId === kontrakId)
        const draft = draftsRef.current[kontrakId]
        if (!item || !draft) return null

        const payload: {
            kontrak_id: number
            rencana: number | null
            realisasi: number | null
            pho_completed: boolean
            outputs?: Array<{ output_id: number; realisasi: number | null }>
        } = {
            kontrak_id: kontrakId,
            rencana: parsePercent(draft.rencana),
            realisasi: parsePercent(draft.realisasi),
            pho_completed: draft.phoCompleted,
        }

        if (item.outputs.length > 0) {
            payload.outputs = item.outputs.map((output) => ({
                output_id: output.outputId,
                realisasi: parseVolume(
                    outputDraftsRef.current[outputDraftKey(kontrakId, output.outputId)]?.realisasi ?? '',
                ),
            }))
        }

        return payload
    }, [])

    const saveRow = useCallback(async (kontrakId: number) => {
        if (isPublicView) return

        const draft = draftsRef.current[kontrakId]
        const baseline = baselinesRef.current[kontrakId]
        const item = rowsRef.current.find((row) => row.kontrakId === kontrakId)
        if (!draft || !baseline || !item) return

        const kontrakChanged = !valuesEqual(draft, baseline)
        const outputChanged = hasOutputDraftChanges(item, outputDraftsRef.current, outputBaselinesRef.current)

        if (!kontrakChanged && !outputChanged) {
            setRowStatus((current) => ({ ...current, [kontrakId]: 'idle' }))
            return
        }

        if (!isDraftValid(item, draft, outputDraftsRef.current)) {
            return
        }

        const payload = buildSavePayload(kontrakId)
        if (!payload) return

        setRowStatus((current) => ({ ...current, [kontrakId]: 'saving' }))

        try {
            await savePuspenProgressFisik({
                tahun,
                items: [payload],
            })

            setBaselines((current) => ({
                ...current,
                [kontrakId]: { ...draft },
            }))
            setOutputBaselines((current) => {
                const next = { ...current }
                item.outputs.forEach((output) => {
                    const key = outputDraftKey(kontrakId, output.outputId)
                    const outputDraft = outputDraftsRef.current[key]
                    if (outputDraft) {
                        next[key] = { ...outputDraft }
                    }
                })
                return next
            })
            setRowStatus((current) => ({ ...current, [kontrakId]: 'saved' }))

            queryClient.setQueriesData<PuspenProgressFisikResponse>(
                { queryKey: ['puspen-progress-fisik'] },
                (current) => {
                    if (!current) return current

                    return {
                        ...current,
                        data: current.data.map((row) => (
                            row.kontrakId === kontrakId
                                ? { ...row, phoCompleted: draft.phoCompleted }
                                : row
                        )),
                    }
                },
            )

            if (savedResetTimersRef.current[kontrakId]) {
                clearTimeout(savedResetTimersRef.current[kontrakId])
            }
            savedResetTimersRef.current[kontrakId] = setTimeout(() => {
                setRowStatus((current) => ({ ...current, [kontrakId]: 'idle' }))
            }, 2000)

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['puspen-progress-fisik'] }),
                queryClient.invalidateQueries({ queryKey: ['puspen-progress-fisik-sub-kegiatan'] }),
                queryClient.invalidateQueries({ queryKey: ['pekerjaan-progress-estimasi'] }),
            ])
        } catch {
            setRowStatus((current) => ({ ...current, [kontrakId]: 'error' }))
            toast.error('Gagal menyimpan progress fisik. Periksa kembali nilai rencana/realisasi.')
        }
    }, [buildSavePayload, isPublicView, queryClient, tahun])

    const handleSyncUlang = useCallback(async () => {
        if (isPublicView || isManualSyncing) return

        Object.values(saveTimersRef.current).forEach(clearTimeout)
        saveTimersRef.current = {}

        setIsManualSyncing(true)

        try {
            const allItems = await fetchAllData()

            if (allItems.length === 0) {
                toast.info('Tidak ada kontrak untuk disinkronkan ulang.')
                return
            }

            const targets = allItems.map((item) => ({
                item,
                kontrakId: item.kontrakId,
                draft: draftsRef.current[item.kontrakId] ?? toBaseline(item),
            }))

            const invalidTarget = targets.find(({ item, draft }) => (
                !isDraftValid(item, draft, outputDraftsRef.current)
            ))
            if (invalidTarget) {
                toast.error('Ada nilai rencana/realisasi tidak valid. Perbaiki sebelum sync ulang.')
                return
            }

            targets.forEach(({ kontrakId }) => {
                setRowStatus((current) => ({ ...current, [kontrakId]: 'saving' }))
            })

            await savePuspenProgressFisik({
                tahun,
                items: targets
                    .map(({ kontrakId }) => buildSavePayload(kontrakId))
                    .filter((payload): payload is NonNullable<typeof payload> => payload !== null),
            })

            setBaselines((current) => {
                const next = { ...current }
                targets.forEach(({ kontrakId, draft }) => {
                    next[kontrakId] = { ...draft }
                })
                return next
            })

            setOutputBaselines((current) => {
                const next = { ...current }
                targets.forEach(({ item, kontrakId }) => {
                    item.outputs.forEach((output) => {
                        const key = outputDraftKey(kontrakId, output.outputId)
                        const outputDraft = outputDraftsRef.current[key]
                        if (outputDraft) {
                            next[key] = { ...outputDraft }
                        }
                    })
                })
                return next
            })

            targets.forEach(({ kontrakId }) => {
                setRowStatus((current) => ({ ...current, [kontrakId]: 'saved' }))
                if (savedResetTimersRef.current[kontrakId]) {
                    clearTimeout(savedResetTimersRef.current[kontrakId])
                }
                savedResetTimersRef.current[kontrakId] = setTimeout(() => {
                    setRowStatus((current) => ({ ...current, [kontrakId]: 'idle' }))
                }, 2000)
            })

            toast.success(
                `${targets.length} kontrak disinkronkan ulang ke tab Progress pekerjaan terkait.`,
            )

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['puspen-progress-fisik'] }),
                queryClient.invalidateQueries({ queryKey: ['puspen-progress-fisik-sub-kegiatan'] }),
                queryClient.invalidateQueries({ queryKey: ['pekerjaan-progress-estimasi'] }),
            ])
        } catch {
            toast.error('Gagal sync ulang. Coba lagi.')
        } finally {
            setIsManualSyncing(false)
        }
    }, [
        buildSavePayload,
        fetchAllData,
        isManualSyncing,
        isPublicView,
        queryClient,
        tahun,
    ])

    const scheduleRowSave = useCallback((kontrakId: number, immediate = false) => {
        if (isPublicView) return

        if (saveTimersRef.current[kontrakId]) {
            clearTimeout(saveTimersRef.current[kontrakId])
        }

        setRowStatus((current) => ({
            ...current,
            [kontrakId]: current[kontrakId] === 'saving' ? 'saving' : 'pending',
        }))

        const runSave = () => {
            delete saveTimersRef.current[kontrakId]
            void saveRow(kontrakId)
        }

        if (immediate) {
            queueMicrotask(runSave)
            return
        }

        saveTimersRef.current[kontrakId] = setTimeout(runSave, AUTO_SAVE_DELAY_MS)
    }, [isPublicView, saveRow])

    const summary = progressQuery.data?.summary ?? {
        count: 0,
        rencana: 0,
        realisasi: 0,
        deviasi: 0,
        latestUpdatedAt: null,
        kontrakTanpaOutput: 0,
        phoCompleted: 0,
        perSubKegiatan: [],
        perSubKegiatanOutput: [],
    }

    const handleDraftChange = (
        kontrakId: number,
        field: 'rencana' | 'realisasi',
        value: string,
    ) => {
        setDrafts((current) => ({
            ...current,
            [kontrakId]: {
                ...(current[kontrakId] ?? { rencana: '', realisasi: '', phoCompleted: false }),
                [field]: sanitizeDecimalInput(value),
            },
        }))
        scheduleRowSave(kontrakId)
    }

    const handlePhoChange = (kontrakId: number, checked: boolean) => {
        setDrafts((current) => {
            const nextDraft: EditableValue = {
                ...(current[kontrakId] ?? { rencana: '', realisasi: '', phoCompleted: false }),
                phoCompleted: checked,
            }

            draftsRef.current = {
                ...draftsRef.current,
                [kontrakId]: nextDraft,
            }

            return {
                ...current,
                [kontrakId]: nextDraft,
            }
        })
        scheduleRowSave(kontrakId, true)
    }

    const handleOutputDraftChange = (
        kontrakId: number,
        outputId: number,
        value: string,
    ) => {
        const key = outputDraftKey(kontrakId, outputId)
        setOutputDrafts((current) => ({
            ...current,
            [key]: {
                realisasi: sanitizeDecimalInput(value),
            },
        }))
        scheduleRowSave(kontrakId)
    }

    const handleDraftBlur = (kontrakId: number) => {
        scheduleRowSave(kontrakId, true)
    }

    const renderRowSaveStatus = (kontrakId: number) => {
        const status = rowStatus[kontrakId] ?? 'idle'

        if (status === 'saving') {
            return (
                <span className="inline-flex items-center gap-1 text-[#111111]/70">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Simpan...
                </span>
            )
        }

        if (status === 'pending') {
            return <span className="text-[#FB8500]">Menunggu...</span>
        }

        if (status === 'saved') {
            return (
                <span className="inline-flex items-center gap-1 text-[#1B7F43]">
                    <Check className="h-3.5 w-3.5" />
                    Tersimpan
                </span>
            )
        }

        if (status === 'error') {
            return <span className="text-[#EF233C]">Gagal</span>
        }

        return <span className="text-[#111111]/45">Auto</span>
    }

    const openExportDialog = (format: 'pdf' | 'excel') => {
        if (exporting) return
        setExportDialogFormat(format)
    }

    const handleExportConfirm = async (options: ExportOptions) => {
        const format = exportDialogFormat
        if (!format) return

        setExporting(format)
        try {
            // Ambil semua kontrak + daftar belum berkontrak (abaikan filter sub di halaman)
            const batchSize = 1000
            let currentPage = 1
            let allData: PuspenProgressFisikItem[] = []
            let uncontracted: Awaited<
                ReturnType<typeof getPuspenProgressFisik>
            >['uncontractedPekerjaan'] = []

            while (true) {
                const result = isPublicView
                    ? await getPublicPuspenProgressFisik({
                        page: currentPage,
                        per_page: batchSize,
                    })
                    : await getPuspenProgressFisik({
                        tahun,
                        page: currentPage,
                        per_page: batchSize,
                    })

                allData = allData.concat(result.data ?? [])
                if (currentPage === 1) {
                    uncontracted = result.uncontractedPekerjaan ?? []
                }

                const resultMeta = result.meta
                if (!resultMeta || currentPage >= resultMeta.last_page) break
                currentPage++
            }

            const hasContractMatch = allData.some((item) =>
                options.subKegiatan.includes(resolveSubKegiatanKey(item.subKegiatan)),
            )
            const hasUncMatch = uncontracted.some((row) =>
                options.subKegiatan.includes(resolveSubKegiatanKey(row.subKegiatan)),
            )

            if (!hasContractMatch && !hasUncMatch) {
                toast.error('Tidak ada paket pada sub kegiatan yang dipilih')
                return
            }

            if (format === 'pdf') {
                await exportProgressFisikPdf({
                    items: allData,
                    tahun,
                    options,
                    uncontractedPekerjaan: uncontracted,
                })
            } else {
                exportProgressFisikExcel({
                    items: allData,
                    tahun,
                    options,
                    uncontractedPekerjaan: uncontracted,
                })
            }
            setExportDialogFormat(null)
            toast.success(
                `Export ${format.toUpperCase()} siap · ${options.subKegiatan.length} sub · ${uncontracted.length} belum berkontrak`,
            )
        } catch {
            toast.error(`Gagal export ${format.toUpperCase()}`)
        } finally {
            setExporting(null)
        }
    }

    const renderRows = () => {
        // No + Paket + Sub + Estimasi(3) + [Anggaran(4)] + Output(4) + PHO + Update
        const columnCount = 12 + (showAnggaranColumns ? 4 : 0)

        if (progressQuery.isLoading) {
            return (
                <tr>
                    <td colSpan={columnCount} className="h-36 text-center">
                        <RefreshCw className="mx-auto h-8 w-8 animate-spin" />
                    </td>
                </tr>
            )
        }

        if (rows.length === 0) {
            return (
                <tr>
                    <td colSpan={columnCount} className="h-36 text-center text-sm font-bold">
                        Tidak ada kontrak pada tahun anggaran ini.
                    </td>
                </tr>
            )
        }

        return rows.flatMap((item: PuspenProgressFisikItem, index) => {
            const draft = drafts[item.kontrakId] ?? { rencana: '', realisasi: '', phoCompleted: false }
            const outputRows = item.outputs.length > 0
                ? item.outputs
                : [null]
            const rowSpan = outputRows.length
            const deviasi = calculateDeviation(draft)

            return outputRows.map((output, outputIndex) => {
                const outputKey = output
                    ? outputDraftKey(item.kontrakId, output.outputId)
                    : null
                const outputDraft = outputKey
                    ? (outputDrafts[outputKey] ?? { realisasi: '' })
                    : null
                const outputCapaian = output
                    ? computeOutputCapaianPercent(output, outputDraft?.realisasi ?? '')
                    : null

                return (
                    <tr
                        key={output ? `${item.kontrakId}-${output.outputId}` : item.kontrakId}
                        className="border-b-[3px] border-[#111111]"
                    >
                        {outputIndex === 0 ? (
                            <td
                                rowSpan={rowSpan}
                                className="w-14 border-r-[3px] border-[#111111] px-3 py-3 text-center font-black align-top"
                            >
                                {index + 1}
                            </td>
                        ) : null}
                        {outputIndex === 0 ? (
                            <td
                                rowSpan={rowSpan}
                                className="min-w-[260px] border-r-[3px] border-[#111111] px-4 py-3 font-bold align-top"
                            >
                                <div className="space-y-1">
                                    <div>{item.namaPaket || '-'}</div>
                                    <div className="text-xs uppercase tracking-[0.16em] text-[#111111]/55">
                                        {item.kodePaket || 'Tanpa kode paket'}
                                    </div>
                                </div>
                            </td>
                        ) : null}
                        {outputIndex === 0 ? (
                            <td
                                rowSpan={rowSpan}
                                className="min-w-[200px] border-r-[6px] border-[#111111] bg-[#FFF7E8] px-4 py-3 font-bold align-top"
                            >
                                {item.subKegiatan || '-'}
                            </td>
                        ) : null}
                        {outputIndex === 0 ? (
                            <td
                                rowSpan={rowSpan}
                                className="w-32 border-r-[3px] border-[#111111] bg-[#FFB703]/35 px-3 py-3 align-top"
                            >
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*[,.]?[0-9]*"
                                    value={draft.rencana}
                                    onChange={(event) => handleDraftChange(item.kontrakId, 'rencana', event.target.value)}
                                    onBlur={() => handleDraftBlur(item.kontrakId)}
                                    disabled={isPublicView}
                                    className="h-10 w-full border-[3px] border-[#111111] bg-[#FFF7E8] px-3 text-right font-black outline-none shadow-[2px_2px_0_0_#111111] focus:bg-[#8ECAE6] disabled:cursor-not-allowed disabled:opacity-70"
                                    placeholder="0"
                                />
                                <div className="mt-1 text-center text-[10px] font-black uppercase tracking-[0.12em] text-[#111111]/55">
                                    %
                                </div>
                            </td>
                        ) : null}
                        {outputIndex === 0 ? (
                            <td
                                rowSpan={rowSpan}
                                className="w-32 border-r-[3px] border-[#111111] bg-[#FFB703]/35 px-3 py-3 align-top"
                            >
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*[,.]?[0-9]*"
                                    value={draft.realisasi}
                                    onChange={(event) => handleDraftChange(item.kontrakId, 'realisasi', event.target.value)}
                                    onBlur={() => handleDraftBlur(item.kontrakId)}
                                    disabled={isPublicView}
                                    className="h-10 w-full border-[3px] border-[#111111] bg-[#FFFFFF] px-3 text-right font-black outline-none shadow-[2px_2px_0_0_#111111] focus:bg-[#8ECAE6] disabled:cursor-not-allowed disabled:opacity-70"
                                    placeholder="0"
                                />
                                <div className="mt-1 text-center text-[10px] font-black uppercase tracking-[0.12em] text-[#111111]/55">
                                    %
                                </div>
                            </td>
                        ) : null}
                        {outputIndex === 0 ? (
                            <td
                                rowSpan={rowSpan}
                                className={`w-28 border-[#111111] bg-[#FFB703]/35 px-4 py-3 text-right font-black align-top ${
                                    showAnggaranColumns ? 'border-r-[3px]' : 'border-r-[6px]'
                                } ${
                                    deviasi !== null && deviasi < 0 ? 'text-[#EF233C]' : 'text-[#1B7F43]'
                                }`}
                            >
                                {formatPercent(deviasi)}
                                <div className="mt-1 text-center text-[10px] font-black uppercase tracking-[0.12em] text-[#111111]/55">
                                    %
                                </div>
                            </td>
                        ) : null}
                        {outputIndex === 0 && showAnggaranColumns ? (
                            <>
                                <td
                                    rowSpan={rowSpan}
                                    className="min-w-[120px] border-r-[3px] border-[#111111] bg-[#E8F5E9] px-3 py-3 text-right text-xs font-black align-top"
                                >
                                    {formatCurrency(item.pagu)}
                                </td>
                                <td
                                    rowSpan={rowSpan}
                                    className="min-w-[120px] border-r-[3px] border-[#111111] bg-[#E8F5E9] px-3 py-3 text-right text-xs font-black align-top"
                                >
                                    {formatCurrency(item.nilaiKontrak)}
                                </td>
                                <td
                                    rowSpan={rowSpan}
                                    className="min-w-[120px] border-r-[3px] border-[#111111] bg-[#E8F5E9] px-3 py-3 text-right text-xs font-black align-top"
                                >
                                    {formatCurrency(item.sisaKontrak)}
                                </td>
                                <td
                                    rowSpan={rowSpan}
                                    className="min-w-[120px] border-r-[6px] border-[#111111] bg-[#E8F5E9] px-3 py-3 text-right text-xs font-black align-top"
                                >
                                    {formatCurrency(item.retensi)}
                                </td>
                            </>
                        ) : null}
                        {output ? (
                            <>
                                <td className="min-w-[180px] border-r-[3px] border-[#111111] bg-[#8ECAE6]/25 px-4 py-3 font-bold">
                                    {output.komponen}
                                </td>
                                <td className="w-28 border-r-[3px] border-[#111111] bg-[#8ECAE6]/25 px-4 py-3 text-right font-black">
                                    {formatVolume(output.volume)}
                                </td>
                                <td className="w-20 border-r-[3px] border-[#111111] bg-[#8ECAE6]/25 px-3 py-3 text-center font-black">
                                    {output.satuan}
                                </td>
                                <td className="w-36 border-r-[3px] border-[#111111] bg-[#8ECAE6]/25 px-3 py-3">
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            pattern="[0-9]*[,.]?[0-9]*"
                                            value={outputDraft?.realisasi ?? ''}
                                            onChange={(event) => handleOutputDraftChange(
                                                item.kontrakId,
                                                output.outputId,
                                                event.target.value,
                                            )}
                                            onBlur={() => handleDraftBlur(item.kontrakId)}
                                            disabled={isPublicView}
                                            className="h-10 w-full border-[3px] border-[#111111] bg-[#FFFFFF] px-3 text-right font-black outline-none shadow-[2px_2px_0_0_#111111] focus:bg-[#8ECAE6] disabled:cursor-not-allowed disabled:opacity-70"
                                            placeholder="0"
                                        />
                                        {outputCapaian !== null ? (
                                            <div className="text-center text-[10px] font-black uppercase tracking-[0.12em] text-[#111111]/55">
                                                {formatPercent(outputCapaian)}% capaian
                                            </div>
                                        ) : null}
                                    </div>
                                </td>
                            </>
                        ) : (
                            <td
                                colSpan={4}
                                className="border-r-[3px] border-[#111111] bg-[#8ECAE6]/25 px-4 py-3"
                            >
                                <span className="text-xs font-bold leading-5 text-[#111111]/70">
                                    {item.outputNotice ?? 'Output pekerjaan belum diinput di master data.'}
                                </span>
                            </td>
                        )}
                        {outputIndex === 0 ? (
                            <td
                                rowSpan={rowSpan}
                                className="w-24 border-r-[3px] border-[#111111] bg-[#2ECC71]/25 px-3 py-3 text-center align-top"
                            >
                                <label className="inline-flex cursor-pointer flex-col items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={draft.phoCompleted}
                                        onChange={(event) => handlePhoChange(item.kontrakId, event.target.checked)}
                                        disabled={isPublicView}
                                        className="h-5 w-5 cursor-pointer border-[3px] border-[#111111] accent-[#2ECC71] disabled:cursor-not-allowed disabled:opacity-70"
                                        aria-label={`PHO selesai untuk ${item.namaPaket || item.kodePaket || 'paket'}`}
                                    />
                                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#111111]">
                                        PHO
                                    </span>
                                </label>
                            </td>
                        ) : null}
                        {outputIndex === 0 ? (
                            <td
                                rowSpan={rowSpan}
                                className="min-w-[170px] px-3 py-3 text-xs font-black align-top"
                            >
                                <div>{formatTimestamp(item.updatedAt)}</div>
                                {!isPublicView ? (
                                    <div className="mt-1 text-[10px] uppercase tracking-[0.12em]">
                                        {renderRowSaveStatus(item.kontrakId)}
                                    </div>
                                ) : null}
                            </td>
                        ) : null}
                    </tr>
                )
            })
        })
    }

    return (
        <>
        <PuspenToolLayout
            slot={tool.slot}
            toolName={tool.toolName}
            accent={tool.accent}
            playerName={isPublicView ? undefined : auth.user?.name}
            showHubBack={!isPublicView}
            showDashboardExit={!isPublicView}
            eyebrow={(
                <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {isPublicView ? 'Mode Publik' : 'Progress Fisik'}
                </span>
            )}
            title={isPublicView ? 'Progress Fisik Publik' : tool.title}
            description="Estimasi progress (rencana/realisasi %) dan realisasi output (volume per komponen) ditampilkan terpisah. Keduanya disimpan otomatis; estimasi progress disinkronkan ke tab Progress pekerjaan."
            aside={(
                <>
                    <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="text-sm font-black uppercase tracking-[0.2em] text-[#111111]">
                            HUD
                        </div>
                        <div className="mt-2 text-2xl font-black uppercase tracking-[0.04em]">
                            Tahun {tahun}
                        </div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Filter tahun anggaran default mengikuti tahun berjalan. Ubah tahun untuk melihat paket kontrak lain.
                        </p>
                        <div className="mt-3 border-[3px] border-[#111111] bg-[#FFFFFF] p-3 shadow-[2px_2px_0_0_#111111]">
                            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#111111]">
                                Latest Update
                            </div>
                            <div className="mt-1 text-sm font-black">
                                {formatTimestamp(summary.latestUpdatedAt)}
                            </div>
                        </div>
                        {summary.kontrakTanpaOutput > 0 ? (
                            <div className="mt-3 border-[3px] border-[#111111] bg-[#FFB703]/35 p-3 shadow-[2px_2px_0_0_#111111]">
                                <div className="text-xs font-black uppercase tracking-[0.16em] text-[#111111]">
                                    Output Belum Lengkap
                                </div>
                                <p className="mt-1 text-sm font-bold leading-5">
                                    {summary.kontrakTanpaOutput} kontrak belum memiliki komponen output di master data Pekerjaan.
                                </p>
                            </div>
                        ) : null}
                        <div className="mt-3 border-[3px] border-[#111111] bg-[#2ECC71]/35 p-3 shadow-[2px_2px_0_0_#111111]">
                            <div className="text-xs font-black uppercase tracking-[0.16em] text-[#111111]">
                                PHO Selesai
                            </div>
                            <p className="mt-1 text-sm font-bold leading-5">
                                {summary.phoCompleted} dari {summary.count} kontrak sudah ditandai PHO.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[
                            ['Rencana', summary.rencana, '#FFB703'],
                            ['Realisasi', summary.realisasi, '#2ECC71'],
                            ['Deviasi', summary.deviasi, '#FB8500'],
                        ].map(([label, value, color]) => (
                            <div
                                key={label as string}
                                className="border-[3px] border-[#111111] bg-[#FFF7E8] p-3 shadow-[3px_3px_0_0_#111111]"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]">
                                            Rata-rata
                                        </div>
                                        <div className="mt-1 text-sm font-black uppercase tracking-[0.08em]">
                                            {label}
                                        </div>
                                    </div>
                                    <div
                                        className="border-[3px] border-[#111111] px-3 py-2 text-lg font-black shadow-[3px_3px_0_0_#111111]"
                                        style={{ backgroundColor: color as string }}
                                    >
                                        {formatPercent(value as number)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-[3px] border-[#111111] bg-[#8ECAE6] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]">
                            Realisasi Output Per Sub Kegiatan
                        </div>
                        <div className="mt-3 max-h-96 space-y-3 overflow-y-auto pr-1">
                            {summary.perSubKegiatanOutput.length > 0 ? (
                                summary.perSubKegiatanOutput.map((item) => (
                                    <div
                                        key={item.subKegiatan}
                                        className="border-[3px] border-[#111111] bg-[#FFFFFF] p-3 shadow-[2px_2px_0_0_#111111]"
                                    >
                                        <div className="text-sm font-black leading-5">
                                            {item.subKegiatan}
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs font-black">
                                            <div className="border-[2px] border-[#111111] bg-[#FFF7E8] p-2 text-[#111111]">
                                                <div className="uppercase tracking-[0.12em]">Target</div>
                                                <div className="mt-1">{formatVolume(item.volumeTarget)}</div>
                                            </div>
                                            <div className="border-[2px] border-[#111111] bg-[#2ECC71] p-2 text-[#111111]">
                                                <div className="uppercase tracking-[0.12em]">Realisasi</div>
                                                <div className="mt-1">{formatVolume(item.volumeRealisasi)}</div>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between gap-2">
                                            <div className="text-xs font-black uppercase tracking-[0.14em] text-[#111111]">
                                                {item.outputCount} baris output
                                            </div>
                                            <div className="border-[2px] border-[#111111] bg-[#FB8500] px-2 py-1 text-xs font-black">
                                                Capaian {formatPercent(item.capaian)}%
                                            </div>
                                        </div>
                                        {item.komponen.length > 0 ? (
                                            <div className="mt-3 space-y-2 border-t-[3px] border-[#111111] pt-3">
                                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#111111]/70">
                                                    Detail Komponen
                                                </div>
                                                {item.komponen.map((row) => (
                                                    <div
                                                        key={`${item.subKegiatan}-${row.komponen}-${row.satuan}`}
                                                        className="border-[2px] border-[#111111] bg-[#FFF7E8] p-2 shadow-[2px_2px_0_0_#111111]"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0">
                                                                <div className="text-xs font-black leading-4">
                                                                    {row.komponen}
                                                                </div>
                                                                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#111111]/55">
                                                                    {row.satuan}
                                                                    {row.outputCount > 1 ? ` · ${row.outputCount} paket` : ''}
                                                                </div>
                                                            </div>
                                                            <div className="shrink-0 border-[2px] border-[#111111] bg-[#FB8500] px-2 py-0.5 text-[10px] font-black">
                                                                {formatPercent(row.capaian)}%
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 grid grid-cols-2 gap-1.5 text-center text-[10px] font-black">
                                                            <div className="border border-[#111111] bg-white px-1 py-1">
                                                                <div className="uppercase tracking-[0.1em] text-[#111111]/55">Target</div>
                                                                <div className="mt-0.5">{formatVolume(row.volumeTarget)}</div>
                                                            </div>
                                                            <div className="border border-[#111111] bg-[#2ECC71]/30 px-1 py-1">
                                                                <div className="uppercase tracking-[0.1em] text-[#111111]/55">Realisasi</div>
                                                                <div className="mt-0.5">{formatVolume(row.volumeRealisasi)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm font-bold text-[#111111]">
                                    Belum ada data realisasi output.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-[3px] border-[#111111] bg-[#FFFFFF] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]">
                            Estimasi Progress Per Sub Kegiatan
                        </div>
                        <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
                            {summary.perSubKegiatan.length > 0 ? (
                                summary.perSubKegiatan.map((item) => (
                                    <div
                                        key={item.subKegiatan}
                                        className="border-[3px] border-[#111111] bg-[#FFF7E8] p-3 shadow-[2px_2px_0_0_#111111]"
                                    >
                                        <div className="text-sm font-black leading-5">
                                            {item.subKegiatan}
                                        </div>
                                        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs font-black">
                                            <div className="border-[2px] border-[#111111] bg-[#FFB703] p-2 text-[#111111]">
                                                <div className="uppercase tracking-[0.12em]">Rencana</div>
                                                <div className="mt-1">{formatPercent(item.rencana)}%</div>
                                            </div>
                                            <div className="border-[2px] border-[#111111] bg-[#2ECC71] p-2 text-[#111111]">
                                                <div className="uppercase tracking-[0.12em]">Realisasi</div>
                                                <div className="mt-1">{formatPercent(item.realisasi)}%</div>
                                            </div>
                                            <div className="border-[2px] border-[#111111] bg-[#FB8500] p-2 text-[#111111]">
                                                <div className="uppercase tracking-[0.12em]">Deviasi</div>
                                                <div className="mt-1">{formatPercent(item.deviasi)}%</div>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#111111]">
                                            {item.count} paket
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm font-bold text-[#111111]">
                                    Belum ada data sub kegiatan.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-[3px] border-[#111111] bg-[#FB8500] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-[#111111]">
                            <CheckSquare className="h-4 w-4" />
                            Catatan
                        </div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Estimasi progress (kolom kuning): rencana & realisasi dalam persen, deviasi = realisasi − rencana. Realisasi output (kolom biru): komponen, volume target, satuan, dan input realisasi volume per komponen — terpisah dari estimasi. Kolom PHO: centang jika serah terima pertama (PHO) sudah selesai. Perubahan tersimpan otomatis ±{AUTO_SAVE_DELAY_MS / 1000} detik.
                        </p>
                    </div>
                </>
            )}
        >
            <div className="space-y-5">
                <section className="border-[3px] border-[#111111] bg-[#FFFFFF] p-4 shadow-[6px_6px_0_0_#111111]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div className="space-y-3">
                            <div className="text-sm font-black uppercase tracking-[0.2em] text-[#111111]">
                                Filter Estimasi
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-[140px_minmax(200px,280px)_minmax(200px,280px)_minmax(200px,auto)]">
                            <label className="block">
                                <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#111111]">
                                    Tahun
                                </span>
                                <input
                                    type="number"
                                    min={2000}
                                    max={2100}
                                    value={tahun}
                                    onChange={(event) => setTahun(Number(event.target.value) || currentYear)}
                                    disabled={isPublicView}
                                    className="h-12 w-full border-[3px] border-[#111111] bg-[#FFF7E8] px-4 font-black outline-none shadow-[3px_3px_0_0_#111111] focus:bg-[#8ECAE6] disabled:cursor-not-allowed disabled:opacity-70"
                                    aria-label="Tahun anggaran"
                                />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#111111]">
                                    Cari Paket/Sub Kegiatan
                                </span>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        className="h-12 w-full border-[3px] border-[#111111] bg-[#FFFFFF] px-4 pl-10 font-bold outline-none shadow-[3px_3px_0_0_#111111] focus:bg-[#8ECAE6]"
                                        placeholder="Cari paket atau sub kegiatan"
                                    />
                                </div>
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#111111]">
                                    Sub Kegiatan
                                </span>
                                <select
                                    value={subKegiatanFilter}
                                    onChange={(event) => setSubKegiatanFilter(event.target.value)}
                                    disabled={subKegiatanOptionsQuery.isLoading}
                                    className="h-12 w-full border-[3px] border-[#111111] bg-[#8ECAE6] px-4 font-black outline-none shadow-[3px_3px_0_0_#111111] focus:bg-[#FFB703] disabled:cursor-not-allowed disabled:opacity-70"
                                    aria-label="Filter sub kegiatan"
                                >
                                    <option value={ALL_SUB_KEGIATAN}>Semua sub kegiatan</option>
                                    {subKegiatanOptions.map((name) => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            {!isPublicView ? (
                                <div className="flex flex-col gap-2 self-end">
                                    <div className="inline-flex h-10 items-center justify-center gap-2 border-[3px] border-[#111111] bg-[#FFF7E8] px-4 text-xs font-black uppercase tracking-[0.14em] text-[#111111] shadow-[2px_2px_0_0_#111111]">
                                        <CloudUpload className="h-3.5 w-3.5" />
                                        Auto-save aktif
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => void handleSyncUlang()}
                                        disabled={isManualSyncing || totalRows === 0}
                                        className="inline-flex h-12 items-center justify-center gap-2 border-[3px] border-[#111111] bg-[#2ECC71] px-5 font-black uppercase tracking-[0.12em] text-[#111111] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isManualSyncing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4" />
                                        )}
                                        Sync Ulang ({totalRows})
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    {isPublicView ? (
                        <div className="mt-4 border-[3px] border-[#111111] bg-[#8ECAE6] p-3 text-sm font-bold shadow-[3px_3px_0_0_#111111]">
                            Mode publik aktif. Tahun anggaran dikunci oleh admin. Login diperlukan untuk menyimpan perubahan.
                        </div>
                    ) : null}
                </section>

                <section className="border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[6px_6px_0_0_#111111]">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em]">
                            <TrendingUp className="h-4 w-4" />
                            Tabel Estimasi
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {!isPublicView ? (
                                <button
                                    type="button"
                                    onClick={() => void handleSyncUlang()}
                                    disabled={isManualSyncing || totalRows === 0}
                                    className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#2ECC71] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isManualSyncing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4" />
                                    )}
                                    Sync Ulang ({totalRows})
                                </button>
                            ) : null}
                            <button
                                type="button"
                                onClick={() => setShowAll((value) => !value)}
                                className="border-[3px] border-[#111111] bg-[#8ECAE6] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                            >
                                {showAll ? 'Paginasi' : 'Tampilkan Semua'}
                            </button>
                            <div className="border-[3px] border-[#111111] bg-[#FFFFFF] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#111111]">
                                {progressQuery.isLoading ? 'Lagi muat...' : `${rows.length} / ${totalRows} paket`}
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAnggaranColumns((v) => !v)}
                                className={`border-[3px] border-[#111111] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                                    showAnggaranColumns
                                        ? 'bg-[#E8F5E9] text-[#111111]'
                                        : 'bg-[#FFFFFF] text-[#111111]/60'
                                }`}
                                title="Tampilkan/sembunyikan kolom pagu, nilai kontrak, sisa, retensi"
                            >
                                {showAnggaranColumns ? 'Anggaran: On' : 'Anggaran: Off'}
                            </button>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => openExportDialog('pdf')}
                                    disabled={exporting !== null || rows.length === 0}
                                    className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#EF233C] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {exporting === 'pdf' ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <FileDown className="h-4 w-4" />
                                    )}
                                    PDF
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openExportDialog('excel')}
                                    disabled={exporting !== null || rows.length === 0}
                                    className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#2ECC71] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#111111] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {exporting === 'excel' ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <FileSpreadsheet className="h-4 w-4" />
                                    )}
                                    Excel
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden border-[3px] border-[#111111] bg-[#FFFFFF] shadow-[3px_3px_0_0_#111111]">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-[#FB8500]">
                                        <th rowSpan={2} className="border-r-[3px] border-b-[3px] border-[#111111] px-3 py-3 text-center font-black text-[#111111]">
                                            No
                                        </th>
                                        <th rowSpan={2} className="border-r-[3px] border-b-[3px] border-[#111111] px-4 py-3 text-left font-black text-[#111111]">
                                            Nama Paket Pekerjaan
                                        </th>
                                        <th rowSpan={2} className="border-r-[6px] border-b-[3px] border-[#111111] px-4 py-3 text-left font-black text-[#111111]">
                                            Sub Kegiatan
                                        </th>
                                        <th
                                            colSpan={3}
                                            className={`border-b-[3px] border-[#111111] bg-[#FFB703] px-4 py-3 text-center font-black uppercase tracking-[0.18em] text-[#111111] ${
                                                showAnggaranColumns ? 'border-r-[3px]' : 'border-r-[6px]'
                                            }`}
                                        >
                                            Estimasi Progress
                                        </th>
                                        {showAnggaranColumns ? (
                                            <th
                                                colSpan={4}
                                                className="border-r-[6px] border-b-[3px] border-[#111111] bg-[#C8E6C9] px-4 py-3 text-center font-black uppercase tracking-[0.18em] text-[#111111]"
                                            >
                                                Anggaran
                                            </th>
                                        ) : null}
                                        <th colSpan={4} className="border-r-[3px] border-b-[3px] border-[#111111] bg-[#8ECAE6] px-4 py-3 text-center font-black uppercase tracking-[0.18em] text-[#111111]">
                                            Realisasi Output
                                        </th>
                                        <th rowSpan={2} className="border-r-[3px] border-b-[3px] border-[#111111] bg-[#2ECC71]/60 px-3 py-3 text-center font-black uppercase tracking-[0.18em] text-[#111111]">
                                            PHO
                                        </th>
                                        <th rowSpan={2} className="border-b-[3px] border-[#111111] px-3 py-3 text-center font-black text-[#111111]">
                                            Update
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="border-r-[3px] border-b-[3px] border-[#111111] bg-[#FFB703] px-3 py-3 text-center font-black text-[#1A1A2E]">
                                            Rencana
                                        </th>
                                        <th className="border-r-[3px] border-b-[3px] border-[#111111] bg-[#FFB703] px-3 py-3 text-center font-black text-[#1A1A2E]">
                                            Realisasi
                                        </th>
                                        <th
                                            className={`border-b-[3px] border-[#111111] bg-[#FFB703] px-3 py-3 text-center font-black text-[#1A1A2E] ${
                                                showAnggaranColumns ? 'border-r-[3px]' : 'border-r-[6px]'
                                            }`}
                                        >
                                            Deviasi
                                        </th>
                                        {showAnggaranColumns ? (
                                            <>
                                                <th className="border-r-[3px] border-b-[3px] border-[#111111] bg-[#C8E6C9] px-3 py-3 text-center font-black text-[#1A1A2E]">
                                                    Pagu
                                                </th>
                                                <th className="border-r-[3px] border-b-[3px] border-[#111111] bg-[#C8E6C9] px-3 py-3 text-center font-black text-[#1A1A2E]">
                                                    Nilai Kontrak
                                                </th>
                                                <th className="border-r-[3px] border-b-[3px] border-[#111111] bg-[#C8E6C9] px-3 py-3 text-center font-black text-[#1A1A2E]">
                                                    Sisa Kontrak
                                                </th>
                                                <th className="border-r-[6px] border-b-[3px] border-[#111111] bg-[#C8E6C9] px-3 py-3 text-center font-black text-[#1A1A2E]">
                                                    Retensi 5%
                                                </th>
                                            </>
                                        ) : null}
                                        <th className="border-r-[3px] border-b-[3px] border-[#111111] bg-[#8ECAE6] px-4 py-3 text-left font-black text-[#1A1A2E]">
                                            Komponen
                                        </th>
                                        <th className="border-r-[3px] border-b-[3px] border-[#111111] bg-[#8ECAE6] px-3 py-3 text-center font-black text-[#1A1A2E]">
                                            Volume
                                        </th>
                                        <th className="border-r-[3px] border-b-[3px] border-[#111111] bg-[#8ECAE6] px-3 py-3 text-center font-black text-[#1A1A2E]">
                                            Satuan
                                        </th>
                                        <th className="border-r-[3px] border-b-[3px] border-[#111111] bg-[#8ECAE6] px-3 py-3 text-center font-black text-[#1A1A2E]">
                                            Realisasi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>{renderRows()}</tbody>
                            </table>
                        </div>
                    </div>

                    {!showAll && totalPages > 1 ? (
                        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((value) => Math.max(1, value - 1))}
                                disabled={page <= 1 || progressQuery.isFetching}
                                className="border-[3px] border-[#111111] bg-[#FFFFFF] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <div className="border-[3px] border-[#111111] bg-[#FFB703] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#111111]">
                                Hal {page} / {totalPages}
                            </div>
                            <button
                                type="button"
                                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                                disabled={page >= totalPages || progressQuery.isFetching}
                                className="border-[3px] border-[#111111] bg-[#FFFFFF] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    ) : null}
                </section>
            </div>
        </PuspenToolLayout>

        <ProgressFisikExportPeriodDialog
            open={exportDialogFormat !== null}
            format={exportDialogFormat}
            loading={exporting !== null}
            subKegiatanOptions={subKegiatanOptions}
            onOpenChange={(open) => {
                if (!open && exporting === null) {
                    setExportDialogFormat(null)
                }
            }}
            onConfirm={(options) => {
                void handleExportConfirm(options)
            }}
        />
        </>
    )
}
