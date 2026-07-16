import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
    ArrowDown,
    ArrowUp,
    Loader2,
    Plus,
    Pencil,
    Trash2,
    Search,
    X,
    FlaskConical,
} from 'lucide-react'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api-client'
import {
    useCreateMasterFase,
    useDeleteMasterFase,
    useMasterFaseList,
    useReorderMasterFase,
    useUpdateMasterFase,
} from '../hooks'
import { JENIS_PROYEK_OPTIONS, type MasterFasePekerjaan } from '../types'
import {
    keywordsFromChipInput,
    parseKeywords,
    previewClassifyPhase,
} from '../lib/keywords'

function jenisLabel(value: string) {
    return (
        JENIS_PROYEK_OPTIONS.find((o) => o.value === value)?.label ??
        value.replace(/_/g, ' ')
    )
}

function apiErrorMessage(error: unknown, fallback: string) {
    if (error instanceof ApiError) {
        const data = error.data as { message?: string; errors?: Record<string, string[]> } | undefined
        if (data?.message) return data.message
        const first = data?.errors && Object.values(data.errors)[0]?.[0]
        if (first) return first
        return error.message || fallback
    }
    if (error instanceof Error) return error.message
    return fallback
}

export default function MasterFaseList() {
    const [filterJenis, setFilterJenis] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [showInactive, setShowInactive] = useState(true)

    const listJenis = filterJenis === 'all' ? undefined : filterJenis
    const { data: phases = [], isLoading, isError, error, refetch } = useMasterFaseList({
        jenisProyek: listJenis,
    })

    const createMutation = useCreateMasterFase()
    const updateMutation = useUpdateMasterFase()
    const deleteMutation = useDeleteMasterFase()
    const reorderMutation = useReorderMasterFase()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Partial<MasterFasePekerjaan> | null>(null)
    const [keywordChips, setKeywordChips] = useState<string[]>([])
    const [keywordDraft, setKeywordDraft] = useState('')
    const [previewSample, setPreviewSample] = useState('')

    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const filteredPhases = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        return phases
            .filter((p) => (showInactive ? true : p.is_active !== false))
            .filter((p) => {
                if (!q) return true
                const keys = parseKeywords(p.keywords).join(' ').toLowerCase()
                return (
                    p.nama_fase.toLowerCase().includes(q) ||
                    p.kode_fase.toLowerCase().includes(q) ||
                    keys.includes(q)
                )
            })
            .slice()
            .sort((a, b) => {
                if (a.jenis_proyek !== b.jenis_proyek) {
                    return a.jenis_proyek.localeCompare(b.jenis_proyek)
                }
                return a.prioritas - b.prioritas
            })
    }, [phases, searchQuery, showInactive])

    const previewHit = useMemo(() => {
        if (!previewSample.trim() || !editingItem) return null
        // Preview against all phases of same jenis + draft keywords for current
        const draftFase = {
            id: editingItem.id ?? -1,
            kode_fase: editingItem.kode_fase || 'draft',
            nama_fase: editingItem.nama_fase || 'Draft',
            prioritas: editingItem.prioritas ?? 99,
            is_active: editingItem.is_active !== false,
            keywords: keywordChips,
        }
        const others = phases
            .filter(
                (p) =>
                    p.jenis_proyek === (editingItem.jenis_proyek || 'sanitasi') &&
                    p.id !== editingItem.id,
            )
            .map((p) => ({
                id: p.id,
                kode_fase: p.kode_fase,
                nama_fase: p.nama_fase,
                prioritas: p.prioritas,
                is_active: p.is_active,
                keywords: p.keywords,
            }))
        return previewClassifyPhase(previewSample, [draftFase, ...others])
    }, [previewSample, editingItem, keywordChips, phases])

    const openDialog = (item?: MasterFasePekerjaan) => {
        if (item) {
            setEditingItem({ ...item })
            setKeywordChips(parseKeywords(item.keywords))
        } else {
            const maxPri = phases
                .filter((p) => p.jenis_proyek === (filterJenis === 'all' ? 'sanitasi' : filterJenis))
                .reduce((m, p) => Math.max(m, p.prioritas), -1)
            setEditingItem({
                jenis_proyek: filterJenis === 'all' ? 'sanitasi' : filterJenis,
                is_active: true,
                durasi_faktor: 1,
                overlap_persen: 0,
                prioritas: maxPri + 1,
                kode_fase: '',
                nama_fase: '',
                deskripsi: '',
            })
            setKeywordChips([])
        }
        setKeywordDraft('')
        setPreviewSample('')
        setIsDialogOpen(true)
    }

    const addKeywordChip = () => {
        const next = keywordsFromChipInput([...keywordChips, keywordDraft])
        setKeywordChips(next)
        setKeywordDraft('')
    }

    const removeKeywordChip = (kw: string) => {
        setKeywordChips((prev) => prev.filter((k) => k !== kw))
    }

    const handleSave = () => {
        if (!editingItem?.nama_fase?.trim() || !editingItem?.kode_fase?.trim()) {
            toast.error('Nama dan kode fase wajib diisi')
            return
        }

        const payload: Partial<MasterFasePekerjaan> = {
            ...editingItem,
            kode_fase: editingItem.kode_fase.trim(),
            nama_fase: editingItem.nama_fase.trim(),
            keywords: keywordChips,
            is_active: editingItem.is_active !== false,
            prioritas: Number(editingItem.prioritas) || 0,
            durasi_faktor: Number(editingItem.durasi_faktor) || 1,
            overlap_persen: Number(editingItem.overlap_persen) || 0,
        }

        if (editingItem.id) {
            updateMutation.mutate(
                { id: editingItem.id, data: payload },
                {
                    onSuccess: () => {
                        toast.success('Fase diperbarui')
                        setIsDialogOpen(false)
                    },
                    onError: (e) => toast.error(apiErrorMessage(e, 'Gagal memperbarui fase')),
                },
            )
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success('Fase ditambahkan')
                    setIsDialogOpen(false)
                },
                onError: (e) => toast.error(apiErrorMessage(e, 'Gagal menambah fase')),
            })
        }
    }

    const movePhase = (phase: MasterFasePekerjaan, direction: -1 | 1) => {
        const sameJenis = filteredPhases.filter((p) => p.jenis_proyek === phase.jenis_proyek)
        const idx = sameJenis.findIndex((p) => p.id === phase.id)
        const neighbor = sameJenis[idx + direction]
        if (!neighbor) return
        reorderMutation.mutate(
            {
                a: { id: phase.id, prioritas: phase.prioritas },
                b: { id: neighbor.id, prioritas: neighbor.prioritas },
            },
            {
                onSuccess: () => toast.success('Urutan diperbarui'),
                onError: (e) => toast.error(apiErrorMessage(e, 'Gagal mengubah urutan')),
            },
        )
    }

    const toggleActive = (phase: MasterFasePekerjaan, next: boolean) => {
        updateMutation.mutate(
            { id: phase.id, data: { is_active: next } },
            {
                onSuccess: () =>
                    toast.success(next ? 'Fase diaktifkan' : 'Fase dinonaktifkan'),
                onError: (e) => toast.error(apiErrorMessage(e, 'Gagal mengubah status')),
            },
        )
    }

    if (isLoading) {
        return (
            <PageContainer pageTitle="Master Fase Pekerjaan" pageDescription="Memuat data...">
                <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </PageContainer>
        )
    }

    if (isError) {
        return (
            <PageContainer pageTitle="Master Fase Pekerjaan">
                <Card>
                    <CardContent className="py-8 text-center space-y-3">
                        <p className="text-sm text-destructive">
                            {apiErrorMessage(error, 'Gagal memuat master fase')}
                        </p>
                        <Button variant="outline" onClick={() => void refetch()}>
                            Coba lagi
                        </Button>
                    </CardContent>
                </Card>
            </PageContainer>
        )
    }

    return (
        <PageContainer
            pageTitle="Master Fase Pekerjaan"
            pageDescription="Kelola fase konstruksi & keyword RAB untuk auto-fill jadwal. Nonaktifkan fase tanpa menghapus data."
            pageHeaderAction={
                <Button onClick={() => openDialog()} className="gap-2">
                    <Plus className="h-4 w-4" /> Tambah fase
                </Button>
            }
        >
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-4 sm:p-6 space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari kode, nama, atau keyword..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={filterJenis} onValueChange={setFilterJenis}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Jenis proyek" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua jenis</SelectItem>
                                    {JENIS_PROYEK_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <label className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                                <Checkbox
                                    checked={showInactive}
                                    onCheckedChange={(v) => setShowInactive(v === true)}
                                />
                                Tampilkan nonaktif
                            </label>
                        </div>

                        <div className="overflow-x-auto rounded-xl border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40">
                                        <TableHead className="w-20">Urutan</TableHead>
                                        <TableHead>Fase</TableHead>
                                        <TableHead>Jenis</TableHead>
                                        <TableHead className="text-center">Durasi / Overlap</TableHead>
                                        <TableHead>Keywords</TableHead>
                                        <TableHead className="text-center">Aktif</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPhases.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="py-12 text-center text-muted-foreground"
                                            >
                                                Belum ada fase. Tambah fase atau longgarkan filter.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPhases.map((phase) => {
                                            const sameJenis = filteredPhases.filter(
                                                (p) => p.jenis_proyek === phase.jenis_proyek,
                                            )
                                            const localIdx = sameJenis.findIndex((p) => p.id === phase.id)
                                            const keywords = parseKeywords(phase.keywords)
                                            return (
                                                <TableRow
                                                    key={phase.id}
                                                    className={cn(!phase.is_active && 'opacity-60')}
                                                >
                                                    <TableCell>
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <span className="text-xs font-bold tabular-nums">
                                                                {phase.prioritas}
                                                            </span>
                                                            <div className="flex gap-0.5">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    disabled={
                                                                        localIdx <= 0 ||
                                                                        reorderMutation.isPending
                                                                    }
                                                                    onClick={() => movePhase(phase, -1)}
                                                                    title="Naikkan prioritas"
                                                                >
                                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    disabled={
                                                                        localIdx >= sameJenis.length - 1 ||
                                                                        reorderMutation.isPending
                                                                    }
                                                                    onClick={() => movePhase(phase, 1)}
                                                                    title="Turunkan prioritas"
                                                                >
                                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{phase.nama_fase}</div>
                                                        <div className="font-mono text-xs text-muted-foreground">
                                                            {phase.kode_fase}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                phase.jenis_proyek === 'sanitasi'
                                                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                                                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                            }
                                                        >
                                                            {jenisLabel(phase.jenis_proyek)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm">
                                                        <div>{phase.durasi_faktor}×</div>
                                                        {phase.overlap_persen > 0 ? (
                                                            <Badge variant="secondary" className="mt-1 text-[10px]">
                                                                Overlap {phase.overlap_persen}%
                                                            </Badge>
                                                        ) : null}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex max-w-[220px] flex-wrap gap-1">
                                                            {keywords.slice(0, 4).map((k) => (
                                                                <Badge
                                                                    key={k}
                                                                    variant="secondary"
                                                                    className="text-[10px] font-normal"
                                                                >
                                                                    {k}
                                                                </Badge>
                                                            ))}
                                                            {keywords.length > 4 ? (
                                                                <Badge variant="outline" className="text-[10px]">
                                                                    +{keywords.length - 4}
                                                                </Badge>
                                                            ) : null}
                                                            {keywords.length === 0 ? (
                                                                <span className="text-xs text-muted-foreground">—</span>
                                                            ) : null}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Switch
                                                            checked={phase.is_active !== false}
                                                            onCheckedChange={(v) => toggleActive(phase, v)}
                                                            aria-label="Aktif"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => openDialog(phase)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setDeletingId(phase.id)
                                                                    setIsDeleteOpen(true)
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {filteredPhases.length} fase ditampilkan
                            {filterJenis !== 'all' ? ` · filter ${jenisLabel(filterJenis)}` : ''}
                            . Urutan ↑↓ menukar prioritas (dipakai auto-fill jadwal).
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem?.id ? 'Edit fase' : 'Tambah fase'}
                        </DialogTitle>
                        <DialogDescription>
                            Keyword dipakai untuk mengklasifikasi baris RAB ke fase ini. Keyword lebih
                            panjang menang saat bentrok.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Kode fase</Label>
                            <Input
                                value={editingItem?.kode_fase || ''}
                                onChange={(e) =>
                                    setEditingItem({ ...editingItem, kode_fase: e.target.value })
                                }
                                placeholder="persiapan"
                                className="font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nama fase</Label>
                            <Input
                                value={editingItem?.nama_fase || ''}
                                onChange={(e) =>
                                    setEditingItem({ ...editingItem, nama_fase: e.target.value })
                                }
                                placeholder="Pekerjaan Persiapan"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Jenis proyek</Label>
                            <Select
                                value={editingItem?.jenis_proyek || 'sanitasi'}
                                onValueChange={(val) =>
                                    setEditingItem({ ...editingItem, jenis_proyek: val })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {JENIS_PROYEK_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end gap-3 pb-1">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={editingItem?.is_active !== false}
                                    onCheckedChange={(v) =>
                                        setEditingItem({ ...editingItem, is_active: v })
                                    }
                                    id="fase-active"
                                />
                                <Label htmlFor="fase-active">Aktif (ikut auto-fill)</Label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Prioritas (urutan)</Label>
                            <Input
                                type="number"
                                value={editingItem?.prioritas ?? 0}
                                onChange={(e) =>
                                    setEditingItem({
                                        ...editingItem,
                                        prioritas: parseInt(e.target.value, 10) || 0,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Faktor durasi</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={editingItem?.durasi_faktor ?? 1}
                                onChange={(e) =>
                                    setEditingItem({
                                        ...editingItem,
                                        durasi_faktor: parseFloat(e.target.value) || 1,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Overlap (%)</Label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                value={editingItem?.overlap_persen ?? 0}
                                onChange={(e) =>
                                    setEditingItem({
                                        ...editingItem,
                                        overlap_persen: parseInt(e.target.value, 10) || 0,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label>Keywords</Label>
                            <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                                {keywordChips.map((k) => (
                                    <Badge key={k} variant="secondary" className="gap-1 pr-1">
                                        {k}
                                        <button
                                            type="button"
                                            className="rounded-full p-0.5 hover:bg-muted"
                                            onClick={() => removeKeywordChip(k)}
                                            aria-label={`Hapus ${k}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={keywordDraft}
                                    onChange={(e) => setKeywordDraft(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ',') {
                                            e.preventDefault()
                                            addKeywordChip()
                                        }
                                    }}
                                    placeholder="Tambah keyword, Enter"
                                />
                                <Button type="button" variant="outline" onClick={addKeywordChip}>
                                    Tambah
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label>Deskripsi</Label>
                            <Input
                                value={editingItem?.deskripsi || ''}
                                onChange={(e) =>
                                    setEditingItem({ ...editingItem, deskripsi: e.target.value })
                                }
                                placeholder="Opsional"
                            />
                        </div>

                        <div className="space-y-2 rounded-lg border bg-muted/30 p-3 sm:col-span-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <FlaskConical className="h-4 w-4" />
                                Uji cocok RAB
                            </div>
                            <Input
                                value={previewSample}
                                onChange={(e) => setPreviewSample(e.target.value)}
                                placeholder='Contoh: "Pekerjaan pipa PVC transmisi DN 100"'
                            />
                            {previewSample.trim() ? (
                                previewHit ? (
                                    <p className="text-xs">
                                        Match:{' '}
                                        <strong>
                                            {previewHit.nama_fase} ({previewHit.kode_fase})
                                        </strong>{' '}
                                        via keyword “{previewHit.bestKeyword}”
                                        {previewHit.faseId === (editingItem?.id ?? -1) ||
                                        (previewHit.faseId === -1 && !editingItem?.id)
                                            ? ' — fase ini'
                                            : ' — fase lain menang'}
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Tidak ada keyword yang cocok.
                                    </p>
                                )
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Ketik contoh uraian RAB untuk melihat fase mana yang menang.
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {(createMutation.isPending || updateMutation.isPending) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus fase?</DialogTitle>
                        <DialogDescription>
                            Lebih aman nonaktifkan fase jika sudah dipakai. Hapus permanen tidak bisa
                            dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                                if (!deletingId) return
                                deleteMutation.mutate(deletingId, {
                                    onSuccess: () => {
                                        toast.success('Fase dihapus')
                                        setIsDeleteOpen(false)
                                    },
                                    onError: (e) =>
                                        toast.error(apiErrorMessage(e, 'Gagal menghapus fase')),
                                })
                            }}
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageContainer>
    )
}
