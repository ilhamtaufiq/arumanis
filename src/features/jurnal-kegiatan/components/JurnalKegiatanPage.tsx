import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react'
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
    shiftMonth,
    sortJurnalNewestFirst,
} from '../lib/jurnal-helpers'
import type { JurnalEntry } from '../types'
import JurnalFormDialog from './JurnalFormDialog'
import JurnalList from './JurnalList'
import JurnalSummaryCards from './JurnalSummaryCards'

function currentPeriod() {
    const now = new Date()
    return { tahun: now.getFullYear(), bulan: now.getMonth() + 1 }
}

export default function JurnalKegiatanPage() {
    const [period, setPeriod] = useState(currentPeriod)
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<JurnalEntry | null>(null)
    const [deleting, setDeleting] = useState<JurnalEntry | null>(null)

    const { data, isLoading, isError, error, isFetching, refetch } = useJurnalList(period)
    const deleteMutation = useDeleteJurnal()

    const entries = useMemo(() => sortJurnalNewestFirst(data?.data ?? []), [data])

    const openCreate = () => {
        setEditing(null)
        setFormOpen(true)
    }

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

                        <Button onClick={openCreate} className="w-full sm:w-auto">
                            <Plus className="h-4 w-4" />
                            Tambah Kegiatan
                        </Button>
                    </div>

                    <JurnalSummaryCards ringkasan={data?.ringkasan} isLoading={isLoading} />

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
                            ) : (
                                <JurnalList
                                    entries={entries}
                                    isLoading={isLoading}
                                    onEdit={openEdit}
                                    onDelete={setDeleting}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Main>

            {formOpen && (
                <JurnalFormDialog
                    open={formOpen}
                    onOpenChange={setFormOpen}
                    entry={editing}
                />
            )}

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleting(null)
                }}
                title="Hapus kegiatan ini?"
                desc={
                    deleting
                        ? `Kegiatan tanggal ${formatTanggal(deleting.tanggal)} akan dihapus permanen.`
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
