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
import { Plus, Pencil, KeyRound, ShieldCheck, RefreshCw, Fingerprint } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { AccessPageShell, AccessSection } from '@/components/shared/AccessSecurityShell';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ListRowActions } from '@/components/shared/ListRowActions';
import { DashboardStatCard } from '@/features/dashboard/components/DashboardStatCard';
import { useDeletePermission, usePermissionsList } from '../hooks/usePermissions';

export default function PermissionList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, isLoading, isFetching, refetch } = usePermissionsList({ page, search });
    const deleteMutation = useDeletePermission();

    const stats = useMemo(() => {
        const rows = data?.data ?? [];
        const total = data?.meta?.total ?? rows.length;
        const guards = new Set(rows.map((p) => p.guard_name).filter(Boolean));
        const webCount = rows.filter((p) => p.guard_name === 'web').length;
        const apiCount = rows.filter((p) => p.guard_name === 'api').length;
        return { total, guardCount: guards.size, webCount, apiCount };
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
            title="Permissions"
            description="Kelola permission sistem"
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
                        <Link to="/permissions/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Permission
                        </Link>
                    </Button>
                </>
            )}
        >
            <AccessSection title="Ringkasan" description="Total permission dan sebaran guard-nya.">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DashboardStatCard
                        title="Total Permission"
                        value={String(stats.total)}
                        icon={KeyRound}
                        description={`Halaman ${page}`}
                        isLoading={isLoading}
                        variant="primary"
                        compact
                    />
                    <DashboardStatCard
                        title="Guard Aktif"
                        value={String(stats.guardCount)}
                        icon={ShieldCheck}
                        description="Variasi guard name"
                        isLoading={isLoading}
                        variant="info"
                        compact
                    />
                    <DashboardStatCard
                        title="Guard Web"
                        value={String(stats.webCount)}
                        icon={Fingerprint}
                        description="Halaman ini"
                        isLoading={isLoading}
                        variant="success"
                        compact
                    />
                    <DashboardStatCard
                        title="Guard API"
                        value={String(stats.apiCount)}
                        icon={KeyRound}
                        description="Halaman ini"
                        isLoading={isLoading}
                        variant="warning"
                        compact
                    />
                </div>
            </AccessSection>

            <AccessSection title="Data Permission" description="Nama permission dipakai role untuk membuka fitur.">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <KeyRound className="h-5 w-5" />
                                Tabel Permission
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Total {data?.meta?.total ?? data?.data.length ?? 0} permission
                            </p>
                        </div>
                        <SearchInput
                            defaultValue={search}
                            onSearch={handleSearch}
                            placeholder="Cari nama permission..."
                            className="w-full sm:max-w-sm"
                            delay={300}
                        />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <TableSkeleton columns={3} rows={8} />
                        ) : data?.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Tidak ada data permission
                            </div>
                        ) : (
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[300px]">Nama</TableHead>
                                            <TableHead className="min-w-[150px]">Guard Name</TableHead>
                                            <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data?.data.map((permission) => (
                                            <TableRow key={permission.id}>
                                                <TableCell className="font-medium">{permission.name}</TableCell>
                                                <TableCell>{permission.guard_name}</TableCell>
                                                <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                                    <ListRowActions
                                                        edit={(
                                                            <Button variant="ghost" size="icon" asChild>
                                                                <Link to="/permissions/$id/edit" params={{ id: permission.id.toString() }}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        onDelete={() => setDeleteId(permission.id)}
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
                entityName="Permission"
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </AccessPageShell>
    );
}
