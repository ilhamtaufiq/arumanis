import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface RenameDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialName: string;
    onSubmit: (name: string) => void;
    isPending?: boolean;
}

export default function RenameDialog({
    open,
    onOpenChange,
    initialName,
    onSubmit,
    isPending = false,
}: RenameDialogProps) {
    const [name, setName] = useState(initialName);

    const handleSubmit = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) setName(initialName); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ganti Nama</DialogTitle>
                </DialogHeader>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
