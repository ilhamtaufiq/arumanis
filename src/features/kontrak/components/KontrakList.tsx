import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { getKontrak, deleteKontrak } from '../api/kontrak';
import type { Kontrak } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, FileText, Search as SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';

export default function KontrakList() {
    const [kontrakList, setKontrakList] = useState<Kontrak[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const { tahunAnggaran } = useAppSettingsValues();

    const fetchKontrak = async (page: number, search?: string, year?: string) => {
        try {
            setLoading(true);
            const response = await getKontrak({
                page,
                search,
                tahun: year
            });
            setKontrakList(response.data);
            setCurrentPage(response.meta.current_page);
            setTotalPages(response.meta.last_page);
            setTotal(response.meta.total);
        } catch (error) {
            console.error('Failed to fetch kontrak:', error);
            toast.error('Gagal memuat data kontrak');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchKontrak(1, searchQuery, tahunAnggaran);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, tahunAnggaran]);

    useEffect(() => {
        fetchKontrak(currentPage, searchQuery, tahunAnggaran);
    }, [currentPage]);

    const handleDelete = async (id: number) => {
        try {
            await deleteKontrak(id);
            toast.success('Kontrak berhasil dihapus');
            fetchKontrak(currentPage, searchQuery, tahunAnggaran);
        } catch (error) {
            console.error('Failed to delete kontrak:', error);
            toast.error('Gagal menghapus kontrak');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const formatRupiah = (value: number | null) => {
        if (!value) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const renderPagination = () => {
        const pages: (number | string)[] = [];
        const delta = 2;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }

        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>

                    {pages.map((page, index) => (
                        <PaginationItem key={index}>
                            {page === '...' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    onClick={() => handlePageChange(page as number)}
                                    isActive={currentPage === page}
                                    className="cursor-pointer"
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    if (loading && kontrakList.length === 0) {
        return (
            <>
                <Header />

                <Main>
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Memuat data...</p>
                    </div>
                </Main>
            </>
        );
    }

    return (
        <>
            {/* ===== Top Heading ===== */}
            <Header />


            {/* ===== Main ===== */}
            <Main>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kontrak</h1>
                        <p className="text-muted-foreground">
                            Kelola data kontrak pekerjaan
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild>
                            <Link to="/kontrak/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Kontrak
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Daftar Kontrak</CardTitle>
                                <CardDescription>
                                    Total {total} kontrak
                                </CardDescription>
                            </div>
                            <div className="relative w-64">
                                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari kontrak..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode RUP</TableHead>
                                        <TableHead>Nomor Penawaran</TableHead>
                                        <TableHead>Pekerjaan</TableHead>
                                        <TableHead>Penyedia</TableHead>
                                        <TableHead className="text-right">Nilai Kontrak</TableHead>
                                        <TableHead>Tgl. SPK</TableHead>
                                        <TableHead>Tgl. Selesai</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {kontrakList.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                <FileText className="mx-auto h-12 w-12 mb-2 opacity-20" />
                                                <p>Tidak ada data kontrak</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        kontrakList.map((kontrak) => (
                                            <TableRow key={kontrak.id}>
                                                <TableCell className="font-medium">
                                                    {kontrak.kode_rup || '-'}
                                                </TableCell>
                                                <TableCell>{kontrak.nomor_penawaran || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs truncate">
                                                        {kontrak.pekerjaan?.nama_paket || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs truncate">
                                                        {kontrak.penyedia?.nama || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatRupiah(kontrak.nilai_kontrak)}
                                                </TableCell>
                                                <TableCell>{formatDate(kontrak.tgl_spk)}</TableCell>
                                                <TableCell>{formatDate(kontrak.tgl_selesai)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link to="/kontrak/$id/edit" params={{ id: kontrak.id.toString() }}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Hapus Kontrak</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Apakah Anda yakin ingin menghapus kontrak ini? Tindakan ini tidak dapat dibatalkan.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(kontrak.id)}>
                                                                        Hapus
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-4">
                                {renderPagination()}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Main>
        </>
    );
}
