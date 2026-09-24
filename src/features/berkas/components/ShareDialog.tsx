import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useUsersList } from '@/features/users/hooks/useUsers';
import { useAuthStore } from '@/stores/auth-stores';

interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemName: string;
    isOwner: boolean;
    onShare: (userIds: number[]) => void;
    isPending?: boolean;
}

export default function ShareDialog({
    open,
    onOpenChange,
    itemName,
    isOwner,
    onShare,
    isPending = false,
}: ShareDialogProps) {
    const [shareAll, setShareAll] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const { auth } = useAuthStore();

    const { data: usersRes, isLoading } = useUsersList({ page: 1, search: '' }, open);

    const users = useMemo(
        () => (usersRes?.data ?? []).filter((u) => u.id !== auth.user?.id),
        [usersRes?.data, auth.user?.id],
    );

    const toggleUser = (id: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSubmit = () => {
        if (shareAll) {
            onShare([]);
        } else {
            onShare(Array.from(selected));
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (o) { setShareAll(false); setSelected(new Set()); } }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bagikan &quot;{itemName}&quot;</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {isOwner ? (
                        <label className="flex cursor-pointer items-center gap-2 rounded border p-3 hover:bg-muted/60">
                            <Checkbox
                                checked={shareAll}
                                onCheckedChange={(v) => { setShareAll(!!v); if (v) setSelected(new Set()); }}
                            />
                            <div>
                                <p className="text-sm font-medium">Semua User</p>
                                <p className="text-xs text-muted-foreground">Bagikan ke seluruh pengguna</p>
                            </div>
                        </label>
                    ) : null}

                    {!shareAll ? (
                        <div className="max-h-64 space-y-1 overflow-y-auto">
                            {isLoading ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">Memuat user...</p>
                            ) : users.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">Tidak ada user lain.</p>
                            ) : (
                                users.map((u) => (
                                    <label
                                        key={u.id}
                                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/60"
                                    >
                                        <Checkbox
                                            checked={selected.has(u.id)}
                                            onCheckedChange={() => toggleUser(u.id)}
                                        />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{u.name}</p>
                                            {u.jabatan ? (
                                                <p className="truncate text-xs text-muted-foreground">{u.jabatan}</p>
                                            ) : null}
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    ) : null}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || (!shareAll && selected.size === 0)}
                    >
                        Bagikan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
