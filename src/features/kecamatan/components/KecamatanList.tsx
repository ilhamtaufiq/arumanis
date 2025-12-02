import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getKecamatan, deleteKecamatan } from '../api/kecamatan';
import type { Kecamatan } from '../types';
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

export default function KecamatanList() {
    const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchKecamatan = async () => {
        try {
            setLoading(true);
            const response = await getKecamatan();
            setKecamatanList(response.data);
        } catch (error) {
            console.error('Failed to fetch kecamatan:', error);
            toast.error('Gagal memuat data kecamatan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKecamatan();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await deleteKecamatan(id);
            toast.success('Kecamatan berhasil dihapus');
            fetchKecamatan();
        } catch (error) {
            console.error('Failed to delete kecamatan:', error);
            toast.error('Gagal menghapus kecamatan');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Daftar Kecamatan</h1>
                <Button asChild>
                    <Link to="/kecamatan/new">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Kecamatan
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Data Kecamatan</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Kecamatan</TableHead>
                                    <TableHead>Jumlah Desa</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kecamatanList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            Belum ada data kecamatan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    kecamatanList.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.nama_kecamatan}</TableCell>
                                            <TableCell>{item.jumlah_desa}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="icon" asChild>
                                                    <Link to={`/kecamatan/${item.id}/edit`}>
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
                                                                Tindakan ini tidak dapat dibatalkan. Data kecamatan akan dihapus permanen.
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
