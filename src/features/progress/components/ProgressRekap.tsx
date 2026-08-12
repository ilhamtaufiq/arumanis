import React, { useState, useMemo, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';
import { getKecamatan } from '@/features/kecamatan/api/kecamatan';
import { getTags } from '@/features/pekerjaan/api/tags';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Eye, FileDown, FileText, ArrowUpDown, ArrowUp, ArrowDown, Link2, Package, Wallet, FileSignature } from 'lucide-react';
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

/** Tag names to surface in filter dropdown (case-insensitive match). */
const REKAP_TAG_NAMES = ['rembug warga', 'pokir'] as const;

const isCanceled = (item: RekapPekerjaanItem) => item.status === 'canceled';

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
    // Konsolidasi: pagu dijumlah, kontrak dedupe by id (kontrak bersama).
    const totalPagu = items.reduce((s, i) => s + (i.pagu ?? 0), 0);
    const kontrakById = new Map<number, Kontrak>();
    for (const item of items) for (const k of item.kontrak ?? []) kontrakById.set(k.id, k);

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
                    {isKonsolidasi ? (
                        items.map((item, i) => (
                            <div key={item.id} className="font-bold text-sm leading-tight">
                                {i + 1}. {item.nama_paket}
                                {isCanceled(item) && (
                                    <Badge variant="destructive" className="ml-1 text-[10px] h-5 px-1.5 align-middle">Dibatalkan</Badge>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="font-bold text-sm leading-tight">
                            {primaryItem.nama_paket}
                            {isCanceled(primaryItem) && (
                                <Badge variant="destructive" className="ml-1 text-[10px] h-5 px-1.5 align-middle">Dibatalkan</Badge>
                            )}
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
                {formatCurrency(totalPagu)}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
                {kontrakById.size > 0 ? (
                    <div className="space-y-0.5">
                        {[...kontrakById.values()].map((k) => (
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
            <TableCell className="text-center">
                <span className={`font-bold tabular-nums ${
                    progress >= 100 ? 'text-green-600' :
                    progress >= 75 ? 'text-emerald-500' :
                    progress >= 50 ? 'text-amber-500' :
                    progress >= 25 ? 'text-orange-500' :
                    'text-rose-500'
                }`}>
                    {progress.toFixed(2)}%
                </span>
            </TableCell>
            <TableCell className="text-center">
                <span className={`font-bold tabular-nums ${
                    keu >= 100 ? 'text-green-600' :
                    keu >= 75 ? 'text-emerald-500' :
                    keu >= 50 ? 'text-amber-500' :
                    keu >= 25 ? 'text-orange-500' :
                    'text-rose-500'
                }`}>
                    {keu.toFixed(2)}%
                </span>
            </TableCell>
            <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild className="h-8 rounded-full font-bold">
                    <Link to="/pekerjaan/$id" params={{ id: primaryItem.id.toString() }} search={{ tab: 'progress', from: 'rekap' }}>
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
    const [fisikOnly, setFisikOnly] = useState(false);
    /** all | active | canceled — paket dibatalkan tetap muncul, default semua. */
    const [statusMode, setStatusMode] = useState<'all' | 'active' | 'canceled'>('all');
    const [selectedTagId, setSelectedTagId] = useState<string>('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sort, setSort] = useState<SortState>({ field: null, dir: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;
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

    // Tag khusus rekap (Rembug Warga / Pokir) — cocokkan by name dari daftar tag API.
    const { data: tagsRes } = useQuery({
        queryKey: ['tags-rekap'],
        queryFn: () => getTags(),
        ...filterQueryOpts,
    });
    const rekapTagOptions = useMemo(
        () => (tagsRes?.data || []).filter((t: { name: string }) =>
            REKAP_TAG_NAMES.includes(t.name.toLowerCase() as typeof REKAP_TAG_NAMES[number])
        ),
        [tagsRes?.data]
    );

    // Unbounded fetch: konsolidasi grouping is client-side, needs all data in one shot.
    const filters = useMemo(() => ({
        kecamatan_id: selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan),
        kegiatan_id: selectedKegiatan === 'all' ? undefined : parseInt(selectedKegiatan),
        tag_id: selectedTagId === 'all' ? undefined : parseInt(selectedTagId),
        search: debouncedSearch || undefined,
        tahun: tahunAnggaran,
        summary: true as const,
        status: statusMode === 'all' ? 'all' as const : statusMode === 'canceled' ? 'canceled' as const : 'active' as const,
        per_page: -1,
        ...(fisikOnly ? { is_konsultan: 0 } : {}),
    }), [selectedKecamatan, selectedKegiatan, selectedTagId, debouncedSearch, tahunAnggaran, fisikOnly, statusMode]);

    const { data: pekerjaanRes, isLoading: loading } = useQuery({
        queryKey: ['pekerjaan-rekap', filters],
        queryFn: () => getPekerjaan(filters),
        enabled: !!tahunAnggaran,
    });

    const pekerjaanList = useMemo(
        () => (pekerjaanRes?.data || []) as RekapPekerjaanItem[],
        [pekerjaanRes?.data],
    )

    const sortedList = useMemo(() => {
        if (!sort.field) return pekerjaanList
        return [...pekerjaanList].sort((a, b) => {
            const cmp = compareRekapItems(a, b, sort.field!)
            return sort.dir === 'asc' ? cmp : -cmp
        })
    }, [pekerjaanList, sort])

    const groupedList = useMemo(
        () => groupByKonsolidasi(sortedList).filter((items) =>
            konsolidasiMode === 'all' ? true
            : konsolidasiMode === 'single' ? items.length === 1
            : items.length > 1
        ),
        [sortedList, konsolidasiMode]
    )

    // Client-side pagination (20 row/halaman) di atas data unbounded + grouped.
    const totalPages = Math.max(1, Math.ceil(groupedList.length / pageSize));
    const pageItems = useMemo(
        () => groupedList.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [groupedList, currentPage]
    );

    // Summary stats from grouped data (after konsolidasi filter applied).
    const stats = useMemo(() => {
        const totalPaket = groupedList.reduce((s, items) => s + items.length, 0)
        const totalPagu = groupedList.reduce((s, items) =>
            s + items.reduce((ps, i) => ps + (i.pagu ?? 0), 0), 0)
        // Nilai kontrak deduped per group (konsolidasi share kontrak).
        let totalKontrak = 0
        const kontrakGroupCount = groupedList.filter(i => i.length > 1).length
        for (const items of groupedList) {
            const kontrakMap = new Map<number, number>()
            for (const item of items) for (const k of item.kontrak ?? []) {
                if (k.nilai_kontrak != null) kontrakMap.set(k.id, k.nilai_kontrak)
            }
            for (const v of kontrakMap.values()) totalKontrak += v
        }
        return { totalPaket, totalPagu, totalKontrak, kontrakGroupCount }
    }, [groupedList])

    const handleSort = useCallback((field: SortField) => {
        setSort(prev => ({
            field,
            dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc',
        }))
        setCurrentPage(1)
    }, [])

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
                            onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                    {pages.map((p, index) => (
                        <PaginationItem key={index}>
                            {p === 'ellipsis' ? <PaginationEllipsis /> : (
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setCurrentPage(p as number); }}
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
                            onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    const sortIcon = (field: SortField) => {
        if (sort.field !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
        return sort.dir === 'asc'
            ? <ArrowUp className="ml-1 h-3 w-3" />
            : <ArrowDown className="ml-1 h-3 w-3" />
    }

    const handleExportPdf = useCallback(async () => {
        try {
            const jsPDF = (await import('jspdf')).default
            const autoTable = (await import('jspdf-autotable')).default
            const { drawReportPdfHeader, drawReportPdfFooter, loadReportPdfLogosSelective } = await import('@/features/pekerjaan/lib/export-pdf-branding')

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
            const logos = await loadReportPdfLogosSelective({ showCianjur: true, showAms: false, showArumanis: false })
            const margin = { top: 42, right: 12, bottom: 14, left: 12 }

            // Build data
            const rows = pekerjaanList
            const sortedExport = sort.field
                ? [...rows].sort((a, b) => {
                    const cmp = compareRekapItems(a, b, sort.field!)
                    return sort.dir === 'asc' ? cmp : -cmp
                })
                : rows
            const groups = groupByKonsolidasi(sortedExport)
            const filteredGroups = groups.filter((items) =>
                konsolidasiMode === 'all' ? true : konsolidasiMode === 'single' ? items.length === 1 : items.length > 1
            )

            const head = [['No', 'Nama Paket', 'Pagu', 'Nilai Kontrak', 'Fisik (%)', 'Keuangan (%)']]
            const body: string[][] = []
            let rowNo = 1

            for (const items of filteredGroups) {
                const primary = items[0]
                const isKonsolidasi = items.length > 1
                const namaPaket = isKonsolidasi
                    ? `${items.map(i => i.nama_paket).join(', ')} (Konsolidasi ${items.length} paket)`
                    : primary.nama_paket
                const totalPagu = items.reduce((s, i) => s + (i.pagu ?? 0), 0)
                const kontrakMap = new Map<number, number>()
                for (const item of items) for (const k of item.kontrak ?? []) {
                    if (k.nilai_kontrak != null) kontrakMap.set(k.id, k.nilai_kontrak)
                }
                const totalKontrak = [...kontrakMap.values()].reduce((s, v) => s + v, 0)
                const fisik = primary.progress_estimasi_fisik ?? 0
                const keuangan = primary.progress_estimasi_keuangan ?? 0

                body.push([
                    String(rowNo++),
                    namaPaket,
                    formatCurrency(totalPagu),
                    formatCurrency(totalKontrak),
                    `${fisik.toFixed(2)}%`,
                    `${keuangan.toFixed(2)}%`,
                ])
            }

            autoTable(doc, {
                head,
                body,
                startY: margin.top,
                margin,
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
                columnStyles: {
                    0: { cellWidth: 12, halign: 'center' },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 35, halign: 'right' },
                    3: { cellWidth: 35, halign: 'right' },
                    4: { cellWidth: 20, halign: 'center' },
                    5: { cellWidth: 22, halign: 'center' },
                },
                didDrawPage: (data) => {
                    drawReportPdfHeader(doc, {
                        logos,
                        title: 'REKAP PROGRES ESTIMASI',
                        subtitle: `Tahun Anggaran ${tahunAnggaran}`,
                        metaLine: `Dicetak: ${new Date().toLocaleString('id-ID')}`,
                        marginLeft: margin.left,
                        marginRight: margin.right,
                        logoVisibility: { showCianjur: true },
                    })
                    drawReportPdfFooter(doc, {
                        pageNumber: data.pageNumber,
                        marginLeft: margin.left,
                        marginRight: margin.right,
                    })
                },
            })

            doc.save(`Rekap_Progress_${tahunAnggaran}_${Date.now()}.pdf`)
            toast.success('PDF berhasil diekspor')
        } catch (error) {
            console.error('Export PDF error:', error)
            toast.error('Gagal mengekspor PDF')
        }
    }, [pekerjaanList, sort, konsolidasiMode, tahunAnggaran])

    const handleExportExcel = useCallback(async () => {
        try {
            const rows = pekerjaanList;
            const sortedExport = (() => {
                if (!sort.field) return rows
                return [...rows].sort((a, b) => {
                    const cmp = compareRekapItems(a, b, sort.field!)
                    return sort.dir === 'asc' ? cmp : -cmp
                })
            })()
            const groups = groupByKonsolidasi(sortedExport);
            const filteredGroups = groups.filter((items) =>
                konsolidasiMode === 'all' ? true
                : konsolidasiMode === 'single' ? items.length === 1
                : items.length > 1
            );
            const dataToExport = filteredGroups.map((items, index: number) => {
                const primary = items[0];
                const isKonsolidasi = items.length > 1;
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
            worksheet['!cols'] = [
                { wch: 5 }, { wch: 60 }, { wch: 40 }, { wch: 20 }, { wch: 20 },
                { wch: 18 }, { wch: 18 }, { wch: 25 }, { wch: 15 }, { wch: 18 },
            ];
            XLSX.writeFile(workbook, `Rekap_Progress_${tahunAnggaran}_${new Date().getTime()}.xlsx`);
            toast.success("Data rekap progress telah diekspor ke Excel.");
        } catch (error) {
            console.error('Export error:', error);
            toast.error("Terjadi kesalahan saat mengekspor data.");
        }
    }, [pekerjaanList, sort, konsolidasiMode, tahunAnggaran]);

    return (
        <>
            <Header />
            <Main>
                <div className="mb-6">
                    <h1 className="text-2xl font-black tracking-tight">Rekap Progres Estimasi</h1>
                    <p className="text-muted-foreground text-sm">
                        Ringkasan realisasi progress estimasi fisik per pekerjaan.
                        Paket dibatalkan (canceled) tidak ditampilkan.
                    </p>
                </div>

                {/* Summary cards */}
                {!loading && pekerjaanList.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Card className="border-none shadow-md bg-blue-50 dark:bg-blue-950/30">
                            <CardContent className="flex items-center gap-3 p-4">
                                <Package className="h-8 w-8 text-blue-500 shrink-0" />
                                <div>
                                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalPaket}</div>
                                    <div className="text-xs text-muted-foreground font-semibold">Total Paket</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md bg-emerald-50 dark:bg-emerald-950/30">
                            <CardContent className="flex items-center gap-3 p-4">
                                <Wallet className="h-8 w-8 text-emerald-500 shrink-0" />
                                <div>
                                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(stats.totalPagu)}</div>
                                    <div className="text-xs text-muted-foreground font-semibold">Total Pagu</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md bg-violet-50 dark:bg-violet-950/30">
                            <CardContent className="flex items-center gap-3 p-4">
                                <FileSignature className="h-8 w-8 text-violet-500 shrink-0" />
                                <div>
                                    <div className="text-2xl font-bold text-violet-700 dark:text-violet-300">{formatCurrency(stats.totalKontrak)}</div>
                                    <div className="text-xs text-muted-foreground font-semibold">Total Nilai Kontrak</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md bg-amber-50 dark:bg-amber-950/30">
                            <CardContent className="flex items-center gap-3 p-4">
                                <Link2 className="h-8 w-8 text-amber-500 shrink-0" />
                                <div>
                                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.kontrakGroupCount}</div>
                                    <div className="text-xs text-muted-foreground font-semibold">Grup Konsolidasi</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Card className="border-none shadow-xl bg-background/60 backdrop-blur-md">
                    <CardHeader className="space-y-3 pb-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12 xl:items-end">
                            <div className="flex min-w-0 flex-col gap-1 sm:col-span-2 xl:col-span-2">
                                <span className="ml-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                    Cari Pekerjaan
                                </span>
                                <SearchInput
                                    defaultValue={debouncedSearch}
                                    onSearch={(v) => { setDebouncedSearch(v); setCurrentPage(1); }}
                                />
                            </div>

                            <div className="flex min-w-0 flex-col gap-1 xl:col-span-2">
                                <span className="ml-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                    Kecamatan
                                </span>
                                <Select
                                    value={selectedKecamatan}
                                    onValueChange={(value) => { setSelectedKecamatan(value); setCurrentPage(1); }}
                                >
                                    <SelectTrigger className="h-10 w-full min-w-0 rounded-xl border-muted/20 whitespace-normal">
                                        <SelectValue placeholder="Semua Kecamatan" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="max-w-[min(100vw-2rem,24rem)]">
                                        <SelectItem value="all">Semua Kecamatan</SelectItem>
                                        {kecamatanList.map((kec) => (
                                            <SelectItem key={kec.id} value={kec.id.toString()}>
                                                {kec.nama_kecamatan}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex min-w-0 flex-col gap-1 sm:col-span-2 xl:col-span-2">
                                <span className="ml-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                    Sub Kegiatan
                                </span>
                                <Select
                                    value={selectedKegiatan}
                                    onValueChange={(value) => { setSelectedKegiatan(value); setCurrentPage(1); }}
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
                                <span className="ml-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                    Jenis paket
                                </span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={!fisikOnly ? 'default' : 'outline'}
                                        onClick={() => { setFisikOnly(false); setCurrentPage(1); }}
                                        className="h-7"
                                    >
                                        Semua
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={fisikOnly ? 'default' : 'outline'}
                                        onClick={() => { setFisikOnly(true); setCurrentPage(1); }}
                                        className="h-7"
                                    >
                                        Fisik saja
                                    </Button>
                                </div>
                            </div>

                            <div className="flex min-w-0 flex-col gap-1 xl:col-span-2">
                                <span className="ml-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                    Status
                                </span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={statusMode === 'all' ? 'default' : 'outline'}
                                        onClick={() => { setStatusMode('all'); setCurrentPage(1); }}
                                        className="h-7"
                                    >
                                        Semua
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={statusMode === 'active' ? 'default' : 'outline'}
                                        onClick={() => { setStatusMode('active'); setCurrentPage(1); }}
                                        className="h-7"
                                    >
                                        Aktif
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={statusMode === 'canceled' ? 'default' : 'outline'}
                                        onClick={() => { setStatusMode('canceled'); setCurrentPage(1); }}
                                        className="h-7"
                                    >
                                        Dibatalkan
                                    </Button>
                                </div>
                            </div>

                            <div className="flex min-w-0 flex-col gap-1 xl:col-span-1">
                                <span className="ml-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                    Tag
                                </span>
                                <Select
                                    value={selectedTagId}
                                    onValueChange={(value) => { setSelectedTagId(value); setCurrentPage(1); }}
                                >
                                    <SelectTrigger className="h-10 w-full min-w-0 rounded-xl border-muted/20 whitespace-normal">
                                        <SelectValue placeholder="Semua Tag" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="max-w-[min(100vw-2rem,16rem)]">
                                        <SelectItem value="all">Semua Tag</SelectItem>
                                        {rekapTagOptions.map((t: { id: number; name: string }) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex min-w-0 flex-col gap-1 xl:col-span-1">
                                <span className="ml-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                    Konsolidasi
                                </span>
                                <Select
                                    value={konsolidasiMode}
                                    onValueChange={(value) => { setKonsolidasiMode(value as KonsolidasiMode); setCurrentPage(1); }}
                                >
                                    <SelectTrigger className="h-10 w-full min-w-0 rounded-xl border-muted/20 whitespace-normal">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="max-w-[min(100vw-2rem,20rem)]">
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="single">Single</SelectItem>
                                        <SelectItem value="consolidated">Konsolidasi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex min-w-0 flex-col gap-1 sm:col-span-2 xl:col-span-2">
                                <span className="ml-1 hidden text-[10px] font-bold uppercase text-muted-foreground xl:block">
                                    &nbsp;
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        className="h-10 w-full rounded-xl border-green-200 bg-green-50 font-bold text-green-700 hover:bg-green-100 hover:text-green-800"
                                        onClick={handleExportExcel}
                                        disabled={loading || pekerjaanList.length === 0}
                                    >
                                        <FileDown className="mr-1.5 h-4 w-4 shrink-0" />
                                        <span className="truncate">Excel</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-10 w-full rounded-xl border-red-200 bg-red-50 font-bold text-red-700 hover:bg-red-100 hover:text-red-800"
                                        onClick={handleExportPdf}
                                        disabled={loading || pekerjaanList.length === 0}
                                    >
                                        <FileText className="mr-1.5 h-4 w-4 shrink-0" />
                                        <span className="truncate">PDF</span>
                                    </Button>
                                </div>
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
                                            <TableHead className="w-[60px] text-center font-bold uppercase text-[10px] tracking-wide">No</TableHead>
                                            <TableHead className="font-bold uppercase text-[10px] tracking-wide cursor-pointer select-none hover:text-primary" onClick={() => handleSort('nama_paket')}>
                                                Pekerjaan
                                                {sortIcon('nama_paket')}
                                            </TableHead>
                                            <TableHead className="text-right font-bold uppercase text-[10px] tracking-wide cursor-pointer select-none hover:text-primary" onClick={() => handleSort('pagu')}>
                                                Pagu
                                                {sortIcon('pagu')}
                                            </TableHead>
                                            <TableHead className="text-right font-bold uppercase text-[10px] tracking-wide cursor-pointer select-none hover:text-primary" onClick={() => handleSort('nilai_kontrak')}>
                                                Nilai Kontrak
                                                {sortIcon('nilai_kontrak')}
                                            </TableHead>
                                            <TableHead className="text-center font-bold uppercase text-[10px] tracking-wide">
                                                Konsolidasi
                                            </TableHead>
                                            <TableHead className="font-bold uppercase text-[10px] tracking-wide cursor-pointer select-none hover:text-primary" onClick={() => handleSort('progress_estimasi_fisik')}>
                                                Estimasi Fisik
                                                {sortIcon('progress_estimasi_fisik')}
                                            </TableHead>
                                            <TableHead className="font-bold uppercase text-[10px] tracking-wide cursor-pointer select-none hover:text-primary" onClick={() => handleSort('progress_estimasi_keuangan')}>
                                                Realisasi Keuangan
                                                {sortIcon('progress_estimasi_keuangan')}
                                            </TableHead>
                                            <TableHead className="text-right font-bold uppercase text-[10px] tracking-wide">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pageItems.map((items, idx) => (
                                            <ProgressRow
                                                key={items[0].id}
                                                items={items}
                                                index={(currentPage - 1) * pageSize + idx + 1}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                    {totalPages > 1 && (
                        <CardFooter className="flex justify-center border-t py-4">
                            {renderPagination()}
                        </CardFooter>
                    )}
                </Card>
            </Main>
        </>
    );
}
