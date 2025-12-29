import { useEffect, useState, useCallback } from 'react';
import { getPenerimaList, deletePenerima } from '@/features/penerima/api';
import type { Penerima, PenerimaResponse } from '@/features/penerima/types';
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
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import EmbeddedPenerimaForm from './EmbeddedPenerimaForm';

interface PenerimaTabContentProps {
    pekerjaanId: number;
}

export default function PenerimaTabContent({ pekerjaanId }: PenerimaTabContentProps) {
    const [data, setData] = useState<PenerimaResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingRecipient, setEditingRecipient] = useState<Penerima | null>(null);
    const [page, setPage] = useState(1);

    const fetchPenerima = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getPenerimaList({
                pekerjaan_id: pekerjaanId,
                page: page,
                per_page: 10
            });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch penerima:', error);
            toast.error('Gagal memuat data penerima');
        } finally {
            setLoading(false);
            setEditingRecipient(null);
        }
    }, [pekerjaanId, page]);

    useEffect(() => {
        fetchPenerima();
    }, [fetchPenerima]);

    const handleDelete = async (id: number) => {
        try {
            await deletePenerima(id);
            toast.success('Penerima berhasil dihapus');
            fetchPenerima();
        } catch (error) {
            console.error('Failed to delete penerima:', error);
            toast.error('Gagal menghapus penerima');
        }
    };

    const handleSuccess = () => {
        if (page !== 1) {
            setPage(1);
        } else {
            fetchPenerima();
        }
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const penerimaList = data?.data || [];

    return (
        <div className="space-y-4">
            {/* Form Tambah/Edit Penerima */}
            <EmbeddedPenerimaForm
                pekerjaanId={pekerjaanId}
                onSuccess={handleSuccess}
                initialData={editingRecipient}
                onCancel={() => setEditingRecipient(null)}
            />

            {/* Tabel Penerima */}
            <div className="rounded-md border overflow-x-auto relative">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>NIK</TableHead>
                            <TableHead>Alamat</TableHead>
                            <TableHead>Jumlah Jiwa</TableHead>
                            <TableHead>Tipe</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {penerimaList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Tidak ada data penerima. Gunakan form di atas untuk menambah penerima.
                                </TableCell>
                            </TableRow>
                        ) : (
                            penerimaList.map((penerima) => (
                                <TableRow key={penerima.id}>
                                    <TableCell className="font-medium">{penerima.nama}</TableCell>
                                    <TableCell>{penerima.nik || '-'}</TableCell>
                                    <TableCell>{penerima.alamat || '-'}</TableCell>
                                    <TableCell>{penerima.jumlah_jiwa}</TableCell>
                                    <TableCell>
                                        {penerima.is_komunal ? (
                                            <Badge>Komunal</Badge>
                                        ) : (
                                            <Badge variant="secondary">Individual</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setEditingRecipient(penerima);
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
                                                        <AlertDialogTitle>Hapus Penerima</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Apakah Anda yakin ingin menghapus penerima ini? Tindakan ini tidak dapat dibatalkan.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(penerima.id)}>
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

            {/* Pagination Controls */}
            {data && data.meta && data.meta.last_page > 1 && (
                <div className="flex items-center justify-between py-2">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan {data.meta.from} - {data.meta.to} dari {data.meta.total} data
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Sebelumnya
                        </Button>
                        <div className="text-sm font-medium">
                            Halaman {page} dari {data.meta.last_page}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === data.meta.last_page}
                        >
                            Selanjutnya
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
