import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
    importKontrak,
    downloadKontrakTemplate,
    exportKontrakDoc,
    exportKontrakRingkasan,
    exportKontrakCover,
    exportKontrakBAP,
    getKontrakBapContext,
    previewKontrakRingkasan,
} from '../api/kontrak';
import { kontrakKeys, useDeleteKontrak, useKontrakList } from '../hooks/useKontrak';
import type { Kontrak, KontrakBapContext, KontrakBapExportParams, KontrakImportResult } from '../types';
import {
    BapBlockedDialog,
    BapExportModal,
    buildBapPayloadFromContext,
} from './BapExportModal';
import { createDefaultBapForm, type BapFormState } from '../lib/bap-calculations';
import type { Pekerjaan } from '@/features/pekerjaan/types';
import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { BlobPreviewModal } from '@/components/shared/BlobPreviewModal';
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

function getApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) {
        const data = error.data as { message?: string } | undefined;
        return data?.message || error.message || fallback;
    }
    if (error instanceof Error) return error.message;
    return fallback;
}

function getImportErrorPayload(error: unknown): KontrakImportResult | undefined {
    if (error instanceof ApiError) {
        return error.data as KontrakImportResult | undefined;
    }
    return undefined;
}

interface KontrakRowProps {
    item: Kontrak;
    isAdmin: boolean;
    onDeleteRequest: (id: number) => void;
    handleExportDoc: (kontrak: Kontrak) => void;
    handleExportRingkasan: (kontrak: Kontrak) => void;
    handleExportCover: (kontrak: Kontrak) => void;
    handleExportBAP: (kontrak: Kontrak) => void | Promise<void>;
    handlePreview: (
        kontrak: Kontrak,
        type: 'spk' | 'ringkasan' | 'bap',
        bapPayload?: KontrakBapExportParams,
    ) => void;
}

// Memoized Row
const KontrakRow = React.memo(({
    item,
    isAdmin,
    onDeleteRequest,
    handleExportDoc,
    handleExportRingkasan,
    handleExportCover,
    handleExportBAP,
    handlePreview
}: KontrakRowProps) => {
    return (
        <TableRow key={item.id}>
            <TableCell>
                <div className="min-w-[250px] font-medium leading-normal py-2">
                    {item.pekerjaans?.length > 1 ? (
                        <div className="space-y-1">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                Konsolidasi ({item.pekerjaans.length} Paket)
                            </span>
                            {item.pekerjaans.map((p: Pekerjaan) => (
                                <div key={p.id} className="text-sm">• {p.nama_paket}</div>
                            ))}
                        </div>
                    ) : (
                        item.pekerjaans?.[0]?.nama_paket || '-'
                    )}
                </div>
            </TableCell>
            <TableCell className="text-right whitespace-nowrap">
                {formatRupiah(item.pekerjaans?.reduce((sum: number, p: Pekerjaan) => sum + (p.pagu || 0), 0) || 0)}
            </TableCell>
            <TableCell className="whitespace-nowrap">
                <Badge variant="outline">
                    {item.pekerjaans?.[0]?.kegiatan?.sumber_dana || '-'}
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
                    const diff = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
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
                        <DropdownMenuItem onClick={() => handleExportCover(item)}>
                            <FileText className="mr-2 h-4 w-4 text-purple-600" />
                            <span>Download Cover Kontrak</span>
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
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    onClick={() => onDeleteRequest(item.id)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Hapus Kontrak</span>
                                </DropdownMenuItem>
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
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
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
    const isAdmin = Boolean(user?.roles?.includes('admin'));

    const { data: kontrakRes, isLoading: loading, isError, error } = useKontrakList({
        page: currentPage,
        search: debouncedSearch || undefined,
        tahun: tahunAnggaran,
    });
    const kontrakList = kontrakRes?.data || [];
    const totalPages = kontrakRes?.meta?.last_page || 1;
    const total = kontrakRes?.meta?.total || 0;
    const deleteMutation = useDeleteKontrak();

    // Preview State
    const [previewingDoc, setPreviewingDoc] = useState<{ uri: string; fileName: string; fileType: string } | null>(null);

    // BAP Modal State
    const [isBapModalOpen, setIsBapModalOpen] = useState(false);
    const [isBapBlockedOpen, setIsBapBlockedOpen] = useState(false);
    const [isBapExporting, setIsBapExporting] = useState(false);
    const [selectedKontrakBap, setSelectedKontrakBap] = useState<Kontrak | null>(null);
    const [bapContext, setBapContext] = useState<KontrakBapContext | null>(null);
    const [blockedBapContext, setBlockedBapContext] = useState<KontrakBapContext | null>(null);
    const [bapForm, setBapForm] = useState<BapFormState>(createDefaultBapForm);

    const handleSearch = (val: string) => {
        setDebouncedSearch(val);
        setCurrentPage(1);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [tahunAnggaran]);

    useEffect(() => {
        if (isError) {
            console.error('Failed to fetch kontrak:', error);
            toast.error('Gagal memuat data kontrak');
        }
    }, [isError, error]);

    const handleConfirmDelete = () => {
        if (!deleteId) return;
        deleteMutation.mutate(deleteId, {
            onSettled: () => setDeleteId(null),
        });
    };

    const handlePreview = async (kontrak: Kontrak, type: 'spk' | 'ringkasan' | 'bap', bapPayload?: KontrakBapExportParams) => {
        if (type !== 'spk' && !kontrak.is_checklist_complete) {
            toast.error('Checklist pekerjaan belum 100% lengkap.');
            return;
        }

        const toastId = toast.loading(`Menyiapkan pratinjau ${type.toUpperCase()}...`);
        try {
            let blob: Blob;
            let fileName = '';

            if (type === 'spk') {
                blob = await exportKontrakDoc(kontrak.id);
                fileName = `SPK_${kontrak.pekerjaans?.[0]?.nama_paket?.replace(/\s+/g, '_') || 'Kontrak'}.docx`;
            } else if (type === 'ringkasan') {
                const preview = await previewKontrakRingkasan(kontrak.id);
                toast.dismiss(toastId);
                void navigate({
                    to: '/documents/onlyoffice/$mediaId',
                    params: { mediaId: String(preview.media_id) },
                    search: preview.title ? { title: preview.title } : {},
                });
                return;
            } else {
                blob = await exportKontrakBAP(kontrak.id, bapPayload);
                fileName = `BAP_${kontrak.pekerjaans?.[0]?.nama_paket?.replace(/\s+/g, '_') || 'Kontrak'}.docx`;
            }

            const url = window.URL.createObjectURL(blob);
            setPreviewingDoc({
                uri: url,
                fileName: fileName,
                fileType: 'docx'
            });
            toast.dismiss(toastId);
        } catch (error: unknown) {
            console.error('Preview failed:', error);
            toast.error(getApiErrorMessage(error, `Gagal menyiapkan pratinjau ${type}`), { id: toastId });
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
        } catch (error: unknown) {
            console.error('Download failed:', error);
            toast.error(getApiErrorMessage(error, 'Gagal mendownload template'));
        }
    };

    const handleImportClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls,.csv';
        input.onchange = async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            setIsImporting(true);
            setImportResult(null);
            setShowImportResult(true);

            try {
                const result = await importKontrak(formData);
                
                setImportResult({
                    success_count: result.success_count || 0,
                    error_count: result.error_count || 0,
                    errors: result.errors || [],
                    message: result.message
                });
                
                if ((result.error_count || 0) === 0) {
                    toast.success('Kontrak berhasil diimport');
                }
                
                queryClient.invalidateQueries({ queryKey: kontrakKeys.all });
            } catch (error: unknown) {
                console.error('Import failed:', error);
                const errorData = getImportErrorPayload(error);

                setImportResult({
                    success_count: errorData?.success_count || 0,
                    error_count: errorData?.error_count || 0,
                    errors: errorData?.errors || [{ message: getApiErrorMessage(error, 'Terjadi kesalahan saat mengimport data') }],
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
            const params: Record<string, string> = {};
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
        try {
            toast.loading(`Menyiapkan dokumen ${kontrak.pekerjaans?.[0]?.nama_paket || 'Kontrak'}...`);
            const blob = await exportKontrakDoc(kontrak.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = `SPK_${kontrak.pekerjaans?.[0]?.nama_paket?.replace(/\s+/g, '_') || 'Kontrak'}_${kontrak.nomor_penawaran?.replace(/[\/\\]/g, '_')}.docx`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.dismiss();
            toast.success('Dokumen berhasil digenerate');
        } catch (error: unknown) {
            console.error('Export failed:', error);
            toast.error(getApiErrorMessage(error, 'Gagal generate dokumen'));
        }
    };

    const handleExportRingkasan = async (kontrak: Kontrak) => {
        if (!kontrak.is_checklist_complete) {
            toast.error('Checklist pekerjaan belum 100% lengkap.');
            return;
        }
        try {
            toast.loading(`Menyiapkan ringkasan ${kontrak.pekerjaans?.[0]?.nama_paket || 'Kontrak'}...`);
            const blob = await exportKontrakRingkasan(kontrak.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = `Ringkasan_${kontrak.pekerjaans?.[0]?.nama_paket?.replace(/\s+/g, '_') || 'Kontrak'}.xlsx`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.dismiss();
            toast.success('Ringkasan berhasil digenerate');
        } catch (error: unknown) {
            console.error('Export failed:', error);
            toast.error(getApiErrorMessage(error, 'Gagal generate ringkasan'));
        }
    };

    const handleExportCover = async (kontrak: Kontrak) => {
        const subBidang = kontrak.pekerjaans?.[0]?.kegiatan?.sub_bidang || kontrak.kegiatan?.sub_bidang;

        if (!subBidang) {
            toast.error('Sub bidang pekerjaan belum tersedia');
            return;
        }

        try {
            toast.loading(`Menyiapkan cover kontrak ${kontrak.pekerjaans?.[0]?.nama_paket || 'Kontrak'}...`);
            const blob = await exportKontrakCover(kontrak.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = `Cover_Kontrak_${kontrak.pekerjaans?.[0]?.nama_paket?.replace(/\s+/g, '_') || 'Kontrak'}.docx`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.dismiss();
            toast.success('Cover kontrak berhasil didownload');
        } catch (error) {
            console.error('Export cover failed:', error);
            const msg = error instanceof Error ? error.message : 'Gagal download cover kontrak';
            toast.error(msg);
        }
    };

    const handleExportBAP = async (kontrak: Kontrak) => {
        if (!kontrak.is_checklist_complete) {
            toast.error('Checklist pekerjaan belum 100% lengkap.');
            return;
        }

        const toastId = toast.loading('Memuat data BAP...');
        try {
            const context = await getKontrakBapContext(kontrak.id);
            toast.dismiss(toastId);

            if (!context.can_generate) {
                setSelectedKontrakBap(kontrak);
                setBlockedBapContext(context);
                setIsBapBlockedOpen(true);
                return;
            }

            setSelectedKontrakBap(kontrak);
            setBapContext(context);
            setBapForm(createDefaultBapForm({
                jaminanUangMuka: context.jaminan_uang_muka
                    ? {
                        nomor: context.jaminan_uang_muka.nomor,
                        tanggal: context.jaminan_uang_muka.tanggal,
                    }
                    : null,
                uangMuka: context.uang_muka
                    ? {
                        nomor: context.uang_muka.nomor,
                        tanggal: context.uang_muka.tanggal,
                        nilai: context.uang_muka.nilai ?? null,
                    }
                    : null,
            }));
            setIsBapModalOpen(true);
        } catch (error: unknown) {
            console.error('BAP context failed:', error);
            toast.error(getApiErrorMessage(error, 'Gagal memuat data BAP'), { id: toastId });
        }
    };

    const processBapExport = async () => {
        if (!selectedKontrakBap || !bapContext) return;

        setIsBapExporting(true);
        const payload = buildBapPayloadFromContext(bapForm, bapContext);

        try {
            toast.loading(`Menyiapkan BAP ${selectedKontrakBap.pekerjaans?.[0]?.nama_paket || 'Kontrak'}...`);
            const blob = await exportKontrakBAP(selectedKontrakBap.id, payload);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = `BAP_${selectedKontrakBap.pekerjaans?.[0]?.nama_paket?.replace(/\s+/g, '_') || 'Kontrak'}.docx`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.dismiss();
            toast.success('BAP berhasil digenerate');
            setIsBapModalOpen(false);
        } catch (error: unknown) {
            console.error('Export failed:', error);
            toast.error(getApiErrorMessage(error, 'Gagal generate BAP'));
        } finally {
            setIsBapExporting(false);
        }
    };

    const handleBapPreview = () => {
        if (!selectedKontrakBap || !bapContext) return;
        const payload = buildBapPayloadFromContext(bapForm, bapContext);
        handlePreview(selectedKontrakBap, 'bap', payload);
    };

    return (
        <>
            <ListPageLayout
                shell
                title="Kontrak"
                description="Kelola data kontrak pekerjaan"
                cardTitle={`Daftar Kontrak (${total})`}
                action={(
                    <div className="flex flex-wrap items-center gap-2">
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
                )}
                toolbar={(
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
                            className="w-full sm:w-64"
                        />
                    </div>
                )}
                footer={totalPages > 1 ? (
                    <ListPagination
                        page={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        disabled={loading}
                        meta={{
                            from: kontrakRes?.meta?.from,
                            to: kontrakRes?.meta?.to,
                            total,
                            label: 'kontrak',
                        }}
                    />
                ) : undefined}
            >
                {loading ? (
                    <TableSkeleton columns={10} rows={10} />
                ) : kontrakList.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Tidak ada data kontrak.
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-6 px-6">
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
                                        onDeleteRequest={setDeleteId}
                                        handleExportDoc={handleExportDoc}
                                        handleExportRingkasan={handleExportRingkasan}
                                        handleExportCover={handleExportCover}
                                        handleExportBAP={handleExportBAP}
                                        handlePreview={handlePreview}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </ListPageLayout>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                entityName="Kontrak"
                onConfirm={handleConfirmDelete}
                isPending={deleteMutation.isPending}
            />

            <BapBlockedDialog
                open={isBapBlockedOpen}
                onOpenChange={setIsBapBlockedOpen}
                kontrak={selectedKontrakBap}
                context={blockedBapContext}
            />

            <BapExportModal
                open={isBapModalOpen}
                onOpenChange={setIsBapModalOpen}
                kontrak={selectedKontrakBap}
                context={bapContext}
                form={bapForm}
                onFormChange={setBapForm}
                onPreview={handleBapPreview}
                onExport={processBapExport}
                isExporting={isBapExporting}
            />

            {previewingDoc && (
                <BlobPreviewModal
                    isOpen={!!previewingDoc}
                    onClose={() => {
                        window.URL.revokeObjectURL(previewingDoc.uri);
                        setPreviewingDoc(null);
                    }}
                    uri={previewingDoc.uri}
                    fileName={previewingDoc.fileName}
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
                                ? 'Mohon tunggu sejenak, sistem sedang memproses file XLSX.'
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
                                        Tips: Perbaiki data pada baris tersebut di file Excel, lalu coba import kembali.
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
