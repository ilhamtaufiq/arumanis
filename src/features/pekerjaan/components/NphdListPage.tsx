import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import PageContainer from '@/components/layout/page-container';
import { useAuthStore } from '@/stores/auth-stores';
import { getPekerjaan } from '../api/pekerjaan';
import type { Pekerjaan } from '../types';

const PER_PAGE = 100;

/** Ambil semua paket aktif yang sudah punya kontrak, per halaman sampai habis. */
async function fetchPaketBerkontrak(): Promise<Pekerjaan[]> {
    const hasil: Pekerjaan[] = [];
    let page = 1;
    let lastPage = 1;
    do {
        const res = await getPekerjaan({ page, per_page: PER_PAGE, status: 'active', has_kontrak: true });
        // Filter di server; saring ulang di sini agar tetap benar bila server belum memakai parameter ini.
        hasil.push(...res.data.data.filter((p) => p.has_kontrak));
        lastPage = res.data.meta.last_page ?? page;
        page += 1;
    } while (page <= lastPage);
    return hasil;
}

export default function NphdListPage() {
    const { auth } = useAuthStore();
    const isAdmin = auth.user?.roles?.includes('admin') ?? false;
    const [cari, setCari] = useState('');

    const { data = [], isLoading, isError } = useQuery({
        queryKey: ['nphd', 'paket-berkontrak'],
        queryFn: fetchPaketBerkontrak,
        enabled: isAdmin,
    });

    const tampil = useMemo(() => {
        const kata = cari.trim().toLowerCase();
        if (!kata) return data;
        return data.filter((p) =>
            [p.nama_paket, p.nama_desa, p.nama_kecamatan].some((v) => v?.toLowerCase().includes(kata)),
        );
    }, [data, cari]);

    if (!isAdmin) {
        return (
            <PageContainer>
                <p className="text-muted-foreground">Hanya admin yang bisa membuat NPHD.</p>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="space-y-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold tracking-tight">
                        <FileText className="h-6 w-6 text-primary" />
                        NPHD
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Paket pekerjaan yang sudah berkontrak. Pilih paket untuk membuat NPHD dan BA serah terima.
                    </p>
                </div>

                <div className="relative max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Cari nama paket, desa, atau kecamatan"
                        value={cari}
                        onChange={(e) => setCari(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : isError ? (
                    <p className="text-destructive">Gagal memuat daftar paket.</p>
                ) : tampil.length === 0 ? (
                    <p className="text-muted-foreground">
                        {data.length === 0 ? 'Belum ada paket pekerjaan yang berkontrak.' : 'Tidak ada paket yang cocok.'}
                    </p>
                ) : (
                    <div className="space-y-3">
                        {tampil.map((p) => (
                            <Card key={p.id}>
                                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0 space-y-1">
                                        <p className="font-medium break-words">{p.nama_paket}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {[p.nama_desa, p.nama_kecamatan].filter(Boolean).join(', ') || '-'}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary">
                                                {p.kontrak_count ?? 0} kontrak
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button asChild className="shrink-0 gap-2">
                                        <Link to="/pekerjaan/$id/nphd" params={{ id: String(p.id) }}>
                                            <FileText className="h-4 w-4" />
                                            Buat NPHD
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
