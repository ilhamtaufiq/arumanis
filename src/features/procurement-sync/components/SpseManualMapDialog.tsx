import { useEffect, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { mapSpseStaging } from '@/features/procurement-sync/api';
import type { ProcurementStagingPaket } from '@/features/procurement-sync/types';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';

interface SpseManualMapDialogProps {
    row: ProcurementStagingPaket | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMapped?: () => void;
}

export function SpseManualMapDialog({ row, open, onOpenChange, onMapped }: SpseManualMapDialogProps) {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<Array<{ id: number; nama_paket: string }>>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open && row) {
            setSearch('');
            setResults([]);
            setSelectedId(row.matched_pekerjaan_id ?? null);
        }
    }, [open, row]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await getPekerjaan({ search: search || undefined, per_page: 10 });
            setResults((res.data ?? []).map((p) => ({ id: p.id, nama_paket: p.nama_paket })));
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal cari pekerjaan');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!row || !selectedId) {
            toast.error('Pilih pekerjaan tujuan dulu.');
            return;
        }
        setSaving(true);
        try {
            await mapSpseStaging(row.id, selectedId);
            toast.success('Mapping manual tersimpan');
            onOpenChange(false);
            onMapped?.();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal simpan mapping');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Map manual ke pekerjaan</DialogTitle>
                    <DialogDescription>
                        {row ? (
                            <>
                                Paket <span className="font-mono text-xs">{row.kode_paket}</span> — {row.nama_paket}
                            </>
                        ) : (
                            'Pilih paket dari tabel staging.'
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2">
                    <Input
                        placeholder="Cari nama pekerjaan Arumanis"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') void handleSearch();
                        }}
                    />
                    <Button variant="outline" onClick={() => void handleSearch()} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-md border divide-y">
                    {results.length === 0 && (
                        <p className="p-3 text-sm text-muted-foreground">
                            {loading ? 'Mencari...' : 'Ketik kata kunci lalu cari. Hasil 10 teratas.'}
                        </p>
                    )}
                    {results.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedId(p.id)}
                            className={`w-full text-left p-3 text-sm hover:bg-muted/60 ${selectedId === p.id ? 'bg-primary/10 font-medium' : ''}`}
                        >
                            <span className="font-mono text-xs text-muted-foreground mr-2">#{p.id}</span>
                            {p.nama_paket}
                        </button>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button onClick={() => void handleSave()} disabled={saving || !selectedId}>
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Simpan mapping
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
