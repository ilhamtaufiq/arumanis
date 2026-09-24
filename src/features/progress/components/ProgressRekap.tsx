import { useState, useMemo, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';
import { getKecamatan } from '@/features/kecamatan/api/kecamatan';
import { getTags } from '@/features/pekerjaan/api/tags';
import api from '@/lib/api-client';
import type { Kegiatan, KegiatanResponse } from '@/features/kegiatan/types';
import {
    Table,
    TableBody,
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
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Eye, FileDown, FileText, ArrowUpDown, ArrowUp, ArrowDown, Inbox, Package, Wallet, FileSignature, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/format';
import {
    buildRekapExportRows,
    filterRekapGroups,
    groupByKonsolidasi,
    sortRekapItems,
    summarizeGroupMoney,
    type KonsolidasiMode,
    type RekapPekerjaanItem,
    type RekapSortField,
    type RekapSortState,
} from '../lib/rekap-progress';
import { ProgressRekapRow } from './ProgressRekapRow';
import { ProgressRekapPagination } from './ProgressRekapPagination';

/** Tag names to surface in filter dropdown (case-insensitive match). */
const REKAP_TAG_NAMES = ['rembug warga', 'pokir'] as const;

export default function ProgressRekap() {
    const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
    const [selectedKegiatan, setSelectedKegiatan] = useState<string>('all');
    const [konsolidasiMode, setKonsolidasiMode] = useState<KonsolidasiMode>('all');
    const [fisikOnly, setFisikOnly] = useState(false);
    /** all | active | canceled — paket dibatalkan ikut tampil sesuai filter. */
    const [statusMode, setStatusMode] = useState<'all' | 'active' | 'canceled'>('all');
    const [selectedTagId, setSelectedTagId] = useState<string>('all');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sort, setSort] = useState<RekapSortState>({ field: null, dir: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    /** Konsolidasi: dialog pilih paket sebelum buka detail. */
    const [pickerItems, setPickerItems] = useState<RekapPekerjaanItem[] | null>(null);
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
    // Search is client-side (after grouping) so konsolidasi groups stay intact.
    const filters = useMemo(() => ({
        kecamatan_id: selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan),
        kegiatan_id: selectedKegiatan === 'all' ? undefined : parseInt(selectedKegiatan),
        tag_id: selectedTagId === 'all' ? undefined : parseInt(selectedTagId),
        tahun: tahunAnggaran,
        summary: true as const,
        status: statusMode === 'all' ? 'all' as const : statusMode === 'canceled' ? 'canceled' as const : 'active' as const,
        per_page: -1,
        ...(fisikOnly ? { is_konsultan: 0 } : {}),
    }), [selectedKecamatan, selectedKegiatan, selectedTagId, tahunAnggaran, fisikOnly, statusMode]);

    const { data: pekerjaanRes, isLoading: loading, isError, refetch } = useQuery({
        queryKey: ['pekerjaan-rekap', filters],
        queryFn: () => getPekerjaan(filters),
        enabled: !!tahunAnggaran,
        staleTime: 60_000,
    });

    const pekerjaanList = useMemo(
        () => (pekerjaanRes?.data || []) as RekapPekerjaanItem[],
        [pekerjaanRes?.data],
    )

    const sortedList = useMemo(() => sortRekapItems(pekerjaanList, sort), [pekerjaanList, sort])

    // Grouping + filter mode konsolidasi + pencarian multi-field.
    const groupedList = useMemo(
        () => filterRekapGroups(groupByKonsolidasi(sortedList), { mode: konsolidasiMode, search: debouncedSearch }),
        [sortedList, konsolidasiMode, debouncedSearch],
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
            totalKontrak += summarizeGroupMoney(items).totalKontrak
        }
        return { totalPaket, totalPagu, totalKontrak, kontrakGroupCount }
    }, [groupedList])

    const handleSort = useCallback((field: RekapSortField) => {
        setSort(prev => ({
            field,
            dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc',
        }))
        setCurrentPage(1)
    }, [])

    const sortIcon = (field: RekapSortField) => {
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

            const rows = buildRekapExportRows(groupedList)
            const head = [['No', 'Nama Paket', 'Pagu', 'Nilai Kontrak', 'Fisik (%)', 'Keuangan (%)']]
            const body: string[][] = rows.map((r, i) => [
                String(i + 1),
                r.namaPaket,
                formatCurrency(r.totalPagu),
                formatCurrency(r.totalKontrak),
                `${r.fisik.toFixed(2)}%`,
                `${r.keuangan.toFixed(2)}%`,
            ])

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
    }, [groupedList, tahunAnggaran])

    const handleExportExcel = useCallback(async () => {
        try {
            const rows = buildRekapExportRows(groupedList)
            const dataToExport = rows.map((r, index) => ({
                'No': index + 1,
                'Nama Paket Pekerjaan': r.namaPaket,
                'Sub Kegiatan': r.subKegiatan,
                'Kecamatan': r.kecamatan,
                'Desa': r.desa,
                'Pagu (Rp)': r.totalPagu,
                'Nilai Kontrak (Rp)': r.totalKontrak,
                'Tags': r.tags,
                'Estimasi Fisik (%)': r.fisik,
                'Realisasi Keuangan (%)': r.keuangan,
            }));

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
    }, [groupedList, tahunAnggaran]);

    return (
        <>
            <Header />
            <Main>
                <div className="mb-6">
                    <h1 className="text-2xl font-black tracking-tight">Rekap Progres Estimasi</h1>
                    <p className="text-muted-foreground text-sm">
                        Ringkasan realisasi progress estimasi fisik per pekerjaan.
                        Gunakan filter Status untuk menyertakan/mengecualikan paket dibatalkan.
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
                        ) : isError ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Inbox />
                                    </EmptyMedia>
                                    <EmptyTitle>Gagal memuat rekap progress</EmptyTitle>
                                    <EmptyDescription>
                                        Periksa koneksi lalu{' '}
                                        <button type="button" className="underline" onClick={() => void refetch()}>
                                            coba lagi
                                        </button>
                                        .
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
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
                                            <ProgressRekapRow
                                                key={items.map((i) => i.id).join('-')}
                                                items={items}
                                                index={(currentPage - 1) * pageSize + idx + 1}
                                                onPickKonsolidasi={setPickerItems}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                    {totalPages > 1 && (
                        <CardFooter className="flex justify-center border-t py-4">
                            <ProgressRekapPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onChange={setCurrentPage}
                            />
                        </CardFooter>
                    )}
                </Card>

                {/* Konsolidasi: pilih paket yang mau dilihat detailnya (tab baru). */}
                <Dialog open={pickerItems !== null} onOpenChange={(open) => !open && setPickerItems(null)}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Paket Konsolidasi</DialogTitle>
                            <DialogDescription>
                                Pilih salah satu paket untuk melihat detailnya di tab baru.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            {pickerItems?.map((item, i) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-muted/40 bg-muted/10 px-4 py-3"
                                >
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm leading-tight">
                                            {i + 1}. {item.nama_paket}
                                            {item.status === 'canceled' && (
                                                <Badge variant="destructive" className="ml-1 text-[10px] h-5 px-1.5 align-middle">Dibatalkan</Badge>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                                            {item.kecamatan?.nama_kecamatan || '-'} • {item.desa?.nama_desa || '-'} • {formatCurrency(item.pagu ?? 0)}
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" asChild className="h-8 shrink-0 rounded-full font-bold">
                                        <Link
                                            to="/pekerjaan/$id"
                                            params={{ id: item.id.toString() }}
                                            search={{ tab: 'progress', from: 'rekap' }}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Eye className="mr-1.5 h-3.5 w-3.5" /> Detail
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </Main>
        </>
    );
}
