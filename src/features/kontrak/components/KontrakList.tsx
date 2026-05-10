import React, { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { getKontrak, deleteKontrak, importKontrak, downloadKontrakTemplate, exportKontrakDoc, exportKontrakRingkasan, exportKontrakBAP } from '../api/kontrak';
import type { Kontrak } from '../types';
import { useAuthStore } from '@/stores/auth-stores';
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
import { Pencil, Trash2, Plus, FileText, Download, Upload, ClipboardList, ClipboardCheck, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2, MoreHorizontal, Eye } from 'lucide-react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import api from '@/lib/api-client';
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { DocViewerModal } from '@/components/shared/DocViewerModal';
import { Progress } from '@/components/ui/progress';
// Utilities
const formatRupiah = (value: number) => {
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

// Memoized Row
const KontrakRow = React.memo(({ 
    item, 
    isAdmin, 
    handleDelete, 
    handleExportDoc, 
    handleExportRingkasan, 
    handleExportBAP,
    handlePreview
}: any) => {
    return (
        <TableRow key={item.id}>
            <TableCell>
                <div className="min-w-[250px] font-medium leading-normal py-2">
                    {item.pekerjaan?.nama_paket || '-'}
                </div>
            </TableCell>
            <TableCell className="text-right whitespace-nowrap">
                {formatRupiah(item.pekerjaan?.pagu || 0)}
            </TableCell>
            <TableCell className="whitespace-nowrap">
                <Badge variant="outline">
                    {item.pekerjaan?.kegiatan?.sumber_dana || '-'}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="min-w-[150px] leading-normal">
                    {item.penyedia?.nama || '-'}
                </div>
            </TableCell>
            <TableCell className="text-right font-medium whitespace-nowrap">
                {formatRupiah(item.nilai_kontrak)}
            </TableCell>
            <TableCell className="whitespace-nowrap">
                <div className="text-xs">
                    <Link to="/kontrak/$id" params={{ id: item.id.toString() }} className="font-medium text-primary hover:underline">
                        {item.spk || '-'}
                    </Link>
                    <div className="text-muted-foreground">{formatDate(item.tgl_spk)}</div>
                </div>
            </TableCell>
            <TableCell className="whitespace-nowrap">
                <div className="text-xs">
                    <div className="font-medium">{item.spmk || '-'}</div>
                    <div className="text-muted-foreground">{formatDate(item.tgl_spmk)}</div>
                </div>
            </TableCell>
            <TableCell className="text-center whitespace-nowrap">
                {(() => {
                    if (!item.tgl_spmk || !item.tgl_selesai) return '-';
                    const start = new Date(item.tgl_spmk);
                    const end = new Date(item.tgl_selesai);
                    const diff = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    return <Badge variant="secondary">{diff} Hari</Badge>;
                })()}
            </TableCell>
            <TableCell className="whitespace-nowrap">{formatDate(item.tgl_selesai)}</TableCell>
            <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase py-1">Umum</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link to="/kontrak/$id" params={{ id: item.id.toString() }}>
                                <Eye className="mr-2 h-4 w-4 text-primary" />
                                <span>Detail Kontrak</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase py-1">SPK</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handlePreview(item, 'spk')}>
                            <Eye className="mr-2 h-4 w-4 text-blue-600" />
                            <span>Pratinjau SPK</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportDoc(item)}>
                            <FileText className="mr-2 h-4 w-4 text-blue-600" />
                            <span>Ekspor SPK (Word)</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase py-1">Ringkasan</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handlePreview(item, 'ringkasan')}>
                            <Eye className="mr-2 h-4 w-4 text-green-600" />
                            <span>Pratinjau Ringkasan</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportRingkasan(item)}>
                            <ClipboardList className="mr-2 h-4 w-4 text-green-600" />
                            <span>Ekspor Ringkasan</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase py-1">BAP & Lainnya</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleExportBAP(item)}>
                            <ClipboardCheck className="mr-2 h-4 w-4 text-orange-600" />
                            <span>Buat BAP</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/kontrak/$id/edit" params={{ id: item.id.toString() }}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Ubah Data</span>
                            </Link>
                        </DropdownMenuItem>
                        
                        {isAdmin && (
                            <>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Hapus Kontrak</span>
                                        </DropdownMenuItem>
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
                                            <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                                Hapus
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
});

KontrakRow.displayName = 'KontrakRow';

export default function KontrakList() {
    const [kontrakList, setKontrakList] = useState<Kontrak[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{
        success_count: number;
        error_count: number;
        errors: Array<{ row?: number; message: string }>;
        message?: string;
    } | null>(null);
    const [showImportResult, setShowImportResult] = useState(false);
    const { tahunAnggaran } = useAppSettingsValues();
    const user = useAuthStore(state => state.auth.user);
    const isAdmin = user?.roles?.includes('admin');

    // Preview State
    const [previewingDoc, setPreviewingDoc] = useState<{ uri: string; fileName: string; fileType: string } | null>(null);

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

    const handleSearch = (val: string) => {
        setDebouncedSearch(val);
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchKontrak(1, debouncedSearch, tahunAnggaran);
    }, [debouncedSearch, tahunAnggaran]);

    useEffect(() => {
        fetchKontrak(currentPage, debouncedSearch, tahunAnggaran);
    }, [currentPage]);

    const handleDelete = async (id: number) => {
        try {
            await deleteKontrak(id);
            toast.success('Kontrak berhasil dihapus');
            fetchKontrak(currentPage, debouncedSearch, tahunAnggaran);
        } catch (error) {
            console.error('Failed to delete kontrak:', error);
            toast.error('Gagal menghapus kontrak');
        }
    };

    const handlePreview = async (kontrak: Kontrak, type: 'spk' | 'ringkasan' | 'bap', bapPayload?: any) => {
        if (!kontrak.is_checklist_complete) {
            toast.error("Checklist pekerjaan belum 100% lengkap bos!");
            return;
        }

        const toastId = toast.loading(`Menyiapkan pratinjau ${type.toUpperCase()}...`);
        try {
            let blob: Blob;
            let fileName = '';

            if (type === 'spk') {
                blob = await exportKontrakDoc(kontrak.id);
                fileName = `SPK_${kontrak.pekerjaan?.nama_paket?.replace(/\s+/g, '_')}.docx`;
            } else if (type === 'ringkasan') {
                blob = await exportKontrakRingkasan(kontrak.id);
                fileName = `Ringkasan_${kontrak.pekerjaan?.nama_paket?.replace(/\s+/g, '_')}.docx`;
            } else {
                // BAP
                blob = await exportKontrakBAP(kontrak.id, bapPayload);
                fileName = `BAP_${kontrak.pekerjaan?.nama_paket?.replace(/\s+/g, '_')}.docx`;
            }

            const url = window.URL.createObjectURL(blob);
            setPreviewingDoc({
                uri: url,
                fileName: fileName,
                fileType: 'docx'
            });
            toast.dismiss(toastId);
        } catch (error: any) {
            console.error('Preview failed:', error);
            toast.error(error.response?.data?.message || `Gagal menyiapkan pratinjau ${type}`, { id: toastId });
        }
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
            setImportResult(null);
            setShowImportResult(true);

            try {
                const result: any = await importKontrak(formData);
                
                setImportResult({
                    success_count: result.success_count || 0,
                    error_count: result.error_count || 0,
                    errors: result.errors || [],
                    message: result.message
                });
                
                if ((result.error_count || 0) === 0) {
                    toast.success('Kontrak berhasil diimport');
                }
                
                fetchKontrak(currentPage, debouncedSearch, tahunAnggaran);
            } catch (error: any) {
                console.error('Import failed:', error);
                const errorData = error.response?.data;
                
                setImportResult({
                    success_count: errorData?.success_count || 0,
                    error_count: errorData?.error_count || 0,
                    errors: errorData?.errors || [{ message: error.response?.data?.message || error.message }],
                    message: errorData?.message || 'Terjadi kesalahan saat mengimport data'
                });
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
            if (debouncedSearch) params.search = debouncedSearch;
            
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
                            Impor XLSX
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
                                    Ekspor Excel
                                </Button>
                                <SearchInput 
                                    defaultValue={debouncedSearch} 
                                    onSearch={handleSearch} 
                                    placeholder="Cari kontrak..."
                                    className="w-full md:w-64"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        {loading ? (
                            <TableSkeleton columns={10} rows={10} />
                        ) : kontrakList.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Tidak ada data kontrak.
                            </div>
                        ) : (
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
                                        {kontrakList.map((item) => (
                                            <KontrakRow 
                                                key={item.id} 
                                                item={item} 
                                                isAdmin={isAdmin}
                                                handleDelete={handleDelete}
                                                handleExportDoc={handleExportDoc}
                                                handleExportRingkasan={handleExportRingkasan}
                                                handleExportBAP={handleExportBAP}
                                                handlePreview={handlePreview}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

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
                        <DialogTitle>Buat BAP & Penagihan</DialogTitle>
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
                        <Button variant="secondary" onClick={() => {
                            // Collect payload for BAP preview
                            const nilaiKontrak = selectedKontrakBap?.nilai_kontrak || 0;
                            const persen = bapForm.persen_bap;
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
                                nilai_kontrak: kontrak_persen
                            };
                            handlePreview(selectedKontrakBap!, 'bap', payload);
                        }}>Pratinjau BAP</Button>
                        <Button onClick={processBapExport}>Buat BAP</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {previewingDoc && (
                <DocViewerModal
                    isOpen={!!previewingDoc}
                    onClose={() => {
                        window.URL.revokeObjectURL(previewingDoc.uri);
                        setPreviewingDoc(null);
                    }}
                    documents={[{
                        uri: previewingDoc.uri,
                        fileName: previewingDoc.fileName,
                        fileType: previewingDoc.fileType
                    }]}
                    title={`Pratinjau: ${previewingDoc.fileName}`}
                />
            )}

            {/* Import Result Dialog */}
            <Dialog open={showImportResult} onOpenChange={(open: boolean) => !isImporting && setShowImportResult(open)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {isImporting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                    Sedang Mengimport...
                                </>
                            ) : (
                                <>
                                    {importResult && importResult.error_count > 0 ? (
                                        <AlertCircle className="h-5 w-5 text-amber-500" />
                                    ) : (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    )}
                                    Hasil Import Kontrak
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {isImporting 
                                ? "Mohon tunggu sejenak, sistem sedang memproses file XLSX bos."
                                : importResult?.message || "Proses import telah selesai."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {isImporting && (
                        <div className="py-6 space-y-4">
                            <Progress value={undefined} className="h-2 w-full animate-pulse" />
                            <p className="text-center text-xs text-muted-foreground animate-pulse">
                                Menghubungkan ke server...
                            </p>
                        </div>
                    )}

                    {!isImporting && importResult && (
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 border border-green-100 p-3 rounded-lg text-center">
                                    <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Sukses</p>
                                    <p className="text-2xl font-bold text-green-700">{importResult.success_count}</p>
                                </div>
                                <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-center">
                                    <p className="text-xs text-red-600 font-medium uppercase tracking-wider">Gagal</p>
                                    <p className="text-2xl font-bold text-red-700">{importResult.error_count}</p>
                                </div>
                            </div>

                            {importResult.errors.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        Detail Kesalahan:
                                    </p>
                                    <div className="max-h-[200px] overflow-y-auto border rounded-md p-2 bg-slate-50 text-xs space-y-2">
                                        {importResult.errors.map((err, idx) => (
                                            <div key={idx} className="flex gap-2 pb-2 border-b last:border-0 border-slate-200">
                                                {err.row && (
                                                    <span className="font-bold text-slate-500 min-w-[50px]">Baris {err.row}:</span>
                                                )}
                                                <span className="text-red-600">{err.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">
                                        Tips: Perbaiki data pada baris tersebut di file Excel bos, lalu coba import kembali.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button 
                            onClick={() => setShowImportResult(false)} 
                            disabled={isImporting}
                            className="w-full sm:w-auto"
                        >
                            {importResult && importResult.error_count > 0 ? "Tutup & Perbaiki" : "Selesai"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
