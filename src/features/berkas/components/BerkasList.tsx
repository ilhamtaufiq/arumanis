import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import type { Berkas } from '../types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Pencil, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { useBerkasList, useDeleteBerkas } from '../hooks/useBerkas';

export default function BerkasList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { tahunAnggaran } = useAppSettingsValues();

    const { data, isLoading, isError } = useBerkasList({
        page,
        search,
        tahun: tahunAnggaran,
    });
    const deleteMutation = useDeleteBerkas();

    useEffect(() => {
        if (isError) {
            toast.error('Gagal memuat data berkas');
        }
    }, [isError]);

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
        <>
            <ListPageLayout
                shell
                title="Dokumen Berkas"
                description="Kelola dokumen berkas pekerjaan"
                cardTitle="Data Berkas"
                action={(
                    <Button asChild>
                        <Link to="/berkas/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Berkas
                        </Link>
                    </Button>
                )}
                toolbar={(
                    <SearchInput
                        defaultValue={search}
                        onSearch={handleSearch}
                        placeholder="Cari jenis dokumen..."
                        className="w-full sm:max-w-sm"
                        delay={300}
                    />
                )}
                footer={data?.meta && data.meta.last_page > 1 ? (
                    <ListPagination
                        page={page}
                        totalPages={data.meta.last_page}
                        onPageChange={setPage}
                        disabled={isLoading}
                    />
                ) : undefined}
            >
                {isLoading ? (
                    <TableSkeleton columns={4} rows={10} />
                ) : data?.data.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Tidak ada data berkas
                    </div>
                ) : (
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px]">Jenis Dokumen</TableHead>
                                    <TableHead className="min-w-[250px]">Pekerjaan</TableHead>
                                    <TableHead className="min-w-[150px]">File</TableHead>
                                    <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.data.map((berkas: Berkas) => (
                                    <TableRow key={berkas.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center">
                                                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {berkas.jenis_dokumen}
                                            </div>
                                        </TableCell>
                                        <TableCell>{berkas.pekerjaan?.nama_paket}</TableCell>
                                        <TableCell>
                                            {berkas.berkas_url && (
                                                <a
                                                    href={berkas.berkas_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-sm text-blue-600 hover:underline"
                                                >
                                                    <ExternalLink className="mr-1 h-3 w-3" />
                                                    Lihat File
                                                </a>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link to="/berkas/$id/edit" params={{ id: berkas.id.toString() }}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => setDeleteId(berkas.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
                entityName="Berkas"
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </>
    );
}