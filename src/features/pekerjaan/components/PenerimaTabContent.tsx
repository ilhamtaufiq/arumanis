import { useEffect, useState } from 'react';
import { getPenerimaList, deletePenerima } from '@/features/penerima/api';
import type { Penerima } from '@/features/penerima/types';
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
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import EmbeddedPenerimaForm from './EmbeddedPenerimaForm';

interface PenerimaTabContentProps {
    pekerjaanId: number;
}

export default function PenerimaTabContent({ pekerjaanId }: PenerimaTabContentProps) {
    const [penerimaList, setPenerimaList] = useState<Penerima[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRecipient, setEditingRecipient] = useState<Penerima | null>(null);

    const fetchPenerima = async () => {
        try {
            setLoading(true);
            const response = await getPenerimaList({ pekerjaan_id: pekerjaanId });
            setPenerimaList(response.data);
        } catch (error) {
            console.error('Failed to fetch penerima:', error);
            toast.error('Gagal memuat data penerima');
        } finally {
            setLoading(false);
            setEditingRecipient(null);
        }
    };

    useEffect(() => {
        fetchPenerima();
    }, [pekerjaanId]);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Form Tambah/Edit Penerima */}
            <EmbeddedPenerimaForm
                pekerjaanId={pekerjaanId}
                onSuccess={fetchPenerima}
                initialData={editingRecipient}
                onCancel={() => setEditingRecipient(null)}
            />

            {/* Tabel Penerima */}
            <div className="rounded-md border overflow-x-auto">
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
        </div>
    );
}
