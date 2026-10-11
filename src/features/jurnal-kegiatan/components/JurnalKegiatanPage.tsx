import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, FileDown, List, Plus, RefreshCw, Settings2, UserCheck } from 'lucide-react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useDeleteJurnal, useJurnalList } from '../hooks/useJurnalKegiatan'
import {
    formatTanggal,
    MONTH_NAMES_ID,
    periodKey,
    shiftMonth,
    sortJurnalNewestFirst,
} from '../lib/jurnal-helpers'
import { type JurnalView } from '../lib/calendar-helpers'
import type { JurnalEntry } from '../types'
import JurnalFormDialog from './JurnalFormDialog'
import JurnalCalendar, { JurnalDayHeader } from './JurnalCalendar'
import JurnalList from './JurnalList'
import JurnalSummaryCards from './JurnalSummaryCards'
import ExportPptxDialog from './ExportPptxDialog'
import FotoPreviewDialog, { type FotoPreviewState } from './FotoPreviewDialog'
import JurnalBuktiSection from './JurnalBuktiSection'
import PejabatPenilaiDialog from './PejabatPenilaiDialog'
import RhkSettingsDialog from './RhkSettingsDialog'

const VIEW_STORAGE_KEY = 'jurnal-kegiatan:view'

/** Pilihan tampilan terakhir. Gagal membaca storage (mode privat, diblokir) berarti default Daftar. */
function readViewPref(): JurnalView {
    try {
        return window.localStorage.getItem(VIEW_STORAGE_KEY) === 'calendar' ? 'calendar' : 'list'
    } catch {
        return 'list'
    }
}

function writeViewPref(view: JurnalView) {
    try {
        window.localStorage.setItem(VIEW_STORAGE_KEY, view)
    } catch {
        // Penyimpanan tidak tersedia; pilihan hanya berlaku untuk sesi ini.
    }
}

function currentPeriod() {
    const now = new Date()
    return { tahun: now.getFullYear(), bulan: now.getMonth() + 1 }
}

export default function JurnalKegiatanPage() {
    const [period, setPeriod] = useState(currentPeriod)
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<JurnalEntry | null>(null)
    const [deleting, setDeleting] = useState<JurnalEntry | null>(null)
    const [rhkOpen, setRhkOpen] = useState(false)
    const [exportOpen, setExportOpen] = useState(false)
    const [atasanOpen, setAtasanOpen] = useState(false)
    const [preview, setPreview] = useState<FotoPreviewState | null>(null)
    const [view, setView] = useState<JurnalView>(readViewPref)
    const [selectedIso, setSelectedIso] = useState<string | null>(null)
    const [formDefaultTanggal, setFormDefaultTanggal] = useState<string | null>(null)

    const { data, isLoading, isError, error, isFetching, refetch } = useJurnalList(period)
    const deleteMutation = useDeleteJurnal()

    const entries = useMemo(() => sortJurnalNewestFirst(data?.data ?? []), [data])

    const openCreate = (tanggal?: string) => {
        setEditing(null)
        setFormDefaultTanggal(tanggal ?? null)
        setFormOpen(true)
    }

    const changeView = (next: JurnalView) => {
        setView(next)
        writeViewPref(next)
    }

    // Panel tanggal hanya tampil bila tanggal terpilih masih berada di bulan yang sedang dilihat.
    const panelIso = selectedIso && selectedIso.startsWith(periodKey(period.tahun, period.bulan)) ? selectedIso : null
    const dayEntries = panelIso
        ? entries.filter((entry) => entry.tanggal === panelIso).sort((a, b) => a.id - b.id)
        : []

    const openEdit = (entry: JurnalEntry) => {
        setEditing(entry)
        setFormOpen(true)
    }

    const handleDelete = () => {
        if (!deleting) return
        deleteMutation.mutate(deleting.id, {
            onSuccess: () => setDeleting(null),
        })
    }

    const changeMonth = (delta: number) => {
        setPeriod((prev) => shiftMonth(prev.tahun, prev.bulan, delta))
    }

    return (
        <>
            <Header>
                <div className="flex w-full items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Jurnal Kegiatan</h1>
                        <p className="text-muted-foreground">Catatan kegiatan harian untuk SKP</p>
                    </div>
                </div>
            </Header>

            <Main>
                <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => changeMonth(-1)}
                                aria-label="Bulan sebelumnya"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Select
                                value={String(period.bulan)}
                                onValueChange={(value) => setPeriod((prev) => ({ ...prev, bulan: Number(value) }))}
                            >
                                <SelectTrigger className="w-40" aria-label="Pilih bulan">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTH_NAMES_ID.map((name, index) => (
                                        <SelectItem key={name} value={String(index + 1)}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="w-14 text-center text-sm font-medium tabular-nums">{period.tahun}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => changeMonth(1)}
                                aria-label="Bulan berikutnya"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                            <Button variant="outline" onClick={() => setRhkOpen(true)}>
                                <Settings2 className="h-4 w-4" />
                                Atur RHK
                            </Button>
                            <Button variant="outline" onClick={() => setExportOpen(true)}>
                                <FileDown className="h-4 w-4" />
                                Export PPTX
                            </Button>
                            <Button variant="outline" onClick={() => setAtasanOpen(true)} className="col-span-2 sm:col-span-1">
                                <UserCheck className="h-4 w-4" />
                                Pejabat Penilai
                            </Button>
                            <Button onClick={() => openCreate()} className="col-span-2 sm:col-span-1">
                                <Plus className="h-4 w-4" />
                                Tambah Kegiatan
                            </Button>
                        </div>
                    </div>

                    <JurnalSummaryCards ringkasan={data?.ringkasan} isLoading={isLoading} />

                    <div className="flex justify-end">
                        <div role="group" aria-label="Tampilan kegiatan" className="inline-flex gap-1">
                            <Button
                                size="sm"
                                variant={view === 'list' ? 'default' : 'outline'}
                                aria-pressed={view === 'list'}
                                onClick={() => changeView('list')}
                            >
                                <List className="h-4 w-4" />
                                Daftar
                            </Button>
                            <Button
                                size="sm"
                                variant={view === 'calendar' ? 'default' : 'outline'}
                                aria-pressed={view === 'calendar'}
                                onClick={() => changeView('calendar')}
                            >
                                <CalendarDays className="h-4 w-4" />
                                Kalender
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <CardTitle>
                                        Kegiatan {MONTH_NAMES_ID[period.bulan - 1]} {period.tahun}
                                    </CardTitle>
                                    <CardDescription>Urutan terbaru di atas</CardDescription>
                                </div>
                                {isFetching && !isLoading && (
                                    <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isError ? (
                                <div className="flex flex-col items-center gap-3 py-8 text-center">
                                    <p className="text-sm text-destructive">
                                        {getApiErrorMessage(error, 'Gagal memuat jurnal kegiatan')}
                                    </p>
                                    <Button variant="outline" onClick={() => refetch()}>
                                        Coba lagi
                                    </Button>
                                </div>
                            ) : view === 'calendar' ? (
                                <div className="space-y-4">
                                    <JurnalCalendar
                                        tahun={period.tahun}
                                        bulan={period.bulan}
                                        entries={entries}
                                        selectedIso={panelIso}
                                        onSelectDate={(iso) => {
                                            setSelectedIso(iso)
                                            openCreate(iso)
                                        }}
                                    />
                                    {panelIso ? (
                                        <div className="space-y-3 border-t pt-4">
                                            <JurnalDayHeader iso={panelIso} entries={dayEntries} onAdd={(iso) => openCreate(iso)} />
                                            {dayEntries.length > 0 ? (
                                                <JurnalList
                                                    entries={dayEntries}
                                                    isLoading={false}
                                                    onEdit={openEdit}
                                                    onDelete={setDeleting}
                                                    onPreview={(photos, index) => setPreview({ photos, index })}
                                                />
                                            ) : (
                                                <p className="py-4 text-center text-sm text-muted-foreground">
                                                    Belum ada kegiatan pada tanggal ini.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-center text-sm text-muted-foreground">
                                            Pilih tanggal di kalender untuk melihat kegiatan pada tanggal itu.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <JurnalList
                                    entries={entries}
                                    isLoading={isLoading}
                                    onEdit={openEdit}
                                    onDelete={setDeleting}
                                    onPreview={(photos, index) => setPreview({ photos, index })}
                                />
                            )}
                        </CardContent>
                    </Card>

                    <JurnalBuktiSection
                        tahun={period.tahun}
                        bulan={period.bulan}
                        onOpenRhkSettings={() => setRhkOpen(true)}
                    />
                </div>
            </Main>

            {formOpen && (
                <JurnalFormDialog
                    open={formOpen}
                    onOpenChange={setFormOpen}
                    entry={editing}
                    defaultTanggal={formDefaultTanggal ?? undefined}
                    onOpenRhkSettings={() => setRhkOpen(true)}
                />
            )}

            {atasanOpen && <PejabatPenilaiDialog open={atasanOpen} onOpenChange={setAtasanOpen} />}

            {rhkOpen && (
                <RhkSettingsDialog open={rhkOpen} onOpenChange={setRhkOpen} tahun={period.tahun} />
            )}

            {exportOpen && (
                <ExportPptxDialog
                    open={exportOpen}
                    onOpenChange={setExportOpen}
                    tahun={period.tahun}
                    bulan={period.bulan}
                    onOpenRhkSettings={() => {
                        setExportOpen(false)
                        setRhkOpen(true)
                    }}
                />
            )}

            <FotoPreviewDialog
                preview={preview}
                onChange={setPreview}
                onClose={() => setPreview(null)}
            />

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleting(null)
                }}
                title="Hapus kegiatan ini?"
                desc={
                    deleting
                        ? `Kegiatan tanggal ${formatTanggal(deleting.tanggal)} dan ${deleting.foto?.length ?? 0} foto kegiatan akan dihapus permanen.`
                        : ''
                }
                confirmText="Hapus"
                destructive
                isLoading={deleteMutation.isPending}
                handleConfirm={handleDelete}
            />
        </>
    )
}
