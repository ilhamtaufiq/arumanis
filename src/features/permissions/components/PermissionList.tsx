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
import { Plus, Pencil } from 'lucide-react';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ListRowActions } from '@/components/shared/ListRowActions';
import { useDeletePermission, usePermissionsList } from '../hooks/usePermissions';

export default function PermissionList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, isLoading } = usePermissionsList({ page, search });
    const deleteMutation = useDeletePermission();

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
                title="Daftar Permission"
                description="Kelola permission sistem"
                cardTitle="Data Permission"
                action={(
                    <Button asChild>
                        <Link to="/permissions/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Permission
                        </Link>
                    </Button>
                )}
                toolbar={(
                    <SearchInput
                        defaultValue={search}
                        onSearch={handleSearch}
                        placeholder="Cari nama permission..."
                        className="w-full sm:max-w-sm"
                        delay={300}
                    />
                )}
                footer={(
                    <ListPagination
                        page={page}
                        totalPages={data?.meta?.last_page || 1}
                        onPageChange={setPage}
                        disabled={isLoading}
                        variant="simple"
                        hasNextPage={!!data?.links?.next}
                    />
                )}
            >
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
            </ListPageLayout>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                entityName="Permission"
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </>
    );
}