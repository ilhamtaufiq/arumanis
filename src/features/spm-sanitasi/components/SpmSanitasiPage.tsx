import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import {
    Building2,
    Download,
    Droplets,
    Edit,
    Factory,
    Home,
    Link2,
    Loader2,
    MapPinned,
    Plus,
    Search,
    Trash2,
    TrendingUp,
    Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { getKecamatan } from '@/features/kecamatan/api/kecamatan'
import { getDesaByKecamatan } from '@/features/desa/api/desa'
import {
    createSpmSanitasi,
    deleteSpmSanitasi,
    exportSpmSanitasi,
    getSpmSanitasiIntegrationByDesa,
    getSpmSanitasiList,
    getSpmSanitasiStats,
    updateSpmSanitasi,
} from '../api'
import { invalidateSpmIntegrationQueries } from '../hooks/useSpmIntegration'
import {
    findPekerjaanForJenis,
    getApiErrorMessage,
    getDesaLabel,
    inferJenisFromIntegrationRow,
} from '../lib/integration-helpers'
import { autoCreateInfrastrukturFromDesa } from '../lib/auto-create-infrastruktur'
import { ImportSpmSanitasiDialog } from './ImportSpmSanitasiDialog'
import { SpmSanitasiCapaianPanel } from './SpmSanitasiCapaianPanel'
import { SpmSanitasiIntegrationTable } from './SpmSanitasiIntegrationTable'
import { SpmSanitasiTagPekerjaanDialog } from './SpmSanitasiTagPekerjaanDialog'
import { SpmDesaDetailPanel } from './SpmDesaDetailPanel'
import { INFRA_JENIS_ORDER, JENIS_LABEL, isIntegrableJenis } from '../lib/jenis-labels'
import { INTEGRASI_OUTPUT_SUMMARY, type SpmSanitasiOutputType } from '../lib/output-labels'
import { SPM_SEARCH_DEBOUNCE_MS } from '../lib/search'
import type {
    SpmDesaIntegration,
    SpmPaketPekerjaan,
    SpmSanitasi,
    SpmSanitasiFormData,
    SpmSanitasiJenis,
    SpmSanitasiSyncStatus,
} from '../types'

const emptyForm = (jenis: SpmSanitasiJenis): SpmSanitasiFormData => ({
    jenis,
    desa_id: null,
    nama_infrastruktur: '',
    skala_pelayanan: 'Permukiman',
    status_keberfungsian: 'Berfungsi',
    kualitas_keberfungsian: 'Baik',
})

function formatNumber(value?: number | null) {
    if (value == null) return '-'
    return new Intl.NumberFormat('id-ID').format(value)
}

function formatCurrency(value?: number | null) {
    if (value == null) return '-'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

export type SpmSanitasiPageSearch = {
    desa_id?: number
    tahun?: string
    jenis?: SpmSanitasiJenis
    tab?: 'data' | 'integration'
    q?: string
}

export default function SpmSanitasiPage({
    initialSearch,
}: {
    initialSearch?: SpmSanitasiPageSearch
} = {}) {
    const queryClient = useQueryClient()
    const bootDesa = initialSearch?.desa_id
    const bootJenis = initialSearch?.jenis ?? 'spaldt'
    const bootTab = initialSearch?.tab ?? 'data'
    const bootQ = initialSearch?.q ?? ''

    const [pageTab, setPageTab] = useState<'data' | 'integration'>(bootTab)
    const [activeJenis, setActiveJenis] = useState<SpmSanitasiJenis>(bootJenis)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState(bootQ)
    const debouncedSearch = useDebounce(search, SPM_SEARCH_DEBOUNCE_MS)
    const [selectedKec, setSelectedKec] = useState<number | ''>('')
    const [selectedDesa, setSelectedDesa] = useState<number | ''>(bootDesa ?? '')
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<SpmSanitasi | null>(null)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [formData, setFormData] = useState<SpmSanitasiFormData>(emptyForm(bootJenis))
    const [exporting, setExporting] = useState(false)
    const [integrationPage, setIntegrationPage] = useState(1)
    const [integrationSearch, setIntegrationSearch] = useState(bootQ)
    const debouncedIntegrationSearch = useDebounce(integrationSearch, SPM_SEARCH_DEBOUNCE_MS)
    const [integrationKec, setIntegrationKec] = useState<number | ''>('')
    const [integrationDesa, setIntegrationDesa] = useState<number | ''>(bootDesa ?? '')
    const [integrationTahun, setIntegrationTahun] = useState('')
    const [integrationStatus, setIntegrationStatus] = useState<SpmSanitasiSyncStatus | ''>('')
    const [integrationOutputType, setIntegrationOutputType] = useState<SpmSanitasiOutputType | ''>('')
    const [selectedIntegrationRow, setSelectedIntegrationRow] = useState<SpmDesaIntegration | null>(null)
    const [detailPanelOpen, setDetailPanelOpen] = useState(false)
    const [tagSpmItem, setTagSpmItem] = useState<SpmSanitasi | null>(null)
    const [tagDialogOpen, setTagDialogOpen] = useState(false)
    const [formKec, setFormKec] = useState<number | ''>('')
    const [integrationInitialAction, setIntegrationInitialAction] = useState<
        'add-infrastruktur' | null
    >(null)

    const { data: kecamatans } = useQuery({
        queryKey: ['kecamatans-list'],
        queryFn: getKecamatan,
    })

    const { data: desas } = useQuery({
        queryKey: ['desas-by-kec', selectedKec],
        queryFn: () => getDesaByKecamatan(selectedKec as number),
        enabled: !!selectedKec,
    })

    const { data: formDesas } = useQuery({
        queryKey: ['desas-by-kec-form', formKec],
        queryFn: () => getDesaByKecamatan(formKec as number),
        enabled: !!formKec && formOpen,
    })

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch, activeJenis, selectedKec, selectedDesa])

    useEffect(() => {
        setIntegrationPage(1)
    }, [debouncedIntegrationSearch])

    const { data: statsData } = useQuery({
        queryKey: ['spm-sanitasi-stats', selectedKec],
        queryFn: () =>
            getSpmSanitasiStats({
                kecamatan_id: selectedKec || undefined,
            }),
        staleTime: 60_000,
    })

    const { data: listData, isLoading, isFetching: isListFetching } = useQuery({
        queryKey: [
            'spm-sanitasi',
            activeJenis,
            page,
            debouncedSearch,
            selectedKec,
            selectedDesa,
        ],
        queryFn: () =>
            getSpmSanitasiList({
                jenis: activeJenis,
                page,
                per_page: 10,
                search: debouncedSearch.trim() || undefined,
                kecamatan_id: selectedKec || undefined,
                desa_id: selectedDesa || undefined,
            }),
        staleTime: 30_000,
        placeholderData: (previousData) => previousData,
    })

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (editing) {
                return updateSpmSanitasi(editing.id, formData)
            }
            return createSpmSanitasi(formData)
        },
        onSuccess: (res) => {
            toast.success(res.message)
            setFormOpen(false)
            setEditing(null)
            invalidateSpmIntegrationQueries(queryClient)
        },
        onError: (error) =>
            toast.error(getApiErrorMessage(error, 'Gagal menyimpan data')),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteSpmSanitasi(id),
        onSuccess: (res) => {
            toast.success(res.message)
            setDeleteId(null)
            invalidateSpmIntegrationQueries(queryClient)
        },
        onError: (error) =>
            toast.error(getApiErrorMessage(error, 'Gagal menghapus data')),
    })

    const stats = statsData?.data
    const items = listData?.data ?? []
    const meta = listData?.meta

    const statCards = useMemo(
        () => [
            { label: 'Capaian SPM', value: `${(stats?.coverage_percentage ?? 0).toLocaleString('id-ID')}%`, icon: TrendingUp },
            { label: 'SPALDT', value: stats?.spaldt_count ?? 0, icon: Droplets },
            { label: 'SPALDS', value: stats?.spalds_count ?? 0, icon: Building2 },
            { label: 'IPLT', value: stats?.iplt_count ?? 0, icon: Factory },
            { label: 'MCK Individu', value: stats?.mck_individu_count ?? 0, icon: Home },
            { label: 'MCK Komunal', value: stats?.mck_komunal_count ?? 0, icon: Users },
            { label: 'Pemanfaat (Jiwa)', value: formatNumber(stats?.total_pemanfaat_jiwa), icon: Building2 },
            { label: 'Total Investasi', value: formatCurrency(stats?.total_investasi), icon: Building2 },
        ],
        [stats]
    )

    const openTagDialog = (item: SpmSanitasi) => {
        setTagSpmItem(item)
        setTagDialogOpen(true)
    }

    const handleIntegrationRowSelect = (row: SpmDesaIntegration) => {
        setSelectedIntegrationRow(row)
        setDetailPanelOpen(true)
    }

    const openCreate = (jenis: SpmSanitasiJenis = activeJenis) => {
        setEditing(null)
        setActiveJenis(jenis)
        setFormKec(selectedKec || '')
        setFormData({
            ...emptyForm(jenis),
            desa_id: selectedDesa || null,
        })
        setFormOpen(true)
    }

    const openCreateForDesa = async (
        desaId: number,
        kecamatanId: number,
        jenis: SpmSanitasiJenis,
        fromPekerjaan?: SpmPaketPekerjaan
    ) => {
        const pembiayaan =
            fromPekerjaan?.derived.pembiayaan_suggested ??
            fromPekerjaan?.derived.nilai_kontrak ??
            null
        const tahun =
            fromPekerjaan?.derived.tahun_konstruksi_suggested ??
            (fromPekerjaan?.tahun_anggaran ? Number(fromPekerjaan.tahun_anggaran) : null)

        await queryClient.ensureQueryData({
            queryKey: ['desas-by-kec-form', kecamatanId],
            queryFn: () => getDesaByKecamatan(kecamatanId),
        })

        setPageTab('data')
        setDetailPanelOpen(false)
        setSelectedKec(kecamatanId)
        setSelectedDesa(desaId)
        setFormKec(kecamatanId)
        setActiveJenis(jenis)
        setEditing(null)
        setFormData({
            ...emptyForm(jenis),
            desa_id: desaId,
            nama_infrastruktur: fromPekerjaan?.nama_paket ?? '',
            tahun_konstruksi: tahun,
            pembiayaan_total: pembiayaan,
            jumlah_pemanfaat_kk: fromPekerjaan?.derived.kk ?? null,
        })
        setFormOpen(true)
    }

    const openEdit = (item: SpmSanitasi) => {
        setEditing(item)
        setFormKec(item.desa?.kecamatan?.id ?? '')
        setFormData({
            jenis: item.jenis,
            desa_id: item.desa_id ?? null,
            skala_pelayanan: item.skala_pelayanan ?? '',
            nama_infrastruktur: item.nama_infrastruktur,
            latitude: item.latitude,
            longitude: item.longitude,
            alamat_lengkap: item.alamat_lengkap,
            jumlah_pemanfaat_kk: item.jumlah_pemanfaat_kk,
            jumlah_pemanfaat_jiwa: item.jumlah_pemanfaat_jiwa,
            tahun_konstruksi: item.tahun_konstruksi,
            pembiayaan_apbn: item.pembiayaan_apbn,
            pembiayaan_apbd: item.pembiayaan_apbd,
            pembiayaan_dak: item.pembiayaan_dak,
            pembiayaan_hibah: item.pembiayaan_hibah,
            pembiayaan_csr: item.pembiayaan_csr,
            pembiayaan_lain: item.pembiayaan_lain,
            pembiayaan_total: item.pembiayaan_total,
            status_keberfungsian: item.status_keberfungsian,
            kualitas_keberfungsian: item.kualitas_keberfungsian,
            pengelola: item.pengelola,
            kapasitas_desain: item.kapasitas_desain,
            kapasitas_terpakai: item.kapasitas_terpakai,
            kapasitas_tidak_terpakai: item.kapasitas_tidak_terpakai,
            jenis_pengolahan: item.jenis_pengolahan,
            peta_cakupan: item.peta_cakupan,
            status_lahan: item.status_lahan,
            luas_lahan_ha: item.luas_lahan_ha,
            opsi_teknologi: item.opsi_teknologi,
            jumlah_stasiun_pompa: item.jumlah_stasiun_pompa,
            biaya_operasional: item.biaya_operasional,
            jenis_pengelola: item.jenis_pengelola,
            sistem_pengolahan: item.sistem_pengolahan,
            truk_tinja_unit: item.truk_tinja_unit,
            kapasitas_truk_m3: item.kapasitas_truk_m3,
            jumlah_ritasi: item.jumlah_ritasi,
            jarak_maksimal_pelayanan_km: item.jarak_maksimal_pelayanan_km,
            alokasi_biaya_operasional: item.alokasi_biaya_operasional,
        })
        setFormOpen(true)
    }

    const handleExport = async () => {
        try {
            setExporting(true)
            await exportSpmSanitasi({
                kecamatan_id: selectedKec || undefined,
                desa_id: selectedDesa || undefined,
                search: debouncedSearch.trim() || undefined,
            })
            toast.success('Data berhasil diekspor')
        } catch {
            toast.error('Gagal mengekspor data')
        } finally {
            setExporting(false)
        }
    }

    const refresh = () => {
        invalidateSpmIntegrationQueries(queryClient)
    }

    const autoCreateMutation = useMutation({
        mutationFn: async (row: SpmDesaIntegration) => {
            // Ambil detail terbaru (pekerjaan + output lengkap) sebelum auto-create
            const detailRes = await getSpmSanitasiIntegrationByDesa(row.desa.id, {
                tahun: integrationTahun || undefined,
                output_type: integrationOutputType || undefined,
            })
            const detail = detailRes.data ?? row
            return autoCreateInfrastrukturFromDesa(detail)
        },
        onSuccess: (result) => {
            if (result.created === 0 && result.errors.length > 0) {
                toast.error(result.errors[0] || 'Gagal membuat infrastruktur otomatis')
                return
            }
            const jenisLabel = result.jenisCreated.map((j) => JENIS_LABEL[j]).join(', ')
            toast.success(
                `Otomatis: ${result.created} infrastruktur (${jenisLabel || '—'}) · ${result.linked} tautan pekerjaan`,
            )
            if (result.errors.length > 0) {
                toast.warning(
                    `${result.errors.length} peringatan: ${result.errors.slice(0, 2).join('; ')}`,
                )
            }
            invalidateSpmIntegrationQueries(queryClient)
        },
        onError: (error) =>
            toast.error(getApiErrorMessage(error, 'Gagal membuat infrastruktur otomatis')),
    })

    const handleQuickAddInfrastruktur = (row: SpmDesaIntegration) => {
        const jenis = inferJenisFromIntegrationRow(row)
        if (!jenis && (row.pekerjaan_count ?? 0) === 0) {
            toast.error('Tidak ada paket pekerjaan sanitasi di desa ini')
            return
        }
        if (!jenis) {
            // Buka detail agar user lihat output / pilih manual
            setSelectedIntegrationRow(row)
            setDetailPanelOpen(true)
            toast.info('Jenis belum terdeteksi — cek detail desa atau buat manual')
            return
        }
        autoCreateMutation.mutate(row)
    }

    const handleAutoCreateFromDetail = (row: SpmDesaIntegration) => {
        autoCreateMutation.mutate(row)
    }

    const updateField = <K extends keyof SpmSanitasiFormData>(key: K, value: SpmSanitasiFormData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">SPM Sanitasi</h1>
                    <p className="text-sm text-muted-foreground">
                        Data infrastruktur SPALD, IPLT, MCK, serta integrasi paket pekerjaan (output {INTEGRASI_OUTPUT_SUMMARY}).
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ImportSpmSanitasiDialog onSuccess={refresh} />
                    <Button variant="outline" onClick={handleExport} disabled={exporting}>
                        {exporting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        Ekspor Excel
                    </Button>
                    <Button onClick={() => openCreate()}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah Data
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select
                    value={selectedKec ? String(selectedKec) : 'all'}
                    onValueChange={(v) => {
                        setSelectedKec(v === 'all' ? '' : Number(v))
                        setSelectedDesa('')
                        setPage(1)
                    }}
                >
                    <SelectTrigger className="w-full sm:w-[260px]">
                        <SelectValue placeholder="Filter Kecamatan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Kecamatan (Kab. Cianjur)</SelectItem>
                        {kecamatans?.data?.map((k) => (
                            <SelectItem key={k.id} value={String(k.id)}>
                                {k.nama_kecamatan}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                    Perhitungan capaian: pemanfaat jiwa = KK × 5, dibandingkan dengan jumlah penduduk desa.
                </p>
            </div>

            <Tabs value={pageTab} onValueChange={(v) => setPageTab(v as 'data' | 'integration')}>
                <TabsList>
                    <TabsTrigger value="data" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Infrastruktur & Capaian
                    </TabsTrigger>
                    <TabsTrigger value="integration" className="flex items-center gap-2">
                        <MapPinned className="h-4 w-4" />
                        Integrasi Paket Pekerjaan
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="data" className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                    <Card key={card.label}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <SpmSanitasiCapaianPanel kecamatanId={selectedKec || undefined} />

            <Card>
                <CardHeader>
                    <CardTitle>Data Infrastruktur Sanitasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Tabs
                        value={activeJenis}
                        onValueChange={(v) => {
                            setActiveJenis(v as SpmSanitasiJenis)
                        }}
                    >
                        <TabsList className="flex h-auto flex-wrap">
                            {INFRA_JENIS_ORDER.map((jenis) => (
                                <TabsTrigger key={jenis} value={jenis}>
                                    {JENIS_LABEL[jenis]}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                            <div className="relative flex-1">
                                {isListFetching ? (
                                    <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                                ) : (
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                )}
                                <Input
                                    className="pl-9"
                                    placeholder="Cari nama infrastruktur atau desa..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    aria-label="Cari infrastruktur SPM sanitasi"
                                />
                            </div>
                            <Select
                                value={selectedKec ? String(selectedKec) : 'all'}
                                onValueChange={(v) => {
                                    setSelectedKec(v === 'all' ? '' : Number(v))
                                    setSelectedDesa('')
                                    setPage(1)
                                }}
                            >
                                <SelectTrigger className="w-full lg:w-[200px]">
                                    <SelectValue placeholder="Kecamatan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kecamatan</SelectItem>
                                    {kecamatans?.data?.map((k) => (
                                        <SelectItem key={k.id} value={String(k.id)}>
                                            {k.nama_kecamatan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={selectedDesa ? String(selectedDesa) : 'all'}
                                onValueChange={(v) => {
                                    setSelectedDesa(v === 'all' ? '' : Number(v))
                                    setPage(1)
                                }}
                                disabled={!selectedKec}
                            >
                                <SelectTrigger className="w-full lg:w-[200px]">
                                    <SelectValue placeholder="Desa" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Desa</SelectItem>
                                    {desas?.data?.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {getDesaLabel(d)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {INFRA_JENIS_ORDER.map((jenis) => (
                            <TabsContent key={jenis} value={jenis} className="mt-4">
                                {isLoading && !listData ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : items.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        Belum ada data {JENIS_LABEL[jenis]}.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Kecamatan</TableHead>
                                                    <TableHead>Desa</TableHead>
                                                    <TableHead className="min-w-[220px]">Nama Infrastruktur</TableHead>
                                                    <TableHead>Tahun</TableHead>
                                                    <TableHead>Pemanfaat (KK)</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Investasi</TableHead>
                                                    <TableHead className="text-right">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {items.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>{item.desa?.kecamatan?.n_kec ?? '-'}</TableCell>
                                                        <TableCell>{item.desa?.n_desa ?? '-'}</TableCell>
                                                        <TableCell className="font-medium">{item.nama_infrastruktur}</TableCell>
                                                        <TableCell>{item.tahun_konstruksi ?? '-'}</TableCell>
                                                        <TableCell>{formatNumber(item.jumlah_pemanfaat_kk)}</TableCell>
                                                        <TableCell>{item.status_keberfungsian ?? '-'}</TableCell>
                                                        <TableCell>{formatCurrency(item.pembiayaan_total)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                {isIntegrableJenis(item.jenis) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        title="Tautkan paket pekerjaan"
                                                                        onClick={() => openTagDialog(item)}
                                                                    >
                                                                        <Link2 className="h-4 w-4 text-blue-600" />
                                                                    </Button>
                                                                )}
                                                                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}

                                {meta && meta.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Halaman {meta.current_page} dari {meta.last_page} ({meta.total} data)
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page <= 1}
                                                onClick={() => setPage((p) => p - 1)}
                                            >
                                                Sebelumnya
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page >= meta.last_page}
                                                onClick={() => setPage((p) => p + 1)}
                                            >
                                                Berikutnya
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
                </TabsContent>

                <TabsContent value="integration" className="mt-6 space-y-6">
                    <SpmSanitasiIntegrationTable
                        page={integrationPage}
                        search={integrationSearch}
                        debouncedSearch={debouncedIntegrationSearch}
                        selectedKec={integrationKec}
                        selectedDesa={integrationDesa}
                        selectedTahun={integrationTahun}
                        selectedStatus={integrationStatus}
                        selectedOutputType={integrationOutputType}
                        onPageChange={setIntegrationPage}
                        onSearchChange={setIntegrationSearch}
                        onKecChange={(v) => {
                            setIntegrationKec(v)
                            setIntegrationPage(1)
                        }}
                        onDesaChange={(v) => {
                            setIntegrationDesa(v)
                            setIntegrationPage(1)
                        }}
                        onTahunChange={(v) => {
                            setIntegrationTahun(v)
                            setIntegrationPage(1)
                        }}
                        onStatusChange={(v) => {
                            setIntegrationStatus(v)
                            setIntegrationPage(1)
                        }}
                        onOutputTypeChange={(v) => {
                            setIntegrationOutputType(v)
                            setIntegrationPage(1)
                        }}
                        onRowSelect={handleIntegrationRowSelect}
                        onQuickAddInfrastruktur={handleQuickAddInfrastruktur}
                        isAutoCreating={autoCreateMutation.isPending}
                    />
                    <SpmDesaDetailPanel
                        row={selectedIntegrationRow}
                        tahun={integrationTahun || undefined}
                        outputType={integrationOutputType || undefined}
                        open={detailPanelOpen}
                        onOpenChange={setDetailPanelOpen}
                        initialAction={integrationInitialAction}
                        onInitialActionHandled={() => setIntegrationInitialAction(null)}
                        onTagInfrastruktur={(item) => {
                            openTagDialog(item)
                            setDetailPanelOpen(false)
                        }}
                        onAddInfrastruktur={openCreateForDesa}
                        onAutoCreateInfrastruktur={handleAutoCreateFromDetail}
                        isAutoCreating={autoCreateMutation.isPending}
                    />
                </TabsContent>
            </Tabs>

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit' : 'Tambah'} {JENIS_LABEL[formData.jenis]}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label>Nama Infrastruktur *</Label>
                            <Input
                                value={formData.nama_infrastruktur}
                                onChange={(e) => updateField('nama_infrastruktur', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Kecamatan</Label>
                            <Select
                                value={formKec ? String(formKec) : 'none'}
                                onValueChange={(v) => {
                                    const kec = v === 'none' ? '' : Number(v)
                                    setFormKec(kec)
                                    updateField('desa_id', null)
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kecamatan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Pilih kecamatan</SelectItem>
                                    {kecamatans?.data?.map((k) => (
                                        <SelectItem key={k.id} value={String(k.id)}>
                                            {k.nama_kecamatan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Desa</Label>
                            <Select
                                value={formData.desa_id ? String(formData.desa_id) : 'none'}
                                onValueChange={(v) =>
                                    updateField('desa_id', v === 'none' ? null : Number(v))
                                }
                                disabled={!formKec}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih desa" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Pilih desa</SelectItem>
                                    {formDesas?.data?.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {getDesaLabel(d)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tahun Konstruksi</Label>
                            <Input
                                type="number"
                                value={formData.tahun_konstruksi ?? ''}
                                onChange={(e) =>
                                    updateField('tahun_konstruksi', e.target.value ? Number(e.target.value) : null)
                                }
                            />
                        </div>
                        {formData.jenis !== 'iplt' && (
                            <div className="space-y-2">
                                <Label>Skala Pelayanan</Label>
                                <Input
                                    value={formData.skala_pelayanan ?? ''}
                                    onChange={(e) => updateField('skala_pelayanan', e.target.value)}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Jumlah Pemanfaat (KK)</Label>
                            <Input
                                type="number"
                                value={formData.jumlah_pemanfaat_kk ?? ''}
                                onChange={(e) =>
                                    updateField('jumlah_pemanfaat_kk', e.target.value ? Number(e.target.value) : null)
                                }
                            />
                        </div>
                        {formData.jenis === 'spaldt' && (
                            <div className="space-y-2">
                                <Label>Jumlah Pemanfaat (Jiwa)</Label>
                                <Input
                                    type="number"
                                    value={formData.jumlah_pemanfaat_jiwa ?? ''}
                                    onChange={(e) =>
                                        updateField('jumlah_pemanfaat_jiwa', e.target.value ? Number(e.target.value) : null)
                                    }
                                />
                            </div>
                        )}
                        <div className="space-y-2 sm:col-span-2">
                            <Label>Alamat Lengkap</Label>
                            <Input
                                value={formData.alamat_lengkap ?? ''}
                                onChange={(e) => updateField('alamat_lengkap', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status Keberfungsian</Label>
                            <Input
                                value={formData.status_keberfungsian ?? ''}
                                onChange={(e) => updateField('status_keberfungsian', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Kualitas Keberfungsian</Label>
                            <Input
                                value={formData.kualitas_keberfungsian ?? ''}
                                onChange={(e) => updateField('kualitas_keberfungsian', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{formData.jenis === 'iplt' ? 'Jenis Pengelola' : 'Pengelola'}</Label>
                            <Input
                                value={
                                    formData.jenis === 'iplt'
                                        ? (formData.jenis_pengelola ?? '')
                                        : (formData.pengelola ?? '')
                                }
                                onChange={(e) =>
                                    formData.jenis === 'iplt'
                                        ? updateField('jenis_pengelola', e.target.value)
                                        : updateField('pengelola', e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Total Pembiayaan (Rp)</Label>
                            <Input
                                type="number"
                                value={formData.pembiayaan_total ?? ''}
                                onChange={(e) =>
                                    updateField('pembiayaan_total', e.target.value ? Number(e.target.value) : null)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Kapasitas Desain/Terpasang (m³/hari)</Label>
                            <Input
                                type="number"
                                value={formData.kapasitas_desain ?? ''}
                                onChange={(e) =>
                                    updateField('kapasitas_desain', e.target.value ? Number(e.target.value) : null)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Kapasitas Terpakai (m³/hari)</Label>
                            <Input
                                type="number"
                                value={formData.kapasitas_terpakai ?? ''}
                                onChange={(e) =>
                                    updateField('kapasitas_terpakai', e.target.value ? Number(e.target.value) : null)
                                }
                            />
                        </div>
                        {formData.jenis === 'iplt' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Sistem Pengolahan</Label>
                                    <Input
                                        value={formData.sistem_pengolahan ?? ''}
                                        onChange={(e) => updateField('sistem_pengolahan', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Truk Tinja (unit)</Label>
                                    <Input
                                        type="number"
                                        value={formData.truk_tinja_unit ?? ''}
                                        onChange={(e) =>
                                            updateField('truk_tinja_unit', e.target.value ? Number(e.target.value) : null)
                                        }
                                    />
                                </div>
                            </>
                        )}
                        {formData.jenis !== 'iplt' && (
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Jenis Pengolahan</Label>
                                <Input
                                    value={formData.jenis_pengolahan ?? ''}
                                    onChange={(e) => updateField('jenis_pengolahan', e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFormOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            onClick={() => saveMutation.mutate()}
                            disabled={!formData.nama_infrastruktur || saveMutation.isPending}
                        >
                            {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                entityName="data SPM Sanitasi"
                onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
                isPending={deleteMutation.isPending}
            />

            <SpmSanitasiTagPekerjaanDialog
                spmItem={tagSpmItem}
                open={tagDialogOpen}
                onOpenChange={setTagDialogOpen}
            />
        </div>
    )
}