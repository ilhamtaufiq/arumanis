import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Check, X, RefreshCw, Search, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import PageContainer from '@/components/layout/page-container';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { useKegiatanList } from '@/features/kegiatan/hooks/useKegiatan';
import {
    useChecklistItems,
    usePekerjaanChecklist,
    useToggleChecklist,
} from '../hooks/useChecklist';
import AddColumnDialog from './AddColumnDialog';
import EditColumnDialog from './EditColumnDialog';

const ITEMS_PER_PAGE = 20;

export default function ChecklistPage() {
    const { tahunAnggaran } = useAppSettingsValues();

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [kegiatanId, setKegiatanId] = useState<number | undefined>();
    const [currentPage, setCurrentPage] = useState(1);

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

    const {
        data: checklistData,
        isLoading,
        isError,
        refetch: refetchChecklist,
    } = usePekerjaanChecklist(checklistParams, !!tahunAnggaran);

    const { data: columnsData, refetch: refetchColumns } = useChecklistItems();
    const toggleMutation = useToggleChecklist();

    const columns = columnsData?.data ?? [];
    const data = checklistData?.data ?? [];
    const totalPages = checklistData?.meta?.last_page ?? 1;
    const totalItems = checklistData?.meta?.total ?? 0;

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, kegiatanId, tahunAnggaran]);

    useEffect(() => {
        if (isError) {
            toast.error('Gagal memuat data checklist');
        }
    }, [isError]);

    const handleRefresh = () => {
        refetchChecklist();
        refetchColumns();
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const renderPagination = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 3; i++) pages.push(i);
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('ellipsis');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }

        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) {
                                    handlePageChange(currentPage - 1);
                                }
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
                                        e.preventDefault();
                                        handlePageChange(page as number);
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
                                e.preventDefault();
                                if (currentPage < totalPages) {
                                    handlePageChange(currentPage + 1);
                                }
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                            Lacak progress checklist untuk setiap pekerjaan
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                                                <TableHead className="sticky left-0 bg-background min-w-[300px]">
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

                                                        return (
                                                            <TableCell key={col.id} className="text-center">
                                                                <div className="flex items-center justify-center">
                                                                    {isToggling ? (
                                                                        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                                                                    ) : (
                                                                        <Checkbox
                                                                            checked={isChecked}
                                                                            onCheckedChange={() =>
                                                                                handleToggle(pekerjaan.id, col.id, isChecked)
                                                                            }
                                                                            className={isChecked ? 'bg-green-500 border-green-500' : ''}
                                                                        />
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-4 flex justify-end">
                                        {renderPagination()}
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