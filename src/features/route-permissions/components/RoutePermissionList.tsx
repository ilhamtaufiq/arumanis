import { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { useRoutePermission } from '@/context/route-permission-context';
import { getRoutePermissions, deleteRoutePermission } from '../api';
import type { RoutePermissionResponse } from '../types';
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
import { Edit, Trash2, Plus, Search, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function RoutePermissionList() {
    const [data, setData] = useState<RoutePermissionResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { refreshRules } = useRoutePermission();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getRoutePermissions({
                page,
                search,
            });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch route permissions:', error);
            toast.error('Gagal mengambil data route permissions');
        } finally {
            setIsLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deleteRoutePermission(deleteId);
                toast.success('Route permission berhasil dihapus');
                fetchData();
                await refreshRules(); // Refresh rules in context
            } catch (error) {
                console.error('Failed to delete route permission:', error);
                toast.error('Gagal menghapus route permission');
            } finally {
                setDeleteId(null);
            }
        }
    };

    const getMethodBadgeVariant = (method: string) => {
        switch (method) {
            case 'GET': return 'default';
            case 'POST': return 'secondary';
            case 'PUT': return 'outline';
            case 'PATCH': return 'outline';
            case 'DELETE': return 'destructive';
            default: return 'default';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Route Permissions</h1>
                <Button asChild>
                    <Link to="/route-permissions/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Route Permission
                    </Link>
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari route path..."
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
                            <TableHead className="w-[300px]">Route Path</TableHead>
                            <TableHead className="w-[100px]">Method</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Allowed Roles</TableHead>
                            <TableHead className="w-[80px]">Status</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    Memuat data...
                                </TableCell>
                            </TableRow>
                        ) : data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    Tidak ada data route permissions
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((permission) => (
                                <TableRow key={permission.id}>
                                    <TableCell className="font-mono text-sm">
                                        {permission.route_path}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getMethodBadgeVariant(permission.route_method)}>
                                            {permission.route_method}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {permission.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {permission.allowed_roles.map((role) => (
                                                <Badge key={role} variant="secondary">
                                                    {role}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {permission.is_active ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-gray-400" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to="/route-permissions/$id/edit" params={{ id: permission.id.toString() }}>
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
                            Tindakan ini tidak dapat dibatalkan. Route permission akan dihapus permanen.
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
