import { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { getKegiatanRoles, deleteKegiatanRole } from '../api';
import type { KegiatanRoleResponse } from '../types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
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
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
// import { PageContainer } from '@/components/layout/page-container';
import { Loader2 } from 'lucide-react';

export default function KegiatanRoleList() {
    const [data, setData] = useState<KegiatanRoleResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getKegiatanRoles({ page });
            console.log('KegiatanRole Response:', response);
            setData(response);
        } catch (error) {
            console.error('Failed to fetch kegiatan roles:', error);
            toast.error('Gagal memuat data kegiatan-role');
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deleteKegiatanRole(deleteId);
                toast.success('Kegiatan-role berhasil dihapus');
                fetchData();
            } catch (error) {
                console.error('Failed to delete kegiatan-role:', error);
                toast.error('Gagal menghapus kegiatan-role');
            } finally {
                setDeleteId(null);
            }
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Kegiatan-Role</h1>
                    <p className="text-muted-foreground mt-1">
                        Kelola akses role terhadap kegiatan
                    </p>
                </div>
                <Button asChild>
                    <Link to="/kegiatan-role/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Kegiatan-Role
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Role</TableHead>
                            <TableHead>Nama Kegiatan</TableHead>
                            <TableHead>Program</TableHead>
                            <TableHead>Tahun Anggaran</TableHead>
                            <TableHead className="w-[100px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : !data || !data.data || data.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10">
                                    <p className="text-muted-foreground">Tidak ada data kegiatan-role</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data?.map((kegiatanRole) => (
                                <TableRow key={kegiatanRole.id}>
                                    <TableCell className="font-medium">
                                        <Badge variant="secondary">{kegiatanRole.role?.name || '-'}</Badge>
                                    </TableCell>
                                    <TableCell>{kegiatanRole.kegiatan?.nama_sub_kegiatan || '-'}</TableCell>
                                    <TableCell>{kegiatanRole.kegiatan?.nama_program || '-'}</TableCell>
                                    <TableCell>{kegiatanRole.kegiatan?.tahun_anggaran || '-'}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => setDeleteId(kegiatanRole.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {data?.meta && data.meta.last_page > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Halaman {data.meta.current_page} dari {data.meta.last_page}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!data.links?.next || isLoading}
                    >
                        Next
                    </Button>
                </div>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Mapping kegiatan-role akan dihapus permanen.
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
