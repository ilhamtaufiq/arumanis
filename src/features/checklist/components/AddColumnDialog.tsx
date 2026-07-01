import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
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
import { createChecklistItem } from '../api/checklist';
import { toast } from 'sonner';
import type { ChecklistContext } from '../types';

interface AddColumnDialogProps {
    onSuccess: () => void;
    context?: ChecklistContext;
    title?: string;
    helperText?: string;
}

export default function AddColumnDialog({
    onSuccess,
    context = 'pekerjaan',
    title = 'Tambah Kolom Checklist',
    helperText = 'Kolom baru akan muncul di tabel checklist untuk semua pekerjaan.',
}: AddColumnDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setLoading(true);
            await createChecklistItem({
                name: name.trim(),
                description: description.trim() || undefined,
                context,
            });
            toast.success('Kolom checklist berhasil ditambahkan');
            setName('');
            setDescription('');
            setOpen(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to create checklist item:', error);
            toast.error('Gagal menambahkan kolom');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kolom
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{helperText}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Kolom</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Contoh: Verifikasi Lapangan"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi (opsional)</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Keterangan tambahan..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading || !name.trim()}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
