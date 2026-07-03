import { useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePickerField } from '@/components/shared/DatePickerField'
import { Loader2, Calendar, FileDown, FileSpreadsheet } from 'lucide-react'
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
import { defaultSignatureData, defaultDpaData } from '@/features/progress/types/signature'
import type { SignatureData, DpaData } from '@/features/progress/types/signature'
import type { BuatLaporanEditorSnapshot } from '@/features/buat-laporan/types'
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
    const [signatureData, setSignatureData] = useState<SignatureData>(defaultSignatureData)
    const [dpaData, setDpaData] = useState<DpaData>(defaultDpaData)
    const [viewMode, setViewMode] = useState<'all' | 'single'>('single')

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

    const handleGeneratePdf = () => {
        if (!report) return
        const exportWeekCount = getExportWeekCount()

        generatePdf({
            report: {
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
            },
            weekCount: exportWeekCount,
            weekNumbers: getExportWeekNumbers(),
            signatureData,
            dpaData,
        })
        setSignatureDialogOpen(false)
    }

    const handleExportExcel = () => {
        if (!report) return
        const exportWeekCount = getExportWeekCount()

        generateExcel({
            report: {
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
            },
            weekCount: exportWeekCount,
            dpaData,
        })
        toast.success('Excel berhasil diunduh')
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
                            Lengkapi data administrasi dan tanda tangan untuk dokumen PDF/Excel.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
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

                        <div className="space-y-4 p-4 rounded-xl border bg-purple-50/30 dark:bg-purple-950/10">
                            <h4 className="font-bold text-purple-700 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-purple-500" />
                                Data DPA (Daftar Pelaksanaan Anggaran)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nomorDpa">Nomor DPA</Label>
                                    <Input
                                        id="nomorDpa"
                                        placeholder="Contoh: 1.03.08.2.01.03.5.2"
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
                                    Pihak Mengetahui
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
                                    Pihak Diperiksa
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
                    </div>

                    <DialogFooter className="gap-3">
                        <Button variant="outline" onClick={handleExportExcel} className="rounded-full gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            Export Excel
                        </Button>
                        <Button
                            onClick={handleGeneratePdf}
                            className="rounded-full gap-2 bg-red-600 hover:bg-red-700 text-white"
                        >
                            <FileDown className="h-4 w-4" />
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