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
import { createKontrakSuketDesa } from '../api/kontrak';
import type { Kontrak } from '../types';
import {
    SUKET_DESA_MAX_LENGTH,
    buildSuketDesaExportPayload,
    createDefaultSuketDesaForm,
    validateSuketDesaForm,
    type SuketDesaForm,
} from '../lib/suket-desa';
import {
    downloadKontrakBlob,
    getKontrakApiErrorMessage,
    sanitizeKontrakFileName,
} from '../lib/kontrak-list-utils';

type SuketDesaModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kontrak: Kontrak | null;
};

export function SuketDesaModal({ open, onOpenChange, kontrak }: SuketDesaModalProps) {
    const [form, setForm] = useState<SuketDesaForm>(() => createDefaultSuketDesaForm());
    const [isBusy, setIsBusy] = useState(false);

    // Isian dimulai ulang setiap dialog dibuka.
    useEffect(() => {
        if (open) {
            setForm(createDefaultSuketDesaForm());
        }
    }, [open]);

    const pekerjaanName = kontrak?.pekerjaans?.[0]?.nama_paket || 'Kontrak';
    const errors = validateSuketDesaForm(form);
    const canSubmit = errors.length === 0 && !isBusy && kontrak !== null;

    const handleExport = async () => {
        if (!kontrak || !canSubmit) return;

        setIsBusy(true);
        const toastId = toast.loading(`Menyiapkan surat keterangan desa ${pekerjaanName}...`);
        try {
            const blob = await createKontrakSuketDesa(kontrak.id, buildSuketDesaExportPayload(form));
            const fileName = `Surat_Keterangan_Desa_${sanitizeKontrakFileName(pekerjaanName)}.docx`;
            downloadKontrakBlob(blob, fileName);
            toast.success('Surat keterangan kepala desa berhasil digenerate', { id: toastId });
            onOpenChange(false);
        } catch (err: unknown) {
            console.error('Export surat keterangan kepala desa failed:', err);
            toast.error(getKontrakApiErrorMessage(err, 'Gagal generate surat keterangan kepala desa'), {
                id: toastId,
            });
        } finally {
            setIsBusy(false);
        }
    };

    const setField = <K extends keyof SuketDesaForm>(key: K, value: SuketDesaForm[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !isBusy && onOpenChange(next)}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Surat Keterangan Kepala Desa</DialogTitle>
                    <DialogDescription>
                        Isi data surat untuk{' '}
                        <span className="font-semibold text-foreground">{pekerjaanName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="suket_nomor_surat">Nomor surat</Label>
                        <Input
                            id="suket_nomor_surat"
                            value={form.nomor_surat}
                            placeholder="Contoh: 141/ /DESA-SMP/2026"
                            maxLength={SUKET_DESA_MAX_LENGTH.nomor_surat}
                            disabled={isBusy}
                            onChange={(e) => setField('nomor_surat', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tanggal surat</Label>
                        <DatePickerField
                            value={form.tanggal_surat}
                            onChange={(value) => setField('tanggal_surat', value || '')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="suket_nama_kepala_desa">Nama kepala desa</Label>
                        <Input
                            id="suket_nama_kepala_desa"
                            value={form.nama_kepala_desa}
                            maxLength={SUKET_DESA_MAX_LENGTH.nama_kepala_desa}
                            disabled={isBusy}
                            onChange={(e) => setField('nama_kepala_desa', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="suket_alamat_kantor">Alamat kantor</Label>
                        <Input
                            id="suket_alamat_kantor"
                            value={form.alamat_kantor}
                            maxLength={SUKET_DESA_MAX_LENGTH.alamat_kantor}
                            disabled={isBusy}
                            onChange={(e) => setField('alamat_kantor', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="suket_serah_terima_kepada">Diserahterimakan kepada</Label>
                        <Input
                            id="suket_serah_terima_kepada"
                            value={form.serah_terima_kepada}
                            placeholder="Contoh: Kepala Desa Simpang"
                            maxLength={SUKET_DESA_MAX_LENGTH.serah_terima_kepada}
                            disabled={isBusy}
                            onChange={(e) => setField('serah_terima_kepada', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="suket_nomor_ba">Nomor Berita Acara serah terima</Label>
                            <Input
                                id="suket_nomor_ba"
                                value={form.nomor_ba}
                                maxLength={SUKET_DESA_MAX_LENGTH.nomor_ba}
                                disabled={isBusy}
                                onChange={(e) => setField('nomor_ba', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tanggal Berita Acara</Label>
                            <DatePickerField
                                value={form.tanggal_ba}
                                onChange={(value) => setField('tanggal_ba', value || '')}
                            />
                        </div>
                    </div>

                    {errors.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Belum bisa diunduh: {errors[0].message}
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
