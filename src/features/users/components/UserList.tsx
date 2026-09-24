import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { impersonateUser } from '../api';
import { useAuthStore } from '@/stores/auth-stores';
import { redirectToPengawasWithHandoff } from '@/lib/auth-handoff';
import { needsDashboardDestinationChoice, shouldRedirectToPengawasApp } from '@/lib/pengawas-app';
import { UserCircle, Plus, Pencil, Users, ShieldCheck, ShieldAlert, RefreshCw, UserCog } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { AccessPageShell, AccessSection } from '@/components/shared/AccessSecurityShell';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ListRowActions } from '@/components/shared/ListRowActions';
import { DashboardStatCard } from '@/features/dashboard/components/DashboardStatCard';
import { formatDate } from '@/lib/format';
import { useDeleteUser, useUsersList } from '../hooks/useUsers';

export default function UserList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { auth } = useAuthStore();
    const isAdmin = auth.user?.roles?.includes('admin') || false;
    const isImpersonating = auth.isImpersonating;

    const { data, isLoading, isFetching, refetch } = useUsersList({ page, search });
    const deleteMutation = useDeleteUser();

    const stats = useMemo(() => {
        const rows = data?.data ?? [];
        const total = data?.meta?.total ?? rows.length;
        const adminCount = rows.filter((u) => (u.roles ?? []).some((r) => r.name === 'admin')).length;
        const withoutRole = rows.filter((u) => (u.roles ?? []).length === 0).length;
        const protectedCount = rows.filter((u) => u.is_protected_from_deletion).length;
        return { total, adminCount, withoutRole, protectedCount };
    }, [data]);

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
            auth.hydrateFromSession({
                user: response.user as any,
                isImpersonating: true,
                impersonator: { user: auth.user },
            });

            // Dual operator+pengawas: stay on portal (admin can switch apps manually).
            // Pure pengawas still hand off to pengawasan app.
            if (
                !needsDashboardDestinationChoice(response.user.roles)
                && shouldRedirectToPengawasApp(response.user.roles)
            ) {
                await redirectToPengawasWithHandoff();
                return;
            }

            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Failed to impersonate:', error);
            toast.error('Gagal melakukan impersonasi');
        }
    };

    return (
        <AccessPageShell
            title="Users"
            description="Kelola akun pengguna sistem"
            actions={(
                <>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw className={isFetching ? 'animate-spin' : ''} />
                        {isFetching ? 'Memuat…' : 'Muat ulang'}
                    </Button>
                    <Button size="sm" asChild>
                        <Link to="/users/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah User
                        </Link>
                    </Button>
                </>
            )}
        >
            <AccessSection title="Ringkasan" description="Total akun dan sebaran role pada halaman ini.">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DashboardStatCard
                        title="Total User"
                        value={String(stats.total)}
                        icon={Users}
                        description={data?.meta ? `Halaman ${page} dari ${data.meta.last_page}` : 'Akun terdaftar'}
                        isLoading={isLoading}
                        variant="primary"
                        compact
                    />
                    <DashboardStatCard
                        title="Admin"
                        value={String(stats.adminCount)}
                        icon={ShieldCheck}
                        description="User dengan role admin"
                        isLoading={isLoading}
                        variant="success"
                        compact
                    />
                    <DashboardStatCard
                        title="Tanpa Role"
                        value={String(stats.withoutRole)}
                        icon={ShieldAlert}
                        description="Perlu penugasan role"
                        isLoading={isLoading}
                        variant="warning"
                        compact
                    />
                    <DashboardStatCard
                        title="Diproteksi"
                        value={String(stats.protectedCount)}
                        icon={UserCog}
                        description="Tidak dapat dihapus"
                        isLoading={isLoading}
                        variant="info"
                        compact
                    />
                </div>
            </AccessSection>

            <AccessSection title="Data User" description="Cari nama atau email, lalu kelola role dan akses.">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Tabel User
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Total {data?.meta?.total ?? data?.data.length ?? 0} user
                            </p>
                        </div>
                        <SearchInput
                            defaultValue={search}
                            onSearch={handleSearch}
                            placeholder="Cari nama atau email..."
                            className="w-full sm:max-w-sm"
                            delay={300}
                        />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <TableSkeleton columns={7} rows={10} />
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
                                            <TableHead className="min-w-[130px] whitespace-nowrap">Dibuat</TableHead>
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
                                                        {(user.roles ?? []).length === 0 ? (
                                                            <span className="text-xs text-muted-foreground">—</span>
                                                        ) : (
                                                            (user.roles ?? []).map((role) => (
                                                                <Badge key={role.id} variant="secondary">
                                                                    {role.name}
                                                                </Badge>
                                                            ))
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                                                    {user.created_at ? formatDate(user.created_at) : '-'}
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
                                                        onDelete={user.is_protected_from_deletion
                                                            ? undefined
                                                            : () => setDeleteId(user.id)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        {data?.meta ? (
                            <div className="mt-4">
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
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </AccessSection>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                entityName="User"
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </AccessPageShell>
    );
}
