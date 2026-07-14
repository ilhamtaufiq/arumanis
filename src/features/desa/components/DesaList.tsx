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
import { Pencil, Plus, RefreshCw } from 'lucide-react';
import { useKecamatanList } from '@/features/kecamatan/hooks/useKecamatan';
import { useDeleteDesa, useDesaList, useSyncDesaKk } from '../hooks/useDesa';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ListRowActions } from '@/components/shared/ListRowActions';
import { formatDesaNumber } from '../lib/format';

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
    const syncKkMutation = useSyncDesaKk();

    const handleDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId, {
                onSettled: () => setDeleteId(null),
            });
        }
    };

    const handleSyncKk = () => {
        if (syncKkMutation.isPending) return;
        syncKkMutation.mutate(undefined);
    };

    return (
        <>
            <ListPageLayout
                shell
                title="Daftar Desa"
                description="Kelola data master desa"
                cardTitle="Data Desa"
                action={(
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSyncKk}
                            disabled={syncKkMutation.isPending}
                            title="Sinkronisasi jumlah KK dari Open Data Cianjur (Disdukcapil)"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${syncKkMutation.isPending ? 'animate-spin' : ''}`} />
                            {syncKkMutation.isPending ? 'Sync KK...' : 'Sync KK'}
                        </Button>
                        <Button asChild>
                            <Link to="/desa/new">
                                <Plus className="mr-2 h-4 w-4" /> Tambah Desa
                            </Link>
                        </Button>
                    </div>
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
                    <TableSkeleton columns={6} rows={8} />
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
                                    <TableHead className="min-w-[120px]">Jumlah KK</TableHead>
                                    <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {desaList.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.nama_desa}</TableCell>
                                        <TableCell>{item.kecamatan?.nama_kecamatan || '-'}</TableCell>
                                        <TableCell>{formatDesaNumber(item.luas)}</TableCell>
                                        <TableCell>{formatDesaNumber(item.jumlah_penduduk)}</TableCell>
                                        <TableCell>{formatDesaNumber(item.jumlah_kk)}</TableCell>
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