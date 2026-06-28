import { useEffect, useState } from 'react';
import type { Berkas } from '@/features/berkas/types';
import { Button } from '@/components/ui/button';
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

interface BerkasTabContentProps {
    pekerjaanId: number;
    namaPaket?: string;
}

export default function BerkasTabContent({ pekerjaanId, namaPaket }: BerkasTabContentProps) {
    const [downloadingZip, setDownloadingZip] = useState(false);
    const [editingFile, setEditingFile] = useState<Berkas | null>(null);
    const [previewingFile, setPreviewingFile] = useState<Berkas | null>(null);
    const [quickShareOpen, setQuickShareOpen] = useState(false);
    const [quickShareBerkasIds, setQuickShareBerkasIds] = useState<number[] | undefined>(undefined);
    const [quickShareLabel, setQuickShareLabel] = useState('semua berkas pekerjaan ini');

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

    const handleDownloadAllZip = async (format: 'original' | 'pdf' = 'original') => {
        try {
            setDownloadingZip(true);
            const api = (await import('@/lib/api-client')).default;
            const blob = await api.get<Blob>(`/pekerjaan/${pekerjaanId}/download-all-berkas`, {
                params: { format },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const suffix = format === 'pdf' ? '_PDF' : '';
            const zipName = namaPaket ? `${namaPaket.replace(/[\\/:*?"<>|]/g, '_')}${suffix}.zip` : `berkas_${pekerjaanId}${suffix}.zip`;
            link.setAttribute('download', zipName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(format === 'pdf' ? 'Unduhan ZIP (Semua PDF) dimulai' : 'Unduhan ZIP (File Asli) dimulai');
        } catch (error) {
            console.error('Failed to download zip:', error);
            toast.error('Gagal mengunduh ZIP berkas');
        } finally {
            setDownloadingZip(false);
        }
    };

    const [exportingPdf, setExportingPdf] = useState<number | null>(null);

    const handleExportPdf = async (id: number, jenisDokumen: string) => {
        try {
            setExportingPdf(id);
            const api = (await import('@/lib/api-client')).default;
            const blob = await api.get<Blob>(`/berkas/${id}/export-pdf`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${jenisDokumen.replace(/[\\/:*?"<>|]/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Ekspor PDF dimulai');
        } catch (error) {
            console.error('Failed to export PDF:', error);
            const message = error instanceof Error && error.message
                ? error.message
                : 'Gagal mengekspor ke PDF. Pastikan server mendukung fitur ini.';
            toast.error(message);
        } finally {
            setExportingPdf(null);
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
                <h3 className="text-lg font-semibold">Daftar Berkas</h3>
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