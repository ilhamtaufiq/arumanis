import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { getKontrak, deleteKontrak, importKontrak, downloadKontrakTemplate, exportKontrakDoc, exportKontrakRingkasan, exportKontrakBAP } from '../api/kontrak';
import type { Kontrak } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, FileText, Search as SearchIcon, Download, Upload, ClipboardList, ClipboardCheck, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { SearchableSelect } from '@/components/ui/searchable-select';
import api from '@/lib/api-client';
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';

export default function KontrakList() {
    const [kontrakList, setKontrakList] = useState<Kontrak[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const { tahunAnggaran } = useAppSettingsValues();

    // BAP Modal State
    const [isBapModalOpen, setIsBapModalOpen] = useState(false);
    const [selectedKontrakBap, setSelectedKontrakBap] = useState<Kontrak | null>(null);
    const [bapForm, setBapForm] = useState({
        persen_bap: 100,
        potongan_lima_persen: 0,
        potongan_uang_muka: 0,
        total_potongan: 0,
        tgl_bap: new Date().toISOString().split('T')[0],
        tgl_bastp: new Date().toISOString().split('T')[0],
        nomor_spk_addendum: '-',
        tgl_spk_addendum: '-',
        nilai_kontrak_addendum: 0,
        nomor_bap: ''
    });

    const formatIndoDateFull = (dateStr: string) => {
        if (!dateStr || dateStr === '-') return '-';
        const date = new Date(dateStr);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${dayName}, Tanggal ${day} ${month} ${year}`;
    };

    const formatIndoDateSimple = (dateStr: string) => {
        if (!dateStr || dateStr === '-') return '-';
        const date = new Date(dateStr);
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const fetchKontrak = async (page: number, search?: string, year?: string) => {
        try {
            setLoading(true);
            const response = await getKontrak({
                page,
                search,
                tahun: year
            });
            setKontrakList(response.data);
            setCurrentPage(response.meta.current_page);
            setTotalPages(response.meta.last_page);
            setTotal(response.meta.total);
        } catch (error) {
            console.error('Failed to fetch kontrak:', error);
            toast.error('Gagal memuat data kontrak');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchKontrak(1, searchQuery, tahunAnggaran);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, tahunAnggaran]);

    useEffect(() => {
        fetchKontrak(currentPage, searchQuery, tahunAnggaran);
    }, [currentPage]);

    const handleDelete = async (id: number) => {
        try {
            await deleteKontrak(id);
            toast.success('Kontrak berhasil dihapus');
            fetchKontrak(currentPage, searchQuery, tahunAnggaran);
        } catch (error) {
            console.error('Failed to delete kontrak:', error);
            toast.error('Gagal menghapus kontrak');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const formatRupiah = (value: number | null) => {
        if (!value) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleDownloadTemplate = async () => {
        try {
            toast.loading('Menyiapkan template...');
            const blob = await downloadKontrakTemplate(tahunAnggaran);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'template_kontrak.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.dismiss();
        } catch (error: any) {
            console.error('Download failed:', error);
            toast.error('Gagal mendownload template');
        }
    };

    const handleImportClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls,.csv';
        input.onchange = async (e: any) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            setIsImporting(true);
            const toastId = toast.loading('Sedang mengimport data kontrak...');

            try {
                await importKontrak(formData);
                toast.success('Kontrak berhasil diimport', { id: toastId });
                fetchKontrak(currentPage, searchQuery, tahunAnggaran);
            } catch (error: any) {
                console.error('Import failed:', error);
                toast.error(`Gagal mengimport: ${error.response?.data?.message || error.message}`, { id: toastId });
            } finally {
                setIsImporting(false);
            }
        };
        input.click();
    };

    const handleExportExcel = async () => {
        try {
            const params: any = {};
            if (tahunAnggaran) params.tahun = tahunAnggaran;
            if (searchQuery) params.search = searchQuery;
            
            const response = await api.get<Blob>('/kontrak/export/excel', {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(response);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `data_kontrak_${tahunAnggaran || 'all'}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Excel berhasil didownload');
        } catch (error) {
            console.error('Failed to export excel:', error);
            toast.error('Gagal export excel');
        }
    };

    const handleExportDoc = async (kontrak: Kontrak) => {
        if (!kontrak.is_checklist_complete) {
            toast.error("Checklist pekerjaan belum 100% lengkap bos!");
            return;
        }
        try {
            toast.loading(`Menyiapkan dokumen ${kontrak.pekerjaan?.nama_paket}...`);
            const blob = await exportKontrakDoc(kontrak.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = `SPK_${kontrak.pekerjaan?.nama_paket?.replace(/\s+/g, '_')}_${kontrak.nomor_penawaran?.replace(/[\/\\]/g, '_')}.docx`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.dismiss();
            toast.success('Dokumen berhasil digenerate');
        } catch (error: any) {
            console.error('Export failed:', error);
            const msg = error.response?.data?.message || 'Gagal generate dokumen';
            toast.error(msg);
        }
    };

    const handleExportRingkasan = async (kontrak: Kontrak) => {
        if (!kontrak.is_checklist_complete) {
            toast.error("Checklist pekerjaan belum 100% lengkap bos!");
            return;
        }
        try {
            toast.loading(`Menyiapkan ringkasan ${kontrak.pekerjaan?.nama_paket}...`);
            const blob = await exportKontrakRingkasan(kontrak.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = `Ringkasan_${kontrak.pekerjaan?.nama_paket?.replace(/\s+/g, '_')}.docx`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.dismiss();
            toast.success('Ringkasan berhasil digenerate');
        } catch (error: any) {
            console.error('Export failed:', error);
            // Ambil pesan error dari backend jika ada
            const msg = error.response?.data?.message || 'Gagal generate ringkasan';
            toast.error(msg);
        }
    };

    const handleExportBAP = (kontrak: Kontrak) => {
        if (!kontrak.is_checklist_complete) {
            toast.error("Checklist pekerjaan belum 100% lengkap bos!");
            return;
        }
        setSelectedKontrakBap(kontrak);
        setIsBapModalOpen(true);
    };

    const processBapExport = async () => {
        if (!selectedKontrakBap) return;

        try {
            const nilaiKontrak = selectedKontrakBap.nilai_kontrak || 0;
            const persen = bapForm.persen_bap;
            
            // Rumus Bos:
            // fisik_persen = (persen / 111) * nilai_kontrak
            // dpp = (11/12) * fisik_persen
            // ppn_persen = dpp * 12%
            // total_potongan = input
            // fisik_persen_total_potongan = fisik_persen + total_potongan
            // total_bap = fisik_persen_total_potongan + ppn_persen

            const fisik_persen = Math.round((persen / 111) * nilaiKontrak);
            const dpp = Math.round((11 / 12) * fisik_persen);
            const ppn_persen = Math.round(dpp * 0.12);
            const total_potongan = Math.round(Number(bapForm.total_potongan));
            const fisik_persen_total_potongan = fisik_persen + total_potongan;
            const total_bap = fisik_persen_total_potongan + ppn_persen;
            const kontrak_persen = Math.round((persen / 100) * nilaiKontrak);

            const payload = {
                ...bapForm,
                fisik_persen,
                dpp,
                ppn_persen,
                fisik_persen_total_potongan,
                total_bap,
                kontrak_persen,
                tgl_bap: formatIndoDateFull(bapForm.tgl_bap),
                tgl_bastp: formatIndoDateSimple(bapForm.tgl_bastp),
                nomor_spk_addendum: bapForm.nomor_spk_addendum,
                tgl_spk_addendum: bapForm.tgl_spk_addendum !== '-' ? formatIndoDateSimple(bapForm.tgl_spk_addendum) : '-',
                nilai_kontrak_addendum: bapForm.nilai_kontrak_addendum,
                nomor_bap: bapForm.nomor_bap,
                // Nilai kontrak di dokumen jadi persentase nilai kontrak
                nilai_kontrak: kontrak_persen
            };

            toast.loading(`Menyiapkan BAP ${selectedKontrakBap.pekerjaan?.nama_paket}...`);
            const blob = await exportKontrakBAP(selectedKontrakBap.id, payload);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = `BAP_${selectedKontrakBap.pekerjaan?.nama_paket?.replace(/\s+/g, '_')}.docx`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.dismiss();
            toast.success('BAP berhasil digenerate');
            setIsBapModalOpen(false);
        } catch (error: any) {
            console.error('Export failed:', error);
            toast.error('Gagal generate BAP');
        }
    };

    const renderPagination = () => {
        const pages: (number | string)[] = [];
        const delta = 2;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }

        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>

                    {pages.map((page, index) => (
                        <PaginationItem key={index}>
                            {page === '...' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    onClick={() => handlePageChange(page as number)}
                                    isActive={currentPage === page}
                                    className="cursor-pointer"
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    if (loading && kontrakList.length === 0) {
        return (
            <>
                <Header />

                <Main>
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Memuat data...</p>
                    </div>
                </Main>
            </>
        );
    }

    return (
        <>
            {/* ===== Top Heading ===== */}
            <Header />


            {/* ===== Main ===== */}
            <Main>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kontrak</h1>
                        <p className="text-muted-foreground">
                            Kelola data kontrak pekerjaan
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={handleDownloadTemplate}>
                            <Download className="mr-2 h-4 w-4" />
                            Template
                        </Button>
                        <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
                            <Upload className="mr-2 h-4 w-4" />
                            Import XLSX
                        </Button>
                        <Button asChild>
                            <Link to="/kontrak/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Kontrak
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="overflow-hidden">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Daftar Kontrak</CardTitle>
                                <CardDescription>
                                    Total {total} kontrak
                                </CardDescription>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                <Button 
                                    variant="outline" 
                                    className="flex gap-2"
                                    onClick={handleExportExcel}
                                >
                                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                    Export Excel
                                </Button>
                                <div className="relative w-full md:w-64">
                                    <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari kontrak..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        <div className="overflow-x-auto">
                            <Table className="min-w-[1200px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[250px]">Pekerjaan</TableHead>
                                        <TableHead className="text-right min-w-[150px]">Pagu</TableHead>
                                        <TableHead className="min-w-[120px]">Sumber Dana</TableHead>
                                        <TableHead className="min-w-[150px]">Penyedia</TableHead>
                                        <TableHead className="text-right min-w-[150px]">Nilai Kontrak</TableHead>
                                        <TableHead className="min-w-[200px]">No/Tgl SPK</TableHead>
                                        <TableHead className="min-w-[200px]">No/Tgl SPMK</TableHead>
                                        <TableHead className="text-center min-w-[80px]">Masa</TableHead>
                                        <TableHead className="min-w-[120px]">Tgl. Selesai</TableHead>
                                        <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] min-w-[150px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {kontrakList.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                <FileText className="mx-auto h-12 w-12 mb-2 opacity-20" />
                                                <p>Tidak ada data kontrak</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        kontrakList.map((kontrak) => (
                                            <TableRow key={kontrak.id}>
                                                <TableCell>
                                                    <div className="min-w-[250px] font-medium leading-normal py-2">
                                                        {kontrak.pekerjaan?.nama_paket || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right whitespace-nowrap">
                                                    {formatRupiah(kontrak.pekerjaan?.pagu || 0)}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <Badge variant="outline">
                                                        {kontrak.pekerjaan?.kegiatan?.sumber_dana || '-'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="min-w-[150px] leading-normal">
                                                        {kontrak.penyedia?.nama || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium whitespace-nowrap">
                                                    {formatRupiah(kontrak.nilai_kontrak)}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <div className="text-xs">
                                                        <div className="font-medium">{kontrak.spk || '-'}</div>
                                                        <div className="text-muted-foreground">{formatDate(kontrak.tgl_spk)}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <div className="text-xs">
                                                        <div className="font-medium">{kontrak.spmk || '-'}</div>
                                                        <div className="text-muted-foreground">{formatDate(kontrak.tgl_spmk)}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center whitespace-nowrap">
                                                    {(() => {
                                                        if (!kontrak.tgl_spmk || !kontrak.tgl_selesai) return '-';
                                                        const start = new Date(kontrak.tgl_spmk);
                                                        const end = new Date(kontrak.tgl_selesai);
                                                        const diff = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                                        return <Badge variant="secondary">{diff} Hari</Badge>;
                                                    })()}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">{formatDate(kontrak.tgl_selesai)}</TableCell>
                                                <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleExportDoc(kontrak)}
                                                            title="Generate SPK (Word)"
                                                        >
                                                            <FileText className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleExportRingkasan(kontrak)}
                                                            title="Generate Ringkasan Kontrak"
                                                        >
                                                            <ClipboardList className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleExportBAP(kontrak)}
                                                            title="Generate BAP"
                                                        >
                                                            <ClipboardCheck className="h-4 w-4 text-orange-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link to="/kontrak/$id/edit" params={{ id: kontrak.id.toString() }}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Hapus Kontrak</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Apakah Anda yakin ingin menghapus kontrak ini? Tindakan ini tidak dapat dibatalkan.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(kontrak.id)}>
                                                                        Hapus
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-4">
                                {renderPagination()}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Main>

            {/* BAP Calculation Modal */}
            <Dialog open={isBapModalOpen} onOpenChange={setIsBapModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Generate BAP & Penagihan</DialogTitle>
                        <DialogDescription>
                            Lengkapi data perhitungan dan informasi tanggal: <br />
                            <span className="font-semibold text-blue-600">{selectedKontrakBap?.pekerjaan?.nama_paket}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6 py-4">
                        {/* Kolom Kiri: Perhitungan */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-sm border-b pb-1">Data Perhitungan</h3>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="persen" className="text-right text-xs">Persen</Label>
                                <select 
                                    id="persen"
                                    className="col-span-3 flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                    value={bapForm.persen_bap}
                                    onChange={(e) => setBapForm({ ...bapForm, persen_bap: Number(e.target.value) })}
                                >
                                    <option value={100}>100%</option>
                                    <option value={95}>95%</option>
                                    <option value={5}>5%</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="pot5" className="text-right text-xs">Pot. 5%</Label>
                                <Input
                                    id="pot5"
                                    type="number"
                                    className="col-span-3 h-8"
                                    value={bapForm.potongan_lima_persen}
                                    onChange={(e) => setBapForm({ ...bapForm, potongan_lima_persen: Number(e.target.value) })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="potum" className="text-right text-xs">Pot. UM</Label>
                                <Input
                                    id="potum"
                                    type="number"
                                    className="col-span-3 h-8"
                                    value={bapForm.potongan_uang_muka}
                                    onChange={(e) => setBapForm({ ...bapForm, potongan_uang_muka: Number(e.target.value) })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="totalpot" className="text-right text-xs font-bold text-red-600">Total Pot.</Label>
                                <Input
                                    id="totalpot"
                                    type="number"
                                    className="col-span-3 h-8 border-red-200"
                                    value={bapForm.total_potongan}
                                    onChange={(e) => setBapForm({ ...bapForm, total_potongan: Number(e.target.value) })}
                                />
                            </div>

                            <div className="p-3 bg-slate-50 rounded-lg text-[10px] space-y-1.5 border">
                                <p className="font-semibold text-slate-700 underline mb-1">Preview Perhitungan:</p>
                                <div className="flex justify-between">
                                    <span>Fisik {bapForm.persen_bap}%:</span>
                                    <span className="font-mono">{formatRupiah(Math.round((bapForm.persen_bap / 111) * (selectedKontrakBap?.nilai_kontrak || 0)))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>DPP:</span>
                                    <span className="font-mono">{formatRupiah(Math.round((11/12) * Math.round((bapForm.persen_bap / 111) * (selectedKontrakBap?.nilai_kontrak || 0))))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>PPN 12%:</span>
                                    <span className="font-mono">{formatRupiah(Math.round(Math.round(Math.round((11/12) * Math.round((bapForm.persen_bap / 111) * (selectedKontrakBap?.nilai_kontrak || 0)))) * 0.12))}</span>
                                </div>
                                <div className="flex justify-between text-blue-600 font-semibold border-t pt-1 mt-1">
                                    <span>Kontrak {bapForm.persen_bap}%:</span>
                                    <span className="font-mono">{formatRupiah(Math.round((bapForm.persen_bap / 100) * (selectedKontrakBap?.nilai_kontrak || 0)))}</span>
                                </div>
                                <div className="flex justify-between border-t pt-1 mt-1 font-bold">
                                    <span>Total Tagihan:</span>
                                    <span className="font-mono text-green-700">
                                        {formatRupiah(
                                            Math.round((bapForm.persen_bap / 111) * (selectedKontrakBap?.nilai_kontrak || 0)) + 
                                            Number(bapForm.total_potongan) + 
                                            Math.round(Math.round(Math.round((11/12) * Math.round((bapForm.persen_bap / 111) * (selectedKontrakBap?.nilai_kontrak || 0)))) * 0.12)
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Kolom Kanan: Tanggal & Addendum */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-sm border-b pb-1">Tanggal & Dokumen</h3>
                            <div className="grid gap-2">
                                <Label htmlFor="nomorbap" className="text-xs">Nomor BAP</Label>
                                <Input
                                    id="nomorbap"
                                    placeholder="Contoh: 001/BAP/2026"
                                    className="h-8"
                                    value={bapForm.nomor_bap}
                                    onChange={(e) => setBapForm({ ...bapForm, nomor_bap: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tglbap" className="text-xs">Tgl. BAP (Hari, Tgl Bln Thn)</Label>
                                <Input
                                    id="tglbap"
                                    type="date"
                                    className="h-8"
                                    value={bapForm.tgl_bap}
                                    onChange={(e) => setBapForm({ ...bapForm, tgl_bap: e.target.value })}
                                />
                                <p className="text-[10px] text-muted-foreground italic">{formatIndoDateFull(bapForm.tgl_bap)}</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tglbastp" className="text-xs">Tgl. BASTP</Label>
                                <Input
                                    id="tglbastp"
                                    type="date"
                                    className="h-8"
                                    value={bapForm.tgl_bastp}
                                    onChange={(e) => setBapForm({ ...bapForm, tgl_bastp: e.target.value })}
                                />
                                <p className="text-[10px] text-muted-foreground italic">{formatIndoDateSimple(bapForm.tgl_bastp)}</p>
                            </div>
                            <div className="space-y-2 border-t pt-2 mt-2">
                                <Label className="text-xs font-bold">Informasi Addendum (Opsional)</Label>
                                <div className="grid gap-2">
                                    <Input
                                        placeholder="Nomor SPK Addendum"
                                        className="h-8 text-xs"
                                        value={bapForm.nomor_spk_addendum}
                                        onChange={(e) => setBapForm({ ...bapForm, nomor_spk_addendum: e.target.value })}
                                    />
                                    <Input
                                        type="date"
                                        className="h-8 text-xs"
                                        value={bapForm.tgl_spk_addendum === '-' ? '' : bapForm.tgl_spk_addendum}
                                        onChange={(e) => setBapForm({ ...bapForm, tgl_spk_addendum: e.target.value || '-' })}
                                    />
                                    <Input
                                        placeholder="Nilai Kontrak Addendum"
                                        type="number"
                                        className="h-8 text-xs"
                                        value={bapForm.nilai_kontrak_addendum}
                                        onChange={(e) => setBapForm({ ...bapForm, nilai_kontrak_addendum: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="border-t pt-4">
                        <Button variant="outline" onClick={() => setIsBapModalOpen(false)}>Batal</Button>
                        <Button onClick={processBapExport}>Generate BAP</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
