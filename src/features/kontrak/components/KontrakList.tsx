import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
    importKontrak,
    downloadKontrakTemplate,
    exportKontrakDoc,
    exportKontrakRingkasan,
    exportKontrakCover,
    exportAllKontrakCovers,
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
import {
    RingkasanExportModal,
    buildRingkasanExportPayload,
    createDefaultRingkasanForm,
    type RingkasanFormState,
} from './RingkasanExportModal';
import { createDefaultBapForm, type BapFormState } from '../lib/bap-calculations';
import { useAuthStore } from '@/stores/auth-stores';
import { Button } from '@/components/ui/button';

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Plus,
    Download,
    Upload,
    FileSpreadsheet,
    Loader2,
    AlertCircle,
    CheckCircle2,
    SearchX,
    RefreshCw,
    Wrench,
} from 'lucide-react';
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
import { KontrakRow } from './KontrakRow';
import { KontrakMobileCard } from './KontrakMobileCard';
import {
    getKontrakApiErrorMessage as getApiErrorMessage,
    getKontrakImportErrorPayload as getImportErrorPayload,
    downloadKontrakBlob,
    sanitizeKontrakFileName,
} from '../lib/kontrak-list-utils';

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

    const { data: kontrakRes, isLoading: loading, isError, error, refetch } = useKontrakList({
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
    const [isRingkasanModalOpen, setIsRingkasanModalOpen] = useState(false);
    const [selectedKontrakRingkasan, setSelectedKontrakRingkasan] = useState<Kontrak | null>(null);
    const [ringkasanForm, setRingkasanForm] = useState<RingkasanFormState>(createDefaultRingkasanForm);
    const [isRingkasanBusy, setIsRingkasanBusy] = useState(false);
    const [selectedKontrakBap, setSelectedKontrakBap] = useState<Kontrak | null>(null);
    const [bapContext, setBapContext] = useState<KontrakBapContext | null>(null);
    const [blockedBapContext, setBlockedBapContext] = useState<KontrakBapContext | null>(null);
    const [bapForm, setBapForm] = useState<BapFormState>(createDefaultBapForm);
    const [isDownloadingAllCover, setIsDownloadingAllCover] = useState(false);

    // Callback stabil supaya React.memo pada KontrakRow / KontrakMobileCard efektif
    // (dan SearchInput tidak restart timer debounce tiap render)
    const handleSearch = useCallback((val: string) => {
        setDebouncedSearch(val);
        setCurrentPage(1);
    }, []);

    const handleResetFilters = useCallback(() => {
        setDebouncedSearch('');
        setCurrentPage(1);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [tahunAnggaran]);

    const handleConfirmDelete = () => {
        if (!deleteId) return;
        deleteMutation.mutate(deleteId, {
            onSettled: () => setDeleteId(null),
        });
    };

    const openRingkasanModal = useCallback((kontrak: Kontrak) => {
        setSelectedKontrakRingkasan(kontrak);
        setRingkasanForm(createDefaultRingkasanForm());
        setIsRingkasanModalOpen(true);
    }, []);

    const handlePreview = useCallback(async (
        kontrak: Kontrak,
        type: 'spk' | 'ringkasan' | 'bap',
        bapPayload?: KontrakBapExportParams,
        ringkasanPayload?: ReturnType<typeof buildRingkasanExportPayload>,
    ) => {
        if (type === 'ringkasan' && !ringkasanPayload) {
            openRingkasanModal(kontrak);
            return;
        }

        const toastId = toast.loading(`Menyiapkan pratinjau ${type.toUpperCase()}...`);
        try {
            let blob: Blob;
            let fileName = '';

            if (type === 'spk') {
                blob = await exportKontrakDoc(kontrak.id);
                fileName = `SPK_${sanitizeKontrakFileName(kontrak.pekerjaans?.[0]?.nama_paket)}.docx`;
            } else if (type === 'ringkasan') {
                const preview = await previewKontrakRingkasan(kontrak.id, ringkasanPayload);
                toast.dismiss(toastId);
                void navigate({
                    to: '/documents/onlyoffice/$mediaId',
                    params: { mediaId: String(preview.media_id) },
                    search: preview.title ? { title: preview.title } : {},
                });
                return;
            } else {
                blob = await exportKontrakBAP(kontrak.id, bapPayload);
                fileName = `BAP_${sanitizeKontrakFileName(kontrak.pekerjaans?.[0]?.nama_paket)}.docx`;
            }

            setPreviewingDoc({
                uri: window.URL.createObjectURL(blob),
                fileName,
                fileType: 'docx'
            });
            toast.dismiss(toastId);
        } catch (err: unknown) {
            console.error('Preview failed:', err);
            toast.error(getApiErrorMessage(err, `Gagal menyiapkan pratinjau ${type}`), { id: toastId });
        }
    }, [navigate, openRingkasanModal]);



    const handleDownloadTemplate = async () => {
        const toastId = toast.loading('Menyiapkan template...');
        try {
            const blob = await downloadKontrakTemplate(tahunAnggaran);
            downloadKontrakBlob(blob, 'template_kontrak.xlsx');
            toast.dismiss(toastId);
            toast.success('Template berhasil didownload');
        } catch (err: unknown) {
            console.error('Download failed:', err);
            toast.error(getApiErrorMessage(err, 'Gagal mendownload template'), { id: toastId });
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

            downloadKontrakBlob(response, `data_kontrak_${tahunAnggaran || 'all'}.xlsx`);
            toast.success('Excel berhasil didownload');
        } catch (error) {
            console.error('Failed to export excel:', error);
            toast.error('Gagal export excel');
        }
    };

    const handleExportDoc = useCallback(async (kontrak: Kontrak) => {
        const toastId = toast.loading(`Menyiapkan dokumen ${kontrak.pekerjaans?.[0]?.nama_paket || 'Kontrak'}...`);
        try {
            const blob = await exportKontrakDoc(kontrak.id);
            const paketName = sanitizeKontrakFileName(kontrak.pekerjaans?.[0]?.nama_paket);
            const nomor = kontrak.nomor_penawaran?.replace(/[\/\\]/g, '_');
            downloadKontrakBlob(blob, `SPK_${paketName}${nomor ? `_${nomor}` : ''}.docx`);
            toast.dismiss(toastId);
            toast.success('Dokumen berhasil digenerate');
        } catch (err: unknown) {
            console.error('Export failed:', err);
            toast.error(getApiErrorMessage(err, 'Gagal generate dokumen'), { id: toastId });
        }
    }, []);

    const handleExportRingkasan = useCallback((kontrak: Kontrak) => {
        openRingkasanModal(kontrak);
    }, [openRingkasanModal]);

    const processRingkasanExport = async () => {
        if (!selectedKontrakRingkasan) return;
        const payload = buildRingkasanExportPayload(ringkasanForm);
        setIsRingkasanBusy(true);
        const toastId = toast.loading(`Menyiapkan ringkasan ${selectedKontrakRingkasan.pekerjaans?.[0]?.nama_paket || 'Kontrak'}...`);
        try {
            const blob = await exportKontrakRingkasan(selectedKontrakRingkasan.id, payload);
            const fileName = `Ringkasan_${sanitizeKontrakFileName(selectedKontrakRingkasan.pekerjaans?.[0]?.nama_paket)}.xlsx`;
            downloadKontrakBlob(blob, fileName);
            toast.dismiss(toastId);
            toast.success('Ringkasan berhasil digenerate');
            setIsRingkasanModalOpen(false);
        } catch (err: unknown) {
            console.error('Export failed:', err);
            toast.error(getApiErrorMessage(err, 'Gagal generate ringkasan'), { id: toastId });
        } finally {
            setIsRingkasanBusy(false);
        }
    };

    const processRingkasanPreview = async () => {
        if (!selectedKontrakRingkasan) return;
        const payload = buildRingkasanExportPayload(ringkasanForm);
        setIsRingkasanBusy(true);
        try {
            await handlePreview(selectedKontrakRingkasan, 'ringkasan', undefined, payload);
            setIsRingkasanModalOpen(false);
        } finally {
            setIsRingkasanBusy(false);
        }
    };

    const handleExportAllCovers = async () => {
        setIsDownloadingAllCover(true);
        const toastId = toast.loading(`Menyiapkan semua cover kontrak TA ${tahunAnggaran}...`);
        try {
            const blob = await exportAllKontrakCovers(tahunAnggaran);
            downloadKontrakBlob(blob, `Cover_Kontrak_${tahunAnggaran}.zip`);
            toast.success('Semua cover kontrak berhasil didownload (ZIP)', { id: toastId });
        } catch (err: unknown) {
            console.error('Export all covers failed:', err);
            toast.error(getApiErrorMessage(err, 'Gagal download semua cover kontrak'), { id: toastId });
        } finally {
            setIsDownloadingAllCover(false);
        }
    };

    const handleExportCover = useCallback(async (kontrak: Kontrak) => {
        const subBidang = kontrak.pekerjaans?.[0]?.kegiatan?.sub_bidang || kontrak.kegiatan?.sub_bidang;

        if (!subBidang) {
            toast.error('Sub bidang pekerjaan belum tersedia');
            return;
        }

        const toastId = toast.loading(`Menyiapkan cover kontrak ${kontrak.pekerjaans?.[0]?.nama_paket || 'Kontrak'}...`);
        try {
            const blob = await exportKontrakCover(kontrak.id);
            const fileName = `Cover_Kontrak_${sanitizeKontrakFileName(kontrak.pekerjaans?.[0]?.nama_paket)}.docx`;
            downloadKontrakBlob(blob, fileName);
            toast.dismiss(toastId);
            toast.success('Cover kontrak berhasil didownload');
        } catch (err) {
            console.error('Export cover failed:', err);
            const msg = err instanceof Error ? err.message : 'Gagal download cover kontrak';
            toast.error(msg, { id: toastId });
        }
    }, []);

    const handleExportBAP = useCallback(async (kontrak: Kontrak) => {
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
        } catch (err: unknown) {
            console.error('BAP context failed:', err);
            toast.error(getApiErrorMessage(err, 'Gagal memuat data BAP'), { id: toastId });
        }
    }, []);

    const processBapExport = async () => {
        if (!selectedKontrakBap || !bapContext) return;

        setIsBapExporting(true);
        const payload = buildBapPayloadFromContext(bapForm, bapContext);
        const toastId = toast.loading(`Menyiapkan BAP ${selectedKontrakBap.pekerjaans?.[0]?.nama_paket || 'Kontrak'}...`);

        try {
            const blob = await exportKontrakBAP(selectedKontrakBap.id, payload);
            const fileName = `BAP_${sanitizeKontrakFileName(selectedKontrakBap.pekerjaans?.[0]?.nama_paket)}.docx`;
            downloadKontrakBlob(blob, fileName);
            toast.dismiss(toastId);
            toast.success('BAP berhasil digenerate');
            setIsBapModalOpen(false);
        } catch (err: unknown) {
            console.error('Export failed:', err);
            toast.error(getApiErrorMessage(err, 'Gagal generate BAP'), { id: toastId });
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
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Wrench className="mr-2 h-4 w-4" />
                                    Utilitas
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[220px]">
                                <DropdownMenuLabel className="py-1 text-[10px] font-bold uppercase text-muted-foreground">
                                    Data Massal
                                </DropdownMenuLabel>
                                <DropdownMenuItem onClick={handleExportExcel}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                                    <span>Ekspor Excel</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDownloadTemplate}>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Download Template</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        if (isImporting) e.preventDefault();
                                        else handleImportClick();
                                    }}
                                    disabled={isImporting}
                                >
                                    {isImporting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Upload className="mr-2 h-4 w-4" />
                                    )}
                                    <span>Impor XLSX</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        if (isDownloadingAllCover) e.preventDefault();
                                        else void handleExportAllCovers();
                                    }}
                                    disabled={isDownloadingAllCover}
                                >
                                    {isDownloadingAllCover ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="mr-2 h-4 w-4" />
                                    )}
                                    <span>Download Semua Cover</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button asChild>
                            <Link to="/kontrak/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Kontrak
                            </Link>
                        </Button>
                    </div>
                )}
                toolbar={(
                    <SearchInput
                        defaultValue={debouncedSearch}
                        onSearch={handleSearch}
                        placeholder="Cari kontrak (paket, SPK, penyedia)..."
                        className="w-full sm:w-72"
                    />
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
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                        <div className="space-y-1">
                            <p className="font-medium">Gagal memuat data kontrak</p>
                            <p className="text-sm text-muted-foreground">
                                {getApiErrorMessage(error, 'Terjadi kesalahan saat memuat daftar kontrak.')}
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => void refetch()}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Coba Lagi
                        </Button>
                    </div>
                ) : kontrakList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <SearchX className="h-10 w-10 text-muted-foreground" />
                        <div className="space-y-1">
                            <p className="font-medium">Tidak ada data kontrak</p>
                            <p className="text-sm text-muted-foreground">
                                {debouncedSearch
                                    ? `Tidak ada kontrak yang cocok dengan "${debouncedSearch}".`
                                    : 'Belum ada kontrak untuk tahun anggaran ini.'}
                            </p>
                        </div>
                        {debouncedSearch && (
                            <Button variant="outline" size="sm" onClick={handleResetFilters}>
                                Reset pencarian
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Mobile / tablet kecil: kartu (kolom tabel terlalu lebar untuk layar ini) */}
                        <div className="space-y-3 lg:hidden">
                            {kontrakList.map((item) => (
                                <KontrakMobileCard
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
                        </div>

                        {/* Desktop: tabel; kolom berkurang bertahap per breakpoint,
                            informasi kolom tersembunyi tetap ada di baris meta "Pekerjaan" */}
                        <div className="hidden overflow-x-auto lg:block">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[200px]">Pekerjaan</TableHead>
                                        <TableHead className="hidden text-right min-w-[150px] xl:table-cell">Pagu</TableHead>
                                        <TableHead className="hidden min-w-[110px] min-[1800px]:table-cell">Sumber Dana</TableHead>
                                        <TableHead className="min-w-[110px]">Penyedia</TableHead>
                                        <TableHead className="text-right min-w-[160px]">Nilai Kontrak</TableHead>
                                        <TableHead className="hidden min-w-[150px] 2xl:table-cell">No/Tgl SPK</TableHead>
                                        <TableHead className="hidden min-w-[150px] 2xl:table-cell">No/Tgl SPMK</TableHead>
                                        <TableHead className="hidden text-center min-w-[80px] min-[1800px]:table-cell">Masa</TableHead>
                                        <TableHead className="min-w-[90px]">Tgl. Selesai</TableHead>
                                        <TableHead className="sticky right-0 z-10 bg-background text-right shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] min-w-[56px]">Aksi</TableHead>
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
                    </>
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

            <RingkasanExportModal
                open={isRingkasanModalOpen}
                onOpenChange={setIsRingkasanModalOpen}
                kontrak={selectedKontrakRingkasan}
                form={ringkasanForm}
                onFormChange={setRingkasanForm}
                onPreview={processRingkasanPreview}
                onExport={processRingkasanExport}
                isBusy={isRingkasanBusy}
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
