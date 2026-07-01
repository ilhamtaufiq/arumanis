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
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { SearchInput } from '@/components/shared/SearchInput';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { ListPagination } from '@/components/shared/ListPagination';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { ListRowActions } from '@/components/shared/ListRowActions';
import { useDeleteRole, useRolesList } from '../hooks/useRoles';

export default function RoleList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { data, isLoading } = useRolesList({ page, search });
    const deleteMutation = useDeleteRole();

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
                title="Daftar Role"
                description="Kelola role dan hak akses"
                cardTitle="Data Role"
                action={(
                    <Button asChild>
                        <Link to="/roles/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Role
                        </Link>
                    </Button>
                )}
                toolbar={(
                    <SearchInput
                        defaultValue={search}
                        onSearch={handleSearch}
                        placeholder="Cari nama role..."
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
            </ListPageLayout>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                entityName="Role"
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </>
    );
}