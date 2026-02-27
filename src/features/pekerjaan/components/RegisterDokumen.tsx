import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
    Search,
    AlertCircle,
    CheckCircle2,
    Clock,
    ChevronLeft,
    ChevronRight,
    FileSpreadsheet,
    Building2,
    AlertTriangle,
    ExternalLink,
    Loader2,
    Calendar
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDocumentRegister } from '../api/pekerjaan';
import type { Pekerjaan } from '../types';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';

/**
 * UTILITIES
 */
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

/**
 * COMPONENTS
 */
const DocumentCell = ({ num, date, label }: { num: string | null | undefined; date: string | null | undefined; label: string }) => {
    const isMissing = !num;

    return (
        <div className="flex flex-col gap-1 min-w-[140px]">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
            {isMissing ? (
                <div className="flex items-center gap-1.5 text-destructive bg-destructive/5 px-2 py-1 rounded border border-destructive/20 border-dashed">
                    <AlertCircle size={14} />
                    <span className="text-xs font-medium italic">Belum Ada</span>
                </div>
            ) : (
                <div className="group">
                    <div className="text-sm font-semibold text-foreground tabular-nums truncate max-w-[180px]" title={num!}>
                        {num}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar size={10} />
                        {formatDate(date)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function RegisterDokumen() {
    const { tahunAnggaran } = useAppSettingsValues();
    const [data, setData] = useState<Pekerjaan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedYear, setSelectedYear] = useState(tahunAnggaran || new Date().getFullYear().toString());
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (tahunAnggaran && !selectedYear) {
            setSelectedYear(tahunAnggaran);
        }
    }, [tahunAnggaran]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getDocumentRegister({
                page,
                search,
                tahun: selectedYear,
                per_page: 20
            });
            setData(res.data);
            setMeta(res.meta);
        } catch (error) {
            console.error('Failed to fetch register:', error);
            toast.error('Gagal memuat data register');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, selectedYear]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchData();
    };

    const handleExportExcel = async () => {
        try {
            setExporting(true);
            toast.loading('Mempersiapkan data export...');

            // Fetch ALL data for export
            const res = await getDocumentRegister({
                tahun: selectedYear,
                per_page: -1 // Assume -1 means all or just a large number
            });

            const allData = res.data;

            const excelData = allData.map((item: Pekerjaan, index: number) => {
                const k = item.kontrak?.[0];
                return {
                    'No': index + 1,
                    'Nama Paket': item.nama_paket,
                    'Pagu': item.pagu,
                    'Penyedia': k?.penyedia?.nama || '-',
                    'SPPBJ Nomor': k?.sppbj || '-',
                    'SPPBJ Tanggal': k?.tgl_sppbj || '-',
                    'SPK Nomor': k?.spk || '-',
                    'SPK Tanggal': k?.tgl_spk || '-',
                    'SPMK Nomor': k?.spmk || '-',
                    'SPMK Tanggal': k?.tgl_spmk || '-',
                    'BA LPP': item.berita_acara?.data?.ba_lpp?.length || 0,
                    'BA PHO': item.berita_acara?.data?.serah_terima_pertama?.length || 0,
                    'BA PHP': item.berita_acara?.data?.ba_php?.length || 0,
                    'BA FHO': item.berita_acara?.data?.ba_stp?.length || 0,
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Register Dokumen");

            // Set column widths
            worksheet['!cols'] = [
                { wch: 5 }, { wch: 50 }, { wch: 15 }, { wch: 30 },
                { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
                { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 10 },
                { wch: 10 }, { wch: 10 }
            ];

            XLSX.writeFile(workbook, `Register_Dokumen_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.dismiss();
            toast.success('Excel berhasil diunduh');
        } catch (error) {
            toast.dismiss();
            console.error('Export failed:', error);
            toast.error('Gagal mengekspor data');
        } finally {
            setExporting(false);
        }
    };

    const getBAStatus = (pekerjaan: Pekerjaan) => {
        if (!pekerjaan.berita_acara || !pekerjaan.berita_acara.data) return [];

        const ba = pekerjaan.berita_acara.data;
        const summaries: { type: string; count: number; status: 'completed' | 'missing' }[] = [];

        if (ba.ba_lpp && ba.ba_lpp.length > 0) summaries.push({ type: 'LPP', count: ba.ba_lpp.length, status: 'completed' });
        if (ba.serah_terima_pertama && ba.serah_terima_pertama.length > 0) summaries.push({ type: 'PHO', count: ba.serah_terima_pertama.length, status: 'completed' });
        if (ba.ba_php && ba.ba_php.length > 0) summaries.push({ type: 'PHP', count: ba.ba_php.length, status: 'completed' });
        if (ba.ba_stp && ba.ba_stp.length > 0) summaries.push({ type: 'FHO', count: ba.ba_stp.length, status: 'completed' });

        return summaries;
    };

    return (
        <>
            <Header />
            <Main>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Register Penomoran Dokumen</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Clock size={14} />
                            Monitoring administrasi penomoran SPPBJ, SPK, SPMK dan Berita Acara
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleExportExcel} disabled={exporting}>
                            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />}
                            Export Excel
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <CardStat label="Total Paket" value={meta?.total || 0} icon={Building2} color="text-blue-600" />
                    <CardStat label="SPK Belum Ada" value={data.filter(d => !d.kontrak?.[0]?.spk).length} icon={AlertTriangle} color="text-amber-600" />
                    <CardStat label="SPMK Belum Ada" value={data.filter(d => !d.kontrak?.[0]?.spmk).length} icon={AlertCircle} color="text-rose-600" />
                    <CardStat label="PHO Selesai" value={data.filter(d => (d.berita_acara?.data?.serah_terima_pertama?.length || 0) > 0).length} icon={CheckCircle2} color="text-emerald-600" />
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <CardTitle>Daftar Penomoran</CardTitle>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                                        Monitor Tahun:
                                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="Tahun" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['2025', '2024', '2023', '2022'].map(y => (
                                                    <SelectItem key={y} value={y}>TA {y}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama paket atau penyedia..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[350px]">Pekerjaan / Paket</TableHead>
                                        <TableHead>SPPBJ</TableHead>
                                        <TableHead>SPK (Kontrak)</TableHead>
                                        <TableHead>SPMK</TableHead>
                                        <TableHead>Progress Berita Acara</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-40 text-center">
                                                <div className="flex flex-col items-center gap-2 justify-center">
                                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">Memuat data register...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : data.length > 0 ? (
                                        data.map((item) => {
                                            const k = item.kontrak?.[0];
                                            const baSummaries = getBAStatus(item);

                                            return (
                                                <TableRow key={item.id} className="group">
                                                    <TableCell className="align-top">
                                                        <div className="space-y-1.5">
                                                            <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                                {item.nama_paket}
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="text-[12px] font-medium text-emerald-700 bg-emerald-50 w-fit px-1.5 py-0.5 rounded border border-emerald-200">
                                                                    {formatCurrency(item.pagu)}
                                                                </div>
                                                                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
                                                                    <Building2 size={12} className="shrink-0" />
                                                                    <span className="truncate max-w-[280px]" title={k?.penyedia?.nama || '-'}>
                                                                        {k?.penyedia?.nama || 'Penyedia belum diatur'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <DocumentCell num={k?.sppbj} date={k?.tgl_sppbj} label="Penyediaan" />
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <DocumentCell num={k?.spk} date={k?.tgl_spk} label="Perjanjian Kerja" />
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <DocumentCell num={k?.spmk} date={k?.tgl_spmk} label="Mulai Kerja" />
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <div className="flex flex-wrap gap-2 max-w-[240px]">
                                                            {baSummaries.length > 0 ? (
                                                                baSummaries.map((ba, idx) => (
                                                                    <Badge
                                                                        key={idx}
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "h-6 text-[10px]",
                                                                            ba.status === 'completed'
                                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                                                        )}
                                                                    >
                                                                        {ba.type}
                                                                        {ba.count > 0 && <span className="ml-1 opacity-70">({ba.count})</span>}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                <span className="text-[10px] text-muted-foreground italic uppercase tracking-wider font-semibold">Belum Ada BA</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-top text-right">
                                                        <Button variant="outline" size="icon" asChild title="Detail Pekerjaan">
                                                            <Link to="/pekerjaan/$id" params={{ id: item.id.toString() }}>
                                                                <ExternalLink size={16} />
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                                                Tidak ada data ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    {meta && meta.last_page > 1 && (
                        <CardFooter className="flex items-center justify-between border-t bg-muted/20 py-4">
                            <p className="text-xs text-muted-foreground">
                                Menampilkan {meta.from}-{meta.to} dari {meta.total} paket
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    <ChevronLeft size={16} />
                                </Button>
                                <span className="text-sm font-medium">Halaman {page} dari {meta.last_page}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === meta.last_page}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </Main>
        </>
    );
}

function CardStat({ label, value, icon: Icon, color }: any) {
    return (
        <Card className="shadow-none border-dashed bg-background">
            <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("p-2.5 rounded-lg bg-muted/50", color)}>
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-xs font-medium text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
