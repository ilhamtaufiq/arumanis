import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { getAllKontrakAddendums, getKontrakAddendumRegisterGaps } from '../api/kontrak';
import type { KontrakAddendumRegisterGap } from '../types';
import { useAuthStore } from '@/stores/auth-stores';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';

const statusClass: Record<string, string> = {
    draft: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    diajukan: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    disetujui: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    ditolak: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    perlu_dilengkapi: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',
};

const formatDate = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const formatCurrency = (value?: number | null) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);

function filterGapItems(
    gaps: KontrakAddendumRegisterGap[],
    search: string,
): KontrakAddendumRegisterGap[] {
    if (!search) return gaps;

    const query = search.toLowerCase();
    return gaps.filter((gap) => {
        const pekerjaan = gap.pekerjaan?.nama_paket?.toLowerCase() ?? '';
        const penyedia = gap.penyedia?.nama?.toLowerCase() ?? '';
        const nomor = gap.nomor_register.toLowerCase();
        const pengawas = gap.pengawas?.nama?.toLowerCase() ?? '';

        return (
            nomor.includes(query)
            || pekerjaan.includes(query)
            || penyedia.includes(query)
            || pengawas.includes(query)
        );
    });
}

export default function KontrakAddendumList() {
    const user = useAuthStore((state) => state.auth.user);
    const isAdmin = Boolean(user?.roles?.includes('admin'));
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');

    const params = useMemo(() => ({
        page: currentPage,
        search: search || undefined,
        status,
    }), [currentPage, search, status]);

    const { data, isLoading } = useQuery({
        queryKey: ['kontrak-addendums', params],
        queryFn: () => getAllKontrakAddendums(params),
    });

    const { data: registerGaps } = useQuery({
        queryKey: ['kontrak-addendums', 'register-gaps'],
        queryFn: getKontrakAddendumRegisterGaps,
        enabled: isAdmin,
    });

    const addendums = data?.data ?? [];
    const gapItems = registerGaps?.items ?? [];
    const totalPages = data?.meta?.last_page ?? 1;

    const showGapRows = isAdmin && currentPage === 1 && (status === 'all' || status === 'perlu_dilengkapi');
    const visibleGapItems = useMemo(
        () => (showGapRows ? filterGapItems(gapItems, search) : []),
        [showGapRows, gapItems, search],
    );
    const showRegularRows = status !== 'perlu_dilengkapi';
    const regularRows = showRegularRows ? addendums : [];
    const hasRows = visibleGapItems.length > 0 || regularRows.length > 0;

    return (
        <>
            <Header />
            <Main>
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Addendum Kontrak</h1>
                        <p className="text-muted-foreground">Pantau seluruh versi addendum dari kontrak pekerjaan.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={status} onValueChange={(value) => {
                            setStatus(value);
                            setCurrentPage(1);
                        }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                {isAdmin && (
                                    <SelectItem value="perlu_dilengkapi">Perlu Dilengkapi</SelectItem>
                                )}
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="diajukan">Diajukan</SelectItem>
                                <SelectItem value="disetujui">Disetujui</SelectItem>
                                <SelectItem value="ditolak">Ditolak</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card>
                    <CardHeader className="space-y-4">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Daftar Addendum
                        </CardTitle>
                        <SearchInput
                            defaultValue={search}
                            onSearch={(value) => {
                                setSearch(value);
                                setCurrentPage(1);
                            }}
                        />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <TableSkeleton columns={8} rows={10} />
                        ) : !hasRows ? (
                            <div className="py-12 text-center text-muted-foreground">
                                {status === 'perlu_dilengkapi'
                                    ? 'Belum ada addendum yang perlu dilengkapi.'
                                    : 'Belum ada addendum kontrak.'}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Addendum</TableHead>
                                            <TableHead>Pekerjaan</TableHead>
                                            <TableHead>Penyedia</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead className="text-right">Nilai Sebelum</TableHead>
                                            <TableHead className="text-right">Nilai Sesudah</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {visibleGapItems.map((gap) => (
                                            <TableRow
                                                key={`gap-${gap.register_id}`}
                                                className="bg-amber-50/70 hover:bg-amber-50 dark:bg-amber-950/35 dark:hover:bg-amber-950/50"
                                            >
                                                <TableCell className="min-w-[220px]">
                                                    <div className="font-medium text-amber-900 dark:text-amber-200">
                                                        Register sudah ada
                                                    </div>
                                                    <div className="text-xs font-mono text-muted-foreground">{gap.nomor_register}</div>
                                                    <div className="text-xs text-amber-700/90 dark:text-amber-400/90 mt-1 space-y-0.5">
                                                        <p>Detail addendum: belum ada</p>
                                                        <p>Status: belum disetujui</p>
                                                    </div>
                                                    {gap.type_name && (
                                                        <div className="text-xs text-muted-foreground mt-0.5">
                                                            Tipe register: {gap.type_name}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="min-w-[260px]">
                                                    <div className="font-medium">{gap.pekerjaan?.nama_paket || '-'}</div>
                                                    <div className="text-xs text-muted-foreground">{gap.pekerjaan?.kode_rekening || '-'}</div>
                                                </TableCell>
                                                <TableCell className="min-w-[180px]">{gap.penyedia?.nama || '-'}</TableCell>
                                                <TableCell className="whitespace-nowrap">{formatDate(gap.tanggal_register)}</TableCell>
                                                <TableCell className="text-right whitespace-nowrap text-muted-foreground">-</TableCell>
                                                <TableCell className="text-right whitespace-nowrap text-muted-foreground">-</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={statusClass.perlu_dilengkapi}>
                                                        Perlu dilengkapi
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link
                                                        to="/kontrak-addendums/gap/$registerId"
                                                        params={{ registerId: String(gap.register_id) }}
                                                        className="text-sm font-medium text-primary hover:underline"
                                                    >
                                                        Detail
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {regularRows.map((addendum) => (
                                            <TableRow key={addendum.id}>
                                                <TableCell className="min-w-[180px]">
                                                    <div className="font-medium">Addendum ke-{addendum.addendum_ke}</div>
                                                    <div className="text-xs text-muted-foreground">{addendum.nomor_addendum}</div>
                                                </TableCell>
                                                <TableCell className="min-w-[260px]">
                                                    <div className="font-medium">{addendum.kontrak?.pekerjaan?.nama_paket || '-'}</div>
                                                    <div className="text-xs text-muted-foreground">{addendum.kontrak?.pekerjaan?.kode_rekening || '-'}</div>
                                                </TableCell>
                                                <TableCell className="min-w-[180px]">{addendum.kontrak?.penyedia?.nama || '-'}</TableCell>
                                                <TableCell className="whitespace-nowrap">{formatDate(addendum.tanggal_addendum)}</TableCell>
                                                <TableCell className="text-right whitespace-nowrap">{formatCurrency(addendum.nilai_kontrak_sebelum)}</TableCell>
                                                <TableCell className="text-right whitespace-nowrap">{formatCurrency(addendum.nilai_kontrak_sesudah)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={statusClass[addendum.status] || statusClass.draft}>
                                                        {addendum.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link
                                                        to="/kontrak-addendums/$id"
                                                        params={{ id: String(addendum.id) }}
                                                        className="text-sm font-medium text-primary hover:underline"
                                                    >
                                                        Detail
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {showRegularRows && totalPages > 1 && (
                            <div className="mt-6 flex justify-end">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    setCurrentPage((page) => Math.max(1, page - 1));
                                                }}
                                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLink href="#" isActive>
                                                {currentPage}
                                            </PaginationLink>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    setCurrentPage((page) => Math.min(totalPages, page + 1));
                                                }}
                                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Main>
        </>
    );
}
