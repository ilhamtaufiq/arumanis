import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { saveNphdData, type NphdData } from '../api/nphd';
import { NphdPenerimaInput } from './NphdPenerimaInput';
import { JENIS_PENGELOLA_AWAL } from './nphd-defaults';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pekerjaanId: number;
    namaPaket: string;
    data: NphdData | undefined;
};

/** Isi jenis pengelola dan penerima manfaat untuk satu paket, dipakai sebagai isi awal form NPHD. */
export function NphdDataDialog({ open, onOpenChange, pekerjaanId, namaPaket, data }: Props) {
    const queryClient = useQueryClient();
    const [jenis, setJenis] = useState(JENIS_PENGELOLA_AWAL);
    const [penerima, setPenerima] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);

    // Setiap dialog dibuka, isi dari data tersimpan (atau nilai awal bila belum ada).
    useEffect(() => {
        if (!open) return;
        setJenis(data?.jenis_pengelola || JENIS_PENGELOLA_AWAL);
        setPenerima(data?.penerima_manfaat ?? []);
    }, [open, data]);

    const simpan = async () => {
        const daftar = penerima.map((p) => p.trim()).filter(Boolean);
        if (!jenis.trim()) {
            toast.error('Jenis pengelola wajib diisi.');
            return;
        }
        if (daftar.length === 0) {
            toast.error('Isi minimal satu nama penerima manfaat.');
            return;
        }
        setBusy(true);
        try {
            await saveNphdData(pekerjaanId, { jenis_pengelola: jenis.trim(), penerima_manfaat: daftar });
            await queryClient.invalidateQueries({ queryKey: ['nphd'] });
            toast.success('Data NPHD disimpan.');
            onOpenChange(false);
        } catch {
            toast.error('Gagal menyimpan data NPHD.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden sm:max-w-[560px]">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Data NPHD</DialogTitle>
                    <DialogDescription className="break-words">{namaPaket}</DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto py-4 pr-1">
                    <div className="space-y-2">
                        <Label htmlFor="nphd-data-jenis">Jenis pengelola</Label>
                        <Input id="nphd-data-jenis" value={jenis} onChange={(e) => setJenis(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nphd-data-penerima">Nama penerima manfaat</Label>
                        <NphdPenerimaInput id="nphd-data-penerima" value={penerima} onChange={setPenerima} />
                    </div>
                </div>

                <DialogFooter className="shrink-0 gap-2 border-t pt-3 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
                        Batal
                    </Button>
                    <Button onClick={simpan} disabled={busy} className="gap-1.5">
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
