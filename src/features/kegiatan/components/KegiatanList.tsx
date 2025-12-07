import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { getKegiatan, deleteKegiatan } from '../api/kegiatan';
import type { Kegiatan } from '../types';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
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

export default function KegiatanList() {
    const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchKegiatan = async () => {
        try {
            setLoading(true);
            const response = await getKegiatan();
            setKegiatanList(response.data);
        } catch (error) {
            console.error('Failed to fetch kegiatan:', error);
            toast.error('Gagal memuat data kegiatan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKegiatan();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await deleteKegiatan(id);
            toast.success('Kegiatan berhasil dihapus');
            fetchKegiatan();
        } catch (error) {
            console.error('Failed to delete kegiatan:', error);
            toast.error('Gagal menghapus kegiatan');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Daftar Kegiatan</h1>
                <Button asChild>
                    <Link to="/kegiatan/new">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Kegiatan
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Data Kegiatan</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Program</TableHead>
                                    <TableHead>Kegiatan</TableHead>
                                    <TableHead>Sub Kegiatan</TableHead>
                                    <TableHead>Tahun</TableHead>
                                    <TableHead>Pagu</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kegiatanList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Belum ada data kegiatan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    kegiatanList.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.nama_program}</TableCell>
                                            <TableCell>{item.nama_kegiatan}</TableCell>
                                            <TableCell>{item.nama_sub_kegiatan}</TableCell>
                                            <TableCell>{item.tahun_anggaran}</TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat('id-ID', {
                                                    style: 'currency',
                                                    currency: 'IDR',
                                                }).format(item.pagu)}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="icon" asChild>
                                                    <Link to="/kegiatan/$id/edit" params={{ id: item.id.toString() }}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="icon">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tindakan ini tidak dapat dibatalkan. Data kegiatan akan dihapus permanen.
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
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
