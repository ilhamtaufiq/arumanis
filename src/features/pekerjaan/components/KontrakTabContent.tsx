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
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import EmbeddedKontrakForm from './EmbeddedKontrakForm';

interface KontrakTabContentProps {
    pekerjaanId: number;
}

export default function KontrakTabContent({ pekerjaanId }: KontrakTabContentProps) {
    const [kontrakList, setKontrakList] = useState<Kontrak[]>([]);
    const [loading, setLoading] = useState(true);

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
            {/* Form Tambah Kontrak */}
            <EmbeddedKontrakForm pekerjaanId={pekerjaanId} onSuccess={fetchKontrak} />

            {/* Tabel Kontrak */}
            <div className="rounded-md border">
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
