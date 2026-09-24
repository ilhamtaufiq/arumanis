import { useState } from 'react';
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
import { Plus, Network, KeyRound, Users, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { AccessPageShell, AccessSection } from '@/components/shared/AccessSecurityShell';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ListRowActions } from '@/components/shared/ListRowActions';
import { DashboardStatCard } from '@/features/dashboard/components/DashboardStatCard';
import { useDeleteKegiatanRole, useKegiatanRoleList } from '../hooks/useKegiatanRole';

export default function KegiatanRoleList() {
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, isLoading, isFetching, refetch } = useKegiatanRoleList({ page });
    const deleteMutation = useDeleteKegiatanRole();

    const rows = data?.data ?? [];
    const total = data?.meta?.total ?? rows.length;
    const distinctRoles = new Set(rows.map((r) => r.role?.name ?? r.role_id)).size;
    const distinctKegiatan = new Set(rows.map((r) => r.kegiatan_id)).size;
    const currentYear = new Date().getFullYear();
    const thisYear = rows.filter((r) => Number(r.kegiatan?.tahun_anggaran) === currentYear).length;

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId, {
                onSettled: () => setDeleteId(null),
            });
        }
    };

    return (
        <AccessPageShell
            title="Kegiatan Role"
            description="Kelola akses role terhadap kegiatan"
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
                        <Link to="/kegiatan-role/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Kegiatan-Role
                        </Link>
                    </Button>
                </>
            )}
        >
            <AccessSection title="Ringkasan" description="Cakupan mapping role ke kegiatan.">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DashboardStatCard
                        title="Total Mapping"
                        value={String(total)}
                        icon={Network}
                        description={`Halaman ${page}`}
                        isLoading={isLoading}
                        variant="primary"
                        compact
                    />
                    <DashboardStatCard
                        title="Role Terlibat"
                        value={String(distinctRoles)}
                        icon={Users}
                        description="Halaman ini"
                        isLoading={isLoading}
                        variant="info"
                        compact
                    />
                    <DashboardStatCard
                        title="Kegiatan Terpetakan"
                        value={String(distinctKegiatan)}
                        icon={KeyRound}
                        description="Halaman ini"
                        isLoading={isLoading}
                        variant="success"
                        compact
                    />
                    <DashboardStatCard
                        title={`Tahun ${currentYear}`}
                        value={String(thisYear)}
                        icon={Network}
                        description="Mapping tahun berjalan"
                        isLoading={isLoading}
                        variant="warning"
                        compact
                    />
                </div>
            </AccessSection>

            <AccessSection title="Data Kegiatan-Role" description="Satu baris = satu role boleh membuka satu kegiatan.">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Network className="h-5 w-5" />
                                Tabel Kegiatan-Role
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Total {total} mapping
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <TableSkeleton columns={5} rows={8} />
                        ) : !data?.data?.length ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Tidak ada data kegiatan-role
                            </div>
                        ) : (
                            <div className="rounded-md border overflow-x-auto">
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
                                        {data.data.map((kegiatanRole) => (
                                            <TableRow key={kegiatanRole.id}>
                                                <TableCell className="font-medium">
                                                    <Badge variant="secondary">{kegiatanRole.role?.name || '-'}</Badge>
                                                </TableCell>
                                                <TableCell>{kegiatanRole.kegiatan?.nama_sub_kegiatan || '-'}</TableCell>
                                                <TableCell>{kegiatanRole.kegiatan?.nama_program || '-'}</TableCell>
                                                <TableCell>{kegiatanRole.kegiatan?.tahun_anggaran || '-'}</TableCell>
                                                <TableCell>
                                                    <ListRowActions onDelete={() => setDeleteId(kegiatanRole.id)} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        {data?.meta && data.meta.last_page > 1 ? (
                            <div className="mt-4">
                                <ListPagination
                                    page={page}
                                    totalPages={data.meta.last_page}
                                    onPageChange={setPage}
                                    disabled={isLoading}
                                    variant="simple"
                                    hasNextPage={!!data.links?.next}
                                />
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </AccessSection>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                entityName="Kegiatan-Role"
                description="Tindakan ini tidak dapat dibatalkan. Mapping kegiatan-role akan dihapus permanen."
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </AccessPageShell>
    );
}
