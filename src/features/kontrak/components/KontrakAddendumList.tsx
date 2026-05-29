import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { getAllKontrakAddendums } from '../api/kontrak';
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
    draft: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
    diajukan: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    disetujui: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    ditolak: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
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

export default function KontrakAddendumList() {
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

    const addendums = data?.data ?? [];
    const totalPages = data?.meta?.last_page ?? 1;

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
                        ) : addendums.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                Belum ada addendum kontrak.
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
                                            <TableHead className="text-right">Kontrak</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {addendums.map((addendum) => (
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
                                                    {addendum.kontrak?.id ? (
                                                        <Link
                                                            to="/kontrak/$id"
                                                            params={{ id: addendum.kontrak.id.toString() }}
                                                            className="text-sm font-medium text-primary hover:underline"
                                                        >
                                                            Detail
                                                        </Link>
                                                    ) : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {totalPages > 1 && (
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
