import { useMemo, useState } from 'react';
import { getPenerimaList, deletePenerima } from '@/features/penerima/api';
import { getOutput } from '@/features/output/api/output';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Penerima } from '@/features/penerima/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import EmbeddedPenerimaForm from './EmbeddedPenerimaForm';
import ImportPenerimaDialog from './ImportPenerimaDialog';
import { getRecipientRequirements } from '../utils/recipientRequirements';
import { cn } from '@/lib/utils';

interface PenerimaTabContentProps {
    pekerjaanId: number;
}

export default function PenerimaTabContent({ pekerjaanId }: PenerimaTabContentProps) {
    const queryClient = useQueryClient();
    const [editingRecipient, setEditingRecipient] = useState<Penerima | null>(null);
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    const { data, isLoading: loading } = useQuery({
        queryKey: ['penerima', { pekerjaan_id: pekerjaanId, page }],
        queryFn: async () => {
            const response = await getPenerimaList({
                pekerjaan_id: pekerjaanId,
                page: page,
                per_page: 10
            });
            return response;
        },
    });

    const { data: outputList = [], isLoading: loadingOutputs } = useQuery({
        queryKey: ['output', { pekerjaan_id: pekerjaanId }],
        queryFn: async () => {
            const response = await getOutput({ pekerjaan_id: pekerjaanId, per_page: -1 });
            return response.data;
        },
    });

    const deleteMutation = useMutation({
        mutationKey: ['penerima', 'delete'],
        mutationFn: (id: number) => deletePenerima(id),
        onSuccess: () => {
            toast.success('Penerima berhasil dihapus');
            queryClient.invalidateQueries({ queryKey: ['penerima'] });
            queryClient.invalidateQueries({ queryKey: ['fotos'] });
        },
        onError: () => toast.error('Gagal menghapus penerima')
    });

    const bulkDeleteMutation = useMutation({
        mutationKey: ['penerima', 'bulk-delete'],
        mutationFn: async (ids: number[]) => {
            const results = await Promise.allSettled(ids.map((id) => deletePenerima(id)));
            const failed = results.filter((r) => r.status === 'rejected').length;
            const ok = results.length - failed;
            return { ok, failed, total: results.length };
        },
        onSuccess: ({ ok, failed }) => {
            if (ok > 0) {
                toast.success(`${ok} penerima berhasil dihapus`);
            }
            if (failed > 0) {
                toast.error(`${failed} penerima gagal dihapus`);
            }
            setSelectedIds([]);
            setBulkDeleteOpen(false);
            queryClient.invalidateQueries({ queryKey: ['penerima'] });
            queryClient.invalidateQueries({ queryKey: ['fotos'] });
        },
        onError: () => toast.error('Gagal menghapus penerima terpilih'),
    });

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id, {
            onSuccess: () => {
                setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
            },
        });
    };

    const handleSuccess = () => {
        setEditingRecipient(null);
        if (page !== 1) {
            setPage(1);
        } else {
            queryClient.invalidateQueries({ queryKey: ['penerima'] });
        }
        queryClient.invalidateQueries({ queryKey: ['fotos'] });
    };

    const penerimaList = data?.data || [];
    const visibleIds = useMemo(() => penerimaList.map((item) => item.id), [penerimaList]);
    const selectedCount = selectedIds.length;
    const allVisibleSelected =
        visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    const someVisibleSelected = visibleIds.some((id) => selectedIds.includes(id));

    const toggleSelection = (id: number, checked: boolean) => {
        setSelectedIds((current) => {
            if (checked) {
                return current.includes(id) ? current : [...current, id];
            }
            return current.filter((selectedId) => selectedId !== id);
        });
    };

    const toggleAllVisible = (checked: boolean) => {
        setSelectedIds((current) => {
            if (!checked) {
                return current.filter((id) => !visibleIds.includes(id));
            }
            return Array.from(new Set([...current, ...visibleIds]));
        });
    };

    if ((loading && !data) || loadingOutputs) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const availableRecipients = data?.meta?.total ?? penerimaList.length;
    const unitBasedRecipientRequirements = getRecipientRequirements(outputList).map(requirement => ({
        ...requirement,
        availableRecipients,
        isReady: availableRecipients >= requirement.targetRecipients,
    }));

    const hasIncompleteRequirements = unitBasedRecipientRequirements.some(item => !item.isReady);

    return (
        <div className="space-y-4">
            {unitBasedRecipientRequirements.length > 0 && (
                <div className={`rounded-lg border p-4 ${hasIncompleteRequirements ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-green-200 bg-green-50 text-green-900'}`}>
                    <div className="flex items-start gap-3">
                        {hasIncompleteRequirements ? (
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        ) : (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                        )}
                        <div className="space-y-1">
                            <p className="font-medium">
                                {hasIncompleteRequirements
                                    ? 'Jumlah penerima pekerjaan belum cukup untuk output non-komunal.'
                                    : 'Jumlah penerima pekerjaan sudah cukup untuk output non-komunal.'}
                            </p>
                            <div className="text-sm">
                                {unitBasedRecipientRequirements.map((item) => (
                                    <p key={item.id}>
                                        {item.name}: tersedia {item.availableRecipients}, kebutuhan {item.targetRecipients}
                                    </p>
                                ))}
                            </div>
                            <p className="text-sm">
                                Saat ini penerima masih dicatat di level pekerjaan, belum dipisahkan per output.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    Import massal per komponen output. Template Excel menyesuaikan volume dan tipe (unit/komunal).
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    {selectedCount > 0 && (
                        <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                            <span className="text-sm font-medium">{selectedCount} terpilih</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto px-2 py-0 text-xs"
                                onClick={() => setSelectedIds([])}
                                disabled={bulkDeleteMutation.isPending}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-auto px-2 py-0 text-xs"
                                onClick={() => setBulkDeleteOpen(true)}
                                disabled={bulkDeleteMutation.isPending}
                            >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Hapus
                            </Button>
                        </div>
                    )}
                    <ImportPenerimaDialog pekerjaanId={pekerjaanId} onSuccess={handleSuccess} />
                </div>
            </div>

            <EmbeddedPenerimaForm
                pekerjaanId={pekerjaanId}
                onSuccess={handleSuccess}
                initialData={editingRecipient}
                onCancel={() => setEditingRecipient(null)}
            />

            {penerimaList.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground rounded-md border">
                    <p>Tidak ada data penerima.</p>
                    <p className="text-sm">Gunakan form di atas untuk menambah penerima.</p>
                </div>
            ) : (
                <div className="rounded-md border overflow-x-auto relative">
                    {loading && (
                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    )}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[44px]">
                                    <Checkbox
                                        checked={
                                            allVisibleSelected
                                                ? true
                                                : someVisibleSelected
                                                  ? 'indeterminate'
                                                  : false
                                        }
                                        onCheckedChange={(value) => toggleAllVisible(value === true)}
                                        aria-label="Pilih semua di halaman"
                                    />
                                </TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>NIK</TableHead>
                                <TableHead>Alamat</TableHead>
                                <TableHead>Jumlah Jiwa</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {penerimaList.map((penerima) => {
                                const isSelected = selectedIds.includes(penerima.id);
                                return (
                                    <TableRow
                                        key={penerima.id}
                                        className={cn(isSelected && 'bg-muted/40')}
                                        data-state={isSelected ? 'selected' : undefined}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(value) =>
                                                    toggleSelection(penerima.id, value === true)
                                                }
                                                aria-label={`Pilih ${penerima.nama}`}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{penerima.nama}</TableCell>
                                        <TableCell>{penerima.nik || '-'}</TableCell>
                                        <TableCell>{penerima.alamat || '-'}</TableCell>
                                        <TableCell>{penerima.jumlah_jiwa}</TableCell>
                                        <TableCell>
                                            {penerima.is_komunal ? (
                                                <Badge>Komunal</Badge>
                                            ) : (
                                                <Badge variant="secondary">Individual</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingRecipient(penerima);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Hapus Penerima</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Apakah Anda yakin ingin menghapus penerima ini? Tindakan ini tidak dapat dibatalkan.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(penerima.id)}>
                                                                Hapus
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {data && data.meta && data.meta.last_page > 1 && (
                <div className="flex items-center justify-between py-2">
                    <div className="text-sm text-muted-foreground">
                        Menampilkan {data.meta.from} - {data.meta.to} dari {data.meta.total} data
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Sebelumnya
                        </Button>
                        <div className="text-sm font-medium">
                            Halaman {page} dari {data.meta.last_page}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === data.meta.last_page}
                        >
                            Selanjutnya
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus {selectedCount} penerima?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedCount} penerima terpilih akan dihapus permanen. Foto yang terikat penerima
                            ini tidak dihapus otomatis (bisa menjadi orphan di tab Foto).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={bulkDeleteMutation.isPending}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            disabled={bulkDeleteMutation.isPending}
                            onClick={() => bulkDeleteMutation.mutate(selectedIds)}
                        >
                            {bulkDeleteMutation.isPending ? 'Menghapus...' : 'Hapus semua terpilih'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
