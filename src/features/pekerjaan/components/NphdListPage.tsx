import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { FileText, Pencil, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import PageContainer from '@/components/layout/page-container';
import { useAuthStore } from '@/stores/auth-stores';
import { getPekerjaan } from '../api/pekerjaan';
import { listNphdData, type NphdData } from '../api/nphd';
import type { Pekerjaan } from '../types';
import { NphdDataDialog } from './NphdDataDialog';

const PER_PAGE = 100;

/** Ambil semua paket aktif yang sudah punya kontrak, per halaman sampai habis. */
async function fetchPaketBerkontrak(): Promise<Pekerjaan[]> {
    const hasil: Pekerjaan[] = [];
    let page = 1;
    let lastPage = 1;
    do {
        const res = await getPekerjaan({ page, per_page: PER_PAGE, status: 'active', has_kontrak: true });
        // Filter di server; saring ulang di sini agar tetap benar bila server belum memakai parameter ini.
        hasil.push(...res.data.filter((p) => p.has_kontrak));
        lastPage = res.meta.last_page ?? page;
        page += 1;
    } while (page <= lastPage);
    return hasil;
}

export default function NphdListPage() {
    const { auth } = useAuthStore();
    const isAdmin = auth.user?.roles?.includes('admin') ?? false;
    const [cari, setCari] = useState('');
    const [dipilih, setDipilih] = useState<Pekerjaan | null>(null);

    const { data: paket = [], isLoading, isError } = useQuery({
        queryKey: ['nphd', 'paket-berkontrak'],
        queryFn: fetchPaketBerkontrak,
        enabled: isAdmin,
    });

    const { data: nphdSemua = [] } = useQuery({
        queryKey: ['nphd', 'data-semua'],
        queryFn: listNphdData,
        enabled: isAdmin,
    });

    const dataPerPaket = useMemo(() => {
        const peta = new Map<number, NphdData>();
        for (const d of nphdSemua) peta.set(d.pekerjaan_id, d);
        return peta;
    }, [nphdSemua]);

    const tampil = useMemo(() => {
        const kata = cari.trim().toLowerCase();
        if (!kata) return paket;
        return paket.filter((p) =>
            [p.nama_paket, p.desa?.nama_desa, p.kecamatan?.nama_kecamatan].some((v) => v?.toLowerCase().includes(kata)),
        );
    }, [paket, cari]);

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
                        Paket pekerjaan yang sudah berkontrak. Isi jenis pengelola dan penerima manfaat dulu, lalu buat NPHD.
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
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : isError ? (
                    <p className="text-destructive">Gagal memuat daftar paket.</p>
                ) : tampil.length === 0 ? (
                    <p className="text-muted-foreground">
                        {paket.length === 0 ? 'Belum ada paket pekerjaan yang berkontrak.' : 'Tidak ada paket yang cocok.'}
                    </p>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">No</TableHead>
                                            <TableHead className="min-w-[260px]">Nama Paket Pekerjaan</TableHead>
                                            <TableHead className="min-w-[160px]">Nomor NPHD</TableHead>
                                            <TableHead className="min-w-[200px]">Jenis Pengelola</TableHead>
                                            <TableHead className="min-w-[240px]">Nama Penerima Manfaat</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tampil.map((p, index) => {
                                            const data = dataPerPaket.get(p.id);
                                            return (
                                                <TableRow key={p.id}>
                                                    <TableCell className="align-top">{index + 1}</TableCell>
                                                    <TableCell className="align-top">
                                                        <p className="font-medium break-words">{p.nama_paket}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {[p.desa?.nama_desa, p.kecamatan?.nama_kecamatan].filter(Boolean).join(', ') || '-'}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="align-top">{data?.nomor_nphd || <span className="text-muted-foreground">Belum dibuat</span>}</TableCell>
                                                    <TableCell className="align-top">{data?.jenis_pengelola || <span className="text-muted-foreground">-</span>}</TableCell>
                                                    <TableCell className="align-top">
                                                        {data?.penerima_manfaat.length ? (
                                                            <ul className="list-disc pl-4 space-y-0.5">
                                                                {data.penerima_manfaat.map((nama) => (
                                                                    <li key={nama} className="break-words">{nama}</li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setDipilih(p)}>
                                                                <Pencil className="h-4 w-4" />
                                                                Input data
                                                            </Button>
                                                            <Button size="sm" asChild className="gap-1.5">
                                                                <Link to="/pekerjaan/$id/nphd" params={{ id: String(p.id) }}>
                                                                    <FileText className="h-4 w-4" />
                                                                    Buat NPHD
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {dipilih ? (
                <NphdDataDialog
                    open={!!dipilih}
                    onOpenChange={(open) => {
                        if (!open) setDipilih(null);
                    }}
                    pekerjaanId={dipilih.id}
                    namaPaket={dipilih.nama_paket}
                    data={dataPerPaket.get(dipilih.id)}
                />
            ) : null}
        </PageContainer>
    );
}
