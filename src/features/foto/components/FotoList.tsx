import { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { getFotoList, deleteFoto } from '../api';
import type { Foto, FotoResponse } from '../types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus, Search, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import { YearFilter } from '@/components/common/YearFilter';

export default function FotoList() {
    const [data, setData] = useState<FotoResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getFotoList({
                page,
                search,
                tahun: selectedYear === 'all' ? undefined : selectedYear
            });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch foto:', error);
            toast.error('Gagal memuat data foto');
        } finally {
            setIsLoading(false);
        }
    }, [page, search, selectedYear]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchData]);

    useEffect(() => {
        setPage(1);
    }, [selectedYear]);

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deleteFoto(deleteId);
                toast.success('Foto berhasil dihapus');
                fetchData();
            } catch (error) {
                console.error('Failed to delete foto:', error);
                toast.error('Gagal menghapus foto');
            } finally {
                setDeleteId(null);
            }
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dokumentasi Foto</h1>
                </div>
                <div className="flex items-center gap-4">
                    <YearFilter
                        selectedYear={selectedYear}
                        onYearChange={setSelectedYear}
                    />
                    <Button asChild>
                        <Link to="/foto/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Foto
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Preview</TableHead>
                            <TableHead>Pekerjaan</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Koordinat</TableHead>
                            <TableHead className="w-[100px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">
                                    Memuat data...
                                </TableCell>
                            </TableRow>
                        ) : data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">
                                    Tidak ada data foto
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((foto: Foto) => (
                                <TableRow key={foto.id}>
                                    <TableCell>
                                        <a href={foto.foto_url} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={foto.foto_url}
                                                alt="Preview"
                                                className="h-16 w-16 object-cover rounded-md hover:scale-105 transition-transform"
                                            />
                                        </a>
                                    </TableCell>
                                    <TableCell className="font-medium">{foto.pekerjaan?.nama_paket}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground">
                                            {foto.keterangan}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <MapPin className="mr-1 h-3 w-3" />
                                            {foto.koordinat}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to="/foto/$id/edit" params={{ id: foto.id.toString() }}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => setDeleteId(foto.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!data?.links?.next || isLoading}
                >
                    Next
                </Button>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Foto akan dihapus permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
