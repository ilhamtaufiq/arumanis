import { Link, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Briefcase, Building2, Clock, FileText, User } from 'lucide-react';
import { getKontrakAddendumRegisterGaps } from '../api/kontrak';
import { AddendumDocumentChecklist } from './AddendumDocumentChecklist';
import { RegisterGapBanner } from './RegisterGapBanner';
import { RegisterGapStatusInfo } from './RegisterGapStatusInfo';
import { useAuthStore } from '@/stores/auth-stores';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const statusClass = 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30';

const formatDate = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 gap-1 border-b border-border/50 py-3 last:border-0 sm:grid-cols-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
            <span className="text-sm font-medium sm:col-span-2 break-words">{value ?? '-'}</span>
        </div>
    );
}

export default function KontrakAddendumGapDetail() {
    const { registerId } = useParams({ strict: false });
    const user = useAuthStore((state) => state.auth.user);
    const isAdmin = Boolean(user?.roles?.includes('admin'));

    const { data: registerGaps, isLoading } = useQuery({
        queryKey: ['kontrak-addendums', 'register-gaps'],
        queryFn: getKontrakAddendumRegisterGaps,
        enabled: isAdmin,
    });

    const gap = registerGaps?.items.find(
        (item) => item.register_id === Number(registerId),
    );

    if (!isAdmin) {
        return (
            <>
                <Header />
                <Main>
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
                        <p className="font-medium text-destructive">Halaman ini hanya dapat diakses admin.</p>
                        <Button variant="outline" className="mt-4" asChild>
                            <Link to="/kontrak-addendums">Kembali ke daftar</Link>
                        </Button>
                    </div>
                </Main>
            </>
        );
    }

    if (isLoading) {
        return (
            <>
                <Header />
                <Main>
                    <Skeleton className="h-10 w-64 mb-6" />
                    <Skeleton className="h-48 w-full" />
                </Main>
            </>
        );
    }

    if (!gap) {
        return (
            <>
                <Header />
                <Main>
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
                        <p className="font-medium text-destructive">
                            Data ketidaksesuaian register tidak ditemukan atau sudah dilengkapi.
                        </p>
                        <Button variant="outline" className="mt-4" asChild>
                            <Link to="/kontrak-addendums">Kembali ke daftar</Link>
                        </Button>
                    </div>
                </Main>
            </>
        );
    }

    return (
        <>
            <Header />
            <Main>
                <div className="mb-6 space-y-3">
                    <Button variant="ghost" size="sm" className="-ml-2" asChild>
                        <Link to="/kontrak-addendums">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Daftar Addendum
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">Addendum Perlu Dilengkapi</h1>
                        <Badge variant="outline" className={statusClass}>
                            Perlu dilengkapi
                        </Badge>
                    </div>
                    <p className="font-mono text-sm text-muted-foreground">{gap.nomor_register}</p>
                </div>

                <RegisterGapBanner gaps={[gap]} />

                <Card className="mt-6 border-amber-300/70 bg-amber-50/40 dark:border-amber-800 dark:bg-amber-950/20">
                    <CardContent className="pt-6">
                        <RegisterGapStatusInfo gap={gap} />
                    </CardContent>
                </Card>

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-5 w-5 text-primary" />
                                Informasi Addendum
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DetailRow label="Addendum Ke" value="-" />
                            <DetailRow label="Nomor Addendum" value={gap.nomor_register} />
                            <DetailRow label="Status" value="Nomor register sudah ada · Detail belum ada · Belum disetujui" />
                            <DetailRow label="Tanggal Addendum" value={formatDate(gap.tanggal_register)} />
                            <DetailRow label="Jenis Addendum" value="-" />
                            <DetailRow label="Nilai Kontrak Sebelum" value="-" />
                            <DetailRow label="Nilai Kontrak Sesudah" value="-" />
                            <DetailRow label="Tgl. Selesai Sebelum" value="-" />
                            <DetailRow label="Tgl. Selesai Sesudah" value="-" />
                            <DetailRow label="Alasan" value="-" />
                            <DetailRow label="Deskripsi Perubahan" value="-" />
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Konteks Pekerjaan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-start gap-2">
                                    <Briefcase className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">Pekerjaan</p>
                                        <p className="font-medium">{gap.pekerjaan?.nama_paket || '-'}</p>
                                        <p className="text-xs text-muted-foreground">{gap.pekerjaan?.kode_rekening || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">Penyedia</p>
                                        <p className="font-medium">{gap.penyedia?.nama || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">Pengawas</p>
                                        <p className="font-medium">{gap.pengawas?.nama || '-'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Status Data
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">Sumber register</p>
                                    <p className="font-medium">{gap.type_name || gap.type_code || 'Addendum'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">Addendum tercatat di sistem</p>
                                    <p className="font-medium">{gap.addendum_count} data</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-base">Dokumen Addendum</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AddendumDocumentChecklist attachments={[]} />
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-base">Rincian Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            Belum ada rincian item addendum. Lengkapi data melalui pengajuan addendum.
                        </p>
                    </CardContent>
                </Card>
            </Main>
        </>
    );
}