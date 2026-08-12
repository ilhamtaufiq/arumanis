import React, { useState, useMemo, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';
import { getKecamatan } from '@/features/kecamatan/api/kecamatan';
import api from '@/lib/api-client';
import type { Kegiatan, KegiatanResponse } from '@/features/kegiatan/types';
import type { Kontrak } from '@/features/kontrak/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Eye, FileDown, ArrowUpDown, ArrowUp, ArrowDown, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/format';
import type { Tag } from '@/features/pekerjaan/types';
/** Show all grouped rows (single + consolidated), single only, or consolidated only. */
type KonsolidasiMode = 'all' | 'single' | 'consolidated';

type RekapPekerjaanItem = {
    id: number;
    nama_paket: string;
    pagu?: number;
    status?: string | null;
    progress_estimasi_fisik?: number | null;
    progress_estimasi_keuangan?: number | null;
    kecamatan?: { nama_kecamatan?: string };
    desa?: { nama_desa?: string };
    kegiatan?: { nama_sub_kegiatan?: string };
    /** Loaded when paginated (not unbounded). Used for konsolidasi grouping. */
    kontrak?: Kontrak[];
    tags?: Tag[];
};

type SortField = 'nama_paket' | 'progress_estimasi_fisik' | 'progress_estimasi_keuangan' | 'pagu' | 'nilai_kontrak';
type SortDir = 'asc' | 'desc';

type SortState = {
    field: SortField | null;
    dir: SortDir;
};

/** Paket dibatalkan tidak ikut rekap progres estimasi. */
function isActiveRekapItem(item: RekapPekerjaanItem): boolean {
    return item.status !== 'canceled';
}

/** Group pekerjaan by kontrak IDs: pekerjaan dengan kontrak sama = konsolidasi. */
function groupByKonsolidasi(list: RekapPekerjaanItem[]): RekapPekerjaanItem[][] {
    const kontrakToPekerjaan = new Map<string, RekapPekerjaanItem[]>()
    const processed = new Set<number>()

    for (const item of list) {
        if (processed.has(item.id)) continue
        const kontrakIds = (item.kontrak ?? []).map(k => k.id).sort()
        const key = kontrakIds.length > 0 ? kontrakIds.join('-') : null

        if (!key) {
            kontrakToPekerjaan.set(`single-${item.id}`, [item])
            processed.add(item.id)
            continue
        }

        const existing = kontrakToPekerjaan.get(key) ?? []
        existing.push(item)
        kontrakToPekerjaan.set(key, existing)
        processed.add(item.id)
    }

    return Array.from(kontrakToPekerjaan.values())
}

/** Total nilai kontrak paket; null bila belum ada kontrak bernilai. */
function getNilaiKontrak(item: RekapPekerjaanItem): number | null {
    const vals = (item.kontrak ?? [])
        .map((k) => k.nilai_kontrak)
        .filter((v): v is number => v != null);
    return vals.length ? vals.reduce((s, v) => s + v, 0) : null;
}

function compareRekapItems(a: RekapPekerjaanItem, b: RekapPekerjaanItem, field: SortField): number {
    if (field === 'nilai_kontrak') {
        const aVal = getNilaiKontrak(a);
        const bVal = getNilaiKontrak(b);
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        return aVal - bVal;
    }
    const aVal = a[field];
    const bVal = b[field];
    if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal);
    if (typeof aVal === 'number' && typeof bVal === 'number') return aVal - bVal;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    return 0;
}

const ProgressRow = React.memo(({ items, index }: { items: RekapPekerjaanItem[]; index: number }) => {
    const isKonsolidasi = items.length > 1;
    const primaryItem = items[0];
    const progress = primaryItem.progress_estimasi_fisik ?? 0;
    const keu = primaryItem.progress_estimasi_keuangan ?? 0;

    return (
        <TableRow>
            <TableCell className="text-center font-bold text-muted-foreground">{index}</TableCell>
            <TableCell>
                <div className="space-y-1">
                    {isKonsolidasi && (
                        <Badge variant="secondary" className="gap-1 mb-1">
                            <Link2 className="h-3 w-3" />
                            Konsolidasi ({items.length} paket)
                        </Badge>
                    )}
                    <div className="font-bold text-sm leading-tight">{primaryItem.nama_paket}</div>
                    {isKonsolidasi && items.length > 1 && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                            + {items.length - 1} paket lainnya
                        </div>
                    )}
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                        {primaryItem.kecamatan?.nama_kecamatan || '-'} • {primaryItem.desa?.nama_desa || '-'}
                    </div>
                    {primaryItem.kegiatan?.nama_sub_kegiatan ? (
                        <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1" title={primaryItem.kegiatan.nama_sub_kegiatan}>
                            {primaryItem.kegiatan.nama_sub_kegiatan}
                        </div>
                    ) : null}
                    {primaryItem.tags && primaryItem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {primaryItem.tags.map((tag) => (
                                <Badge key={tag.id} variant="outline" className="text-[10px] h-5 px-1.5" style={{ borderColor: tag.color, color: tag.color }}>
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
                {formatCurrency(primaryItem.pagu)}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
                {primaryItem.kontrak && primaryItem.kontrak.length > 0 ? (
                    <div className="space-y-0.5">
                        {primaryItem.kontrak.map((k) => (
                            <div key={k.id}>{formatCurrency(k.nilai_kontrak)}</div>
                        ))}
                    </div>
                ) : '-'}
            </TableCell>
            <TableCell className="text-center">
                {isKonsolidasi ? (
                    <Badge variant="secondary" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        {items.length} paket
                    </Badge>
                ) : '-'}
            </TableCell>
            <TableCell>
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                    <div className="flex justify-between items-center px-0.5">
                        <span className={`text-xs font-black ${
                            progress >= 100 ? 'text-green-600' :
                            progress >= 75 ? 'text-emerald-500' :
                            progress >= 50 ? 'text-amber-500' :
                            progress >= 25 ? 'text-orange-500' :
                            'text-rose-500'
                        }`}>
                            {progress.toFixed(2)}%
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Estimasi Fisik</span>
                    </div>
                    <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden border border-muted/5">
                        <div
                            className={`h-full transition-all duration-1000 ease-out rounded-full ${
                                progress >= 100 ? 'bg-green-600' :
                                progress >= 75 ? 'bg-emerald-500' :
                                progress >= 50 ? 'bg-amber-500' :
                                progress >= 25 ? 'bg-orange-500' :
                                'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                    <div className="flex justify-between items-center px-0.5">
                        <span className={`text-xs font-black ${
                            keu >= 100 ? 'text-green-600' :
                            keu >= 75 ? 'text-emerald-500' :
                            keu >= 50 ? 'text-amber-500' :
                            keu >= 25 ? 'text-orange-500' :
                            'text-rose-500'
                        }`}>
                            {keu.toFixed(2)}%
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Realisasi Keuangan</span>
                    </div>
                    <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden border border-muted/5">
                        <div
                            className={`h-full transition-all duration-1000 ease-out rounded-full ${
                                keu >= 100 ? 'bg-green-600' :
                                keu >= 75 ? 'bg-emerald-500' :
                                keu >= 50 ? 'bg-amber-500' :
                                keu >= 25 ? 'bg-orange-500' :
                                'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(keu, 100)}%` }}
                        />
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild className="h-8 rounded-full font-bold">
                    <Link to="/pekerjaan/$id" params={{ id: primaryItem.id.toString() }} search={{ tab: 'progress' }}>
                        <Eye className="mr-2 h-3.5 w-3.5" /> Detail
                    </Link>
                </Button>
            </TableCell>
        </TableRow>
    );
});

ProgressRow.displayName = 'ProgressRow';

export default function ProgressRekap() {
    const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
    const [selectedKegiatan, setSelectedKegiatan] = useState<string>('all');
    const [konsolidasiMode, setKonsolidasiMode] = useState<KonsolidasiMode>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sort, setSort] = useState<SortState>({ field: null, dir: 'asc' });
    const { tahunAnggaran } = useAppSettingsValues();

    const filterQueryOpts = {
        staleTime: 5 * 60_000,
        refetchOnWindowFocus: false,
    } as const;

    const { data: kecamatanRes } = useQuery({
        queryKey: ['kecamatan'],
        queryFn: () => getKecamatan(),
        ...filterQueryOpts,
    });
    const kecamatanList = kecamatanRes?.data || [];

    const { data: kegiatanRes } = useQuery({
        queryKey: ['kegiatan', { tahun: tahunAnggaran }],
        queryFn: () =>
            api.get<KegiatanResponse>('/kegiatan', {
                params: { tahun: tahunAnggaran, per_page: -1 },
            }),
        enabled: !!tahunAnggaran,
        ...filterQueryOpts,
    });
    const kegiatanList = kegiatanRes?.data || [];

    const filters = useMemo(() => ({
        page: currentPage,
        kecamatan_id: selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan),
        kegiatan_id: selectedKegiatan === 'all' ? undefined : parseInt(selectedKegiatan),
        search: debouncedSearch || undefined,
        tahun: tahunAnggaran,
        summary: true as const,
        // Exclude paket dibatalkan (canceled) dari rekap estimasi.
        status: 'active' as const,
    }), [currentPage, selectedKecamatan, selectedKegiatan, debouncedSearch, tahunAnggaran]);

    const { data: pekerjaanRes, isLoading: loading } = useQuery({
        queryKey: ['pekerjaan-rekap', filters],
        queryFn: () => getPekerjaan(filters),
        enabled: !!tahunAnggaran,
    });
    
    // API filter status=active; guard FE bila status masih ikut terkirim.
    const pekerjaanList = useMemo(
        () => ((pekerjaanRes?.data || []) as RekapPekerjaanItem[]).filter(isActiveRekapItem),
        [pekerjaanRes?.data],
    )
    
    const sortedList = useMemo(() => {
        if (!sort.field) return pekerjaanList
        return [...pekerjaanList].sort((a, b) => {
            const cmp = compareRekapItems(a, b, sort.field!)
            return sort.dir === 'asc' ? cmp : -cmp
        })
    }, [pekerjaanList, sort])

    /** Group pekerjaan by kontrak IDs: pekerjaan dengan kontrak sama = konsolidasi. */
    const groupedList = useMemo(
        () => groupByKonsolidasi(sortedList).filter((items) =>
            konsolidasiMode === 'all' ? true
            : konsolidasiMode === 'single' ? items.length === 1
            : items.length > 1
        ),
        [sortedList, konsolidasiMode]
    )

    const handleSort = useCallback((field: SortField) => {
        setSort(prev => ({
            field,
            dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc',
        }))
        setCurrentPage(1)
    }, [])

    const sortIcon = (field: SortField) => {
        if (sort.field !== field) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-40" />
        return sort.dir === 'asc' 
            ? <ArrowUp className="ml-2 h-3 w-3" /> 
            : <ArrowDown className="ml-2 h-3 w-3" />
    }
    const totalPages = pekerjaanRes?.meta?.last_page || 1;

    const handleExportExcel = useCallback(async () => {
        try {
            // Get all data without pagination for export (tanpa paket canceled)
            const allDataRes = await getPekerjaan({
                kecamatan_id: selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan),
                kegiatan_id: selectedKegiatan === 'all' ? undefined : parseInt(selectedKegiatan),
                search: debouncedSearch || undefined,
                tahun: tahunAnggaran,
                per_page: -1,
                summary: true,
                status: 'active',
            });

            const rows = (allDataRes.data as RekapPekerjaanItem[]).filter(isActiveRekapItem);
            const sortedExport = (() => {
                if (!sort.field) return rows
                return [...rows].sort((a, b) => {
                    const cmp = compareRekapItems(a, b, sort.field!)
                    return sort.dir === 'asc' ? cmp : -cmp
                })
            })()
            // Group konsolidasi jadi 1 baris (kontrak sama = konsolidasi).
            const groups = groupByKonsolidasi(sortedExport);
            const dataToExport = groups.map((items, index: number) => {
                const primary = items[0];
                const isKonsolidasi = items.length > 1;
                // Kontrak bersama di-dedupe by id agar tidak double count.
                const kontrakMap = new Map<number, number | null>();
                for (const item of items) for (const k of item.kontrak ?? []) kontrakMap.set(k.id, k.nilai_kontrak);
                const kontrakVals = [...kontrakMap.values()].filter((v): v is number => v != null);
                const totalKontrak = kontrakVals.length ? kontrakVals.reduce((s, v) => s + v, 0) : null;
                return {
                    'No': index + 1,
                    'Nama Paket Pekerjaan': isKonsolidasi
                        ? `${items.map(i => i.nama_paket).join(', ')} (Konsolidasi ${items.length} paket)`
                        : primary.nama_paket,
                    'Sub Kegiatan': primary.kegiatan?.nama_sub_kegiatan || '-',
                    'Kecamatan': primary.kecamatan?.nama_kecamatan || '-',
                    'Desa': primary.desa?.nama_desa || '-',
                    'Pagu (Rp)': items.reduce((s, i) => s + (i.pagu ?? 0), 0),
                    'Nilai Kontrak (Rp)': totalKontrak,
                    'Tags': (primary.tags ?? []).map(t => t.name).join(', ') || '-',
                    'Estimasi Fisik (%)': primary.progress_estimasi_fisik ?? 0,
                    'Realisasi Keuangan (%)': primary.progress_estimasi_keuangan ?? 0,
                };
            });

            const XLSX = await import('xlsx')
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Progress');

            // Adjust column widths
            const wscols = [
                { wch: 5 },  // No
                { wch: 60 }, // Nama Paket
                { wch: 40 }, // Sub Kegiatan
                { wch: 20 }, // Kecamatan
                { wch: 20 }, // Desa
                { wch: 18 }, // Pagu
                { wch: 18 }, // Nilai Kontrak
                { wch: 25 }, // Tags
                { wch: 15 }, // Estimasi Fisik
                { wch: 18 }, // Realisasi Keuangan
            ];
            worksheet['!cols'] = wscols;

            XLSX.writeFile(workbook, `Rekap_Progress_${tahunAnggaran}_${new Date().getTime()}.xlsx`);
            
            toast.success("Data rekap progress telah diekspor ke Excel.");
        } catch (error) {
            console.error('Export error:', error);
            toast.error("Terjadi kesalahan saat mengekspor data.");
        }
    }, [selectedKecamatan, selectedKegiatan, debouncedSearch, tahunAnggaran]);

    const renderPagination = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
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
                                if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                                        setCurrentPage(p as number);
                                    }}
                                    isActive={currentPage === p}
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
                                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    return (
        <>
            <Header />
            <Main>
                <div className="mb-6">
                    <h1 className="text-2xl font-black tracking-tight">Rekap Progres Estimasi</h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        Ringkasan realisasi progress estimasi fisik per pekerjaan (sumber sama dengan tab Progress).
                        Paket dibatalkan (canceled) tidak ditampilkan.
                    </p>
                </div>

                <Card className="border-none shadow-xl bg-background/60 backdrop-blur-md">
                    <CardHeader className="space-y-3 pb-4">
                        {/*
                          Filter bar: grid so long "Sub Kegiatan" labels never force horizontal overflow.
                          SelectTrigger defaults to w-fit + nowrap — override with w-full min-w-0 + truncate.
                        */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12 xl:items-end">
                            <div className="flex min-w-0 flex-col gap-1 sm:col-span-2 xl:col-span-3">
                                <span className="ml-1 text-[10px] font-black uppercase text-muted-foreground">
                                    Cari Pekerjaan
                                </span>
                                <SearchInput
                                    defaultValue={debouncedSearch}
                                    onSearch={setDebouncedSearch}
                                />
                            </div>

                            <div className="flex min-w-0 flex-col gap-1 xl:col-span-2">
                                <span className="ml-1 text-[10px] font-black uppercase text-muted-foreground">
                                    Kecamatan
                                </span>
                                <Select
                                    value={selectedKecamatan}
                                    onValueChange={(value) => {
                                        setSelectedKecamatan(value)
                                        setCurrentPage(1)
                                    }}
                                >
                                    <SelectTrigger className="h-10 w-full min-w-0 rounded-xl border-muted/20 whitespace-normal">
                                        <SelectValue placeholder="Semua Kecamatan" />
                                    </SelectTrigger>
                                    <SelectContent
                                        position="popper"
                                        className="max-w-[min(100vw-2rem,24rem)]"
                                    >
                                        <SelectItem value="all">Semua Kecamatan</SelectItem>
                                        {kecamatanList.map((kec) => (
                                            <SelectItem key={kec.id} value={kec.id.toString()}>
                                                {kec.nama_kecamatan}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex min-w-0 flex-col gap-1 sm:col-span-2 xl:col-span-3">
                                <span className="ml-1 text-[10px] font-black uppercase text-muted-foreground">
                                    Sub Kegiatan
                                </span>
                                <Select
                                    value={selectedKegiatan}
                                    onValueChange={(value) => {
                                        setSelectedKegiatan(value)
                                        setCurrentPage(1)
                                    }}
                                >
                                    <SelectTrigger
                                        className="h-auto min-h-10 w-full min-w-0 rounded-xl border-muted/20 py-2 whitespace-normal *:data-[slot=select-value]:line-clamp-2 *:data-[slot=select-value]:whitespace-normal *:data-[slot=select-value]:break-words *:data-[slot=select-value]:text-left"
                                        title={
                                            selectedKegiatan === 'all'
                                                ? 'Semua Sub Kegiatan'
                                                : kegiatanList.find((k) => k.id.toString() === selectedKegiatan)
                                                      ?.nama_sub_kegiatan
                                        }
                                    >
                                        <SelectValue placeholder="Semua Sub Kegiatan" />
                                    </SelectTrigger>
                                    <SelectContent
                                        position="popper"
                                        align="start"
                                        className="w-[var(--radix-select-trigger-width)] max-w-[min(100vw-2rem,36rem)]"
                                    >
                                        <SelectItem value="all">Semua Sub Kegiatan</SelectItem>
                                        {kegiatanList.map((keg: Kegiatan) => (
                                            <SelectItem
                                                key={keg.id}
                                                value={keg.id.toString()}
                                                className="items-start whitespace-normal py-2"
                                                title={keg.nama_sub_kegiatan}
                                            >
                                                <span className="line-clamp-3 text-left leading-snug">
                                                    {keg.nama_sub_kegiatan}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex min-w-0 flex-col gap-1 sm:col-span-2 xl:col-span-2">
                                <span className="ml-1 text-[10px] font-black uppercase text-muted-foreground">
                                    Konsolidasi
                                </span>
                                <Select
                                    value={konsolidasiMode}
                                    onValueChange={(value) => {
                                        setKonsolidasiMode(value as KonsolidasiMode)
                                        setCurrentPage(1)
                                    }}
                                >
                                    <SelectTrigger className="h-10 w-full min-w-0 rounded-xl border-muted/20 whitespace-normal">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="max-w-[min(100vw-2rem,20rem)]">
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="single">Single saja</SelectItem>
                                        <SelectItem value="consolidated">Konsolidasi saja</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex min-w-0 flex-col gap-1 sm:col-span-2 xl:col-span-2">
                                <span className="ml-1 hidden text-[10px] font-black uppercase text-muted-foreground xl:block">
                                    &nbsp;
                                </span>
                                <Button
                                    variant="outline"
                                    className="h-10 w-full rounded-xl border-green-200 bg-green-50 font-bold text-green-700 hover:bg-green-100 hover:text-green-800"
                                    onClick={handleExportExcel}
                                    disabled={loading || pekerjaanList.length === 0}
                                >
                                    <FileDown className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">Ekspor Excel</span>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <TableSkeleton columns={8} rows={10} />
                        ) : pekerjaanList.length === 0 ? (
                            <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-muted">
                                <p className="text-muted-foreground font-medium italic">Tidak ada data pekerjaan yang ditemukan.</p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-muted/10 overflow-hidden bg-background/40">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="w-[60px] text-center font-black uppercase text-[10px]">No</TableHead>
                                            <TableHead className="font-black uppercase text-[10px] cursor-pointer select-none hover:text-primary" onClick={() => handleSort('nama_paket')}>
                                                Pekerjaan
                                                {sortIcon('nama_paket')}
                                            </TableHead>
                                            <TableHead className="text-right font-black uppercase text-[10px] cursor-pointer select-none hover:text-primary" onClick={() => handleSort('pagu')}>
                                                Pagu
                                                {sortIcon('pagu')}
                                            </TableHead>
                                            <TableHead className="text-right font-black uppercase text-[10px] cursor-pointer select-none hover:text-primary" onClick={() => handleSort('nilai_kontrak')}>
                                                Nilai Kontrak
                                                {sortIcon('nilai_kontrak')}
                                            </TableHead>
                                            <TableHead className="text-center font-black uppercase text-[10px]">
                                                Konsolidasi
                                            </TableHead>
                                            <TableHead className="font-black uppercase text-[10px] cursor-pointer select-none hover:text-primary" onClick={() => handleSort('progress_estimasi_fisik')}>
                                                Estimasi Fisik
                                                {sortIcon('progress_estimasi_fisik')}
                                            </TableHead>
                                            <TableHead className="font-black uppercase text-[10px] cursor-pointer select-none hover:text-primary" onClick={() => handleSort('progress_estimasi_keuangan')}>
                                                Realisasi Keuangan
                                                {sortIcon('progress_estimasi_keuangan')}
                                            </TableHead>
                                            <TableHead className="text-right font-black uppercase text-[10px]">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groupedList.map((items, idx) => (
                                            <ProgressRow
                                                key={items[0].id}
                                                items={items}
                                                index={(currentPage - 1) * 20 + idx + 1}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center border-t py-4">
                        {totalPages > 1 && renderPagination()}
                    </CardFooter>
                </Card>
            </Main>
        </>
    );
}
