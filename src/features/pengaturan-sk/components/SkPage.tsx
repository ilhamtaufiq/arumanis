import { useState } from 'react';
import { FileText, PlusCircle, Search, Download, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';
import { useSkList, useCreateSk, useUpdateSk, useDeleteSk, getSkDownloadUrl, type Sk } from '../api';

interface FormState {
    id: number | null;
    nomor_sk: string;
    nama: string;
    tanggal_sk: string;
    file: File | null;
}

const EMPTY_FORM: FormState = { id: null, nomor_sk: '', nama: '', tanggal_sk: '', file: null };

function formatBytes(bytes?: number | null): string {
    if (bytes === null || bytes === undefined || isNaN(bytes) || bytes === 0) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function SkPage() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [pendingDelete, setPendingDelete] = useState<Sk | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [page, setPage] = useState(1);

    const { data, isLoading } = useSkList({ search: debouncedSearch || undefined, page });
    const createMutation = useCreateSk();
    const updateMutation = useUpdateSk();
    const deleteMutation = useDeleteSk();

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
        window.setTimeout(() => setDebouncedSearch(value), 300);
    };

    const meta = data?.meta;
    const totalPages = meta?.last_page ?? 1;

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setOpen(true);
    };

    const openEdit = (sk: Sk) => {
        setForm({
            id: sk.id,
            nomor_sk: sk.nomor_sk,
            nama: sk.nama,
            tanggal_sk: sk.tanggal_sk ?? '',
            file: null,
        });
        setOpen(true);
    };

    const handleSubmit = async () => {
        if (!form.nomor_sk.trim() || !form.nama.trim()) {
            toast.error('Nomor SK dan nama wajib diisi');
            return;
        }
        if (form.id === null && !form.file) {
            toast.error('Pilih file scan SK');
            return;
        }

        const formData = new FormData();
        formData.append('nomor_sk', form.nomor_sk.trim());
        formData.append('nama', form.nama.trim());
        if (form.tanggal_sk) formData.append('tanggal_sk', form.tanggal_sk);
        if (form.file) formData.append('file', form.file);

        try {
            setIsSubmitting(true);
            if (form.id === null) {
                await createMutation.mutateAsync(formData);
                toast.success('SK berhasil ditambahkan');
            } else {
                await updateMutation.mutateAsync({ id: form.id, data: formData });
                toast.success('SK berhasil diperbarui');
            }
            setOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Gagal menyimpan SK');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!pendingDelete) return;
        try {
            await deleteMutation.mutateAsync(pendingDelete.id);
            toast.success('SK berhasil dihapus');
            setPendingDelete(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Gagal menghapus SK');
        }
    };

    const downloadSk = (sk: Sk) => {
        const link = document.createElement('a');
        link.href = getSkDownloadUrl(sk.id);
        link.target = '_blank';
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Pengaturan SK</h1>
                        <p className="text-muted-foreground">Arsip dokumen Surat Keputusan — upload, cari, dan kelola file SK</p>
                    </div>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Tambah SK
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-9"
                    placeholder="Cari nomor SK atau nama..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>

            <div className="bg-card rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nomor SK</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>File</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                    Memuat SK...
                                </TableCell>
                            </TableRow>
                        ) : data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                    Belum ada SK. Klik "Tambah SK" untuk upload dokumen.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((sk) => (
                                <TableRow key={sk.id}>
                                    <TableCell className="font-medium">{sk.nomor_sk}</TableCell>
                                    <TableCell>{sk.nama}</TableCell>
                                    <TableCell>{sk.tanggal_sk ?? '-'}</TableCell>
                                    <TableCell>
                                        {sk.file_name ? (
                                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <FileText className="h-3.5 w-3.5" />
                                                {sk.file_name}
                                                {sk.size ? <span className="text-xs">({formatBytes(sk.size)})</span> : null}
                                            </span>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" title="Unduh" onClick={() => downloadSk(sk)}>
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(sk)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" title="Hapus" onClick={() => setPendingDelete(sk)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Halaman {meta?.current_page ?? 1} dari {totalPages} · Total {meta?.total ?? 0}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{form.id === null ? 'Tambah SK' : 'Edit SK'}</DialogTitle>
                        <DialogDescription>Upload dokumen SK beserta nomor, nama, dan tanggal.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nomor SK</label>
                            <Input
                                value={form.nomor_sk}
                                onChange={(e) => setForm({ ...form, nomor_sk: e.target.value })}
                                placeholder="cth. 800/1234/2026"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nama</label>
                            <Input
                                value={form.nama}
                                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                placeholder="Judul / perihal SK"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tanggal</label>
                            <Input
                                type="date"
                                value={form.tanggal_sk}
                                onChange={(e) => setForm({ ...form, tanggal_sk: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">File Scan SK</label>
                            <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                            />
                            {form.id !== null && (
                                <p className="text-xs text-muted-foreground">
                                    Kosongkan untuk mempertahankan file yang ada.
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => {
                    if (!open) setPendingDelete(null);
                }}
                title="Hapus SK?"
                desc={`Hapus SK ${pendingDelete?.nomor_sk} — ${pendingDelete?.nama}? File yang dihapus tidak bisa dikembalikan.`}
                destructive
                confirmText="Hapus"
                handleConfirm={handleDelete}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
