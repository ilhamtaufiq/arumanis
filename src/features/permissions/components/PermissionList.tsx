import { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { getPermissions, deletePermission } from '../api';
import type { PermissionResponse } from '../types';
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
import { Edit, Trash2, Plus, Search as SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Search } from '@/components/search';

export default function PermissionList() {
    const [data, setData] = useState<PermissionResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getPermissions({ page, search });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
            toast.error('Gagal memuat data permission');
        } finally {
            setIsLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchData]);

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deletePermission(deleteId);
                toast.success('Permission berhasil dihapus');
                fetchData();
            } catch (error) {
                console.error('Failed to delete permission:', error);
                toast.error('Gagal menghapus permission');
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
                        <h1 className="text-2xl font-bold tracking-tight">Daftar Permission</h1>
                        <p className="text-muted-foreground">
                            Kelola permission sistem
                        </p>
                    </div>
                    <Button asChild>
                        <Link to="/permissions/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Permission
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center space-x-2 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama permission..."
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
                                <TableHead>Nama</TableHead>
                                <TableHead>Guard Name</TableHead>
                                <TableHead className="w-[100px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-10">
                                        Memuat data...
                                    </TableCell>
                                </TableRow>
                            ) : data?.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-10">
                                        Tidak ada data permission
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data.map((permission) => (
                                    <TableRow key={permission.id}>
                                        <TableCell className="font-medium">{permission.name}</TableCell>
                                        <TableCell>{permission.guard_name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link to="/permissions/$id/edit" params={{ id: permission.id.toString() }}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => setDeleteId(permission.id)}
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
                                Tindakan ini tidak dapat dibatalkan. Data permission akan dihapus permanen.
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
