import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Search,
    Plus,
    Filter,
    Loader2,
    Eye,
    Edit,
    Trash2,
    Calendar,
    DollarSign,
    X,
    CheckCircle,
    Upload,
    MapPinned,
    Database,
    Link2,
    TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import {
    getSpamUnits,
    createSpamUnit,
    updateSpamUnit,
    deleteSpamUnit,
    createSpamAchievement,
    createSpamBudget,
    deleteSpamBudget,
    importSpamData
} from '../api'
import { getKecamatan } from '@/features/kecamatan/api/kecamatan'
import { getDesaByKecamatan } from '@/features/desa/api/desa'
import type { IntegrationUnit, SpamAirMinumOutputType, SpamDesaIntegration, SyncStatus, UnitSpam } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SpamIntegrationDashboard } from './SpamIntegrationDashboard'
import { SpamSpmCapaianDashboard } from './SpamSpmCapaianDashboard'
import { SpamIntegrationTable } from './SpamIntegrationTable'
import { SpamDesaDetailPanel } from './SpamDesaDetailPanel'
import { SpamTagPekerjaanDialog } from './SpamTagPekerjaanDialog'
import { spamIntegrationKeys } from '../hooks/useSpamIntegration'
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

export default function SpamUnitPage() {
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Integration tab state
    const [integrationPage, setIntegrationPage] = useState(1)
    const [integrationSearch, setIntegrationSearch] = useState('')
    const [integrationKec, setIntegrationKec] = useState<number | ''>('')
    const [integrationDesa, setIntegrationDesa] = useState<number | ''>('')
    const [integrationTahun, setIntegrationTahun] = useState<string>('')
    const [integrationStatus, setIntegrationStatus] = useState<SyncStatus | ''>('')
    const [integrationKomponen, setIntegrationKomponen] = useState<string>('')
    const [spmKec, setSpmKec] = useState<number | ''>('')
    const [spmDesa, setSpmDesa] = useState<number | ''>('')
    const [spmTahun, setSpmTahun] = useState<string>('')
    const [selectedIntegrationRow, setSelectedIntegrationRow] = useState<SpamDesaIntegration | null>(null)
    const [detailPanelOpen, setDetailPanelOpen] = useState(false)
    const [detailInitialAction, setDetailInitialAction] = useState<'create-unit' | null>(null)
    const [tagUnit, setTagUnit] = useState<IntegrationUnit | UnitSpam | null>(null)
    const [tagDialogOpen, setTagDialogOpen] = useState(false)

    // Filters & Pagination State
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [selectedKec, setSelectedKec] = useState<number | ''>('')
    const [selectedDesa, setSelectedDesa] = useState<number | ''>('')
    const [selectedSimspam, setSelectedSimspam] = useState<string>('')
    const [selectedTahun, setSelectedTahun] = useState<string>('')

    // Modals State
    const [detailUnit, setDetailUnit] = useState<UnitSpam | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingUnit, setEditingUnit] = useState<UnitSpam | null>(null)
    const [activeTab, setActiveTab] = useState<'info' | 'pengelola' | 'achievements' | 'budgets'>('info')

    // Achievement Form State
    const [isSubmittingAch, setIsSubmittingAch] = useState(false)
    const [achForm, setAchForm] = useState({
        tahun: '',
        jumlah_sr: '',
        jumlah_kk: '',
        jumlah_jiwa: '',
        jumlah_bjp_kk: '',
        jumlah_bjp_jiwa: '',
        catatan: ''
    })

    // Budget Form State
    const [isSubmittingBudget, setIsSubmittingBudget] = useState(false)
    const [budgetForm, setBudgetForm] = useState({
        tahun: '',
        nilai_kontrak: '',
        nama_paket: '',
        sumber_dana: 'APBD'
    })


    // Form Inputs State
    const [formInputs, setFormInputs] = useState({
        desa_id: '',
        name: '',
        is_simspam: false,
        sistem_layanan: '',
        sumber_mata_air_kap: '',
        sumber_air_tanah_kap: '',
        lain_lain_kap: '',
        pokmas: '',
        perdes: '',
        kepala: '',
        bendahara: '',
        sekretaris: '',
    })

    // Fetch Kecamatan
    const { data: kecamatans } = useQuery({
        queryKey: ['kecamatans-list'],
        queryFn: getKecamatan
    })

    // Fetch Desa dynamically by Kecamatan
    const { data: desas } = useQuery({
        queryKey: ['desas-list-by-kec', selectedKec],
        queryFn: () => getDesaByKecamatan(selectedKec as number),
        enabled: !!selectedKec,
        staleTime: 0
    })

    // Fetch SPAM Units List
    const { data: unitsData, isLoading: isListLoading } = useQuery({
        queryKey: ['spam-units', page, search, selectedKec, selectedDesa, selectedSimspam, selectedTahun],
        queryFn: () => getSpamUnits({
            page,
            search: search || undefined,
            kecamatan_id: selectedKec || undefined,
            desa_id: selectedDesa || undefined,
            is_simspam: selectedSimspam === '' ? undefined : selectedSimspam,
            tahun: selectedTahun || undefined,
            per_page: 10
        }),
        staleTime: 0
    })

    const refetchSpamStatsAndIntegration = () =>
        Promise.all([
            queryClient.refetchQueries({ queryKey: ['spam-units-stats'] }),
            queryClient.refetchQueries({ queryKey: spamIntegrationKeys.all }),
        ])

    // Mutations for CRUD
    const createMutation = useMutation({
        mutationFn: createSpamUnit,
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['spam-units'] })
            await refetchSpamStatsAndIntegration()
            toast.success('Unit SPAM berhasil ditambahkan!')
            closeFormModal()
        },
        onError: (_err) => {
            toast.error('Gagal menambahkan unit SPAM.')
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateSpamUnit(id, data),
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['spam-units'] })
            await refetchSpamStatsAndIntegration()
            toast.success('Unit SPAM berhasil diperbarui!')
            closeFormModal()
        },
        onError: (_err) => {
            toast.error('Gagal memperbarui unit SPAM.')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: deleteSpamUnit,
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['spam-units'] })
            await refetchSpamStatsAndIntegration()
            toast.success('Unit SPAM berhasil dihapus!')
        },
        onError: (_err) => {
            toast.error('Gagal menghapus unit SPAM.')
        }
    })

    const importMutation = useMutation({
        mutationFn: importSpamData,
        onSuccess: (_res) => {
            queryClient.invalidateQueries({ queryKey: ['spam-units'] })
            queryClient.invalidateQueries({ queryKey: ['spam-units-stats'] })
            toast.success('Data SPAM berhasil diimport!')
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Gagal mengimport data SPAM.')
        }
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            toast.info('Memproses file import...')
            importMutation.mutate(file)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const addAchievementMutation = useMutation({
        mutationFn: ({ unitId, data }: { unitId: number; data: any }) => createSpamAchievement(unitId, data),
        onSuccess: async (res) => {
            queryClient.invalidateQueries({ queryKey: ['spam-units'] })
            await refetchSpamStatsAndIntegration()
            toast.success('Histori achievement berhasil disimpan!')
            if (detailUnit) {
                const updatedAchievements = [...(detailUnit.achievements || [])];
                const index = updatedAchievements.findIndex(a => a.tahun === res.data.tahun);
                if (index > -1) {
                    updatedAchievements[index] = res.data;
                } else {
                    updatedAchievements.push(res.data);
                }
                updatedAchievements.sort((a, b) => b.tahun.localeCompare(a.tahun));
                setDetailUnit({
                    ...detailUnit,
                    achievements: updatedAchievements
                });
            }
            setAchForm({
                tahun: '',
                jumlah_sr: '',
                jumlah_kk: '',
                jumlah_jiwa: '',
                jumlah_bjp_kk: '',
                jumlah_bjp_jiwa: '',
                catatan: ''
            })
        },
        onError: (_err) => {
            toast.error('Gagal menyimpan histori achievement.')
        }
    })

    const toggleSimspam = (unit: any) => {
        const data = {
            desa_id: unit.desa_id,
            name: unit.name,
            is_simspam: !unit.is_simspam,
            sistem_layanan: unit.sistem_layanan,
            sumber_mata_air_kap: unit.sumber_mata_air_kap,
            sumber_air_tanah_kap: unit.sumber_air_tanah_kap,
            lain_lain_kap: unit.lain_lain_kap,
            pokmas: unit.pengelola?.pokmas,
            perdes: unit.pengelola?.perdes,
            kepala: unit.pengelola?.kepala,
            bendahara: unit.pengelola?.bendahara,
            sekretaris: unit.pengelola?.sekretaris
        };
        updateMutation.mutate({ id: unit.id, data });
    }


    const addBudgetMutation = useMutation({
        mutationFn: ({ unitId, data }: { unitId: number; data: any }) => createSpamBudget(unitId, data),
        onSuccess: async (res) => {
            queryClient.invalidateQueries({ queryKey: ['spam-units'] })
            await refetchSpamStatsAndIntegration()
            toast.success('Data anggaran berhasil disimpan!')
            if (detailUnit) {
                const updatedBudgets = [...(detailUnit.budgets || []), res.data];
                updatedBudgets.sort((a, b) => b.tahun.localeCompare(a.tahun));
                setDetailUnit({
                    ...detailUnit,
                    budgets: updatedBudgets
                });
            }
            setBudgetForm({
                tahun: '',
                nilai_kontrak: '',
                nama_paket: '',
                sumber_dana: 'APBD'
            })
        },
        onError: (_err) => {
            toast.error('Gagal menyimpan data anggaran.')
        }
    })

    const removeBudgetMutation = useMutation({
        mutationFn: ({ unitId, budgetId }: { unitId: number; budgetId: number }) => deleteSpamBudget(unitId, budgetId),
        onSuccess: async (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['spam-units'] })
            await refetchSpamStatsAndIntegration()
            toast.success('Data anggaran berhasil dihapus!')
            if (detailUnit) {
                setDetailUnit({
                    ...detailUnit,
                    budgets: (detailUnit.budgets || []).filter(b => b.id !== variables.budgetId)
                });
            }
        },
        onError: (_err) => {
            toast.error('Gagal menghapus data anggaran.')
        }
    })

    // Actions
    const openCreateModal = () => {
        setEditingUnit(null)
        setFormInputs({
            desa_id: '',
            name: '',
            is_simspam: false,
            sistem_layanan: '',
            sumber_mata_air_kap: '',
            sumber_air_tanah_kap: '',
            lain_lain_kap: '',
            pokmas: '',
            perdes: '',
            kepala: '',
            bendahara: '',
            sekretaris: '',
        })
        setIsFormOpen(true)
    }

    const openEditModal = (unit: UnitSpam) => {
        setEditingUnit(unit)
        setFormInputs({
            desa_id: String(unit.desa_id),
            name: unit.name || '',
            is_simspam: unit.is_simspam,
            sistem_layanan: unit.sistem_layanan || '',
            sumber_mata_air_kap: unit.sumber_mata_air_kap || '',
            sumber_air_tanah_kap: unit.sumber_air_tanah_kap || '',
            lain_lain_kap: unit.lain_lain_kap || '',
            pokmas: unit.pengelola?.pokmas || '',
            perdes: unit.pengelola?.perdes || '',
            kepala: unit.pengelola?.kepala || '',
            bendahara: unit.pengelola?.bendahara || '',
            sekretaris: unit.pengelola?.sekretaris || '',
        })
        setIsFormOpen(true)
    }

    const closeFormModal = () => {
        setIsFormOpen(false)
        setEditingUnit(null)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formInputs.desa_id) {
            toast.warning('Silakan pilih Desa terlebih dahulu.')
            return
        }

        const data = {
            ...formInputs,
            desa_id: parseInt(formInputs.desa_id),
            is_simspam: formInputs.is_simspam
        }

        if (editingUnit) {
            updateMutation.mutate({ id: editingUnit.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleDelete = (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus unit SPAM ini? Semua data terkait (Pengelola & Achievements) akan ikut terhapus.')) {
            deleteMutation.mutate(id)
        }
    }

    const handleIntegrationRowSelect = (row: SpamDesaIntegration) => {
        setSelectedIntegrationRow(row)
        setDetailInitialAction(null)
        setDetailPanelOpen(true)
    }

    const handleQuickCreateUnit = (row: SpamDesaIntegration) => {
        setSelectedIntegrationRow(row)
        setDetailInitialAction('create-unit')
        setDetailPanelOpen(true)
    }

    const handleTagUnit = (unit: UnitSpam) => {
        setTagUnit(unit)
        setTagDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Aset SPAM & Capaian SPM</h1>
                <p className="text-muted-foreground">
                    Pantau capaian SPM, integrasi pekerjaan air minum per desa, dan kelola master unit SPAM.
                </p>
            </div>

            <Tabs defaultValue="spm" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="spm" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Capaian SPM
                    </TabsTrigger>
                    <TabsTrigger value="integration" className="flex items-center gap-2">
                        <MapPinned className="h-4 w-4" />
                        Integrasi Wilayah
                    </TabsTrigger>
                    <TabsTrigger value="master" className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Master Unit SPAM
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="spm" className="space-y-6">
                    <SpamSpmCapaianDashboard
                        kecamatanId={spmKec || undefined}
                        desaId={spmDesa || undefined}
                        tahun={spmTahun || undefined}
                        onKecChange={setSpmKec}
                        onDesaChange={setSpmDesa}
                        onTahunChange={setSpmTahun}
                    />
                </TabsContent>

                <TabsContent value="integration" className="space-y-6">
                    <SpamIntegrationDashboard
                        kecamatanId={integrationKec || undefined}
                        tahun={integrationTahun}
                    />
                    <SpamIntegrationTable
                        page={integrationPage}
                        search={integrationSearch}
                        selectedKec={integrationKec}
                        selectedDesa={integrationDesa}
                        selectedTahun={integrationTahun}
                        selectedStatus={integrationStatus}
                        selectedKomponen={integrationKomponen}
                        onPageChange={setIntegrationPage}
                        onSearchChange={setIntegrationSearch}
                        onKecChange={(kec) => {
                            setIntegrationKec(kec)
                            setIntegrationKomponen('')
                        }}
                        onDesaChange={setIntegrationDesa}
                        onTahunChange={(tahun) => {
                            setIntegrationTahun(tahun)
                            setIntegrationKomponen('')
                        }}
                        onStatusChange={setIntegrationStatus}
                        onKomponenChange={setIntegrationKomponen}
                        onRowSelect={handleIntegrationRowSelect}
                        onQuickCreateUnit={handleQuickCreateUnit}
                    />
                    <SpamDesaDetailPanel
                        row={selectedIntegrationRow}
                        tahun={integrationTahun || undefined}
                        komponen={integrationKomponen || undefined}
                        open={detailPanelOpen}
                        onOpenChange={(nextOpen) => {
                            setDetailPanelOpen(nextOpen)
                            if (!nextOpen) {
                                setDetailInitialAction(null)
                            }
                        }}
                        initialAction={detailInitialAction}
                        onInitialActionHandled={() => setDetailInitialAction(null)}
                    />
                    <SpamTagPekerjaanDialog
                        unit={tagUnit}
                        open={tagDialogOpen}
                        onOpenChange={setTagDialogOpen}
                    />
                </TabsContent>

                <TabsContent value="master" className="space-y-6">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-lg font-semibold">Master Unit SPAM</h2>
                            <p className="text-sm text-muted-foreground">
                                Kelola data teknis unit SPAM, POKMAS pengelola, serta rekam histori capaian SR tahunan.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".csv"
                                onChange={handleFileChange}
                            />
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={importMutation.isPending}
                            >
                                {importMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="mr-2 h-4 w-4" />
                                )}
                                Import CSV
                            </Button>
                            <Button onClick={openCreateModal}>
                                <Plus className="mr-2 h-4 w-4" /> Tambah Unit SPAM
                            </Button>
                        </div>
                    </div>

                    {/* DATA TABLE & FILTERS CARD */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                                    <CardTitle>Data Unit SPAM & Capaian SPM</CardTitle>

                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Filter:</span>
                                        </div>

                                        {/* Kecamatan Filter */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">Kecamatan:</span>
                                            <Select
                                                value={selectedKec ? String(selectedKec) : 'all'}
                                                onValueChange={(val) => {
                                                    setSelectedKec(val === 'all' ? '' : Number(val));
                                                    setSelectedDesa('');
                                                    setPage(1);
                                                }}
                                            >
                                                <SelectTrigger className="w-[180px] h-9 text-xs">
                                                    <SelectValue placeholder="Semua Kecamatan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Kecamatan</SelectItem>
                                                    {kecamatans?.data?.map((kec: any) => (
                                                        <SelectItem key={kec.id} value={String(kec.id)}>
                                                            {kec.nama_kecamatan || kec.n_kec}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Desa Filter */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">Desa:</span>
                                            <Select
                                                value={selectedDesa ? String(selectedDesa) : 'all'}
                                                onValueChange={(val) => {
                                                    setSelectedDesa(val === 'all' ? '' : Number(val));
                                                    setPage(1);
                                                }}
                                                disabled={!selectedKec}
                                            >
                                                <SelectTrigger className="w-[180px] h-9 text-xs">
                                                    <SelectValue placeholder="Semua Desa" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Desa</SelectItem>
                                                    {desas?.data?.map((desa: any) => (
                                                        <SelectItem key={desa.id} value={String(desa.id)}>
                                                            {desa.nama_desa || desa.n_desa}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* SIMSPAM Filter */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">Status:</span>
                                            <Select
                                                value={selectedSimspam || 'all'}
                                                onValueChange={(val) => {
                                                    setSelectedSimspam(val === 'all' ? '' : val);
                                                    setPage(1);
                                                }}
                                            >
                                                <SelectTrigger className="w-[140px] h-9 text-xs">
                                                    <SelectValue placeholder="Semua Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Status</SelectItem>
                                                    <SelectItem value="true">SIMSPAM</SelectItem>
                                                    <SelectItem value="false">Standard</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Tahun Filter */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">Tahun Capaian:</span>
                                            <Select
                                                value={selectedTahun || 'all'}
                                                onValueChange={(val) => {
                                                    setSelectedTahun(val === 'all' ? '' : val);
                                                    setPage(1);
                                                }}
                                            >
                                                <SelectTrigger className="w-[130px] h-9 text-xs">
                                                    <SelectValue placeholder="Semua Tahun" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Tahun</SelectItem>
                                                    <SelectItem value="2026">Tahun 2026</SelectItem>
                                                    <SelectItem value="2025">Tahun 2025</SelectItem>
                                                    <SelectItem value="2024">Tahun 2024</SelectItem>
                                                    <SelectItem value="2023">Tahun 2023</SelectItem>
                                                    <SelectItem value="2022">Tahun 2022</SelectItem>
                                                    <SelectItem value="2021">Tahun 2021</SelectItem>
                                                    <SelectItem value="2020">Tahun 2020</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Cari unit SPAM, POKMAS, kepala..."
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                        className="pl-9 w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* DATA TABLE */}
                            {isListLoading ? (
                                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                    <p className="text-sm text-muted-foreground">Memuat data unit SPAM...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-transparent">
                                                <TableHead className="min-w-[120px]">Kecamatan</TableHead>
                                                <TableHead className="min-w-[120px]">Desa</TableHead>
                                                <TableHead className="min-w-[200px]">Nama Unit / Sistem</TableHead>
                                                <TableHead className="min-w-[180px]">POKMAS Pengelola</TableHead>
                                                <TableHead className="text-center w-[120px]">Status SPAM</TableHead>
                                                <TableHead className="text-center w-[130px]">Sambungan (SR)</TableHead>
                                                <TableHead className="text-center w-[120px]">BJP (KK)</TableHead>
                                                <TableHead className="text-right w-[150px]">Total Anggaran</TableHead>
                                                <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10 w-[120px]">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {unitsData?.data && unitsData.data.length > 0 ? (
                                                unitsData.data.map((unit) => {
                                                    const displayName = unit.name || `SPAM ${unit.desa?.nama_desa || unit.desa?.n_desa || ''} ${unit.desa?.kecamatan?.nama_kecamatan || unit.desa?.kecamatan?.n_kec || ''}`;
                                                    const displayPokmas = unit.pengelola?.pokmas || `KPSPAM ${(unit.desa?.nama_desa || unit.desa?.n_desa || '').toUpperCase()} ${(unit.desa?.kecamatan?.nama_kecamatan || unit.desa?.kecamatan?.n_kec || '').toUpperCase()}`;
                                                    const bjpCount = (unit.desa?.bjp_master ?? 0) + (unit.achievements?.reduce((sum, a) => sum + (a.jumlah_bjp_kk ?? 0), 0) ?? 0);
                                                    const totalAnggaran = unit.budgets?.reduce((sum, b) => sum + Number(b.nilai_kontrak || 0), 0) || 0;

                                                    return (
                                                        <TableRow key={unit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                                            <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                                                {unit.desa?.kecamatan?.nama_kecamatan || unit.desa?.kecamatan?.n_kec}
                                                            </TableCell>
                                                            <TableCell className="text-slate-700 dark:text-slate-300">
                                                                {unit.desa?.nama_desa || unit.desa?.n_desa}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="font-medium">{displayName}</div>
                                                                <div className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded w-max mt-1">
                                                                    {unit.sistem_layanan || 'Belum diisi'}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="font-medium">{displayPokmas}</div>
                                                                <div className="text-xs text-muted-foreground">Kepala: {unit.pengelola?.kepala || '-'}</div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <button
                                                                    onClick={() => toggleSimspam(unit)}
                                                                    disabled={updateMutation.isPending}
                                                                    className="hover:scale-110 transition-transform disabled:opacity-50"
                                                                    title="Toggle Status SPAM"
                                                                >
                                                                    {unit.is_simspam ? (
                                                                        <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                                                                    ) : (
                                                                        <X className="h-5 w-5 text-slate-300 mx-auto" />
                                                                    )}
                                                                </button>
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-slate-800 dark:text-slate-200">
                                                                {unit.achievements && unit.achievements.length > 0
                                                                    ? unit.achievements[0].jumlah_sr
                                                                    : 0} SR
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-slate-800 dark:text-slate-200">
                                                                {bjpCount.toLocaleString()} KK
                                                            </TableCell>
                                                            <TableCell
                                                                className="text-right font-semibold text-emerald-600 cursor-pointer hover:underline"
                                                                onClick={() => { setDetailUnit(unit); setActiveTab('budgets'); }}
                                                            >
                                                                {totalAnggaran > 0 ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalAnggaran) : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                                                <div className="flex justify-end gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => { setDetailUnit(unit); setActiveTab('info'); }}
                                                                        className="h-8 w-8 text-slate-600 dark:text-slate-400"
                                                                        title="Detail"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => openEditModal(unit)}
                                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleDelete(unit.id)}
                                                                        className="h-8 w-8 text-destructive"
                                                                        title="Hapus"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="p-8 text-center text-muted-foreground">
                                                        Tidak ada data unit SPAM ditemukan.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t">
                            {/* PAGINATION */}
                            {unitsData && unitsData.meta && (
                                <>
                                    <div className="text-xs text-muted-foreground">
                                        Menampilkan {unitsData.data?.length} dari {unitsData.meta.total} unit
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                                            disabled={page === 1}
                                            className="h-8 px-3 text-xs"
                                        >
                                            Sebelumnya
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(p + 1, unitsData.meta.last_page))}
                                            disabled={page === unitsData.meta.last_page}
                                            className="h-8 px-3 text-xs"
                                        >
                                            Selanjutnya
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardFooter>
                    </Card>

                    {/* DETAIL MODAL DRAWER */}
                    {detailUnit && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
                            <div className="bg-card border w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                                {/* Modal Header */}
                                <div className="p-6 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{detailUnit.name || 'Detail Unit SPAM'}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {detailUnit.desa?.kecamatan?.nama_kecamatan || detailUnit.desa?.kecamatan?.n_kec} • Desa {detailUnit.desa?.nama_desa || detailUnit.desa?.n_desa}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleTagUnit(detailUnit)}
                                        >
                                            <Link2 className="mr-1 h-3.5 w-3.5" />
                                            Tautkan Pekerjaan
                                        </Button>
                                        <button
                                            onClick={() => setDetailUnit(null)}
                                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Tabs Bar */}
                                <div className="flex border-b bg-card">
                                    <button
                                        onClick={() => setActiveTab('info')}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 text-center ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-slate-900'}`}
                                    >
                                        Informasi Teknis
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('pengelola')}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 text-center ${activeTab === 'pengelola' ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-slate-900'}`}
                                    >
                                        Pengelola (POKMAS)
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('achievements')}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 text-center ${activeTab === 'achievements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-slate-900'}`}
                                    >
                                        Histori Achievements
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('budgets')}
                                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 text-center ${activeTab === 'budgets' ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-slate-900'}`}
                                    >
                                        Detail Anggaran
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="p-6 overflow-y-auto space-y-6">
                                    {/* Technical Info Tab */}
                                    {activeTab === 'info' && (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-4">
                                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                                    <div className="text-xs text-muted-foreground">Sistem Layanan</div>
                                                    <div className="text-sm font-semibold mt-0.5">{detailUnit.sistem_layanan || '-'}</div>
                                                </div>
                                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                                    <div className="text-xs text-muted-foreground">Kapasitas Mata Air</div>
                                                    <div className="text-sm font-semibold mt-0.5">{detailUnit.sumber_mata_air_kap || '-'}</div>
                                                </div>
                                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                                    <div className="text-xs text-muted-foreground">Kapasitas Air Tanah</div>
                                                    <div className="text-sm font-semibold mt-0.5">{detailUnit.sumber_air_tanah_kap || '-'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pengelola Tab */}
                                    {activeTab === 'pengelola' && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-start space-x-3">
                                                <Building2 className="h-6 w-6 text-blue-600 mt-0.5" />
                                                <div>
                                                    <div className="text-xs text-muted-foreground">Nama POKMAS</div>
                                                    <div className="text-base font-bold text-slate-800 dark:text-slate-100">{detailUnit.pengelola?.pokmas || '(Belum Terbentuk)'}</div>
                                                    <div className="text-xs text-emerald-600 mt-1">Landasan Hukum Perdes: {detailUnit.pengelola?.perdes || '-'}</div>
                                                </div>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-3">
                                                <div className="p-3 bg-slate-100/50 dark:bg-slate-800 rounded-lg">
                                                    <div className="text-xs text-muted-foreground">Ketua / Kepala</div>
                                                    <div className="text-sm font-semibold mt-0.5">{detailUnit.pengelola?.kepala || '-'}</div>
                                                </div>
                                                <div className="p-3 bg-slate-100/50 dark:bg-slate-800 rounded-lg">
                                                    <div className="text-xs text-muted-foreground">Bendahara</div>
                                                    <div className="text-sm font-semibold mt-0.5">{detailUnit.pengelola?.bendahara || '-'}</div>
                                                </div>
                                                <div className="p-3 bg-slate-100/50 dark:bg-slate-800 rounded-lg">
                                                    <div className="text-xs text-muted-foreground">Sekretaris</div>
                                                    <div className="text-sm font-semibold mt-0.5">{detailUnit.pengelola?.sekretaris || '-'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Achievements Histori Tab */}
                                    {activeTab === 'achievements' && (
                                        <div className="space-y-4">
                                            {/* Capaian Form (Always visible) */}
                                            <div className="p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                    {achForm.tahun && detailUnit.achievements?.some(a => a.tahun === achForm.tahun) ? 'Edit / Update Capaian Capaian' : 'Tambah Capaian Baru'}
                                                </h4>
                                                <form onSubmit={(e) => {
                                                    e.preventDefault();
                                                    if (!achForm.tahun) {
                                                        toast.warning('Silakan pilih atau isi tahun terlebih dahulu.');
                                                        return;
                                                    }
                                                    setIsSubmittingAch(true);
                                                    addAchievementMutation.mutate({
                                                        unitId: detailUnit.id,
                                                        data: {
                                                            tahun: achForm.tahun,
                                                            jumlah_sr: Number(achForm.jumlah_sr || 0),
                                                            jumlah_kk: Number(achForm.jumlah_kk || 0),
                                                            jumlah_jiwa: Number(achForm.jumlah_jiwa || 0),
                                                            jumlah_bjp_kk: Number(achForm.jumlah_bjp_kk || 0),
                                                            jumlah_bjp_jiwa: Number(achForm.jumlah_bjp_jiwa || 0),
                                                            catatan: achForm.catatan || ''
                                                        }
                                                    }, {
                                                        onSettled: () => setIsSubmittingAch(false)
                                                    });
                                                }} className="grid gap-3">
                                                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tahun *</label>
                                                            <Select
                                                                value={achForm.tahun}
                                                                onValueChange={(val) => {
                                                                    const existing = detailUnit.achievements?.find(a => a.tahun === val);
                                                                    if (existing) {
                                                                        setAchForm({
                                                                            tahun: val,
                                                                            jumlah_sr: String(existing.jumlah_sr),
                                                                            jumlah_kk: String(existing.jumlah_kk),
                                                                            jumlah_jiwa: String(existing.jumlah_jiwa),
                                                                            jumlah_bjp_kk: String(existing.jumlah_bjp_kk || ''),
                                                                            jumlah_bjp_jiwa: String(existing.jumlah_bjp_jiwa || ''),
                                                                            catatan: existing.catatan || ''
                                                                        });
                                                                    } else {
                                                                        setAchForm(a => ({
                                                                            ...a,
                                                                            tahun: val,
                                                                            jumlah_sr: '',
                                                                            jumlah_kk: '',
                                                                            jumlah_jiwa: '',
                                                                            jumlah_bjp_kk: '',
                                                                            jumlah_bjp_jiwa: '',
                                                                            catatan: ''
                                                                        }));
                                                                    }
                                                                }}
                                                            >
                                                                <SelectTrigger className="h-9 text-xs">
                                                                    <SelectValue placeholder="Pilih Tahun" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="2026">2026</SelectItem>
                                                                    <SelectItem value="2025">2025</SelectItem>
                                                                    <SelectItem value="2024">2024</SelectItem>
                                                                    <SelectItem value="2023">2023</SelectItem>
                                                                    <SelectItem value="2022">2022</SelectItem>
                                                                    <SelectItem value="2021">2021</SelectItem>
                                                                    <SelectItem value="2020">2020</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Sambungan (SR) *</label>
                                                            <input
                                                                type="number"
                                                                value={achForm.jumlah_sr}
                                                                onChange={(e) => setAchForm(a => ({ ...a, jumlah_sr: e.target.value }))}
                                                                required
                                                                min="0"
                                                                placeholder="e.g. 50"
                                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Jumlah KK *</label>
                                                            <input
                                                                type="number"
                                                                value={achForm.jumlah_kk}
                                                                onChange={(e) => setAchForm(a => ({ ...a, jumlah_kk: e.target.value }))}
                                                                required
                                                                min="0"
                                                                placeholder="e.g. 50"
                                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Layanan Jiwa *</label>
                                                            <input
                                                                type="number"
                                                                value={achForm.jumlah_jiwa}
                                                                onChange={(e) => setAchForm(a => ({ ...a, jumlah_jiwa: e.target.value }))}
                                                                required
                                                                min="0"
                                                                placeholder="e.g. 250"
                                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                                                        <div className="space-y-1">
                                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">BJP KK (Optional)</label>
                                                            <input
                                                                type="number"
                                                                value={achForm.jumlah_bjp_kk}
                                                                onChange={(e) => setAchForm(a => ({ ...a, jumlah_bjp_kk: e.target.value }))}
                                                                min="0"
                                                                placeholder="e.g. 10"
                                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">BJP Jiwa (Optional)</label>
                                                            <input
                                                                type="number"
                                                                value={achForm.jumlah_bjp_jiwa}
                                                                onChange={(e) => setAchForm(a => ({ ...a, jumlah_bjp_jiwa: e.target.value }))}
                                                                min="0"
                                                                placeholder="e.g. 50"
                                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                            />
                                                        </div>

                                                        <div className="space-y-1 col-span-2 sm:col-span-1">
                                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Catatan</label>
                                                            <input
                                                                type="text"
                                                                value={achForm.catatan}
                                                                onChange={(e) => setAchForm(a => ({ ...a, catatan: e.target.value }))}
                                                                placeholder="e.g. Kondisi baik"
                                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end gap-2 pt-2">
                                                        {achForm.tahun && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setAchForm({
                                                                    tahun: '',
                                                                    jumlah_sr: '',
                                                                    jumlah_kk: '',
                                                                    jumlah_jiwa: '',
                                                                    jumlah_bjp_kk: '',
                                                                    jumlah_bjp_jiwa: '',
                                                                    catatan: ''
                                                                })}
                                                                className="inline-flex items-center justify-center rounded border px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                            >
                                                                Batal Edit
                                                            </button>
                                                        )}
                                                        <button
                                                            type="submit"
                                                            disabled={isSubmittingAch}
                                                            className="inline-flex items-center justify-center rounded bg-blue-600 text-white px-4 py-1.5 text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                                        >
                                                            {isSubmittingAch && (
                                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                            )}
                                                            {achForm.tahun && detailUnit.achievements?.some(a => a.tahun === achForm.tahun) ? 'Update Capaian' : 'Tambah Capaian'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>

                                            {detailUnit.achievements && detailUnit.achievements.length > 0 ? (
                                                <div className="border rounded-xl overflow-hidden">
                                                    <table className="w-full caption-bottom text-sm">
                                                        <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                                                            <tr>
                                                                <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Tahun</th>
                                                                <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">SR</th>
                                                                <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">KK</th>
                                                                <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Served (Jiwa)</th>
                                                                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Catatan</th>
                                                                <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground w-[80px]">Aksi</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y text-center">
                                                            {detailUnit.achievements.map((ach) => (
                                                                <tr key={ach.id} className="hover:bg-slate-50/50 transition-colors">
                                                                    <td className="p-3 align-middle font-bold">{ach.tahun}</td>
                                                                    <td className="p-3 align-middle font-semibold text-blue-600">{ach.jumlah_sr} SR</td>
                                                                    <td className="p-3 align-middle">{ach.jumlah_kk} KK</td>
                                                                    <td className="p-3 align-middle font-semibold text-emerald-600">{ach.jumlah_jiwa} Jiwa</td>
                                                                    <td className="p-3 align-middle text-left text-xs text-muted-foreground">{ach.catatan || '-'}</td>
                                                                    <td className="p-3 align-middle">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => setAchForm({
                                                                                tahun: ach.tahun,
                                                                                jumlah_sr: String(ach.jumlah_sr),
                                                                                jumlah_kk: String(ach.jumlah_kk),
                                                                                jumlah_jiwa: String(ach.jumlah_jiwa),
                                                                                jumlah_bjp_kk: String(ach.jumlah_bjp_kk || ''),
                                                                                jumlah_bjp_jiwa: String(ach.jumlah_bjp_jiwa || ''),
                                                                                catatan: ach.catatan || ''
                                                                            })}
                                                                            className="h-7 w-7 text-blue-600 hover:text-blue-700"
                                                                            title="Edit Capaian"
                                                                        >
                                                                            <Edit className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl space-y-2 text-muted-foreground">
                                                    <Calendar className="h-8 w-8" />
                                                    <p className="text-sm">Belum ada histori achievements terdaftar.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Budgets Tab */}
                                    {activeTab === 'budgets' && (
                                        <div className="space-y-4">
                                            {/* Anggaran Form */}
                                            <div className="p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                    Tambah Data Anggaran
                                                </h4>
                                                <form onSubmit={(e) => {
                                                    e.preventDefault();
                                                    if (!budgetForm.tahun) {
                                                        toast.warning('Silakan pilih atau isi tahun terlebih dahulu.');
                                                        return;
                                                    }
                                                    setIsSubmittingBudget(true);
                                                    addBudgetMutation.mutate({
                                                        unitId: detailUnit.id,
                                                        data: {
                                                            tahun: budgetForm.tahun,
                                                            nilai_kontrak: Number(budgetForm.nilai_kontrak || 0),
                                                            nama_paket: budgetForm.nama_paket || '',
                                                            sumber_dana: budgetForm.sumber_dana || 'APBD'
                                                        }
                                                    }, {
                                                        onSettled: () => setIsSubmittingBudget(false)
                                                    });
                                                }} className="grid gap-3">
                                                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                                                        <div className="space-y-1 col-span-2 sm:col-span-1">
                                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tahun *</label>
                                                            <Select
                                                                value={budgetForm.tahun}
                                                                onValueChange={(val) => setBudgetForm(f => ({ ...f, tahun: val }))}
                                                            >
                                                                <SelectTrigger className="h-9 text-xs">
                                                                    <SelectValue placeholder="Pilih Tahun" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Array.from({ length: 15 }, (_, i) => 2013 + i).reverse().map(y => (
                                                                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-1 col-span-2 sm:col-span-1">
                                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Sumber Dana *</label>
                                                            <Select
                                                                value={budgetForm.sumber_dana}
                                                                onValueChange={(val) => setBudgetForm(f => ({ ...f, sumber_dana: val }))}
                                                            >
                                                                <SelectTrigger className="h-9 text-xs">
                                                                    <SelectValue placeholder="Pilih Sumber" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="APBD">APBD</SelectItem>
                                                                    <SelectItem value="DAK">DAK</SelectItem>
                                                                    <SelectItem value="APBN">APBN</SelectItem>
                                                                    <SelectItem value="LAINNYA">LAINNYA</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-1 col-span-2 sm:col-span-2">
                                                            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nilai Kontrak (Rp) *</label>
                                                            <input
                                                                type="number"
                                                                value={budgetForm.nilai_kontrak}
                                                                onChange={(e) => setBudgetForm(a => ({ ...a, nilai_kontrak: e.target.value }))}
                                                                required
                                                                min="0"
                                                                placeholder="e.g. 150000000"
                                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nama Paket Pekerjaan</label>
                                                        <input
                                                            type="text"
                                                            value={budgetForm.nama_paket}
                                                            onChange={(e) => setBudgetForm(a => ({ ...a, nama_paket: e.target.value }))}
                                                            placeholder="e.g. Pembangunan SPAM Jaringan Perpipaan"
                                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        />
                                                    </div>

                                                    <div className="flex justify-end pt-2">
                                                        <button
                                                            type="submit"
                                                            disabled={isSubmittingBudget}
                                                            className="inline-flex items-center justify-center rounded bg-blue-600 text-white px-4 py-1.5 text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                                        >
                                                            {isSubmittingBudget && (
                                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                            )}
                                                            Tambah Data Anggaran
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>

                                            {detailUnit.budgets && detailUnit.budgets.length > 0 ? (
                                                <div className="border rounded-xl overflow-hidden">
                                                    <table className="w-full caption-bottom text-sm">
                                                        <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                                                            <tr>
                                                                <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Tahun</th>
                                                                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Nama Paket</th>
                                                                <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Sumber Dana</th>
                                                                <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Nilai Kontrak</th>
                                                                <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground w-[80px]">Aksi</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y text-center">
                                                            {detailUnit.budgets.map((bg) => (
                                                                <tr key={bg.id} className="hover:bg-slate-50/50 transition-colors">
                                                                    <td className="p-3 align-middle font-bold">{bg.tahun}</td>
                                                                    <td className="p-3 align-middle text-left text-xs line-clamp-2" title={bg.nama_paket}>{bg.nama_paket || '-'}</td>
                                                                    <td className="p-3 align-middle">
                                                                        <span className="inline-flex items-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-semibold">
                                                                            {bg.sumber_dana || 'APBD'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-3 align-middle text-right font-semibold text-emerald-600">
                                                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(bg.nilai_kontrak)}
                                                                    </td>
                                                                    <td className="p-3 align-middle">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => {
                                                                                if (window.confirm('Yakin ingin menghapus data anggaran ini?')) {
                                                                                    removeBudgetMutation.mutate({ unitId: detailUnit.id, budgetId: bg.id });
                                                                                }
                                                                            }}
                                                                            className="h-7 w-7 text-destructive hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                                            title="Hapus Anggaran"
                                                                        >
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl space-y-2 text-muted-foreground">
                                                    <DollarSign className="h-8 w-8" />
                                                    <p className="text-sm">Belum ada data anggaran terdaftar.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CREATE / EDIT FORM MODAL */}
                    {isFormOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
                            <div className="bg-card border w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                                {/* Header */}
                                <div className="p-6 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        {editingUnit ? 'Edit Unit SPAM' : 'Tambah Unit SPAM Baru'}
                                    </h3>
                                    <button
                                        onClick={closeFormModal}
                                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
                                    {/* Row 1: Desa Selection & Unit Name */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground">Kecamatan</label>
                                            <Select
                                                value={selectedKec ? String(selectedKec) : ''}
                                                onValueChange={(val) => {
                                                    setSelectedKec(val ? Number(val) : '');
                                                    setFormInputs(f => ({ ...f, desa_id: '' }));
                                                }}
                                            >
                                                <SelectTrigger className="flex h-9 w-full">
                                                    <SelectValue placeholder="Pilih Kecamatan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {kecamatans?.data?.map((kec: any) => (
                                                        <SelectItem key={kec.id} value={String(kec.id)}>
                                                            {kec.nama_kecamatan || kec.n_kec}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground">Desa *</label>
                                            <Select
                                                value={formInputs.desa_id ? String(formInputs.desa_id) : ''}
                                                onValueChange={(val) => setFormInputs(f => ({ ...f, desa_id: val }))}
                                                disabled={!selectedKec}
                                            >
                                                <SelectTrigger className="flex h-9 w-full">
                                                    <SelectValue placeholder="Pilih Desa" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {desas?.data?.map((desa: any) => (
                                                        <SelectItem key={desa.id} value={String(desa.id)}>
                                                            {desa.nama_desa || desa.n_desa}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground">Nama Unit SPAM</label>
                                            <input
                                                type="text"
                                                value={formInputs.name}
                                                onChange={(e) => setFormInputs(f => ({ ...f, name: e.target.value }))}
                                                placeholder="e.g. SPAM Bojongkaso"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            />
                                        </div>

                                        <div className="space-y-1 flex flex-col justify-end pb-1.5">
                                            <label className="flex items-center space-x-2 text-sm font-semibold cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formInputs.is_simspam}
                                                    onChange={(e) => setFormInputs(f => ({ ...f, is_simspam: e.target.checked }))}
                                                    className="rounded border-input text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                />
                                                <span>Terverifikasi SIMSPAM</span>
                                            </label>
                                        </div>
                                    </div>

                                    <hr className="my-2 border-slate-100" />
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Aspek Teknis & Finansial</h4>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground">Sistem Layanan</label>
                                            <input
                                                type="text"
                                                value={formInputs.sistem_layanan}
                                                onChange={(e) => setFormInputs(f => ({ ...f, sistem_layanan: e.target.value }))}
                                                placeholder="e.g. Gravitasi / Pompa"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground">Kap. Mata Air (l/s)</label>
                                            <input
                                                type="text"
                                                value={formInputs.sumber_mata_air_kap}
                                                onChange={(e) => setFormInputs(f => ({ ...f, sumber_mata_air_kap: e.target.value }))}
                                                placeholder="e.g. 3.5 l/s"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground">Kap. Air Tanah (l/s)</label>
                                            <input
                                                type="text"
                                                value={formInputs.sumber_air_tanah_kap}
                                                onChange={(e) => setFormInputs(f => ({ ...f, sumber_air_tanah_kap: e.target.value }))}
                                                placeholder="e.g. -"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <hr className="my-2 border-slate-100" />
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Pengelola (POKMAS)</h4>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground">Nama POKMAS</label>
                                            <input
                                                type="text"
                                                value={formInputs.pokmas}
                                                onChange={(e) => setFormInputs(f => ({ ...f, pokmas: e.target.value }))}
                                                placeholder="e.g. KPSPAM Bojongkaso"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground">SK Perdes</label>
                                            <input
                                                type="text"
                                                value={formInputs.perdes}
                                                onChange={(e) => setFormInputs(f => ({ ...f, perdes: e.target.value }))}
                                                placeholder="e.g. Perdes No 3 Tahun 2021"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground">Ketua / Kepala</label>
                                            <input
                                                type="text"
                                                value={formInputs.kepala}
                                                onChange={(e) => setFormInputs(f => ({ ...f, kepala: e.target.value }))}
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground">Bendahara</label>
                                            <input
                                                type="text"
                                                value={formInputs.bendahara}
                                                onChange={(e) => setFormInputs(f => ({ ...f, bendahara: e.target.value }))}
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground">Sekretaris</label>
                                            <input
                                                type="text"
                                                value={formInputs.sekretaris}
                                                onChange={(e) => setFormInputs(f => ({ ...f, sekretaris: e.target.value }))}
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Footer Buttons */}
                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        <button
                                            type="button"
                                            onClick={closeFormModal}
                                            className="inline-flex items-center justify-center rounded border px-4 py-2 text-sm font-medium hover:bg-slate-100"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createMutation.isPending || updateMutation.isPending}
                                            className="inline-flex items-center justify-center rounded bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {(createMutation.isPending || updateMutation.isPending) && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Simpan Unit SPAM
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
