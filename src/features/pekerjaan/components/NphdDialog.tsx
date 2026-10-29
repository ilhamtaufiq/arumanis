import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { downloadBlob } from '@/lib/download-file';
import { exportNphd } from '../api/nphd';
import { useCreateDocumentRegister, useDocumentTypes } from '../hooks/useDocumentRegister';
import { getPrimaryKontrak, getRegisterApiErrorMessage } from '../lib/register-dokumen';
import type { Pekerjaan } from '../types';

const TIPE_KODE = 'NPHD';
const PENERIMA_DEFAULT = 'Penerima Manfaat MCK Individu';
const OBJEK_DEFAULT = '1 Paket Pembangunan (MCK 2 unit/pintu dan Tangki Septik 2 unit)';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pekerjaan: Pekerjaan;
};

type FormState = {
    tanggal: string;
    penerima: string;
    pengelola1: string;
    pengelola2: string;
    objek: string;
    nilai: string;
};

const formAwal = (): FormState => ({
    tanggal: new Date().toISOString().split('T')[0],
    penerima: PENERIMA_DEFAULT,
    pengelola1: '',
    pengelola2: '',
    objek: OBJEK_DEFAULT,
    nilai: '',
});

/**
 * Membuat NPHD dan BA serah terima untuk satu pekerjaan. Nomor dicatat dulu di Register Dokumen
 * (tipe NPHD), lalu dokumen diunduh dengan nomor itu.
 */
export function NphdDialog({ open, onOpenChange, pekerjaan }: Props) {
    const [form, setForm] = useState<FormState>(formAwal);
    const [busy, setBusy] = useState(false);
    const { data: docTypes = [] } = useDocumentTypes(open);
    const createRegister = useCreateDocumentRegister();

    const tipe = docTypes.find((t) => t.code.trim().toUpperCase() === TIPE_KODE);
    const kontrak = getPrimaryKontrak(pekerjaan);

    const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async () => {
        if (!kontrak) {
            toast.error('Pekerjaan ini belum punya kontrak.');
            return;
        }
        if (!tipe) {
            toast.error('Tipe dokumen NPHD belum ada. Tambahkan dulu di Pengaturan Nomor Surat.');
            return;
        }
        const nilai = Number(form.nilai);
        if (!form.objek.trim() || !(nilai > 0)) {
            toast.error('Objek hibah dan nilai aset wajib diisi.');
            return;
        }

        setBusy(true);
        try {
            const register = await createRegister.mutateAsync({
                kontrak_id: kontrak.id,
                type_id: tipe.id,
                tanggal: form.tanggal,
                description: 'NPHD',
            });
            const blob = await exportNphd(pekerjaan.id, {
                nomor: register.nomor,
                tanggal: form.tanggal,
                objek: form.objek.trim(),
                nilai,
                pengelola_label: form.penerima.trim() || PENERIMA_DEFAULT,
                pengelola_1: form.pengelola1.trim(),
                pengelola_2: form.pengelola2.trim(),
            });
            downloadBlob(blob, `NPHD_${register.nomor.replace(/[^A-Za-z0-9]+/g, '_')}.docx`);
            toast.success(`NPHD ${register.nomor} dibuat dan diunduh.`);
            setForm(formAwal());
            onOpenChange(false);
        } catch (err) {
            toast.error(getRegisterApiErrorMessage(err, 'Gagal membuat NPHD'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden sm:max-w-[600px]">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FileText className="h-5 w-5 text-primary" />
                        Buat NPHD
                    </DialogTitle>
                    <DialogDescription>
                        Nomor NPHD dicatat di Register Dokumen saat tombol ditekan. Dokumen NPHD dan BA serah terima
                        diunduh sebagai satu berkas .docx.
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto py-4 pr-1">
                    <div className="space-y-1 rounded-lg border bg-muted/30 p-3 text-sm">
                        <p className="font-medium">{pekerjaan.nama_paket}</p>
                        {!kontrak && <p className="text-destructive">Pekerjaan ini belum punya kontrak.</p>}
                        {kontrak && !tipe && (
                            <p className="text-destructive">
                                Tipe dokumen NPHD belum ada. Tambahkan dulu di Pengaturan Nomor Surat.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="nphd-tanggal">Tanggal NPHD</Label>
                            <Input id="nphd-tanggal" type="date" value={form.tanggal} onChange={set('tanggal')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nphd-nilai">Nilai aset bangunan (Rp)</Label>
                            <Input
                                id="nphd-nilai"
                                type="number"
                                min={0}
                                placeholder="49501500"
                                value={form.nilai}
                                onChange={set('nilai')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nphd-penerima">Sebutan penerima manfaat</Label>
                        <Input id="nphd-penerima" value={form.penerima} onChange={set('penerima')} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="nphd-pengelola1">Nama penerima 1</Label>
                            <Input id="nphd-pengelola1" value={form.pengelola1} onChange={set('pengelola1')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nphd-pengelola2">Nama penerima 2 (opsional)</Label>
                            <Input id="nphd-pengelola2" value={form.pengelola2} onChange={set('pengelola2')} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nphd-objek">Objek hibah</Label>
                        <Textarea id="nphd-objek" className="min-h-[72px]" value={form.objek} onChange={set('objek')} />
                    </div>
                </div>

                <DialogFooter className="shrink-0 gap-2 border-t pt-3 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={busy || !kontrak || !tipe}
                        className="gap-1.5"
                    >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                        Buat & unduh NPHD
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
