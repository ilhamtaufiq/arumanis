import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, ExternalLink, Send, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { notifyKontrakAddendumRegisterGapPengawas } from '../api/kontrak';
import { ADDENDUM_REGISTER_GAP_DESCRIPTION } from '../lib/addendum-register-gap';
import type { KontrakAddendumRegisterGap } from '../types';
import { RegisterGapStatusInfo } from './RegisterGapStatusInfo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formatDate = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

type RegisterGapBannerProps = {
    gaps: KontrakAddendumRegisterGap[];
};

export function RegisterGapBanner({ gaps }: RegisterGapBannerProps) {
    const [activeRegisterId, setActiveRegisterId] = useState<number | null>(null);

    const notifyMutation = useMutation({
        mutationFn: (registerId: number) => notifyKontrakAddendumRegisterGapPengawas(registerId),
        onSuccess: (result) => {
            const emailInfo = result.email_sent_count > 0
                ? `${result.email_sent_count} email terkirim`
                : 'notifikasi in-app terkirim';

            toast.success(`Instruksi pengawas dikirim ke ${result.notified_count} pengawas (${emailInfo})`);
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error?.response?.data?.message || 'Gagal mengirim instruksi pengawas');
        },
        onSettled: () => setActiveRegisterId(null),
    });

    const handleNotifyPengawas = (gap: KontrakAddendumRegisterGap) => {
        setActiveRegisterId(gap.register_id);
        notifyMutation.mutate(gap.register_id);
    };

    if (gaps.length === 0) return null;

    return (
        <Card className="border-amber-300 bg-amber-50/60 dark:border-amber-700 dark:bg-amber-950/30">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-200 text-lg">
                    <AlertTriangle className="h-5 w-5" />
                    Ketidaksesuaian Register Dokumen ({gaps.length})
                </CardTitle>
                <p className="text-sm text-amber-800/90 dark:text-amber-300/90">
                    {ADDENDUM_REGISTER_GAP_DESCRIPTION} Admin dapat mengirim instruksi ke pengawas pekerjaan untuk melengkapi data.
                </p>
            </CardHeader>
            <CardContent className="space-y-3">
                {gaps.map((gap) => (
                    <div
                        key={gap.register_id}
                        className="rounded-lg border border-amber-200 bg-white p-4 shadow-sm dark:border-amber-800 dark:bg-card"
                    >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-1.5 min-w-0">
                                <p className="font-semibold text-foreground break-words">
                                    {gap.pekerjaan?.nama_paket || 'Pekerjaan tidak diketahui'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Nomor register:{' '}
                                    <span className="font-mono font-medium text-foreground">{gap.nomor_register}</span>
                                    {' · '}
                                    {formatDate(gap.tanggal_register)}
                                    {gap.type_name && (
                                        <>
                                            {' · '}
                                            Tipe: {gap.type_name} ({gap.type_code})
                                        </>
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Penyedia: {gap.penyedia?.nama || '-'}
                                    {gap.pengawas?.nama && (
                                        <span className="inline-flex items-center gap-1 ml-2">
                                            <UserRound className="h-3 w-3" />
                                            Pengawas: {gap.pengawas.nama}
                                        </span>
                                    )}
                                </p>
                                <div className="pt-2">
                                    <RegisterGapStatusInfo gap={gap} compact />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 shrink-0">
                                <Button variant="outline" size="sm" asChild>
                                    <Link to="/pekerjaan/register">
                                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                        Register Dokumen
                                    </Link>
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={notifyMutation.isPending && activeRegisterId === gap.register_id}
                                    onClick={() => handleNotifyPengawas(gap)}
                                >
                                    <Send className="mr-1.5 h-3.5 w-3.5" />
                                    {notifyMutation.isPending && activeRegisterId === gap.register_id
                                        ? 'Mengirim...'
                                        : 'Instruksi Pengawas'}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}