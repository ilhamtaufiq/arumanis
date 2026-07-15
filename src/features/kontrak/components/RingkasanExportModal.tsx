import { Plus, Trash2 } from 'lucide-react';
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
import type {
    Kontrak,
    KontrakRingkasanExportParams,
    RingkasanPembayaranLaluItem,
    RingkasanPersenTagih,
} from '../types';

const PERSEN_OPTIONS: RingkasanPersenTagih[] = [100, 95, 5, 30];

const JENIS_OPTIONS = [
    'Uang Muka',
    'MC / Termin I',
    'MC / Termin II',
    'MC / Termin III',
    'Termin',
    'Lainnya',
] as const;

export type RingkasanFormState = {
    persen_tagih: RingkasanPersenTagih;
    pembayaran_lalu: RingkasanPembayaranLaluItem[];
    nomor_jaminan_uang_muka: string;
    tanggal_jaminan_uang_muka: string;
    nomor_jaminan_pelaksanaan: string;
    tanggal_jaminan_pelaksanaan: string;
};

export function createDefaultRingkasanForm(): RingkasanFormState {
    return {
        persen_tagih: 100,
        pembayaran_lalu: [
            { jenis: 'Uang Muka', tanggal: '', nominal: '' },
        ],
        nomor_jaminan_uang_muka: '',
        tanggal_jaminan_uang_muka: '',
        nomor_jaminan_pelaksanaan: '',
        tanggal_jaminan_pelaksanaan: '',
    };
}

function optionalTrimmed(value: string | undefined | null): string | undefined {
    const trimmed = String(value ?? '').trim();
    return trimmed !== '' ? trimmed : undefined;
}

export function buildRingkasanExportPayload(form: RingkasanFormState): KontrakRingkasanExportParams {
    const pembayaran_lalu = form.pembayaran_lalu
        .map((row) => {
            const jenis = row.jenis.trim();
            const tanggal = row.tanggal.trim();
            const nominal =
                row.nominal === '' || row.nominal === null || row.nominal === undefined
                    ? undefined
                    : Number(row.nominal);

            if (!jenis && !tanggal && (nominal === undefined || Number.isNaN(nominal))) {
                return null;
            }

            return {
                ...(jenis ? { jenis } : {}),
                ...(tanggal ? { tanggal } : {}),
                ...(nominal !== undefined && !Number.isNaN(nominal) ? { nominal } : {}),
            };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

    return {
        persen_tagih: form.persen_tagih,
        ...(pembayaran_lalu.length > 0 ? { pembayaran_lalu } : {}),
        ...(optionalTrimmed(form.nomor_jaminan_uang_muka)
            ? { nomor_jaminan_uang_muka: optionalTrimmed(form.nomor_jaminan_uang_muka) }
            : {}),
        ...(optionalTrimmed(form.tanggal_jaminan_uang_muka)
            ? { tanggal_jaminan_uang_muka: optionalTrimmed(form.tanggal_jaminan_uang_muka) }
            : {}),
        ...(optionalTrimmed(form.nomor_jaminan_pelaksanaan)
            ? { nomor_jaminan_pelaksanaan: optionalTrimmed(form.nomor_jaminan_pelaksanaan) }
            : {}),
        ...(optionalTrimmed(form.tanggal_jaminan_pelaksanaan)
            ? { tanggal_jaminan_pelaksanaan: optionalTrimmed(form.tanggal_jaminan_pelaksanaan) }
            : {}),
    };
}

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 20,
    }).format(value);

type RingkasanExportModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kontrak: Kontrak | null;
    form: RingkasanFormState;
    onFormChange: (form: RingkasanFormState) => void;
    onPreview: () => void;
    onExport: () => void;
    isBusy?: boolean;
};

export function RingkasanExportModal({
    open,
    onOpenChange,
    kontrak,
    form,
    onFormChange,
    onPreview,
    onExport,
    isBusy = false,
}: RingkasanExportModalProps) {
    const nilaiKontrak = Number(kontrak?.nilai_kontrak ?? 0);
    const nilaiTagih = (nilaiKontrak * form.persen_tagih) / 100;
    const pekerjaanName = kontrak?.pekerjaans?.[0]?.nama_paket || 'Kontrak';

    const updateRow = (index: number, patch: Partial<RingkasanPembayaranLaluItem>) => {
        const next = form.pembayaran_lalu.map((row, i) => (i === index ? { ...row, ...patch } : row));
        onFormChange({ ...form, pembayaran_lalu: next });
    };

    const addRow = () => {
        if (form.pembayaran_lalu.length >= 5) return;
        onFormChange({
            ...form,
            pembayaran_lalu: [
                ...form.pembayaran_lalu,
                { jenis: '', tanggal: '', nominal: '' },
            ],
        });
    };

    const removeRow = (index: number) => {
        const next = form.pembayaran_lalu.filter((_, i) => i !== index);
        onFormChange({
            ...form,
            pembayaran_lalu: next.length > 0 ? next : [{ jenis: '', tanggal: '', nominal: '' }],
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[720px] max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Ringkasan Kontrak</DialogTitle>
                    <DialogDescription>
                        Lengkapi nominal penagihan dan pembayaran yang lalu sebelum pratinjau/unduh untuk{' '}
                        <span className="font-semibold text-foreground">{pekerjaanName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Nilai kontrak
                        </p>
                        <p className="text-lg font-bold">{formatRupiah(nilaiKontrak)}</p>
                        <p className="text-xs text-muted-foreground">
                            Digunakan untuk menghitung nominal yang ditagihkan.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="persen_tagih">Nominal yang ditagihkan</Label>
                        <select
                            id="persen_tagih"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                            value={form.persen_tagih}
                            onChange={(e) =>
                                onFormChange({
                                    ...form,
                                    persen_tagih: Number(e.target.value) as RingkasanPersenTagih,
                                })
                            }
                        >
                            {PERSEN_OPTIONS.map((p) => (
                                <option key={p} value={p}>
                                    {p}%
                                </option>
                            ))}
                        </select>
                        <p className="text-sm font-medium">
                            {form.persen_tagih}% · {formatRupiah(nilaiTagih)}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <Label>Jaminan</Label>
                            <p className="text-xs text-muted-foreground">
                                Opsional. Isi nomor &amp; tanggal untuk mengganti nilai di template. Kosongkan agar
                                memakai Register Dokumen (jika ada) atau tanda &quot;-&quot;.
                            </p>
                        </div>
                        <div className="rounded-lg border p-3 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Jaminan uang muka
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs" htmlFor="nomor_jaminan_uang_muka">
                                        Nomor
                                    </Label>
                                    <Input
                                        id="nomor_jaminan_uang_muka"
                                        value={form.nomor_jaminan_uang_muka}
                                        placeholder="Contoh: JUM/001/2026"
                                        onChange={(e) =>
                                            onFormChange({ ...form, nomor_jaminan_uang_muka: e.target.value })
                                        }
                                        disabled={isBusy}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Tanggal</Label>
                                    <DatePickerField
                                        value={form.tanggal_jaminan_uang_muka}
                                        onChange={(value) =>
                                            onFormChange({
                                                ...form,
                                                tanggal_jaminan_uang_muka: value || '',
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border p-3 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Jaminan pelaksanaan
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs" htmlFor="nomor_jaminan_pelaksanaan">
                                        Nomor
                                    </Label>
                                    <Input
                                        id="nomor_jaminan_pelaksanaan"
                                        value={form.nomor_jaminan_pelaksanaan}
                                        placeholder="Contoh: JP/001/2026"
                                        onChange={(e) =>
                                            onFormChange({ ...form, nomor_jaminan_pelaksanaan: e.target.value })
                                        }
                                        disabled={isBusy}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Tanggal</Label>
                                    <DatePickerField
                                        value={form.tanggal_jaminan_pelaksanaan}
                                        onChange={(value) =>
                                            onFormChange({
                                                ...form,
                                                tanggal_jaminan_pelaksanaan: value || '',
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <Label>Pembayaran yang lalu</Label>
                                <p className="text-xs text-muted-foreground">
                                    Opsional. Isi jenis, tanggal, dan nominal. Maksimal 5 baris (template menampilkan 3 baris utama).
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addRow}
                                disabled={form.pembayaran_lalu.length >= 5 || isBusy}
                            >
                                <Plus className="mr-1 h-4 w-4" />
                                Tambah
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {form.pembayaran_lalu.map((row, index) => (
                                <div
                                    key={`pembayaran-lalu-${index}`}
                                    className="rounded-lg border p-3 grid grid-cols-1 sm:grid-cols-12 gap-3"
                                >
                                    <div className="sm:col-span-4 space-y-1">
                                        <Label className="text-xs">Jenis</Label>
                                        <Input
                                            list={`jenis-pembayaran-lalu-${index}`}
                                            value={row.jenis}
                                            placeholder="Uang Muka / Termin"
                                            onChange={(e) => updateRow(index, { jenis: e.target.value })}
                                        />
                                        <datalist id={`jenis-pembayaran-lalu-${index}`}>
                                            {JENIS_OPTIONS.map((opt) => (
                                                <option key={opt} value={opt} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <div className="sm:col-span-3 space-y-1">
                                        <Label className="text-xs">Tanggal</Label>
                                        <DatePickerField
                                            value={row.tanggal}
                                            onChange={(value) => updateRow(index, { tanggal: value || '' })}
                                        />
                                    </div>
                                    <div className="sm:col-span-4 space-y-1">
                                        <Label className="text-xs">Nominal (Rp)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={row.nominal === '' ? '' : row.nominal}
                                            placeholder="0"
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                updateRow(index, {
                                                    nominal: raw === '' ? '' : Number(raw),
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="sm:col-span-1 flex items-end justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => removeRow(index)}
                                            disabled={isBusy}
                                            title="Hapus baris"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
                        Batal
                    </Button>
                    <Button type="button" variant="secondary" onClick={onPreview} disabled={isBusy}>
                        Pratinjau
                    </Button>
                    <Button type="button" onClick={onExport} disabled={isBusy}>
                        Unduh Excel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
