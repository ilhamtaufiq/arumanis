import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getKontrak, deleteKontrak } from '@/features/kontrak/api/kontrak';
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
import { Pencil, Trash2, Loader2, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import EmbeddedKontrakForm from './EmbeddedKontrakForm';
import api from '@/lib/api-client';
import { DocViewerModal } from '@/components/shared/DocViewerModal';

interface KontrakTabContentProps {
    pekerjaanId: number;
}

export default function KontrakTabContent({ pekerjaanId }: KontrakTabContentProps) {
    const queryClient = useQueryClient();
    const [exporting, setExporting] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [previewingDoc, setPreviewingDoc] = useState<{ uri: string; fileName: string; fileType: string } | null>(null);

    const { data: kontrakList = [], isLoading: loading } = useQuery({
        queryKey: ['kontrak', { pekerjaan_id: pekerjaanId }],
        queryFn: async () => {
            const response = await getKontrak({ pekerjaan_id: pekerjaanId });
            return response.data;
        },
    });

    const deleteMutation = useMutation({
        mutationKey: ['kontrak', 'delete'],
        mutationFn: (id: number) => deleteKontrak(id),
        onSuccess: () => {
            toast.success('Kontrak berhasil dihapus');
            queryClient.invalidateQueries({ queryKey: ['kontrak'] });
        },
        onError: () => toast.error('Gagal menghapus kontrak')
    });

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleExport = async (action: 'download' | 'preview') => {
        try {
            if (action === 'preview') {
                setPreviewing(true);
                const response = await api.get(`/kontrak/${pekerjaanId}/export?format=docx`, {
                    responseType: 'blob'
                });
                const blob = response as unknown as Blob;
                const url = window.URL.createObjectURL(new Blob([blob], {
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                }));
                
                setPreviewingDoc({
                    uri: url,
                    fileName: `Kontrak_${pekerjaanId}.docx`,
                    fileType: 'docx'
                });
            } else {
                setExporting(true);
                const response = await api.get(`/kontrak/${pekerjaanId}/export?format=docx`, {
                    responseType: 'blob'
                });

                const blob = response as unknown as Blob;
                const url = window.URL.createObjectURL(new Blob([blob], {
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                }));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Kontrak_${pekerjaanId}.docx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                toast.success('File Word berhasil di-generate');
            }
        } catch (error) {
            console.error('Failed to export document:', error);
            toast.error(`Gagal men-generate file. Pastikan data kontrak sudah diisi.`);
        } finally {
            setPreviewing(false);
            setExporting(false);
        }
    };

    const formatCurrency = (value: number | null) => {
        if (!value) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    onClick={() => handleExport('preview')}
                    disabled={previewing || exporting}
                >
                    {previewing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Eye className="h-4 w-4 mr-2" />
                    )}
                    Preview Dokumen
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleExport('download')}
                    disabled={exporting || previewing}
                >
                    {exporting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Download className="h-4 w-4 mr-2" />
                    )}
                    Export Word
                </Button>
            </div>

            {/* Form Tambah Kontrak */}
            <EmbeddedKontrakForm pekerjaanId={pekerjaanId} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['kontrak'] })} />

            {/* Tabel Kontrak */}
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kode RUP</TableHead>
                            <TableHead>Kode Paket</TableHead>
                            <TableHead>Penyedia</TableHead>
                            <TableHead>Nilai Kontrak</TableHead>
                            <TableHead>Tgl SPPBJ</TableHead>
                            <TableHead>Tgl SPK</TableHead>
                            <TableHead>Tgl SPMK</TableHead>
                            <TableHead>Tgl Selesai</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {kontrakList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    Tidak ada data kontrak. Gunakan form di atas untuk menambah kontrak.
                                </TableCell>
                            </TableRow>
                        ) : (
                            kontrakList.map((kontrak) => (
                                <TableRow key={kontrak.id}>
                                    <TableCell>{kontrak.kode_rup || '-'}</TableCell>
                                    <TableCell>{kontrak.kode_paket || '-'}</TableCell>
                                    <TableCell>{kontrak.penyedia?.nama || '-'}</TableCell>
                                    <TableCell>{formatCurrency(kontrak.nilai_kontrak)}</TableCell>
                                    <TableCell>{formatDate(kontrak.tgl_sppbj)}</TableCell>
                                    <TableCell>{formatDate(kontrak.tgl_spk)}</TableCell>
                                    <TableCell>{formatDate(kontrak.tgl_spmk)}</TableCell>
                                    <TableCell>{formatDate(kontrak.tgl_selesai)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to="/kontrak/$id/edit" params={{ id: kontrak.id.toString() }}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="h-4 w-4" />
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
                    title={`Pratinjau Kontrak`}
                />
            )}
        </div>
    );
}
