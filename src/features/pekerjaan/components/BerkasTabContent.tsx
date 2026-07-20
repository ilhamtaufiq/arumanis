import { useEffect, useMemo, useState } from 'react';
import type { Berkas } from '@/features/berkas/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pencil, Trash2, Loader2, Download, FileText, Eye, FileDown, ChevronDown, FileType, Share2 } from 'lucide-react';
import { BerkasQuickShareDialog } from './BerkasQuickShareDialog';
import { toast } from 'sonner';
import EmbeddedBerkasForm from './EmbeddedBerkasForm';
import { DocumentPreviewModal } from '@/components/shared/DocumentPreviewModal';
import { resolveBerkasFileName } from '@/features/documents/lib/resolve-berkas-file-name';
import { useBerkasList, useDeleteBerkas } from '@/features/berkas/hooks/useBerkas';
import { downloadBffApiFile, safeDownloadFilename } from '@/lib/download-file';
import {
    getPengawasVisibleBerkasJuduls,
    matchesPengawasSharedBerkasJudul,
    useAppSettings,
} from '@/features/settings/api';
import { useAuthStore } from '@/stores/auth-stores';

interface BerkasTabContentProps {
    pekerjaanId: number;
    namaPaket?: string;
}

const FIELD_ROLES = new Set(['pengawas', 'konsultan_pengawas']);
const PRIVILEGED_ROLES = new Set(['admin', 'manager', 'super-admin', 'operator']);

function isFieldPengawasOnly(roles: string[] | undefined): boolean {
    if (!roles?.length) return false;
    const hasField = roles.some((r) => FIELD_ROLES.has(r));
    const hasPrivileged = roles.some((r) => PRIVILEGED_ROLES.has(r));
    return hasField && !hasPrivileged;
}

export default function BerkasTabContent({ pekerjaanId, namaPaket }: BerkasTabContentProps) {
    const [downloadingZip, setDownloadingZip] = useState(false);
    const [editingFile, setEditingFile] = useState<Berkas | null>(null);
    const [previewingFile, setPreviewingFile] = useState<Berkas | null>(null);
    const [quickShareOpen, setQuickShareOpen] = useState(false);
    const [quickShareBerkasIds, setQuickShareBerkasIds] = useState<number[] | undefined>(undefined);
    const [quickShareLabel, setQuickShareLabel] = useState('semua berkas pekerjaan ini');

    const userRoles = useAuthStore((s) => s.auth.user?.roles ?? []);
    const fieldOnly = isFieldPengawasOnly(userRoles);
    const { data: settingsData } = useAppSettings({ enabled: true });
    const sharedJuduls = useMemo(
        () => getPengawasVisibleBerkasJuduls(settingsData?.data),
        [settingsData?.data],
    );

    const { data, isLoading, isError, refetch } = useBerkasList({ pekerjaan_id: pekerjaanId });
    const deleteMutation = useDeleteBerkas();

    const berkasList = data?.data ?? [];

    useEffect(() => {
        if (isError) {
            toast.error('Gagal memuat data berkas');
        }
    }, [isError]);

    const handleBerkasSuccess = () => {
        setEditingFile(null);
        refetch();
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const openQuickShare = (berkasIds?: number[], label = 'semua berkas pekerjaan ini') => {
        setQuickShareBerkasIds(berkasIds);
        setQuickShareLabel(label);
        setQuickShareOpen(true);
    };

    const quickShareFileCount = quickShareBerkasIds?.length ?? berkasList.length;

    const handleDownload = (url: string, jenisDokumen: string) => {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = jenisDokumen;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadAllZip = (format: 'original' | 'pdf' = 'original') => {
        // Browser-native stream to disk — never fetch()+blob() (OOMs on large packages).
        try {
            setDownloadingZip(true);
            const suffix = format === 'pdf' ? '_PDF' : '';
            const zipName = safeDownloadFilename(
                namaPaket
                    ? `${namaPaket}${suffix}.zip`
                    : `berkas_${pekerjaanId}${suffix}.zip`,
                `berkas_${pekerjaanId}.zip`,
            );

            downloadBffApiFile(`/pekerjaan/${pekerjaanId}/download-all-berkas`, {
                params: { format },
                filename: zipName,
            });

            toast.success(
                format === 'pdf'
                    ? 'Unduhan ZIP (Semua PDF) dimulai — file besar di-stream ke disk'
                    : 'Unduhan ZIP (File Asli) dimulai — file besar di-stream ke disk',
            );
        } catch (error) {
            console.error('Failed to download zip:', error);
            toast.error('Gagal memulai unduhan ZIP berkas');
        } finally {
            // Native download continues in the browser; UI unlocks quickly.
            window.setTimeout(() => setDownloadingZip(false), 1200);
        }
    };

    const [exportingPdf, setExportingPdf] = useState<number | null>(null);

    const handleExportPdf = (id: number, jenisDokumen: string) => {
        try {
            setExportingPdf(id);
            downloadBffApiFile(`/berkas/${id}/export-pdf`, {
                filename: safeDownloadFilename(`${jenisDokumen}.pdf`, `berkas_${id}.pdf`),
            });
            toast.success('Ekspor PDF dimulai');
        } catch (error) {
            console.error('Failed to export PDF:', error);
            toast.error('Gagal mengekspor ke PDF. Pastikan server mendukung fitur ini.');
        } finally {
            window.setTimeout(() => setExportingPdf(null), 1200);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Form Upload/Edit Berkas */}
            <EmbeddedBerkasForm
                pekerjaanId={pekerjaanId}
                onSuccess={handleBerkasSuccess}
                initialData={editingFile}
                onCancel={() => setEditingFile(null)}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Daftar Berkas</h3>
                    {fieldOnly && sharedJuduls.length > 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Termasuk berkas bersama:{' '}
                            <span className="font-medium text-foreground">{sharedJuduls.join(', ')}</span>
                            {' '}(diaktifkan di Pengaturan).
                        </p>
                    ) : null}
                </div>
                {berkasList.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                        onClick={() => openQuickShare(undefined, 'semua berkas pekerjaan ini')}
                    >
                        <Share2 className="h-4 w-4" />
                        Quick Share
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                disabled={downloadingZip}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                {downloadingZip ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                                Download Semua
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownloadAllZip('original')} className="cursor-pointer">
                                <Download className="h-4 w-4 mr-2" />
                                Download File Asli (ZIP)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadAllZip('pdf')} className="cursor-pointer text-red-600 focus:text-red-600">
                                <FileType className="h-4 w-4 mr-2" />
                                Download Format PDF (ZIP)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                )}
            </div>

            {/* Tabel Berkas */}
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Jenis Dokumen</TableHead>
                            <TableHead>File</TableHead>
                            <TableHead>Tanggal Upload</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {berkasList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    Tidak ada berkas. Gunakan form di atas untuk upload berkas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            berkasList.map((berkas) => (
                                <TableRow key={berkas.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {berkas.jenis_dokumen}
                                            {matchesPengawasSharedBerkasJudul(berkas.jenis_dokumen, sharedJuduls) ? (
                                                <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wide">
                                                    Bersama
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button 
                                            variant="link" 
                                            className="h-auto p-0 text-primary flex items-center gap-1.5"
                                            onClick={() => setPreviewingFile(berkas)}
                                        >
                                            <Eye className="h-4 w-4" />
                                            Pratinjau
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(berkas.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleExportPdf(berkas.id, berkas.jenis_dokumen)}
                                                disabled={exportingPdf === berkas.id}
                                                title="Export ke PDF"
                                            >
                                                {exportingPdf === berkas.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <FileDown className="h-4 w-4 text-red-500" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openQuickShare([berkas.id], `berkas "${berkas.jenis_dokumen}"`)}
                                                title="Quick Share ke Puspen"
                                            >
                                                <Share2 className="h-4 w-4 text-primary" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDownload(berkas.berkas_url, berkas.jenis_dokumen)}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setEditingFile(berkas);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Hapus Berkas</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Apakah Anda yakin ingin menghapus berkas ini? Tindakan ini tidak dapat dibatalkan.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(berkas.id)}>
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

            <BerkasQuickShareDialog
                open={quickShareOpen}
                onOpenChange={setQuickShareOpen}
                pekerjaanId={pekerjaanId}
                namaPaket={namaPaket}
                berkasIds={quickShareBerkasIds}
                fileCount={quickShareFileCount}
                fileLabel={quickShareLabel}
            />

            <DocumentPreviewModal
                isOpen={!!previewingFile}
                onClose={() => setPreviewingFile(null)}
                url={previewingFile?.berkas_url ?? ''}
                title={previewingFile?.jenis_dokumen}
                fileName={previewingFile ? resolveBerkasFileName(previewingFile) : undefined}
                mediaId={previewingFile?.media_id ?? undefined}
                onDocumentSaved={() => {
                    void refetch();
                }}
            />
        </div>
    );
}