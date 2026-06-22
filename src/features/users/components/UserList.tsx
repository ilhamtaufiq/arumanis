import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { impersonateUser } from '../api';
import { useAuthStore } from '@/stores/auth-stores';
import { getPengawasAppUrl } from '@/lib/pengawas-app';
import { UserCircle, Plus, Pencil } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ListRowActions } from '@/components/shared/ListRowActions';
import { useDeleteUser, useUsersList } from '../hooks/useUsers';

export default function UserList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { auth } = useAuthStore();
    const isAdmin = auth.user?.roles?.includes('admin') || false;
    const isImpersonating = auth.isImpersonating;

    const { data, isLoading } = useUsersList({ page, search });
    const deleteMutation = useDeleteUser();

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId, {
                onSettled: () => setDeleteId(null),
            });
        }
    };

    const handleImpersonate = async (userId: number) => {
        try {
            const response = await impersonateUser(userId);
            toast.success(response.message);
            auth.setImpersonating(response.user as any, response.token);
            window.location.href = getPengawasAppUrl(response.token);
        } catch (error) {
            console.error('Failed to impersonate:', error);
            toast.error('Gagal melakukan impersonasi');
        }
    };

    return (
        <>
            <ListPageLayout
                title="Daftar User"
                description="Kelola akun pengguna sistem"
                cardTitle="Data User"
                action={(
                    <Button asChild>
                        <Link to="/users/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah User
                        </Link>
                    </Button>
                )}
                toolbar={(
                    <SearchInput
                        defaultValue={search}
                        onSearch={handleSearch}
                        placeholder="Cari nama atau email..."
                        className="w-full sm:max-w-sm"
                        delay={300}
                    />
                )}
                footer={data?.meta ? (
                    <ListPagination
                        page={page}
                        totalPages={data.meta.last_page}
                        onPageChange={setPage}
                        disabled={isLoading}
                        meta={{
                            from: data.meta.from,
                            to: data.meta.to,
                            total: data.meta.total,
                            label: 'user',
                        }}
                    />
                ) : undefined}
            >
                {isLoading ? (
                    <TableSkeleton columns={6} rows={10} />
                ) : data?.data.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Tidak ada data user
                    </div>
                ) : (
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[150px]">Nama</TableHead>
                                    <TableHead className="min-w-[200px]">Email</TableHead>
                                    <TableHead className="min-w-[150px]">NIP</TableHead>
                                    <TableHead className="min-w-[150px]">Jabatan</TableHead>
                                    <TableHead className="min-w-[150px]">Roles</TableHead>
                                    <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.nip || '-'}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.jabatan || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.map((role) => (
                                                    <Badge key={role.id} variant="secondary">
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                            <ListRowActions
                                                edit={(
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link to="/users/$id/edit" params={{ id: user.id.toString() }}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                extra={isAdmin && !isImpersonating && user.id !== auth.user?.id ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Impersonate"
                                                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                        onClick={() => handleImpersonate(user.id)}
                                                    >
                                                        <UserCircle className="h-4 w-4" />
                                                    </Button>
                                                ) : undefined}
                                                onDelete={() => setDeleteId(user.id)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </ListPageLayout>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                entityName="User"
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </>
    );
}