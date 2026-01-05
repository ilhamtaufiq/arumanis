import { useState, useEffect } from 'react';
import { Pencil, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import { updateChecklistItem, deleteChecklistItem } from '../api/checklist';
import { toast } from 'sonner';
import type { ChecklistItem } from '../types';

interface EditColumnDialogProps {
    column: ChecklistItem;
    onSuccess: () => void;
}

export default function EditColumnDialog({ column, onSuccess }: EditColumnDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(column.name);
    const [description, setDescription] = useState(column.description || '');
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Reset fields when column changes
    useEffect(() => {
        setName(column.name);
        setDescription(column.description || '');
    }, [column]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setLoading(true);
            await updateChecklistItem(column.id, {
                name: name.trim(),
                description: description.trim() || undefined
            });
            toast.success('Kolom checklist berhasil diperbarui');
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to update checklist item:', error);
            toast.error('Gagal memperbarui kolom');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleteLoading(true);
            await deleteChecklistItem(column.id);
            toast.success('Kolom checklist berhasil dihapus');
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to delete checklist item:', error);
            toast.error('Gagal menghapus kolom');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Kolom Checklist</DialogTitle>
                        <DialogDescription>
                            Ubah nama atau deskripsi kolom. Perubahan akan berlaku untuk semua pekerjaan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama Kolom</Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Pencairan Dana..."
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Deskripsi (opsional)</Label>
                            <Input
                                id="edit-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Keterangan..."
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between items-center sm:justify-between">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" size="sm" disabled={deleteLoading || loading}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Kolom Checklist?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tindakan ini tidak dapat dibatalkan. Semua data checklist untuk kolom ini di setiap pekerjaan akan hilang.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Hapus
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading || deleteLoading}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={loading || deleteLoading || !name.trim()}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
