import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Check, ClipboardCheck, FileSignature, RefreshCw, Search, Settings2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination'
import PageContainer from '@/components/layout/page-container'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useKegiatanList } from '@/features/kegiatan/hooks/useKegiatan'
import AddColumnDialog from '@/features/checklist/components/AddColumnDialog'
import EditColumnDialog from '@/features/checklist/components/EditColumnDialog'
import {
    usePostPekerjaanColumns,
    usePostPekerjaanList,
    useTogglePostPekerjaanChecklist,
} from '../hooks/usePostPekerjaan'

const ITEMS_PER_PAGE = 20

export default function PostPekerjaanPage() {
    const { tahunAnggaran } = useAppSettingsValues()

    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [kegiatanId, setKegiatanId] = useState<number | undefined>()
    const [currentPage, setCurrentPage] = useState(1)

    const { data: kegiatanRes } = useKegiatanList({ tahun: tahunAnggaran }, !!tahunAnggaran)
    const kegiatanList = kegiatanRes?.data ?? []

    const listParams = useMemo(
        () => ({
            tahun: tahunAnggaran,
            kegiatan_id: kegiatanId,
            search: debouncedSearch || undefined,
            page: currentPage,
            per_page: ITEMS_PER_PAGE,
        }),
        [tahunAnggaran, kegiatanId, debouncedSearch, currentPage],
    )

    const {
        data: listData,
        isLoading,
        isError,
        refetch: refetchList,
    } = usePostPekerjaanList(listParams, !!tahunAnggaran)

    const { data: columnsData, refetch: refetchColumns } = usePostPekerjaanColumns()
    const toggleMutation = useTogglePostPekerjaanChecklist()

    const columns = columnsData?.data ?? []
    const rows = listData?.data ?? []
    const totalPages = listData?.meta?.last_page ?? 1
    const totalItems = listData?.meta?.total ?? 0

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch, kegiatanId, tahunAnggaran])

    useEffect(() => {
        if (isError) {
            toast.error('Gagal memuat data post pekerjaan')
        }
    }, [isError])

    const handleRefresh = () => {
        refetchList()
        refetchColumns()
    }

    const handleToggle = (pekerjaanId: number, checklistItemId: number, currentValue: boolean) => {
        toggleMutation.mutate(
            {
                pekerjaan_id: pekerjaanId,
                checklist_item_id: checklistItemId,
                is_checked: !currentValue,
            },
            {
                onSuccess: () => {
                    toast.success(!currentValue ? 'Ditandai selesai' : 'Tanda dihapus')
                },
                onError: () => {
                    toast.error('Gagal mengubah status checklist')
                },
            },
        )
    }

    const completedCount = rows.filter((row) =>
        columns.length > 0 && columns.every((col) => row.checklist[col.id]?.is_checked),
    ).length

    const renderPagination = () => {
        const pages: (number | string)[] = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 3; i++) pages.push(i)
            pages.push('ellipsis', totalPages)
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, 'ellipsis')
            for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages)
        }

        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                if (currentPage > 1) setCurrentPage(currentPage - 1)
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                    {pages.map((page, index) => (
                        <PaginationItem key={index}>
                            {page === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setCurrentPage(page as number)
                                    }}
                                    isActive={currentPage === page}
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )
    }

    return (
        <PageContainer>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                            <ClipboardCheck className="h-8 w-8 text-primary" />
                            Post Pekerjaan
                        </h1>
                        <p className="text-muted-foreground">
                            Checklist pekerjaan yang sudah berkontrak — kelola kolom dan lacak penyelesaian post-kontrak
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <AddColumnDialog
                            context="post_pekerjaan"
                            title="Tambah Kolom Post Pekerjaan"
                            helperText="Kolom baru hanya berlaku untuk pekerjaan yang sudah memiliki kontrak."
                            onSuccess={handleRefresh}
                        />
                        <Button variant="outline" size="icon" onClick={handleRefresh} aria-label="Segarkan">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari nama paket, SPK, atau nomor penawaran..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select
                                value={kegiatanId?.toString() || 'all'}
                                onValueChange={(val) => setKegiatanId(val === 'all' ? undefined : parseInt(val))}
                            >
                                <SelectTrigger className="w-full md:w-[300px]">
                                    <SelectValue placeholder="Semua Kegiatan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kegiatan</SelectItem>
                                    {kegiatanList.map((k) => (
                                        <SelectItem key={k.id} value={k.id.toString()}>
                                            {k.nama_sub_kegiatan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {!isLoading && rows.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                                        <FileSignature className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pekerjaan Berkontrak</p>
                                        <p className="text-2xl font-bold tabular-nums">{totalItems}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Checklist Lengkap</p>
                                        <p className="text-2xl font-bold tabular-nums">{completedCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900">
                                        <X className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Belum Lengkap</p>
                                        <p className="text-2xl font-bold tabular-nums">{rows.length - completedCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Settings2 className="h-5 w-5" />
                                Tabel Post Pekerjaan
                            </CardTitle>
                            <p className="text-sm text-muted-foreground tabular-nums">
                                Total {totalItems} pekerjaan berkontrak
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : columns.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <p>Belum ada kolom checklist post pekerjaan.</p>
                                <p className="text-sm">Klik &quot;Tambah Kolom&quot; untuk membuat kolom baru.</p>
                            </div>
                        ) : rows.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <p>Tidak ada pekerjaan berkontrak untuk filter ini.</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="sticky left-0 z-10 min-w-[260px] bg-background">
                                                    Nama Paket
                                                </TableHead>
                                                <TableHead className="min-w-[220px]">Kontrak</TableHead>
                                                {columns.map((col) => (
                                                    <TableHead key={col.id} className="group min-w-[120px] text-center">
                                                        <div className="flex items-center justify-center">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span className="cursor-help">{col.name}</span>
                                                                    </TooltipTrigger>
                                                                    {col.description && (
                                                                        <TooltipContent>
                                                                            <p>{col.description}</p>
                                                                        </TooltipContent>
                                                                    )}
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                            <EditColumnDialog column={col} onSuccess={handleRefresh} />
                                                        </div>
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rows.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell className="sticky left-0 z-10 bg-background font-medium">
                                                        <div>
                                                            <Link
                                                                to="/pekerjaan/$id"
                                                                params={{ id: String(row.id) }}
                                                                className="hover:text-primary hover:underline"
                                                            >
                                                                {row.nama_paket}
                                                            </Link>
                                                            {row.kegiatan && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {row.kegiatan.nama_sub_kegiatan}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.kontrak ? (
                                                            <div className="space-y-1 text-sm">
                                                                <p className="font-medium">
                                                                    {row.kontrak.spk || row.kontrak.nomor_penawaran || `Kontrak #${row.kontrak.id}`}
                                                                </p>
                                                                {row.kontrak.penyedia && (
                                                                    <p className="text-xs text-muted-foreground">{row.kontrak.penyedia}</p>
                                                                )}
                                                                {row.kontrak.kode_paket && (
                                                                    <Badge variant="outline" className="text-[10px]">
                                                                        {row.kontrak.kode_paket}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </TableCell>
                                                    {columns.map((col) => {
                                                        const status = row.checklist[col.id]
                                                        const isToggling =
                                                            toggleMutation.isPending &&
                                                            toggleMutation.variables?.pekerjaan_id === row.id &&
                                                            toggleMutation.variables?.checklist_item_id === col.id
                                                        const isChecked = status?.is_checked || false

                                                        return (
                                                            <TableCell key={col.id} className="text-center">
                                                                <div className="flex items-center justify-center">
                                                                    {isToggling ? (
                                                                        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                                                                    ) : (
                                                                        <Checkbox
                                                                            checked={isChecked}
                                                                            onCheckedChange={() =>
                                                                                handleToggle(row.id, col.id, isChecked)
                                                                            }
                                                                            className={isChecked ? 'border-green-500 bg-green-500' : ''}
                                                                        />
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        )
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-4 flex justify-end">{renderPagination()}</div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    )
}