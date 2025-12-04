import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMenuPermissions, deleteMenuPermission } from '../api';
import type { MenuPermissionResponse } from '../types';
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
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function MenuPermissionList() {
    const [data, setData] = useState<MenuPermissionResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getMenuPermissions({ page, search });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch menu permissions:', error);
            toast.error('Gagal memuat data menu permission');
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
                await deleteMenuPermission(deleteId);
                toast.success('Menu permission berhasil dihapus');
                fetchData();
            } catch (error) {
                console.error('Failed to delete menu permission:', error);
                toast.error('Gagal menghapus menu permission');
            } finally {
                setDeleteId(null);
            }
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Menu Permissions</h1>
                <Button asChild>
                    <Link to="/menu-permissions/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Menu Permission
                    </Link>
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari menu key atau label..."
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
                            <TableHead>Menu Key</TableHead>
                            <TableHead>Menu Label</TableHead>
                            <TableHead>Allowed Roles</TableHead>
                            <TableHead>Status</TableHead>
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
                                    Tidak ada data menu permission
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((menuPermission) => (
                                <TableRow key={menuPermission.id}>
                                    <TableCell className="font-medium font-mono text-sm">
                                        {menuPermission.menu_key}
                                    </TableCell>
                                    <TableCell>{menuPermission.menu_label}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {menuPermission.allowed_roles?.length > 0 ? (
                                                menuPermission.allowed_roles.map((role, index) => (
                                                    <Badge key={index} variant="secondary">
                                                        {role}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <Badge variant="outline">Semua Role</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={menuPermission.is_active ? "default" : "secondary"}>
                                            {menuPermission.is_active ? "Aktif" : "Tidak Aktif"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to={`/menu-permissions/${menuPermission.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => setDeleteId(menuPermission.id)}
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
                            Tindakan ini tidak dapat dibatalkan. Data menu permission akan dihapus permanen.
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
