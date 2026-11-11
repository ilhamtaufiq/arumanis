import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
} from '@/components/ui/dialog';
import { DatePickerField } from '@/components/shared/DatePickerField';
import { exportKontrakBmd } from '../api/kontrak';
import type { Kontrak } from '../types';
import {
    BMD_NOMOR_SURAT_MAX_LENGTH,
    buildBmdExportPayload,
    createDefaultBmdForm,
    validateBmdForm,
    type BmdSuratPernyataanForm,
} from '../lib/bmd-surat-pernyataan';
import {
    downloadKontrakBlob,
    getKontrakApiErrorMessage,
    sanitizeKontrakFileName,
} from '../lib/kontrak-list-utils';

type BmdSuratPernyataanModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kontrak: Kontrak | null;
};

export function BmdSuratPernyataanModal({ open, onOpenChange, kontrak }: BmdSuratPernyataanModalProps) {
    const [form, setForm] = useState<BmdSuratPernyataanForm>(() => createDefaultBmdForm());
    const [isBusy, setIsBusy] = useState(false);

    // Isian dimulai ulang setiap dialog dibuka.
    useEffect(() => {
        if (open) {
            setForm(createDefaultBmdForm());
        }
    }, [open]);

    const pekerjaanName = kontrak?.pekerjaans?.[0]?.nama_paket || 'Kontrak';
    const errors = validateBmdForm(form);
    const canSubmit = errors.length === 0 && !isBusy && kontrak !== null;

    const handleExport = async () => {
        if (!kontrak || !canSubmit) return;

        setIsBusy(true);
        const toastId = toast.loading(`Menyiapkan surat pernyataan BMD ${pekerjaanName}...`);
        try {
            const blob = await exportKontrakBmd(kontrak.id, buildBmdExportPayload(form));
            const fileName = `Surat_Pernyataan_BMD_${sanitizeKontrakFileName(pekerjaanName)}.docx`;
            downloadKontrakBlob(blob, fileName);
            toast.success('Surat pernyataan BMD berhasil digenerate', { id: toastId });
            onOpenChange(false);
        } catch (err: unknown) {
            console.error('Export surat pernyataan BMD failed:', err);
            toast.error(getKontrakApiErrorMessage(err, 'Gagal generate surat pernyataan BMD'), { id: toastId });
        } finally {
            setIsBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !isBusy && onOpenChange(next)}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Surat Pernyataan BMD</DialogTitle>
                    <DialogDescription>
                        Isi nomor dan tanggal surat untuk{' '}
                        <span className="font-semibold text-foreground">{pekerjaanName}</span>. Nama dan NIP pejabat
                        diambil dari Pengaturan.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="bmd_nomor_surat">Nomor surat</Label>
                        <Input
                            id="bmd_nomor_surat"
                            value={form.nomor_surat}
                            placeholder="Contoh: 900/001/KEU-SP/DPKP/2026"
                            maxLength={BMD_NOMOR_SURAT_MAX_LENGTH}
                            disabled={isBusy}
                            onChange={(e) => setForm({ ...form, nomor_surat: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Format: 900/nomor urut/KEU-SP/DPKP/tahun. Maksimal {BMD_NOMOR_SURAT_MAX_LENGTH} karakter.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Tanggal surat</Label>
                            <DatePickerField
                                value={form.tanggal_surat}
                                onChange={(value) => setForm({ ...form, tanggal_surat: value || '' })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tanggal perolehan</Label>
                            <DatePickerField
                                value={form.tanggal_perolehan}
                                onChange={(value) => setForm({ ...form, tanggal_perolehan: value || '' })}
                            />
                        </div>
                    </div>

                    {errors.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Belum bisa diunduh: {errors[0]}
                        </p>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
                        Batal
                    </Button>
                    <Button type="button" onClick={() => void handleExport()} disabled={!canSubmit}>
                        Unduh
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
