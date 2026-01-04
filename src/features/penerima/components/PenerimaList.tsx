import { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { getPenerimaList, deletePenerima } from '../api';
import type { PenerimaResponse } from '../types';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Plus, SearchIcon, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';

export default function PenerimaList() {
    const [data, setData] = useState<PenerimaResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { tahunAnggaran } = useAppSettingsValues();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getPenerimaList({
                page,
                search,
                tahun: tahunAnggaran
            });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch penerima:', error);
            toast.error('Gagal memuat data penerima');
        } finally {
            setIsLoading(false);
        }
    }, [page, search, tahunAnggaran]);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchData]);

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deletePenerima(deleteId);
                toast.success('Penerima berhasil dihapus');
                fetchData();
            } catch (error) {
                console.error('Failed to delete penerima:', error);
                toast.error('Gagal menghapus penerima');
            } finally {
                setDeleteId(null);
            }
        }
    };

    return (
        <>
            {/* ===== Top Heading ===== */}
            <Header />


            {/* ===== Main ===== */}
            <Main>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Daftar Penerima</h1>
                        <p className="text-muted-foreground">
                            Kelola data penerima manfaat
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild>
                            <Link to="/penerima/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Penerima
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center space-x-2 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama penerima..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Data Penerima
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Total {data?.meta?.total || 0} penerima
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : data?.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Tidak ada data penerima.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Pekerjaan</TableHead>
                                            <TableHead>Alamat</TableHead>
                                            <TableHead>Jumlah Jiwa</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[100px]">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data?.data.map((penerima) => (
                                            <TableRow key={penerima.id}>
                                                <TableCell className="font-medium">{penerima.nama}</TableCell>
                                                <TableCell>{penerima.pekerjaan?.nama_paket}</TableCell>
                                                <TableCell>{penerima.alamat}</TableCell>
                                                <TableCell>{penerima.jumlah_jiwa}</TableCell>
                                                <TableCell>
                                                    {penerima.is_komunal ? (
                                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                            Komunal
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                                            Individu
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link to="/penerima/$id/edit" params={{ id: penerima.id.toString() }}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => setDeleteId(penerima.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination controls */}
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
                                Tindakan ini tidak dapat dibatalkan. Data penerima akan dihapus permanen.
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
            </Main>
        </>
    );
}
