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
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { useDeleteKegiatan, useKegiatanList } from '../hooks/useKegiatan';

export default function KegiatanList() {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { tahunAnggaran } = useAppSettingsValues();
    const { data: kegiatanRes, isLoading: loading } = useKegiatanList({ tahun: tahunAnggaran });
    const kegiatanList = kegiatanRes?.data || [];
    const deleteMutation = useDeleteKegiatan();

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
                title="Daftar Kegiatan"
                description="Kelola data kegiatan dan anggaran"
                cardTitle="Data Kegiatan"
                action={(
                    <Button asChild>
                        <Link to="/kegiatan/new">
                            <Plus className="mr-2 h-4 w-4" /> Tambah Kegiatan
                        </Link>
                    </Button>
                )}
            >
                {loading ? (
                    <TableSkeleton columns={8} rows={8} />
                ) : kegiatanList.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Belum ada data kegiatan.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px]">Program</TableHead>
                                    <TableHead className="min-w-[120px]">Sub Bidang</TableHead>
                                    <TableHead className="min-w-[200px]">Kegiatan</TableHead>
                                    <TableHead className="min-w-[200px]">Sub Kegiatan</TableHead>
                                    <TableHead className="min-w-[100px]">Tahun</TableHead>
                                    <TableHead className="min-w-[150px]">Pagu</TableHead>
                                    <TableHead className="min-w-[160px]">PPTK</TableHead>
                                    <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kegiatanList.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.nama_program}</TableCell>
                                        <TableCell>
                                            {item.sub_bidang === 'Air Minum' ? (
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                    Air Minum
                                                </span>
                                            ) : item.sub_bidang === 'Sanitasi' ? (
                                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                                                    Sanitasi
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                    -
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{item.nama_kegiatan}</TableCell>
                                        <TableCell>{item.nama_sub_kegiatan}</TableCell>
                                        <TableCell>{item.tahun_anggaran}</TableCell>
                                        <TableCell>
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                            }).format(item.pagu)}
                                        </TableCell>
                                        <TableCell>
                                            {item.nama_pptk?.trim() ? (
                                                <span className="text-sm">{item.nama_pptk}</span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Default settings</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                            <ListRowActions
                                                edit={(
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link to="/kegiatan/$id/edit" params={{ id: item.id.toString() }}>
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
                entityName="Kegiatan"
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </>
    );
}