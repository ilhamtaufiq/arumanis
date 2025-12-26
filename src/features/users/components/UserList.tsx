import { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { getUsers, deleteUser, impersonateUser } from '../api';
import type { UserResponse } from '../types';
import { useAuthStore } from '@/stores/auth-stores';
import { UserCircle } from 'lucide-react';
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
import { Trash2, Plus, Search as SearchIcon, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function UserList() {
    const [data, setData] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { auth } = useAuthStore();
    const isAdmin = auth.user?.roles?.includes('admin') || false;
    const isImpersonating = auth.isImpersonating;

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getUsers({ page, search });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Gagal memuat data user');
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
                await deleteUser(deleteId);
                toast.success('User berhasil dihapus');
                fetchData();
            } catch (error) {
                console.error('Failed to delete user:', error);
                toast.error('Gagal menghapus user');
            } finally {
                setDeleteId(null);
            }
        }
    };

    const handleImpersonate = async (userId: number) => {
        try {
            const response = await impersonateUser(userId);
            toast.success(response.message);

            // Map the API user to the store user format if necessary
            // In this case, standard User model should match AuthUser interface
            auth.setImpersonating(response.user as any, response.token);

            // Navigate to dashboard or refresh
            window.location.href = '/';
        } catch (error) {
            console.error('Failed to impersonate:', error);
            toast.error('Gagal melakukan impersonasi');
        }
    };

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Daftar User</h2>
                    <p className="text-muted-foreground text-sm">
                        Kelola akun pengguna sistem
                    </p>
                </div>
                <Button asChild>
                    <Link to="/users/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah User
                    </Link>
                </Button>
            </div>

            <div className="flex items-center space-x-2 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama atau email..."
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
                            <TableHead>Email</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead className="w-[100px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">
                                    Memuat data...
                                </TableCell>
                            </TableRow>
                        ) : data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10">
                                    Tidak ada data user
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map((role) => (
                                                <Badge key={role.id} variant="secondary">
                                                    {role.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to="/users/$id/edit" params={{ id: user.id.toString() }}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {isAdmin && !isImpersonating && user.id !== auth.user?.id && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Impersonate"
                                                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                    onClick={() => handleImpersonate(user.id)}
                                                >
                                                    <UserCircle className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => setDeleteId(user.id)}
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
                            Tindakan ini tidak dapat dibatalkan. Data user akan dihapus permanen.
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
