import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { toast } from 'sonner';
import { getPenyedia, deletePenyedia } from '../api/penyedia';
import type { Penyedia } from '../types';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';

// Memoized Row
const PenyediaRow = React.memo(({ item, handleDelete }: any) => {
    return (
        <TableRow key={item.id}>
            <TableCell className="font-medium">{item.nama}</TableCell>
            <TableCell>{item.direktur || '-'}</TableCell>
            <TableCell>{item.alamat || '-'}</TableCell>
            <TableCell>
                {item.dokumen && item.dokumen.length > 0 ? (
                    <span className="flex items-center text-xs bg-primary/10 text-primary px-2 py-1 rounded-full w-fit">
                        <FileText className="w-3 h-3 mr-1" />
                        {item.dokumen.length} dokumen
                    </span>
                ) : '-'}
            </TableCell>
            <TableCell className="text-right space-x-2 sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/penyedia/$id/edit" params={{ id: item.id.toString() }}>
                        <Pencil className="h-4 w-4" />
                    </Link>
                </Button>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Penyedia?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Seluruh data penyedia ini akan dihapus secara permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </TableCell>
        </TableRow>
    );
});

PenyediaRow.displayName = 'PenyediaRow';

export default function PenyediaList() {
    const [data, setData] = useState<Penyedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const handleSearch = (val: string) => {
        setDebouncedSearch(val);
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, debouncedSearch]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getPenyedia({ page: currentPage, search: debouncedSearch }) as any;
            setData(response.data);
            if (response.meta) {
                setTotalPages(response.meta.last_page);
            }
        } catch (error) {
            toast.error('Gagal memuat data penyedia');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deletePenyedia(id);
            toast.success('Penyedia berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus penyedia');
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
                        <h1 className="text-2xl font-bold tracking-tight">Daftar Penyedia</h1>
                        <p className="text-muted-foreground">
                            Kelola data master referensi penyedia / vendor
                        </p>
                    </div>
                    <Button asChild>
                        <Link to="/penyedia/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Penyedia
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <CardTitle>Data Penyedia</CardTitle>
                                <SearchInput 
                                    defaultValue={debouncedSearch} 
                                    onSearch={handleSearch} 
                                    placeholder="Cari nama, direktur..."
                                    className="w-full sm:w-64"
                                />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[200px]">Nama Penyedia</TableHead>
                                        <TableHead className="min-w-[150px]">Direktur</TableHead>
                                        <TableHead className="min-w-[250px]">Alamat</TableHead>
                                        <TableHead className="min-w-[120px]">Dokumen</TableHead>
                                        <TableHead className="text-right sticky right-0 bg-background shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)] z-10">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableSkeleton columns={5} rows={10} />
                                    ) : data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Belum ada data penyedia.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.map((item) => (
                                            <PenyediaRow 
                                                key={item.id} 
                                                item={item} 
                                                handleDelete={handleDelete}
                                            />
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage > 1) {
                                                    setCurrentPage(currentPage - 1);
                                                }
                                            }}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>

                                    {(() => {
                                        const items = [];
                                        const maxVisiblePages = 5;

                                        if (totalPages <= maxVisiblePages) {
                                            for (let i = 1; i <= totalPages; i++) {
                                                items.push(i);
                                            }
                                        } else {
                                            if (currentPage <= 3) {
                                                for (let i = 1; i <= 3; i++) items.push(i);
                                                items.push('ellipsis');
                                                items.push(totalPages);
                                            } else if (currentPage >= totalPages - 2) {
                                                items.push(1);
                                                items.push('ellipsis');
                                                for (let i = totalPages - 2; i <= totalPages; i++) items.push(i);
                                            } else {
                                                items.push(1);
                                                items.push('ellipsis');
                                                items.push(currentPage - 1);
                                                items.push(currentPage);
                                                items.push(currentPage + 1);
                                                items.push('ellipsis');
                                                items.push(totalPages);
                                            }
                                        }

                                        return items.map((item, index) => (
                                            <PaginationItem key={index}>
                                                {item === 'ellipsis' ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <PaginationLink
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setCurrentPage(item as number);
                                                        }}
                                                        isActive={currentPage === item}
                                                    >
                                                        {item}
                                                    </PaginationLink>
                                                )}
                                            </PaginationItem>
                                        ));
                                    })()}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage < totalPages) {
                                                    setCurrentPage(currentPage + 1);
                                                }
                                            }}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </CardFooter>
                </Card>
            </Main>
        </>
    );
}
