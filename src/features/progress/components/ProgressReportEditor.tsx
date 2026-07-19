import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePickerField } from '@/components/shared/DatePickerField'
import { Loader2, Calendar, FileDown, FileSpreadsheet, RefreshCw, AlertTriangle } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
    generateExcel,
    generatePdf,
} from '@/features/progress/utils'
import { ProgressChart } from '@/features/progress/components'
import type { SignatureData, DpaData } from '@/features/progress/types/signature'
import type { BuatLaporanEditorSnapshot } from '@/features/buat-laporan/types'
import { useAppSettings } from '@/features/settings/api'
import {
    buildExportAutofill,
    buildLaporanFileName,
    loadExportSettingsOverrides,
    saveExportSettingsOverrides,
} from '../lib/export-autofill'
import { useProgressReport } from '../hooks/useProgressReport'
import { useProgressCalculations } from '../hooks/useProgressCalculations'
import { useProgressItemActions } from '../hooks/useProgressItemActions'
import { useRabImport } from '../hooks/useRabImport'
import { useProgressAutoFill } from '../hooks/useProgressAutoFill'
import { ProgressImportRabDialog } from './ProgressImportRabDialog'
import { ProgressAutoFillDialog } from './ProgressAutoFillDialog'
import { ProgressEditorToolbar } from './ProgressEditorToolbar'
import { ProgressItemsTable } from './ProgressItemsTable'

export type ProgressReportEditorProps = {
    pekerjaanId: number
    onEditorSnapshotChange?: (snapshot: Partial<BuatLaporanEditorSnapshot>) => void
    onProgressReady?: () => void
    clearImportRabSearchOnLoad?: boolean
}

export default function ProgressReportEditor({
    pekerjaanId,
    onEditorSnapshotChange,
    onProgressReady,
    clearImportRabSearchOnLoad = false,
}: ProgressReportEditorProps) {
    const navigate = useNavigate()
    const search = useSearch({ strict: false }) as { importRab?: string | number }
    const [signatureDialogOpen, setSignatureDialogOpen] = useState(false)
    const [printMode, setPrintMode] = useState<'single' | 'all'>('single')
    const [signatureData, setSignatureData] = useState<SignatureData | null>(null)
    const [dpaData, setDpaData] = useState<DpaData | null>(null)
    const [autofillSources, setAutofillSources] = useState<Record<string, string>>({})
    const [viewMode, setViewMode] = useState<'all' | 'single'>('single')
    const [exporting, setExporting] = useState(false)

    const { data: appSettingsRes } = useAppSettings()

    const {
        report,
        isLoading: loading,
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
        submitting,
        handleSaveAll,
        queryClient,
    } = useProgressReport({ pekerjaanId })

    const applyAutofill = (opts?: { keepManualOverrides?: boolean }) => {
        const overrides = opts?.keepManualOverrides ? loadExportSettingsOverrides() : {}
        const filled = buildExportAutofill(report, appSettingsRes?.data, overrides)
        setSignatureData(filled.signatureData)
        setDpaData(filled.dpaData)
        setAutofillSources(filled.sources)
    }

    // Autofill saat dialog export dibuka / data report & settings siap
    useEffect(() => {
        if (!signatureDialogOpen || !report) return
        applyAutofill({ keepManualOverrides: true })
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only when opening or report identity changes
    }, [signatureDialogOpen, report, appSettingsRes?.data])

    const { calculatedData, groupedItems } = useProgressCalculations(editableItems, weekCount)

    const {
        handleUpdateItem,
        handleUpdateGroupName,
        handleUpdateWeekly,
        handleAddNewRow,
        handleRemoveRow,
        handleRemoveGroup,
    } = useProgressItemActions({
        editableItems,
        setEditableItems,
        setHasChanges,
    })

    const autoFill = useProgressAutoFill({
        editableItems,
        weekCount,
        setEditableItems,
        setHasChanges,
    })

    const rabImport = useRabImport({
        editableItems,
        onImport: (items) => {
            setEditableItems(items)
            setHasChanges(true)
        },
        onRequestAutoFill: () => {
            void autoFill.prepareAutoFill()
        },
    })

    useEffect(() => {
        if (String(search.importRab) !== '1') return
        const loaded = rabImport.loadDraft()
        if (loaded && clearImportRabSearchOnLoad) {
            void navigate({ to: '.', search: {}, replace: true })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when navigated with importRab=1
    }, [search.importRab, clearImportRabSearchOnLoad])

    useEffect(() => {
        onEditorSnapshotChange?.({
            weightedProgress: calculatedData.totals.totalWeightedProgress,
        })
    }, [calculatedData.totals.totalWeightedProgress, onEditorSnapshotChange])

    useEffect(() => {
        onEditorSnapshotChange?.({ hasChanges })
    }, [hasChanges, onEditorSnapshotChange])

    useEffect(() => {
        if (!loading && report) {
            onProgressReady?.()
        }
    }, [loading, report, onProgressReady])

    const getExportWeekCount = () => (printMode === 'single' ? selectedPrintWeek : weekCount)
    const getExportWeekNumbers = () =>
        printMode === 'all' ? Array.from({ length: weekCount }, (_, index) => index + 1) : undefined

    const weekLabel = useMemo(() => {
        if (printMode === 'all') return `M1-M${weekCount}`
        return `M${selectedPrintWeek}`
    }, [printMode, weekCount, selectedPrintWeek])

    const persistCurrentExportFields = () => {
        if (!signatureData || !dpaData) return
        // Simpan hanya field yang user mungkin edit manual (seluruh state saat ini)
        saveExportSettingsOverrides({
            signatureOverrides: signatureData,
            dpaOverrides: dpaData,
        })
    }

    const buildExportReportPayload = () => {
        if (!report) return null
        return {
            ...report,
            items: calculatedData.items,
            totals: {
                total_bobot: 100,
                total_accumulated_real: calculatedData.items.reduce(
                    (sum, item) => sum + item.totalReal,
                    0,
                ),
                total_weighted_progress: calculatedData.totals.totalWeightedProgress,
            },
        }
    }

    const ensureExportReady = (): boolean => {
        if (!report || !signatureData || !dpaData) {
            toast.error('Data laporan belum siap')
            return false
        }
        if (hasChanges) {
            const ok = window.confirm(
                'Ada perubahan yang belum disimpan. Export memakai data di layar saat ini. Lanjutkan?',
            )
            if (!ok) return false
        }
        return true
    }

    const handleGeneratePdf = () => {
        if (!ensureExportReady() || !signatureData || !dpaData) return
        const payload = buildExportReportPayload()
        if (!payload) return

        const exportWeekCount = getExportWeekCount()
        const fileName = buildLaporanFileName(report!.pekerjaan.nama, weekLabel, 'pdf')

        setExporting(true)
        try {
            persistCurrentExportFields()
            generatePdf({
                report: payload,
                weekCount: exportWeekCount,
                weekNumbers: getExportWeekNumbers(),
                signatureData,
                dpaData,
                fileName,
            })
            toast.success(`PDF diunduh: ${fileName}`)
            setSignatureDialogOpen(false)
        } catch (err) {
            console.error(err)
            toast.error('Gagal membuat PDF')
        } finally {
            setExporting(false)
        }
    }

    const handleExportExcel = () => {
        if (!ensureExportReady() || !signatureData || !dpaData) return
        const payload = buildExportReportPayload()
        if (!payload) return

        // Excel: matrix s/d minggu terpilih (single) atau semua minggu (all)
        const exportWeekCount = getExportWeekCount()
        const fileName = buildLaporanFileName(report!.pekerjaan.nama, weekLabel, 'xlsx')

        setExporting(true)
        try {
            persistCurrentExportFields()
            generateExcel({
                report: payload,
                weekCount: exportWeekCount,
                dpaData,
                fileName,
            })
            toast.success(`Excel diunduh: ${fileName}`)
        } catch (err) {
            console.error(err)
            toast.error('Gagal membuat Excel')
        } finally {
            setExporting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="border-none shadow-xl bg-linear-to-br from-card to-muted/30">
                <ProgressEditorToolbar
                    pekerjaanId={pekerjaanId}
                    weekCount={weekCount}
                    onWeekCountChange={setWeekCount}
                    onRefresh={() =>
                        queryClient.invalidateQueries({ queryKey: ['progress-report', pekerjaanId] })
                    }
                    onImportRab={() => rabImport.setOpen(true)}
                    onAutoFill={() => void autoFill.prepareAutoFill()}
                    onExport={() => {
                        setSelectedPrintWeek(focusWeek)
                        setSignatureDialogOpen(true)
                    }}
                    hasChanges={hasChanges}
                    submitting={submitting}
                    onSave={handleSaveAll}
                />

                <CardContent className="pt-6">
                    <ProgressItemsTable
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        weekCount={weekCount}
                        focusWeek={focusWeek}
                        setFocusWeek={setFocusWeek}
                        report={report}
                        groupedItems={groupedItems}
                        calculatedData={calculatedData}
                        onAddNewRow={handleAddNewRow}
                        onRemoveGroup={handleRemoveGroup}
                        onUpdateGroupName={handleUpdateGroupName}
                        onRemoveRow={handleRemoveRow}
                        onUpdateItem={handleUpdateItem}
                        onUpdateWeekly={handleUpdateWeekly}
                    />
                </CardContent>
            </Card>

            <ProgressChart report={report ?? null} weekCount={weekCount} />

            <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Pengaturan Export Laporan</DialogTitle>
                        <DialogDescription>
                            Data pejabat &amp; DPA diisi otomatis dari sub kegiatan, pengawas, penyedia, dan
                            pengaturan aplikasi. Anda bisa mengubah manual sebelum export.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {hasChanges && (
                            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>
                                    Ada perubahan progress yang belum disimpan. Export memakai data di
                                    layar saat ini.
                                </span>
                            </div>
                        )}

                        <div className="space-y-2 rounded-xl border bg-sky-50/50 p-4 text-sm dark:bg-sky-950/20">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h4 className="font-bold">Sumber autofill</h4>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1"
                                    onClick={() => {
                                        applyAutofill({ keepManualOverrides: false })
                                        toast.success('Autofill direset dari data master')
                                    }}
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Muat ulang autofill
                                </Button>
                            </div>
                            <ul className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                                <li>
                                    <strong className="text-foreground">DPA:</strong>{' '}
                                    {autofillSources.dpa || '—'}
                                </li>
                                <li>
                                    <strong className="text-foreground">Mengetahui (PPTK):</strong>{' '}
                                    {autofillSources.mengetahui || '—'}
                                </li>
                                <li>
                                    <strong className="text-foreground">Diperiksa (Pengawas):</strong>{' '}
                                    {autofillSources.diperiksa || '—'}
                                </li>
                                <li>
                                    <strong className="text-foreground">Penyedia:</strong>{' '}
                                    {autofillSources.penyedia || '—'}
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4 p-4 rounded-xl border bg-muted/30">
                            <h4 className="font-bold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                Opsi Cetak Laporan
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPrintMode('single')}
                                    className={`rounded-xl border p-4 text-left transition-all ${printMode === 'single' ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'bg-background hover:bg-muted/50'}`}
                                >
                                    <div className="font-semibold">Cetak minggu tertentu</div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Laporan dibuat untuk satu minggu yang dipilih.
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPrintMode('all')}
                                    className={`rounded-xl border p-4 text-left transition-all ${printMode === 'all' ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'bg-background hover:bg-muted/50'}`}
                                >
                                    <div className="font-semibold">Cetak semua minggu</div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Laporan dibuat lengkap dari minggu 1 sampai minggu {weekCount}.
                                    </p>
                                </button>
                            </div>

                            {printMode === 'single' ? (
                                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                    <Label htmlFor="selectedPrintWeek" className="min-w-32">
                                        Minggu ke
                                    </Label>
                                    <Input
                                        id="selectedPrintWeek"
                                        type="number"
                                        min={1}
                                        max={weekCount}
                                        value={selectedPrintWeek}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value, 10) || 1
                                            setSelectedPrintWeek(Math.min(Math.max(value, 1), weekCount))
                                        }}
                                        className="w-32 bg-background"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        Pilih 1 sampai {weekCount}.
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        {signatureData && dpaData ? (
                            <>
                        <div className="space-y-4 p-4 rounded-xl border bg-purple-50/30 dark:bg-purple-950/10">
                            <h4 className="font-bold text-purple-700 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-purple-500" />
                                Data DPA (dari Pengaturan)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nomorDpa">Nomor DPA</Label>
                                    <Input
                                        id="nomorDpa"
                                        placeholder="Dari pengaturan aplikasi"
                                        value={dpaData.nomorDpa}
                                        onChange={(e) =>
                                            setDpaData({ ...dpaData, nomorDpa: e.target.value })
                                        }
                                        className="bg-background"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tanggalDpa">Tanggal DPA</Label>
                                    <DatePickerField
                                        id="tanggalDpa"
                                        value={dpaData.tanggalDpa}
                                        onChange={(tanggalDpa) =>
                                            setDpaData({ ...dpaData, tanggalDpa })
                                        }
                                        className="bg-background"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4 p-4 rounded-xl border bg-blue-50/30 dark:bg-blue-950/10">
                                <h4 className="font-bold text-blue-700 flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    Pihak Mengetahui (PPTK)
                                </h4>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs uppercase font-bold text-muted-foreground">
                                            Nama Lengkap & Gelar
                                        </Label>
                                        <Input
                                            value={signatureData.namaMengetahui}
                                            onChange={(e) =>
                                                setSignatureData({
                                                    ...signatureData,
                                                    namaMengetahui: e.target.value,
                                                })
                                            }
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs uppercase font-bold text-muted-foreground">
                                            NIP
                                        </Label>
                                        <Input
                                            value={signatureData.nipMengetahui}
                                            onChange={(e) =>
                                                setSignatureData({
                                                    ...signatureData,
                                                    nipMengetahui: e.target.value,
                                                })
                                            }
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs uppercase font-bold text-muted-foreground">
                                            Jabatan
                                        </Label>
                                        <Input
                                            value={signatureData.jabatanMengetahui}
                                            onChange={(e) =>
                                                setSignatureData({
                                                    ...signatureData,
                                                    jabatanMengetahui: e.target.value,
                                                })
                                            }
                                            className="bg-background"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-4 rounded-xl border bg-green-50/30 dark:bg-green-950/10">
                                <h4 className="font-bold text-green-700 flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    Pihak Diperiksa (Pengawas)
                                </h4>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs uppercase font-bold text-muted-foreground">
                                            Nama Lengkap & Gelar
                                        </Label>
                                        <Input
                                            value={signatureData.namaDiperiksa}
                                            onChange={(e) =>
                                                setSignatureData({
                                                    ...signatureData,
                                                    namaDiperiksa: e.target.value,
                                                })
                                            }
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs uppercase font-bold text-muted-foreground">
                                            NIP
                                        </Label>
                                        <Input
                                            value={signatureData.nipDiperiksa}
                                            onChange={(e) =>
                                                setSignatureData({
                                                    ...signatureData,
                                                    nipDiperiksa: e.target.value,
                                                })
                                            }
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs uppercase font-bold text-muted-foreground">
                                            Jabatan
                                        </Label>
                                        <Input
                                            value={signatureData.jabatanDiperiksa}
                                            onChange={(e) =>
                                                setSignatureData({
                                                    ...signatureData,
                                                    jabatanDiperiksa: e.target.value,
                                                })
                                            }
                                            className="bg-background"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 rounded-xl border bg-red-50/30 dark:bg-red-950/10">
                            <h4 className="font-bold text-red-700 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                Pihak Penyedia / Kontraktor
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nama Perusahaan</Label>
                                    <Input
                                        value={signatureData.namaPerusahaan}
                                        onChange={(e) =>
                                            setSignatureData({
                                                ...signatureData,
                                                namaPerusahaan: e.target.value,
                                            })
                                        }
                                        className="bg-background"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nama Direktur</Label>
                                    <Input
                                        value={signatureData.namaDirektur}
                                        onChange={(e) =>
                                            setSignatureData({
                                                ...signatureData,
                                                namaDirektur: e.target.value,
                                            })
                                        }
                                        className="bg-background"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Lokasi Tanda Tangan</Label>
                                    <Input
                                        value={signatureData.lokasi}
                                        onChange={(e) =>
                                            setSignatureData({
                                                ...signatureData,
                                                lokasi: e.target.value,
                                            })
                                        }
                                        className="bg-background"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanggal Laporan</Label>
                                    <Input
                                        value={signatureData.tanggal}
                                        onChange={(e) =>
                                            setSignatureData({
                                                ...signatureData,
                                                tanggal: e.target.value,
                                            })
                                        }
                                        className="bg-background"
                                    />
                                </div>
                            </div>
                        </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Memuat autofill…
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-3">
                        <Button
                            variant="outline"
                            onClick={handleExportExcel}
                            disabled={exporting || !signatureData || !dpaData}
                            className="rounded-full gap-2"
                        >
                            {exporting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            )}
                            Export Excel
                        </Button>
                        <Button
                            onClick={handleGeneratePdf}
                            disabled={exporting || !signatureData || !dpaData}
                            className="rounded-full gap-2 bg-red-600 hover:bg-red-700 text-white"
                        >
                            {exporting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <FileDown className="h-4 w-4" />
                            )}
                            Export PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ProgressImportRabDialog rabImport={rabImport} />

            <ProgressAutoFillDialog
                open={autoFill.open}
                onOpenChange={autoFill.setOpen}
                previewGroups={autoFill.previewGroups}
                detectedProjectType={autoFill.detectedProjectType}
                weekCount={weekCount}
                applying={autoFill.applying}
                onApply={() => void autoFill.applyAutoFillPlan()}
            />
        </div>
    )
}