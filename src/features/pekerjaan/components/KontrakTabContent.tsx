import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { getKontrak, deleteKontrak } from '@/features/kontrak/api/kontrak';
import type { Kontrak } from '@/features/kontrak/types';
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

interface KontrakTabContentProps {
    pekerjaanId: number;
}

export default function KontrakTabContent({ pekerjaanId }: KontrakTabContentProps) {
    const [kontrakList, setKontrakList] = useState<Kontrak[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [previewing, setPreviewing] = useState(false);

    const fetchKontrak = async () => {
        try {
            setLoading(true);
            const response = await getKontrak({ pekerjaan_id: pekerjaanId });
            setKontrakList(response.data);
        } catch (error) {
            console.error('Failed to fetch kontrak:', error);
            toast.error('Gagal memuat data kontrak');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKontrak();
    }, [pekerjaanId]);

    const handleDelete = async (id: number) => {
        try {
            await deleteKontrak(id);
            toast.success('Kontrak berhasil dihapus');
            fetchKontrak();
        } catch (error) {
            console.error('Failed to delete kontrak:', error);
            toast.error('Gagal menghapus kontrak');
        }
    };

    const handleExport = async (action: 'download' | 'preview') => {
        try {
            if (action === 'preview') {
                // Gunakan layanan Office Online Viewer / Google Docs Viewer
                // yang akan mengkonversi layout dokumen secara presisi 100%

                // Ambil base URL API dari environment
                const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin + '/api';

                // Buat link download langsung ke dokumen
                // Catatan: Google/MS Viewer butuh URL ini bisa diakses publik secara online (tidak ter-password lokal)
                const fileUrl = `${baseUrl}/kontrak/${pekerjaanId}/export?format=docx`;

                // Jika aplikasi masih jalan di localhost, layanan ini belum bisa menarik file dari komputer Anda
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    toast.info('Info: Fitur Live Preview butuh koneksi Public Hosting. File akan didownload untuk sementara selama di Localhost.');

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

                } else {
                    toast.success('Pratinjau sedang dibuka dengan Office/Google Viewer...');

                    // Office Viewer versi Microsoft biasanya lebih presisi untuk file DOCX daripada Google Docs
                    const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;

                    // Opsi lain: Google Docs Viewer
                    // const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}`;

                    window.open(officeViewerUrl, '_blank');
                }

            } else {
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
            if (action === 'preview') {
                setPreviewing(false);
            } else {
                setExporting(false);
            }
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
            <EmbeddedKontrakForm pekerjaanId={pekerjaanId} onSuccess={fetchKontrak} />

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
        </div>
    );
}
