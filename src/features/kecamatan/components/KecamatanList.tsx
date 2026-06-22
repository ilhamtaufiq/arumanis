import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Pencil, Plus } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ListRowActions } from '@/components/shared/ListRowActions';
import { useDeleteKecamatan, useKecamatanList } from '../hooks/useKecamatan';

export default function KecamatanList() {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { data: kecamatanRes, isLoading: loading } = useKecamatanList();
    const kecamatanList = kecamatanRes?.data || [];
    const deleteMutation = useDeleteKecamatan();

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
                shell
                title="Daftar Kecamatan"
                description="Kelola data master kecamatan"
                cardTitle="Data Kecamatan"
                action={(
                    <Button asChild>
                        <Link to="/kecamatan/new">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Kecamatan
                        </Link>
                    </Button>
                )}
            >
                {loading ? (
                    <TableSkeleton columns={3} rows={8} />
                ) : kecamatanList.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Belum ada data kecamatan.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px]">Nama Kecamatan</TableHead>
                                    <TableHead className="min-w-[150px]">Jumlah Desa</TableHead>
                                    <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kecamatanList.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.nama_kecamatan}</TableCell>
                                        <TableCell>{item.jumlah_desa}</TableCell>
                                        <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                            <ListRowActions
                                                edit={(
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link to="/kecamatan/$id/edit" params={{ id: item.id.toString() }}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                onDelete={() => setDeleteId(item.id)}
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
                entityName="Kecamatan"
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </>
    );
}