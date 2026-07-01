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
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ListRowActions } from '@/components/shared/ListRowActions';
import { useDeleteKegiatanRole, useKegiatanRoleList } from '../hooks/useKegiatanRole';

export default function KegiatanRoleList() {
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, isLoading } = useKegiatanRoleList({ page });
    const deleteMutation = useDeleteKegiatanRole();

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId, {
                onSettled: () => setDeleteId(null),
            });
        }
    };

    return (
        <>
            <ListPageLayout
                title="Manajemen Kegiatan-Role"
                description="Kelola akses role terhadap kegiatan"
                cardTitle="Data Kegiatan-Role"
                action={(
                    <Button asChild>
                        <Link to="/kegiatan-role/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Kegiatan-Role
                        </Link>
                    </Button>
                )}
                footer={data?.meta && data.meta.last_page > 1 ? (
                    <ListPagination
                        page={page}
                        totalPages={data.meta.last_page}
                        onPageChange={setPage}
                        disabled={isLoading}
                        variant="simple"
                        hasNextPage={!!data.links?.next}
                    />
                ) : undefined}
            >
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
            </ListPageLayout>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                entityName="Kegiatan-Role"
                description="Tindakan ini tidak dapat dibatalkan. Mapping kegiatan-role akan dihapus permanen."
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </>
    );
}