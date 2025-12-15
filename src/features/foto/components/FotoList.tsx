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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, Plus, Search as SearchIcon, MapPin, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Search } from '@/components/search';
import { useAppSettingsValues } from '@/hooks/use-app-settings';

export default function FotoList() {
    const [data, setData] = useState<FotoResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [previewFoto, setPreviewFoto] = useState<Foto | null>(null);
    const { tahunAnggaran } = useAppSettingsValues();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getFotoList({
                page,
                search,
                tahun: tahunAnggaran
            });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch foto:', error);
            toast.error('Gagal memuat data foto');
        } finally {
            setIsLoading(false);
        }
    }, [page, search, tahunAnggaran]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchData]);

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
        <>
            {/* ===== Top Heading ===== */}
            <Header>
                <div className='ms-auto flex items-center space-x-4'>
                    <Search />
                </div>
            </Header>

            {/* ===== Main ===== */}
            <Main>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dokumentasi Foto</h1>
                        <p className="text-muted-foreground">
                            Kelola dokumentasi foto pekerjaan
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild>
                            <Link to="/foto/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Foto
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center space-x-2 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
                                            <button
                                                onClick={() => setPreviewFoto(foto)}
                                                className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                                            >
                                                <img
                                                    src={foto.foto_url}
                                                    alt="Preview"
                                                    className="h-16 w-16 object-cover rounded-md hover:scale-105 transition-transform"
                                                />
                                            </button>
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

                {/* Photo Preview Dialog */}
                <Dialog open={!!previewFoto} onOpenChange={(open) => !open && setPreviewFoto(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
                        <DialogHeader className="p-4 pb-0">
                            <DialogTitle className="flex items-center justify-between">
                                <span className="truncate pr-4">
                                    {previewFoto?.pekerjaan?.nama_paket || 'Preview Foto'}
                                </span>
                            </DialogTitle>
                        </DialogHeader>
                        {previewFoto && (
                            <div className="flex flex-col">
                                {/* Image Container */}
                                <div className="relative flex items-center justify-center bg-black/5 dark:bg-black/20 min-h-[300px] max-h-[60vh]">
                                    <img
                                        src={previewFoto.foto_url}
                                        alt="Preview"
                                        className="max-w-full max-h-[60vh] object-contain"
                                    />
                                </div>
                                {/* Info Footer */}
                                <div className="p-4 border-t bg-muted/30 space-y-2">
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">Progress:</span>
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
                                                {previewFoto.keterangan}
                                            </span>
                                        </div>
                                        {previewFoto.koordinat && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span className="font-mono text-xs">{previewFoto.koordinat}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(previewFoto.foto_url, '_blank')}
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Buka di Tab Baru
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setPreviewFoto(null)}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Tutup
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </Main>
        </>
    );
}
