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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Pencil, Plus } from 'lucide-react';
import { useKecamatanList } from '@/features/kecamatan/hooks/useKecamatan';
import { useDeleteDesa, useDesaList } from '../hooks/useDesa';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ListRowActions } from '@/components/shared/ListRowActions';

export default function DesaList() {
    const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const kecamatanId = selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan);

    const { data: kecamatanRes } = useKecamatanList();
    const kecamatanList = kecamatanRes?.data || [];

    const { data: desaRes, isLoading: loading } = useDesaList({
        page: currentPage,
        kecamatan_id: kecamatanId,
    });
    const desaList = desaRes?.data || [];
    const totalPages = desaRes?.meta?.last_page || 1;
    const deleteMutation = useDeleteDesa();

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
                title="Daftar Desa"
                description="Kelola data master desa"
                cardTitle="Data Desa"
                action={(
                    <Button asChild>
                        <Link to="/desa/new">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Desa
                        </Link>
                    </Button>
                )}
                toolbar={(
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Filter Kecamatan:</span>
                        <Select
                            value={selectedKecamatan}
                            onValueChange={(value) => {
                                setSelectedKecamatan(value);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Semua Kecamatan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kecamatan</SelectItem>
                                {kecamatanList.map((kec) => (
                                    <SelectItem key={kec.id} value={kec.id.toString()}>
                                        {kec.nama_kecamatan}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                footer={totalPages > 1 ? (
                    <ListPagination
                        page={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        disabled={loading}
                    />
                ) : undefined}
            >
                {loading ? (
                    <TableSkeleton columns={5} rows={8} />
                ) : desaList.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Belum ada data desa.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px]">Nama Desa</TableHead>
                                    <TableHead className="min-w-[150px]">Kecamatan</TableHead>
                                    <TableHead className="min-w-[120px]">Luas (Ha)</TableHead>
                                    <TableHead className="min-w-[150px]">Jumlah Penduduk</TableHead>
                                    <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {desaList.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.nama_desa}</TableCell>
                                        <TableCell>{item.kecamatan?.nama_kecamatan || '-'}</TableCell>
                                        <TableCell>{item.luas.toLocaleString('id-ID')}</TableCell>
                                        <TableCell>{item.jumlah_penduduk.toLocaleString('id-ID')}</TableCell>
                                        <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                            <ListRowActions
                                                edit={(
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link to="/desa/$id/edit" params={{ id: item.id.toString() }}>
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
                entityName="Desa"
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </>
    );
}