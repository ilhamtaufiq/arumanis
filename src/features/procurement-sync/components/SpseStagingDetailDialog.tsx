import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ExternalLink, FileDown, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { fetchSpseStagingDetail } from '@/features/procurement-sync/api';
import type { ProcurementStagingDetail, ProcurementStagingPaket } from '@/features/procurement-sync/types';
import { formatCurrency } from '@/lib/format';
import { getDesaName, getKecamatanName } from '@/lib/wilayah-fields';

const RAW_ROW_LABELS: Record<number, string> = {
    0: 'Kode paket',
    1: 'Nama paket',
    2: 'Status paket',
    3: 'Kode RUP',
    4: 'Satuan kerja',
    5: 'Metode pengadaan',
    6: 'Pagu',
    7: 'Tahun anggaran',
    8: 'Lokasi',
    9: 'Jenis pengadaan',
};

function matchLabel(status: string) {
    if (status === 'unmatched') return 'Belum cocok';
    if (status === 'exact_kode_paket') return 'Cocok (kode paket)';
    if (status === 'fuzzy_nama_paket') return 'Cocok (nama mirip)';
    if (status === 'manual_map') return 'Mapping manual';
    return status;
}

function jenisPaketLabel(jenis: string | null | undefined) {
    if (jenis === 'pengadaan_langsung') return 'Pengadaan langsung';
    if (jenis === 'tender_seleksi') return 'Tender / seleksi';
    return jenis ?? '-';
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-3 text-sm">
            <dt className="text-muted-foreground shrink-0">{label}</dt>
            <dd className="text-right font-medium break-words min-w-0">{value}</dd>
        </div>
    );
}

interface SpseStagingDetailDialogProps {
    row: ProcurementStagingPaket | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImportDocuments?: (row: ProcurementStagingPaket) => void;
}

export function SpseStagingDetailDialog({
    row,
    open,
    onOpenChange,
    onImportDocuments,
}: SpseStagingDetailDialogProps) {
    const [detail, setDetail] = useState<ProcurementStagingDetail | null>(null);
    const [loading, setLoading] = useState(false);

    const loadDetail = useCallback(async () => {
        if (!row?.id) return;
        setLoading(true);
        try {
            const res = await fetchSpseStagingDetail(row.id);
            setDetail(res.data);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal memuat detail paket');
            setDetail(null);
        } finally {
            setLoading(false);
        }
    }, [row?.id]);

    useEffect(() => {
        if (open && row) {
            void loadDetail();
        } else if (!open) {
            setDetail(null);
        }
    }, [open, row, loadDetail]);

    const rawRows = useMemo(() => {
        if (!detail?.raw_row || !Array.isArray(detail.raw_row)) return [];
        return detail.raw_row
            .map((value, index) => ({
                index,
                label: RAW_ROW_LABELS[index] ?? `Kolom ${index}`,
                value: value === null || value === undefined || value === '' ? null : String(value),
            }))
            .filter((item) => item.value !== null);
    }, [detail?.raw_row]);

    const pekerjaanId = detail?.matched_pekerjaan_id ?? detail?.pekerjaan?.id ?? null;
    const canImport = detail?.match_status !== 'unmatched' && Boolean(pekerjaanId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 pr-6">
                        <Package className="h-5 w-5 shrink-0" />
                        <span className="line-clamp-2">{row?.nama_paket ?? 'Detail paket'}</span>
                    </DialogTitle>
                    <DialogDescription>
                        {row ? (
                            <>
                                Kode paket{' '}
                                <span className="font-mono text-xs">{row.kode_paket}</span>
                                {detail?.spse_url && (
                                    <>
                                        {' '}
                                        ·{' '}
                                        <a
                                            href={detail.spse_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="underline inline-flex items-center gap-1"
                                        >
                                            Buka di SPSE
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </>
                                )}
                            </>
                        ) : (
                            'Pilih paket dari tabel staging.'
                        )}
                    </DialogDescription>
                </DialogHeader>

                {loading && (
                    <div className="flex items-center justify-center py-10 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Memuat detail...
                    </div>
                )}

                {!loading && detail && (
                    <div className="space-y-5">
                        <section className="rounded-lg border bg-muted/30 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                                Data SPSE
                            </p>
                            <dl className="space-y-2.5">
                                <DetailField label="Kode paket" value={<span className="font-mono text-xs">{detail.kode_paket}</span>} />
                                <DetailField label="Status paket" value={detail.status_paket ?? '-'} />
                                <DetailField label="Jenis paket" value={jenisPaketLabel(detail.jenis_paket)} />
                                <DetailField label="Metode pengadaan" value={detail.metode_pengadaan ?? '-'} />
                                <DetailField label="Sumber sync" value={detail.sumber.toUpperCase()} />
                                {detail.fetched_at && (
                                    <DetailField
                                        label="Diambil"
                                        value={new Date(detail.fetched_at).toLocaleString('id-ID')}
                                    />
                                )}
                            </dl>
                        </section>

                        <section className="rounded-lg border bg-muted/30 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                                Pencocokan Arumanis
                            </p>
                            <dl className="space-y-2.5">
                                <DetailField
                                    label="Status match"
                                    value={
                                        <Badge variant={detail.match_status === 'unmatched' ? 'outline' : 'default'}>
                                            {matchLabel(detail.match_status)}
                                        </Badge>
                                    }
                                />
                                <DetailField
                                    label="Pekerjaan"
                                    value={
                                        pekerjaanId ? (
                                            <Link
                                                to="/pekerjaan/$id"
                                                params={{ id: String(pekerjaanId) }}
                                                className="underline text-primary"
                                            >
                                                {detail.pekerjaan?.nama_paket ?? `Pekerjaan #${pekerjaanId}`}
                                            </Link>
                                        ) : (
                                            '-'
                                        )
                                    }
                                />
                                {detail.pekerjaan?.kegiatan && (
                                    <DetailField
                                        label="Kegiatan"
                                        value={`${detail.pekerjaan.kegiatan.nama_kegiatan} (${detail.pekerjaan.kegiatan.tahun_anggaran})`}
                                    />
                                )}
                                {(detail.pekerjaan?.kecamatan || detail.pekerjaan?.desa) && (
                                    <DetailField
                                        label="Lokasi"
                                        value={[
                                            getKecamatanName(detail.pekerjaan?.kecamatan),
                                            getDesaName(detail.pekerjaan?.desa),
                                        ]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    />
                                )}
                                {detail.pekerjaan?.pagu != null && (
                                    <DetailField label="Pagu pekerjaan" value={formatCurrency(detail.pekerjaan.pagu)} />
                                )}
                                <DetailField
                                    label="Kontrak"
                                    value={
                                        detail.kontrak
                                            ? [
                                                  detail.kontrak.spk && `SPK ${detail.kontrak.spk}`,
                                                  detail.kontrak.kode_paket && `kode ${detail.kontrak.kode_paket}`,
                                                  detail.kontrak.nilai_kontrak != null &&
                                                      formatCurrency(detail.kontrak.nilai_kontrak),
                                              ]
                                                  .filter(Boolean)
                                                  .join(' · ') || `Kontrak #${detail.kontrak.id}`
                                            : '-'
                                    }
                                />
                            </dl>
                        </section>

                        {rawRows.length > 0 && (
                            <section className="rounded-lg border p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                                    Data mentah SPSE
                                </p>
                                <dl className="space-y-2 text-sm">
                                    {rawRows.map((item) => (
                                        <div key={item.index} className="flex items-start justify-between gap-3">
                                            <dt className="text-muted-foreground">{item.label}</dt>
                                            <dd className="text-right break-all max-w-[65%]">{item.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                        )}

                        {detail.sync_run && (
                            <>
                                <Separator />
                                <p className="text-xs text-muted-foreground">
                                    Sync run #{detail.sync_run.id} · {detail.sync_run.item_count} paket ·{' '}
                                    {detail.sync_run.matched_count} cocok
                                    {detail.sync_run.finished_at &&
                                        ` · ${new Date(detail.sync_run.finished_at).toLocaleString('id-ID')}`}
                                </p>
                            </>
                        )}
                    </div>
                )}

                <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                    {detail?.spse_url && (
                        <Button variant="outline" asChild className="sm:mr-auto">
                            <a href={detail.spse_url} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Buka di SPSE
                            </a>
                        </Button>
                    )}
                    <div className="flex flex-wrap gap-2 justify-end">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Tutup
                        </Button>
                        {canImport && row && onImportDocuments && (
                            <Button
                                onClick={() => {
                                    onImportDocuments(row);
                                    onOpenChange(false);
                                }}
                            >
                                <FileDown className="h-4 w-4 mr-2" />
                                Import dokumen
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}