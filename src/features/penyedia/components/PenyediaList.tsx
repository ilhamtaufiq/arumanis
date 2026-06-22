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
import { Plus, Pencil, FileText } from 'lucide-react';
import { useDeletePenyedia, usePenyediaList } from '../hooks/usePenyedia';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ListRowActions } from '@/components/shared/ListRowActions';

export default function PenyediaList() {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSearch = (val: string) => {
        setSearch(val);
        setCurrentPage(1);
    };

    const { data: penyediaRes, isLoading: loading } = usePenyediaList({
        page: currentPage,
        search: search || undefined,
    });
    const data = penyediaRes?.data || [];
    const totalPages = penyediaRes?.meta?.last_page || 1;
    const deleteMutation = useDeletePenyedia();

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
                title="Daftar Penyedia"
                description="Kelola data master referensi penyedia / vendor"
                cardTitle="Data Penyedia"
                action={(
                    <Button asChild>
                        <Link to="/penyedia/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Penyedia
                        </Link>
                    </Button>
                )}
                toolbar={(
                    <SearchInput
                        defaultValue={search}
                        onSearch={handleSearch}
                        placeholder="Cari nama, direktur..."
                        className="w-full sm:w-64"
                    />
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
                    <TableSkeleton columns={5} rows={10} />
                ) : data.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Belum ada data penyedia.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px]">Nama Penyedia</TableHead>
                                    <TableHead className="min-w-[150px]">Direktur</TableHead>
                                    <TableHead className="min-w-[250px]">Alamat</TableHead>
                                    <TableHead className="min-w-[120px]">Dokumen</TableHead>
                                    <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.nama}</TableCell>
                                        <TableCell>{item.direktur || '-'}</TableCell>
                                        <TableCell>{item.alamat || '-'}</TableCell>
                                        <TableCell>
                                            {item.dokumen && item.dokumen.length > 0 ? (
                                                <span className="flex items-center text-xs bg-primary/10 text-primary px-2 py-1 rounded-full w-fit">
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    {item.dokumen.length} dokumen
                                                </span>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                            <ListRowActions
                                                edit={(
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link to="/penyedia/$id/edit" params={{ id: item.id.toString() }}>
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
                entityName="Penyedia"
                description="Tindakan ini tidak dapat dibatalkan. Seluruh data penyedia ini akan dihapus secara permanen."
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </>
    );
}