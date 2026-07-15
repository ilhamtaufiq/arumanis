import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
    Check,
    X,
    RefreshCw,
    Search,
    Settings2,
    FileSpreadsheet,
    FileText,
    History,
    Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PageContainer from '@/components/layout/page-container';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { useKegiatanList } from '@/features/kegiatan/hooks/useKegiatan';
import {
    useChecklistHistory,
    useChecklistItems,
    useExportChecklistExcel,
    useExportChecklistPdf,
    usePekerjaanChecklist,
    useToggleChecklist,
} from '../hooks/useChecklist';
import AddColumnDialog from './AddColumnDialog';
import EditColumnDialog from './EditColumnDialog';

const ITEMS_PER_PAGE = 20;
const HISTORY_PER_PAGE = 15;

function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

function formatDateTime(value?: string | null) {
    if (!value) return '-';
    try {
        return new Date(value).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return value;
    }
}

export default function ChecklistPage() {
    const { tahunAnggaran } = useAppSettingsValues();

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [kegiatanId, setKegiatanId] = useState<number | undefined>();
    const [currentPage, setCurrentPage] = useState(1);
    const [historyPage, setHistoryPage] = useState(1);
    const [historySearch, setHistorySearch] = useState('');
    const [debouncedHistorySearch, setDebouncedHistorySearch] = useState('');

    const { data: kegiatanRes } = useKegiatanList({ tahun: tahunAnggaran }, !!tahunAnggaran);
    const kegiatanList = kegiatanRes?.data ?? [];

    const checklistParams = useMemo(
        () => ({
            tahun: tahunAnggaran,
            kegiatan_id: kegiatanId,
            search: debouncedSearch || undefined,
            page: currentPage,
            per_page: ITEMS_PER_PAGE,
        }),
        [tahunAnggaran, kegiatanId, debouncedSearch, currentPage],
    );

    const exportParams = useMemo(
        () => ({
            tahun: tahunAnggaran,
            kegiatan_id: kegiatanId,
            search: debouncedSearch || undefined,
        }),
        [tahunAnggaran, kegiatanId, debouncedSearch],
    );

    const historyParams = useMemo(
        () => ({
            tahun: tahunAnggaran,
            search: debouncedHistorySearch || undefined,
            page: historyPage,
            per_page: HISTORY_PER_PAGE,
        }),
        [tahunAnggaran, debouncedHistorySearch, historyPage],
    );

    const {
        data: checklistData,
        isLoading,
        isError,
        refetch: refetchChecklist,
    } = usePekerjaanChecklist(checklistParams, !!tahunAnggaran);

    const {
        data: historyData,
        isLoading: historyLoading,
        isError: historyError,
        refetch: refetchHistory,
    } = useChecklistHistory(historyParams, !!tahunAnggaran);

    const { data: columnsData, refetch: refetchColumns } = useChecklistItems();
    const toggleMutation = useToggleChecklist();
    const exportExcelMutation = useExportChecklistExcel();
    const exportPdfMutation = useExportChecklistPdf();

    const columns = columnsData?.data ?? [];
    const data = checklistData?.data ?? [];
    const totalPages = checklistData?.meta?.last_page ?? 1;
    const totalItems = checklistData?.meta?.total ?? 0;

    const historyItems = historyData?.data ?? [];
    const historyTotalPages = historyData?.meta?.last_page ?? 1;
    const historyTotal = historyData?.meta?.total ?? 0;

    const isExporting = exportExcelMutation.isPending || exportPdfMutation.isPending;

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedHistorySearch(historySearch), 500);
        return () => clearTimeout(timer);
    }, [historySearch]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, kegiatanId, tahunAnggaran]);

    useEffect(() => {
        setHistoryPage(1);
    }, [debouncedHistorySearch, tahunAnggaran]);

    useEffect(() => {
        if (isError) {
            toast.error('Gagal memuat data checklist');
        }
    }, [isError]);

    useEffect(() => {
        if (historyError) {
            toast.error('Gagal memuat history checklist');
        }
    }, [historyError]);

    const handleRefresh = () => {
        refetchChecklist();
        refetchColumns();
        refetchHistory();
    };

    const handleToggle = (pekerjaanId: number, checklistItemId: number, currentValue: boolean) => {
        toggleMutation.mutate(
            {
                pekerjaan_id: pekerjaanId,
                checklist_item_id: checklistItemId,
                is_checked: !currentValue,
            },
            {
                onSuccess: () => {
                    toast.success(!currentValue ? 'Ditandai selesai' : 'Tanda dihapus');
                },
                onError: () => {
                    toast.error('Gagal mengubah status checklist');
                },
            },
        );
    };

    const handleExportExcel = async () => {
        try {
            const blob = await exportExcelMutation.mutateAsync(exportParams);
            downloadBlob(blob, `checklist_pekerjaan_${tahunAnggaran || 'all'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
            toast.success('Export Excel berhasil');
        } catch {
            toast.error('Gagal export Excel');
        }
    };

    const handleExportPdf = async () => {
        try {
            const blob = await exportPdfMutation.mutateAsync(exportParams);
            downloadBlob(blob, `checklist_pekerjaan_${tahunAnggaran || 'all'}_${new Date().toISOString().slice(0, 10)}.pdf`);
            toast.success('Export PDF berhasil');
        } catch {
            toast.error('Gagal export PDF');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const renderPagination = (
        page: number,
        pagesTotal: number,
        onChange: (p: number) => void,
    ) => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (pagesTotal <= maxVisiblePages) {
            for (let i = 1; i <= pagesTotal; i++) {
                pages.push(i);
            }
        } else if (page <= 3) {
            for (let i = 1; i <= 3; i++) pages.push(i);
            pages.push('ellipsis');
            pages.push(pagesTotal);
        } else if (page >= pagesTotal - 2) {
            pages.push(1);
            pages.push('ellipsis');
            for (let i = pagesTotal - 2; i <= pagesTotal; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('ellipsis');
            pages.push(page - 1);
            pages.push(page);
            pages.push(page + 1);
            pages.push('ellipsis');
            pages.push(pagesTotal);
        }

        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (page > 1) onChange(page - 1);
                            }}
                            className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>

                    {pages.map((p, index) => (
                        <PaginationItem key={index}>
                            {p === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onChange(p as number);
                                    }}
                                    isActive={page === p}
                                >
                                    {p}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (page < pagesTotal) onChange(page + 1);
                            }}
                            className={page === pagesTotal ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    return (
        <PageContainer>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Checklist Pekerjaan</h1>
                        <p className="text-muted-foreground">
                            Lacak progress checklist, tanggal update, dan history perubahan
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" disabled={isExporting}>
                                    {isExporting ? (
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="mr-2 h-4 w-4" />
                                    )}
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleExportExcel} disabled={exportExcelMutation.isPending}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                                    Export Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportPdf} disabled={exportPdfMutation.isPending}>
                                    <FileText className="mr-2 h-4 w-4 text-red-600" />
                                    Export PDF
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AddColumnDialog onSuccess={handleRefresh} />
                        <Button variant="outline" size="icon" onClick={handleRefresh}>
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
                                        placeholder="Cari nama paket..."
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

                {!isLoading && data.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                                        <Settings2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Pekerjaan</p>
                                        <p className="text-2xl font-bold">{totalItems}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Semua Checklist Selesai</p>
                                        <p className="text-2xl font-bold">
                                            {data.filter((p) =>
                                                columns.every((col) => p.checklist[col.id]?.is_checked),
                                            ).length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                                        <X className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Belum Lengkap</p>
                                        <p className="text-2xl font-bold">
                                            {data.filter((p) =>
                                                !columns.every((col) => p.checklist[col.id]?.is_checked),
                                            ).length}
                                        </p>
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
                                Tabel Checklist
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Total {totalItems} pekerjaan
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : columns.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Belum ada kolom checklist.</p>
                                <p className="text-sm">Klik "Tambah Kolom" untuk membuat kolom baru.</p>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Tidak ada data pekerjaan.</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="sticky left-0 bg-background min-w-[280px]">
                                                    Nama Paket
                                                </TableHead>
                                                {columns.map((col) => (
                                                    <TableHead key={col.id} className="text-center min-w-[120px] group">
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
                                                <TableHead className="min-w-[180px]">Terakhir Diubah</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.map((pekerjaan) => (
                                                <TableRow key={pekerjaan.id}>
                                                    <TableCell className="sticky left-0 bg-background font-medium">
                                                        <div>
                                                            <p>{pekerjaan.nama_paket}</p>
                                                            {pekerjaan.kegiatan && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {pekerjaan.kegiatan.nama_sub_kegiatan}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    {columns.map((col) => {
                                                        const status = pekerjaan.checklist[col.id];
                                                        const isToggling =
                                                            toggleMutation.isPending &&
                                                            toggleMutation.variables?.pekerjaan_id === pekerjaan.id &&
                                                            toggleMutation.variables?.checklist_item_id === col.id;
                                                        const isChecked = status?.is_checked || false;
                                                        const updatedAt = status?.updated_at || status?.checked_at;
                                                        const updatedBy = status?.checked_by_name;

                                                        return (
                                                            <TableCell key={col.id} className="text-center">
                                                                <div className="flex flex-col items-center justify-center gap-1">
                                                                    {isToggling ? (
                                                                        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                                                                    ) : (
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <span className="inline-flex">
                                                                                        <Checkbox
                                                                                            checked={isChecked}
                                                                                            onCheckedChange={() =>
                                                                                                handleToggle(
                                                                                                    pekerjaan.id,
                                                                                                    col.id,
                                                                                                    isChecked,
                                                                                                )
                                                                                            }
                                                                                            className={
                                                                                                isChecked
                                                                                                    ? 'bg-green-500 border-green-500'
                                                                                                    : ''
                                                                                            }
                                                                                        />
                                                                                    </span>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent className="max-w-xs text-left">
                                                                                    <p className="font-medium">
                                                                                        {isChecked ? 'Sudah dicentang' : 'Belum dicentang'}
                                                                                    </p>
                                                                                    <p className="text-xs opacity-90">
                                                                                        Update: {formatDateTime(updatedAt)}
                                                                                    </p>
                                                                                    <p className="text-xs opacity-90">
                                                                                        Oleh: {updatedBy || '-'}
                                                                                    </p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    )}
                                                                    {updatedAt && (
                                                                        <span className="text-[10px] leading-tight text-muted-foreground whitespace-nowrap">
                                                                            {formatDateTime(updatedAt)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell>
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm">
                                                                {formatDateTime(pekerjaan.last_updated_at)}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {pekerjaan.last_updated_by_name || '-'}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-4 flex justify-end">
                                        {renderPagination(currentPage, totalPages, handlePageChange)}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                History Perubahan
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {historyTotal} entri
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari paket, kolom, atau nama user..."
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {historyLoading ? (
                            <div className="flex items-center justify-center py-10">
                                <RefreshCw className="h-7 w-7 animate-spin text-muted-foreground" />
                            </div>
                        ) : historyItems.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>Belum ada history perubahan checklist.</p>
                                <p className="text-sm">Perubahan akan tercatat setiap kali checkbox diubah.</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[160px]">Waktu</TableHead>
                                                <TableHead className="min-w-[220px]">Pekerjaan</TableHead>
                                                <TableHead className="min-w-[140px]">Kolom Checklist</TableHead>
                                                <TableHead className="min-w-[100px]">Status</TableHead>
                                                <TableHead className="min-w-[160px]">Diubah Oleh</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {historyItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="whitespace-nowrap text-sm">
                                                        {formatDateTime(item.created_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium text-sm">{item.pekerjaan_nama || '-'}</p>
                                                            {item.kegiatan && (
                                                                <p className="text-xs text-muted-foreground">{item.kegiatan}</p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {item.checklist_item_name || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.is_checked ? (
                                                            <Badge className="bg-green-600 hover:bg-green-600">Dicentang</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Dibatalkan</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="text-sm font-medium">{item.user_name || '-'}</p>
                                                            {item.user_email && (
                                                                <p className="text-xs text-muted-foreground">{item.user_email}</p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {historyTotalPages > 1 && (
                                    <div className="flex justify-end">
                                        {renderPagination(historyPage, historyTotalPages, setHistoryPage)}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}
