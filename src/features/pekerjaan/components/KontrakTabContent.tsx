import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getKontrak, exportKontrakCover, exportKontrakDoc, exportKontrakRingkasan, exportKontrakBAP } from '@/features/kontrak/api/kontrak';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Calendar, Banknote, Building2, Hash, FileSignature, Download, BookOpen, FileSpreadsheet, ClipboardCheck, ScrollText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { Kontrak } from '@/features/kontrak/types';
import type { DocumentRegister } from '@/features/pekerjaan/types';

interface KontrakTabContentProps {
    pekerjaanId: number;
}

const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const downloadBlob = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }) => (
    <div className="flex items-start gap-3 py-2.5">
        {Icon && <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />}
        <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
            <p className="text-sm font-semibold break-words">{value}</p>
        </div>
    </div>
);

const KontrakCard = ({ kontrak }: { kontrak: Kontrak }) => {
    const [downloading, setDownloading] = useState<string | null>(null);
    const hasAddendum = kontrak.latest_approved_addendum;
    const registers = kontrak.registers ?? [];

    const handleDownload = async (type: string, fn: () => Promise<Blob>, fileName: string) => {
        try {
            setDownloading(type);
            const blob = await fn();
            downloadBlob(blob, fileName);
            toast.success(`${fileName} berhasil diunduh`);
        } catch (err) {
            console.error(`Failed to download ${type}:`, err);
            toast.error(`Gagal mengunduh ${fileName}`);
        } finally {
            setDownloading(null);
        }
    };

    return (
        <Card className="overflow-hidden border-muted/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 bg-muted/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base font-bold">
                            {kontrak.kode_paket || kontrak.spse_nama_paket || `Kontrak #${kontrak.id}`}
                        </CardTitle>
                    </div>
                    {hasAddendum && (
                        <Badge variant="secondary" className="text-xs font-medium">
                            Addendum ke-{kontrak.latest_approved_addendum!.addendum_ke}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                {/* Identitas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <InfoRow label="KODE RUP" value={kontrak.kode_rup || '-'} icon={Hash} />
                    <InfoRow label="KODE PAKET" value={kontrak.kode_paket || '-'} icon={Hash} />
                    <InfoRow label="SPSE NAMA PAKET" value={kontrak.spse_nama_paket || '-'} icon={FileText} />
                </div>

                <Separator className="my-2" />

                {/* Penyedia & Nilai */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <InfoRow label="PENYEDIA" value={kontrak.penyedia?.nama || '-'} icon={Building2} />
                    <InfoRow label="NILAI KONTRAK" value={formatCurrency(kontrak.nilai_kontrak)} icon={Banknote} />
                </div>

                <Separator className="my-2" />

                {/* Nomor Dokumen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <InfoRow label="NOMOR PENAWARAN" value={kontrak.nomor_penawaran || '-'} icon={FileSignature} />
                    <InfoRow label="NOMOR SPPBJ" value={kontrak.sppbj || '-'} icon={FileSignature} />
                    <InfoRow label="NOMOR SPK" value={kontrak.spk || '-'} icon={FileSignature} />
                    <InfoRow label="NOMOR SPMK" value={kontrak.spmk || '-'} icon={FileSignature} />
                </div>

                <Separator className="my-2" />

                {/* Tanggal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    <InfoRow label="TANGGAL PENAWARAN" value={formatDate(kontrak.tanggal_penawaran)} icon={Calendar} />
                    <InfoRow label="TANGGAL SPPBJ" value={formatDate(kontrak.tgl_sppbj)} icon={Calendar} />
                    <InfoRow label="TANGGAL SPK" value={formatDate(kontrak.tgl_spk)} icon={Calendar} />
                    <InfoRow label="TANGGAL SPMK" value={formatDate(kontrak.tgl_spmk)} icon={Calendar} />
                    <InfoRow label="TANGGAL SELESAI" value={formatDate(kontrak.tgl_selesai)} icon={Calendar} />
                </div>

                {/* Addendum */}
                {hasAddendum && (
                    <>
                        <Separator className="my-2" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                            <InfoRow
                                label="ADDENDUM TERAKHIR"
                                value={`Ke-${kontrak.latest_approved_addendum!.addendum_ke} — ${kontrak.latest_approved_addendum!.nomor_addendum}`}
                                icon={FileText}
                            />
                            <InfoRow label="NILAI KONTRAK BERJALAN" value={formatCurrency(kontrak.nilai_kontrak_berjalan ?? kontrak.nilai_kontrak)} icon={Banknote} />
                            <InfoRow label="TGL SELESAI BERJALAN" value={formatDate(kontrak.tgl_selesai_berjalan ?? kontrak.tgl_selesai)} icon={Calendar} />
                        </div>
                    </>
                )}

                {/* Register Dokumen */}
                {registers.length > 0 && (
                    <>
                        <Separator className="my-2" />
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Register Dokumen</p>
                            <div className="flex flex-wrap gap-2">
                                {registers.map((reg) => (
                                    <Badge key={reg.id} variant="outline" className="text-xs font-mono py-1 px-2.5 border-primary/20 bg-primary/5">
                                        {reg.type?.name || `Tipe #${reg.type_id}`}
                                        <span className="ml-1.5 text-muted-foreground">{reg.nomor}</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Download Dokumen */}
                <Separator className="my-3" />
                <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Download Dokumen Kontrak</p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={downloading === 'cover'}
                            onClick={() => handleDownload('cover', () => exportKontrakCover(kontrak.id), `Cover_Kontrak_${kontrak.id}.docx`)}
                        >
                            {downloading === 'cover' ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <BookOpen className="h-3.5 w-3.5 mr-1.5" />}
                            Cover
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={downloading === 'doc'}
                            onClick={() => handleDownload('doc', () => exportKontrakDoc(kontrak.id), `Kontrak_${kontrak.id}.docx`)}
                        >
                            {downloading === 'doc' ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <ScrollText className="h-3.5 w-3.5 mr-1.5" />}
                            Dokumen Kontrak
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={downloading === 'ringkasan'}
                            onClick={() => handleDownload('ringkasan', () => exportKontrakRingkasan(kontrak.id), `Ringkasan_Kontrak_${kontrak.id}.docx`)}
                        >
                            {downloading === 'ringkasan' ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />}
                            Ringkasan
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={downloading === 'bap'}
                            onClick={() => handleDownload('bap', () => exportKontrakBAP(kontrak.id), `BAP_Kontrak_${kontrak.id}.docx`)}
                        >
                            {downloading === 'bap' ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" />}
                            BAP
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function KontrakTabContent({ pekerjaanId }: KontrakTabContentProps) {
    const { data: kontrakList = [], isLoading: loading } = useQuery({
        queryKey: ['kontrak', { pekerjaan_id: pekerjaanId }],
        queryFn: async () => {
            const response = await getKontrak({ pekerjaan_id: pekerjaanId });
            return response.data;
        },
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (kontrakList.length === 0) {
        return (
            <Card className="border-dashed border-muted-foreground/30">
                <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                    <FileText className="h-12 w-12 text-muted-foreground/40" />
                    <p className="text-muted-foreground font-medium">Belum ada data kontrak</p>
                    <p className="text-sm text-muted-foreground/70">Kontrak akan muncul setelah ditambahkan melalui modul Kontrak</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                {kontrakList.length} kontrak ditemukan
            </p>

            {kontrakList.map((kontrak) => (
                <KontrakCard key={kontrak.id} kontrak={kontrak} />
            ))}
        </div>
    );
}