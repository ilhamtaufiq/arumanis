import { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { getBerkasList, deleteBerkas } from '../api';
import type { Berkas, BerkasResponse } from '../types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus, Search as SearchIcon, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { TableSkeleton } from '@/components/shared/TableSkeleton';

import { useAppSettingsValues } from '@/hooks/use-app-settings';

export default function BerkasList() {
    const [data, setData] = useState<BerkasResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { tahunAnggaran } = useAppSettingsValues();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getBerkasList({
                page,
                search,
                tahun: tahunAnggaran
            });
            setData(response);
        } catch (error) {
            console.error('Failed to fetch berkas:', error);
            toast.error('Gagal memuat data berkas');
        } finally {
            setIsLoading(false);
        }
    }, [page, search, tahunAnggaran]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(timer);
    }, [fetchData]);

    const renderPagination = () => {
        if (!data?.meta) return null;
        const totalPages = data.meta.last_page;
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 3) {
                for (let i = 1; i <= 3; i++) pages.push(i);
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('ellipsis');
                pages.push(page - 1);
                pages.push(page);
                pages.push(page + 1);
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }

        return (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (page > 1) setPage(page - 1);
                            }}
                            className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>

                    {pages.map((p, index) => (
                        <PaginationItem key={index}>
                            {p === 'ellipsis' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPage(p as number);
                                    }}
                                    isActive={page === p}
                                >
                                    {p}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (page < totalPages) setPage(page + 1);
                            }}
                            className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await deleteBerkas(deleteId);
                toast.success('Berkas berhasil dihapus');
                fetchData();
            } catch (error) {
                console.error('Failed to delete berkas:', error);
                toast.error('Gagal menghapus berkas');
            } finally {
                setDeleteId(null);
            }
        }
    };

    return (
        <>
            {/* ===== Top Heading ===== */}
            <Header />


            {/* ===== Main ===== */}
            <Main>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dokumen Berkas</h1>
                        <p className="text-muted-foreground">
                            Kelola dokumen berkas pekerjaan
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild>
                            <Link to="/berkas/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Berkas
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center space-x-2 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari jenis dokumen..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <TableSkeleton columns={4} rows={10} />
                ) : data?.data.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-md">
                        Tidak ada data berkas
                    </div>
                ) : (
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px]">Jenis Dokumen</TableHead>
                                    <TableHead className="min-w-[250px]">Pekerjaan</TableHead>
                                    <TableHead className="min-w-[150px]">File</TableHead>
                                    <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.data.map((berkas: Berkas) => (
                                    <TableRow key={berkas.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center">
                                                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {berkas.jenis_dokumen}
                                            </div>
                                        </TableCell>
                                        <TableCell>{berkas.pekerjaan?.nama_paket}</TableCell>
                                        <TableCell>
                                            {berkas.berkas_url && (
                                                <a
                                                    href={berkas.berkas_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-sm text-blue-600 hover:underline"
                                                >
                                                    <ExternalLink className="mr-1 h-3 w-3" />
                                                    Lihat File
                                                </a>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link to="/berkas/$id/edit" params={{ id: berkas.id.toString() }}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => setDeleteId(berkas.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <div className="flex items-center justify-end space-x-2 py-4">
                    {data?.meta && data.meta.last_page > 1 && renderPagination()}
                </div>

                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Berkas akan dihapus permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Main>
        </>
    );
}
