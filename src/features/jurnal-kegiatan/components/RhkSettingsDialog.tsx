import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError } from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useJurnalRhk, useSaveJurnalRhk } from '../hooks/useJurnalKegiatan'
import {
    emptyRhkRow,
    firstErrorMessage,
    nextRhkNo,
    RHK_BULAN_SINGKAT,
    RHK_NAME_MAX,
    RHK_NO_MAX,
    rhkToRow,
    rowsToRhkItems,
    type RhkRowErrors,
    type RhkRowForm,
    validateRhkRows,
} from '../lib/rhk-helpers'

interface RhkSettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tahun: number
}

let rowSeq = 0
const newRowKey = () => `row-${++rowSeq}`

function FieldError({ message }: { message?: string }) {
    if (!message) return null
    return <p className="mt-1 text-xs font-medium text-destructive">{message}</p>
}

export default function RhkSettingsDialog({ open, onOpenChange, tahun }: RhkSettingsDialogProps) {
    const rhkQuery = useJurnalRhk(tahun, open)
    const saveMutation = useSaveJurnalRhk(tahun)
    const [rows, setRows] = useState<RhkRowForm[]>([])
    const [rowErrors, setRowErrors] = useState<Record<string, RhkRowErrors>>({})
    const [serverError, setServerError] = useState<string | null>(null)
    const initializedRef = useRef(false)

    // Isi baris dari server sekali per pembukaan. Setelah simpan, data yang di-refetch tidak menimpa edit.
    useEffect(() => {
        if (!open) {
            initializedRef.current = false
            return
        }
        if (rhkQuery.data && !initializedRef.current) {
            initializedRef.current = true
            setRows(rhkQuery.data.map((item) => rhkToRow(item, newRowKey())))
            setRowErrors({})
            setServerError(null)
        }
    }, [open, rhkQuery.data])

    const updateRow = (key: string, patch: Partial<RhkRowForm>) => {
        setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)))
    }

    const updateRencana = (key: string, index: number, value: string) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.key !== key) return row
                const rencana = [...row.rencana]
                rencana[index] = value
                return { ...row, rencana }
            }),
        )
    }

    const addRow = () => {
        setRows((prev) => [...prev, emptyRhkRow(nextRhkNo(prev), newRowKey())])
    }

    const removeRow = (key: string) => {
        setRows((prev) => prev.filter((row) => row.key !== key))
    }

    const handleSave = async () => {
        const errors = validateRhkRows(rows)
        setRowErrors(errors)
        setServerError(null)
        if (Object.keys(errors).length > 0) return

        try {
            await saveMutation.mutateAsync(rowsToRhkItems(rows))
            onOpenChange(false)
        } catch (error) {
            if (error instanceof ApiError && error.status === 422) {
                const data = error.data as { errors?: Record<string, string[] | string> } | undefined
                // Kontrak 422 untuk daftar memakai satu pesan di errors.items, jadi ditampilkan di atas baris.
                setServerError(
                    firstErrorMessage(data?.errors, 'items') ?? getApiErrorMessage(error, 'Data RHK tidak valid'),
                )
            }
        }
    }

    const busy = saveMutation.isPending
    const loading = rhkQuery.isLoading && !rhkQuery.data

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Pengaturan RHK {tahun}</DialogTitle>
                    <DialogDescription>
                        Daftar RHK dan rencana bulanan. Menyimpan mengganti seluruh daftar RHK untuk tahun ini.
                        Nomor RHK tetap; nomor yang dihapus tidak dipakai ulang.
                    </DialogDescription>
                </DialogHeader>

                {rhkQuery.isError && (
                    <div className="space-y-2 text-sm">
                        <p className="text-destructive">{getApiErrorMessage(rhkQuery.error, 'Gagal memuat RHK')}</p>
                        <Button variant="outline" size="sm" onClick={() => rhkQuery.refetch()}>
                            Coba lagi
                        </Button>
                    </div>
                )}

                {loading && (
                    <div className="space-y-3">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </div>
                )}

                {!loading && !rhkQuery.isError && (
                    <div className="space-y-4">
                        {serverError && (
                            <div role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                                {serverError}
                            </div>
                        )}

                        {rows.length === 0 && (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                Belum ada RHK untuk tahun {tahun}. Tambah RHK pertama di bawah.
                            </p>
                        )}

                        {rows.map((row) => {
                            const errors = rowErrors[row.key] ?? {}
                            return (
                                <div key={row.key} className="space-y-3 rounded-md border p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-semibold">RHK {row.no}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeRow(row.key)}
                                            disabled={busy}
                                            aria-label={`Hapus RHK ${row.no}`}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_8rem_8rem]">
                                        <div>
                                            <Label htmlFor={`rhk-${row.key}-nama`}>Nama RHK</Label>
                                            <Input
                                                id={`rhk-${row.key}-nama`}
                                                value={row.rhk}
                                                maxLength={RHK_NAME_MAX}
                                                onChange={(e) => updateRow(row.key, { rhk: e.target.value })}
                                                aria-invalid={!!errors.rhk}
                                            />
                                            <FieldError message={errors.rhk} />
                                        </div>
                                        <div>
                                            <Label htmlFor={`rhk-${row.key}-target`}>Target tahunan</Label>
                                            <Input
                                                id={`rhk-${row.key}-target`}
                                                type="number"
                                                inputMode="decimal"
                                                min={0}
                                                step="any"
                                                value={row.target}
                                                onChange={(e) => updateRow(row.key, { target: e.target.value })}
                                                aria-invalid={!!errors.target}
                                            />
                                            <FieldError message={errors.target} />
                                        </div>
                                        <div>
                                            <Label htmlFor={`rhk-${row.key}-satuan`}>Satuan</Label>
                                            <Input
                                                id={`rhk-${row.key}-satuan`}
                                                value={row.satuan}
                                                onChange={(e) => updateRow(row.key, { satuan: e.target.value })}
                                                aria-invalid={!!errors.satuan}
                                            />
                                            <FieldError message={errors.satuan} />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-1 text-sm font-medium">Rencana per bulan</p>
                                        <div className="overflow-x-auto pb-1">
                                            <div className="grid min-w-[36rem] grid-cols-12 gap-1">
                                                {RHK_BULAN_SINGKAT.map((label) => (
                                                    <span key={label} className="text-center text-xs text-muted-foreground">
                                                        {label}
                                                    </span>
                                                ))}
                                                {row.rencana.map((value, index) => (
                                                    <Input
                                                        key={RHK_BULAN_SINGKAT[index]}
                                                        type="number"
                                                        inputMode="decimal"
                                                        min={0}
                                                        step="any"
                                                        value={value}
                                                        onChange={(e) => updateRencana(row.key, index, e.target.value)}
                                                        aria-label={`Rencana ${RHK_BULAN_SINGKAT[index]} RHK ${row.no}`}
                                                        className="h-9 px-1 text-center"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <FieldError message={errors.rencana} />
                                    </div>

                                    <FieldError message={errors.no} />
                                </div>
                            )
                        })}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addRow}
                            disabled={busy || rows.length >= RHK_NO_MAX}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah RHK
                        </Button>
                    </div>
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                        Batal
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={busy || loading || rhkQuery.isError}>
                        {busy ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
