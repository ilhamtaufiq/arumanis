import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import {
    AlertCircle,
    Calendar,
    ExternalLink,
    FileText,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { DatePickerField } from '@/components/shared/DatePickerField';
import { Checkbox } from '@/components/ui/checkbox';
import type { Kontrak, KontrakBapContext, KontrakBapPendingAddendumSnapshot } from '../types';
import { RegisterGapStatusInfo } from './RegisterGapStatusInfo';
import {
    buildBapExportPayload,
    calculateBapTotals,
    formatIndoDateFull,
    formatIndoDateSimple,
    type BapFormState,
} from '../lib/bap-calculations';

type BapAddendumRepairTarget =
    | { to: '/kontrak-addendums/gap/$registerId'; params: { registerId: string } }
    | { to: '/kontrak-addendums/$id'; params: { id: string } };

function resolveBapAddendumRepairTarget(context: KontrakBapContext | null): BapAddendumRepairTarget | null {
    const gap = context?.addendum_register_gaps?.[0];
    if (gap) {
        return {
            to: '/kontrak-addendums/gap/$registerId',
            params: { registerId: String(gap.register_id) },
        };
    }

    const pending = context?.pending_addendums?.[0];
    if (pending) {
        return {
            to: '/kontrak-addendums/$id',
            params: { id: String(pending.id) },
        };
    }

    return null;
}

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const formatDateLabel = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

type ReadonlyFieldProps = {
    label: string;
    nomor?: string | null;
    tanggal?: string | null;
    nilai?: number | null;
    hint?: string;
};

const addendumStatusClass: Record<string, string> = {
    draft: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    diajukan: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    ditolak: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
};

function BapPendingAddendumField({ addendum }: { addendum: KontrakBapPendingAddendumSnapshot }) {
    return (
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 space-y-2 dark:border-amber-700/60 dark:bg-amber-950/20">
            <div className="flex items-center justify-between gap-2">
                <Label className="text-xs font-semibold">Addendum Kontrak ke-{addendum.addendum_ke}</Label>
                <Badge variant="outline" className={addendumStatusClass[addendum.status] || addendumStatusClass.draft}>
                    {addendum.status}
                </Badge>
            </div>
            <p className="text-sm font-semibold break-all">{addendum.nomor || '-'}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateLabel(addendum.tanggal)}
            </p>
            {addendum.nilai_kontrak_sesudah != null && (
                <p className="text-xs font-medium text-muted-foreground">
                    Nilai usulan: {formatRupiah(addendum.nilai_kontrak_sesudah)}
                </p>
            )}
            <p className="text-[10px] text-amber-900 dark:text-amber-200">
                Belum disetujui. Nilai kontrak efektif BAP tetap memakai kontrak utama
                {addendum.status === 'draft' ? ' sampai data addendum lengkap dan disetujui.' : '.'}
            </p>
            <Button variant="link" className="h-auto p-0 text-xs" asChild>
                <Link to="/kontrak-addendums/$id" params={{ id: String(addendum.id) }}>
                    Lihat detail addendum
                </Link>
            </Button>
        </div>
    );
}

function BapAddendumSourceSection({ context }: { context: KontrakBapContext | null }) {
    const registerGaps = context?.addendum_register_gaps ?? [];
    const pendingAddendums = context?.pending_addendums ?? [];
    const hasPendingState = registerGaps.length > 0 || pendingAddendums.length > 0;
    const repairTarget = resolveBapAddendumRepairTarget(context);

    if (context?.addendum) {
        return (
            <ReadonlySourceField
                label={`Addendum Kontrak ke-${context.addendum.addendum_ke}`}
                nomor={context.addendum.nomor}
                tanggal={context.addendum.tanggal}
                nilai={context.addendum.nilai_kontrak_sesudah}
                hint="Diambil dari addendum kontrak yang sudah disetujui."
            />
        );
    }

    return (
        <div
            className={`rounded-lg border p-3 text-xs space-y-3 ${
                hasPendingState
                    ? 'border-amber-200 bg-amber-50/40 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/20 dark:text-amber-100'
                    : 'border-dashed text-muted-foreground'
            }`}
        >
            <div className="space-y-1">
                <p className="font-semibold text-foreground">Addendum Kontrak</p>
                {!hasPendingState && (
                    <p>Tidak ada addendum disetujui. Nilai kontrak efektif memakai kontrak utama.</p>
                )}
                {hasPendingState && (
                    <p className="text-muted-foreground">
                        Ada addendum yang belum disetujui. Nilai kontrak efektif BAP memakai kontrak utama.
                    </p>
                )}
            </div>

            {registerGaps.map((gap) => (
                <RegisterGapStatusInfo key={gap.register_id} gap={gap} compact />
            ))}

            {pendingAddendums.map((addendum) => (
                <BapPendingAddendumField key={addendum.id} addendum={addendum} />
            ))}

            {repairTarget && (
                <Button variant="link" className="h-auto p-0 text-xs" asChild>
                    <Link to={repairTarget.to} params={repairTarget.params}>
                        Perbaiki
                    </Link>
                </Button>
            )}
        </div>
    );
}

function ReadonlySourceField({ label, nomor, tanggal, nilai, hint }: ReadonlyFieldProps) {
    return (
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
                <Label className="text-xs font-semibold">{label}</Label>
                <Badge variant="outline" className="text-[10px]">Otomatis</Badge>
            </div>
            <p className="text-sm font-semibold break-all">{nomor || '-'}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateLabel(tanggal)}
            </p>
            {nilai != null && (
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{formatRupiah(nilai)}</p>
            )}
            {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
        </div>
    );
}

type BapBlockedDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kontrak: Kontrak | null;
    context: KontrakBapContext | null;
};

export function BapBlockedDialog({ open, onOpenChange, kontrak, context }: BapBlockedDialogProps) {
    const pekerjaanName = kontrak?.pekerjaans?.[0]?.nama_paket || context?.pekerjaan?.nama_paket || 'Kontrak';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        BASTP Belum Terdaftar
                    </DialogTitle>
                    <DialogDescription>
                        Buat BAP untuk <span className="font-semibold">{pekerjaanName}</span> memerlukan nomor dan tanggal BASTP dari Register Dokumen.
                    </DialogDescription>
                </DialogHeader>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                    Daftarkan dokumen dengan kode tipe <strong>BASTP</strong> terlebih dahulu di Register Penomoran Dokumen.
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
                    <Button asChild>
                        <Link to="/pekerjaan/register">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Buka Register Dokumen
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type BapExportModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    kontrak: Kontrak | null;
    context: KontrakBapContext | null;
    form: BapFormState;
    onFormChange: (form: BapFormState) => void;
    onPreview: () => void;
    onExport: () => void;
    isExporting?: boolean;
};

export function BapExportModal({
    open,
    onOpenChange,
    kontrak,
    context,
    form,
    onFormChange,
    onPreview,
    onExport,
    isExporting = false,
}: BapExportModalProps) {
    const nilaiKontrakEfektif = context?.nilai_kontrak_efektif ?? kontrak?.nilai_kontrak ?? 0;
    const totals = useMemo(
        () => calculateBapTotals(form.persen_bap, nilaiKontrakEfektif, form.total_potongan),
        [form.persen_bap, form.total_potongan, nilaiKontrakEfektif],
    );

    const pekerjaanName = kontrak?.pekerjaans?.[0]?.nama_paket || context?.pekerjaan?.nama_paket || 'Kontrak';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[920px] max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Buat BAP & Penagihan</DialogTitle>
                    <DialogDescription>
                        Data dokumen diambil otomatis dari register dan addendum. Lengkapi perhitungan pembayaran untuk{' '}
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{pekerjaanName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-2">
                    <div className="space-y-4">
                        <h3 className="font-bold text-sm border-b pb-1">Data Perhitungan</h3>
                        <div className="rounded-lg border bg-blue-50/50 p-3 text-xs space-y-1 dark:bg-blue-950/30 dark:border-blue-800/50">
                            <p className="font-semibold text-blue-800 dark:text-blue-300">Nilai kontrak efektif</p>
                            <p className="text-lg font-bold text-blue-900 dark:text-blue-200">{formatRupiah(nilaiKontrakEfektif)}</p>
                            {context?.addendum ? (
                                <p className="text-muted-foreground">
                                    Termasuk addendum ke-{context.addendum.addendum_ke}
                                </p>
                            ) : (context?.addendum_register_gaps?.length || context?.pending_addendums?.length) ? (
                                <p className="text-amber-800 dark:text-amber-200">
                                    Addendum belum disetujui — memakai nilai kontrak utama
                                </p>
                            ) : null}
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="persen" className="text-right text-xs">Persen</Label>
                            <select
                                id="persen"
                                className="col-span-3 flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                value={form.persen_bap}
                                onChange={(e) => onFormChange({ ...form, persen_bap: Number(e.target.value) })}
                            >
                                <option value={100}>100%</option>
                                <option value={95}>95%</option>
                                <option value={5}>5%</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="pot5" className="text-right text-xs">Pot. 5%</Label>
                            <Input
                                id="pot5"
                                type="number"
                                className="col-span-3 h-8"
                                value={form.potongan_lima_persen}
                                onChange={(e) => onFormChange({ ...form, potongan_lima_persen: Number(e.target.value) })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="potum" className="text-right text-xs">Pot. UM</Label>
                            <Input
                                id="potum"
                                type="number"
                                className="col-span-3 h-8"
                                value={form.potongan_uang_muka}
                                onChange={(e) => onFormChange({ ...form, potongan_uang_muka: Number(e.target.value) })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="totalpot" className="text-right text-xs font-bold text-red-600 dark:text-red-400">Total Pot.</Label>
                            <Input
                                id="totalpot"
                                type="number"
                                className="col-span-3 h-8 border-red-200 dark:border-red-800/60"
                                value={form.total_potongan}
                                onChange={(e) => onFormChange({ ...form, total_potongan: Number(e.target.value) })}
                            />
                        </div>

                        <div className="p-4 rounded-lg text-xs space-y-2 border bg-muted/40 text-foreground">
                            <p className="font-semibold">Preview Pembayaran</p>
                            <div className="flex justify-between gap-3">
                                <span className="text-muted-foreground">Fisik {form.persen_bap}%:</span>
                                <span className="font-mono font-medium">{formatRupiah(totals.fisik_persen)}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                                <span className="text-muted-foreground">DPP:</span>
                                <span className="font-mono font-medium">{formatRupiah(totals.dpp)}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                                <span className="text-muted-foreground">PPN 12%:</span>
                                <span className="font-mono font-medium">{formatRupiah(totals.ppn_persen)}</span>
                            </div>
                            <div className="flex justify-between gap-3 text-blue-600 dark:text-blue-400 font-semibold border-t border-border pt-2">
                                <span>Kontrak {form.persen_bap}%:</span>
                                <span className="font-mono">{formatRupiah(totals.kontrak_persen)}</span>
                            </div>
                            <div className="flex justify-between gap-3 border-t border-border pt-2 font-bold">
                                <span>Total Tagihan:</span>
                                <span className="font-mono text-green-700 dark:text-green-400">{formatRupiah(totals.total_bap)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-sm border-b pb-1">Sumber Data Dokumen</h3>

                        <ReadonlySourceField
                            label="BASTP"
                            nomor={context?.bastp?.nomor}
                            tanggal={context?.bastp?.tanggal}
                            hint="Diambil dari Register Dokumen (kode BASTP)."
                        />

                        <div className="space-y-2">
                            <Label htmlFor="nomorbap" className="text-xs">Nomor BAP</Label>
                            <Input
                                id="nomorbap"
                                placeholder="Contoh: 001/BAP/2026"
                                className="h-8"
                                value={form.nomor_bap}
                                onChange={(e) => onFormChange({ ...form, nomor_bap: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tglbap" className="text-xs">Tanggal BAP</Label>
                            <DatePickerField
                                id="tglbap"
                                value={form.tgl_bap}
                                onChange={(tgl_bap) => onFormChange({ ...form, tgl_bap })}
                            />
                            <p className="text-[10px] text-muted-foreground italic">{formatIndoDateFull(form.tgl_bap)}</p>
                        </div>

                        <BapAddendumSourceSection context={context} />

                        <div className="rounded-lg border p-3 space-y-3">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="include-jaminan-um"
                                    checked={form.include_jaminan_uang_muka}
                                    onCheckedChange={(checked) =>
                                        onFormChange({
                                            ...form,
                                            include_jaminan_uang_muka: checked === true,
                                        })
                                    }
                                />
                                <Label htmlFor="include-jaminan-um" className="text-xs font-semibold cursor-pointer">
                                    Jaminan Uang Muka
                                </Label>
                            </div>
                            {form.include_jaminan_uang_muka && (
                                <div className="space-y-3 pl-6 border-l-2 border-muted">
                                    <div className="space-y-2">
                                        <Label htmlFor="nomor-jaminan-um" className="text-xs">Nomor</Label>
                                        <Input
                                            id="nomor-jaminan-um"
                                            placeholder="Nomor jaminan uang muka"
                                            className="h-8"
                                            value={form.nomor_jaminan_uang_muka}
                                            onChange={(e) =>
                                                onFormChange({ ...form, nomor_jaminan_uang_muka: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tgl-jaminan-um" className="text-xs">Tanggal</Label>
                                        <DatePickerField
                                            id="tgl-jaminan-um"
                                            value={form.tgl_jaminan_uang_muka}
                                            onChange={(tgl_jaminan_uang_muka) =>
                                                onFormChange({ ...form, tgl_jaminan_uang_muka })
                                            }
                                        />
                                        <p className="text-[10px] text-muted-foreground italic">
                                            {formatIndoDateFull(form.tgl_jaminan_uang_muka)}
                                        </p>
                                    </div>
                                    {context?.jaminan_uang_muka && (
                                        <p className="text-[10px] text-muted-foreground">
                                            Terisi otomatis dari Register Dokumen (JAMINAN_UM), dapat disesuaikan.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg border p-3 space-y-3">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="include-pembayaran-um"
                                    checked={form.include_pembayaran_uang_muka}
                                    onCheckedChange={(checked) =>
                                        onFormChange({
                                            ...form,
                                            include_pembayaran_uang_muka: checked === true,
                                        })
                                    }
                                />
                                <Label htmlFor="include-pembayaran-um" className="text-xs font-semibold cursor-pointer">
                                    Pembayaran Uang Muka
                                </Label>
                            </div>
                            {form.include_pembayaran_uang_muka && (
                                <div className="space-y-3 pl-6 border-l-2 border-muted">
                                    <div className="space-y-2">
                                        <Label htmlFor="tgl-pembayaran-um" className="text-xs">Tanggal</Label>
                                        <DatePickerField
                                            id="tgl-pembayaran-um"
                                            value={form.tgl_pembayaran_uang_muka}
                                            onChange={(tgl_pembayaran_uang_muka) =>
                                                onFormChange({ ...form, tgl_pembayaran_uang_muka })
                                            }
                                        />
                                        <p className="text-[10px] text-muted-foreground italic">
                                            {formatIndoDateFull(form.tgl_pembayaran_uang_muka)}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nominal-pembayaran-um" className="text-xs">Nominal</Label>
                                        <Input
                                            id="nominal-pembayaran-um"
                                            type="number"
                                            className="h-8"
                                            value={form.nominal_pembayaran_uang_muka}
                                            onChange={(e) =>
                                                onFormChange({
                                                    ...form,
                                                    nominal_pembayaran_uang_muka: Number(e.target.value),
                                                })
                                            }
                                        />
                                    </div>
                                    {context?.uang_muka && (
                                        <p className="text-[10px] text-muted-foreground">
                                            Terisi otomatis dari Register Dokumen (UANG_MUKA), dapat disesuaikan.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t pt-4 gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>Batal</Button>
                    <Button variant="secondary" onClick={onPreview} disabled={isExporting}>
                        <FileText className="mr-2 h-4 w-4" />
                        Pratinjau BAP
                    </Button>
                    <Button onClick={onExport} disabled={isExporting}>
                        {isExporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            'Buat BAP'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function buildBapPayloadFromContext(form: BapFormState, context: KontrakBapContext) {
    return buildBapExportPayload({
        form,
        nilaiKontrakEfektif: context.nilai_kontrak_efektif ?? 0,
        nomorBastp: context.bastp?.nomor ?? '',
        tglBastp: context.bastp?.tanggal ?? '',
        addendum: context.addendum
            ? {
                nomor: context.addendum.nomor,
                tanggal: context.addendum.tanggal,
                nilai_kontrak_sesudah: context.addendum.nilai_kontrak_sesudah ?? context.nilai_kontrak_efektif ?? 0,
            }
            : null,
        jaminanUangMuka: form.include_jaminan_uang_muka
            ? {
                nomor: form.nomor_jaminan_uang_muka,
                tanggal: form.tgl_jaminan_uang_muka,
            }
            : null,
        uangMuka: form.include_pembayaran_uang_muka
            ? {
                nomor: form.nomor_pembayaran_uang_muka || context.uang_muka?.nomor || '',
                tanggal: form.tgl_pembayaran_uang_muka,
                nilai: form.nominal_pembayaran_uang_muka,
            }
            : null,
    });
}

export { formatIndoDateSimple };