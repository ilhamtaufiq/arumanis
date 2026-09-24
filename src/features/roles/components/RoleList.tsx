import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Shield, KeyRound, Users, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { AccessPageShell, AccessSection } from '@/components/shared/AccessSecurityShell';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ListRowActions } from '@/components/shared/ListRowActions';
import { DashboardStatCard } from '@/features/dashboard/components/DashboardStatCard';
import { useDeleteRole, useRolesList } from '../hooks/useRoles';

export default function RoleList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, isLoading, isFetching, refetch } = useRolesList({ page, search });
    const deleteMutation = useDeleteRole();

    const stats = useMemo(() => {
        const rows = data?.data ?? [];
        const total = data?.meta?.total ?? rows.length;
        const permissionCount = rows.reduce((sum, r) => sum + (r.permissions?.length ?? 0), 0);
        const withoutPermission = rows.filter((r) => (r.permissions?.length ?? 0) === 0).length;
        const withMany = rows.filter((r) => (r.permissions?.length ?? 0) > 5).length;
        return { total, permissionCount, withoutPermission, withMany };
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

    return (
        <AccessPageShell
            title="Roles"
            description="Kelola role dan hak akses"
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
                        <Link to="/roles/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Role
                        </Link>
                    </Button>
                </>
            )}
        >
            <AccessSection title="Ringkasan" description="Sebaran role dan kelengkapan permission-nya.">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DashboardStatCard
                        title="Total Role"
                        value={String(stats.total)}
                        icon={Shield}
                        description={`Halaman ${page}`}
                        isLoading={isLoading}
                        variant="primary"
                        compact
                    />
                    <DashboardStatCard
                        title="Permission Terpasang"
                        value={String(stats.permissionCount)}
                        icon={KeyRound}
                        description="Akumulasi halaman ini"
                        isLoading={isLoading}
                        variant="success"
                        compact
                    />
                    <DashboardStatCard
                        title="Tanpa Permission"
                        value={String(stats.withoutPermission)}
                        icon={Users}
                        description="Perlu dilengkapi"
                        isLoading={isLoading}
                        variant="warning"
                        compact
                    />
                    <DashboardStatCard
                        title="Role Kaya Akses"
                        value={String(stats.withMany)}
                        icon={Shield}
                        description="> 5 permission"
                        isLoading={isLoading}
                        variant="info"
                        compact
                    />
                </div>
            </AccessSection>

            <AccessSection title="Data Role" description="Setiap role membawa daftar permission-nya.">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Tabel Role
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Total {data?.meta?.total ?? data?.data.length ?? 0} role
                            </p>
                        </div>
                        <SearchInput
                            defaultValue={search}
                            onSearch={handleSearch}
                            placeholder="Cari nama role..."
                            className="w-full sm:max-w-sm"
                            delay={300}
                        />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <TableSkeleton columns={3} rows={8} />
                        ) : data?.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Tidak ada data role
                            </div>
                        ) : (
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[200px]">Nama</TableHead>
                                            <TableHead className="min-w-[400px]">Permissions</TableHead>
                                            <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data?.data.map((role) => (
                                            <TableRow key={role.id}>
                                                <TableCell className="font-medium">{role.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(role.permissions ?? []).slice(0, 5).map((permission) => (
                                                            <Badge key={permission.id} variant="secondary">
                                                                {permission.name}
                                                            </Badge>
                                                        ))}
                                                        {(role.permissions ?? []).length > 5 && (
                                                            <Badge variant="outline">+{(role.permissions ?? []).length - 5} lainnya</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                                    <ListRowActions
                                                        edit={(
                                                            <Button variant="ghost" size="icon" asChild>
                                                                <Link to="/roles/$id/edit" params={{ id: role.id.toString() }}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        onDelete={() => setDeleteId(role.id)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <div className="mt-4">
                            <ListPagination
                                page={page}
                                totalPages={data?.meta?.last_page || 1}
                                onPageChange={setPage}
                                disabled={isLoading}
                                variant="simple"
                                hasNextPage={!!data?.links?.next}
                            />
                        </div>
                    </CardContent>
                </Card>
            </AccessSection>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                entityName="Role"
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </AccessPageShell>
    );
}
