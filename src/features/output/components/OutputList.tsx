import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { getOutput, deleteOutput } from '../api/output';
import type { Output } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, FileText } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';

export default function OutputList() {
    const [outputList, setOutputList] = useState<Output[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const { tahunAnggaran } = useAppSettingsValues();

    const fetchOutput = async (page: number, year?: string) => {
        try {
            setLoading(true);
            const response = await getOutput({
                page,
                tahun: year
            });
            setOutputList(response.data);
            setCurrentPage(response.meta.current_page);
            setTotalPages(response.meta.last_page);
            setTotal(response.meta.total);
        } catch (error) {
            console.error('Failed to fetch output:', error);
            toast.error('Gagal memuat data output');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOutput(currentPage, tahunAnggaran);
    }, [currentPage, tahunAnggaran]);

    const handleDelete = async (id: number) => {
        try {
            await deleteOutput(id);
            toast.success('Output berhasil dihapus');
            fetchOutput(currentPage, tahunAnggaran);
        } catch (error) {
            console.error('Failed to delete output:', error);
            toast.error('Gagal menghapus output');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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

    if (loading && outputList.length === 0) {
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
                        <h1 className="text-2xl font-bold tracking-tight">Output</h1>
                        <p className="text-muted-foreground">
                            Kelola data output pekerjaan
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild>
                            <Link to="/output/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Output
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Output</CardTitle>
                        <CardDescription>
                            Total {total} output
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pekerjaan</TableHead>
                                        <TableHead>Komponen</TableHead>
                                        <TableHead>Satuan</TableHead>
                                        <TableHead className="text-right">Volume</TableHead>
                                        <TableHead>Penerima Optional</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {outputList.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                <FileText className="mx-auto h-12 w-12 mb-2 opacity-20" />
                                                <p>Tidak ada data output</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        outputList.map((output) => (
                                            <TableRow key={output.id}>
                                                <TableCell className="font-medium">
                                                    <div className="max-w-xs truncate">
                                                        {output.pekerjaan?.nama_paket || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{output.komponen}</TableCell>
                                                <TableCell>{output.satuan}</TableCell>
                                                <TableCell className="text-right">{output.volume}</TableCell>
                                                <TableCell>
                                                    {output.penerima_is_optional ? (
                                                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                            Ya
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                            Tidak
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link to="/output/$id/edit" params={{ id: output.id.toString() }}>
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
                                                                    <AlertDialogTitle>Hapus Output</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Apakah Anda yakin ingin menghapus output ini? Tindakan ini tidak dapat dibatalkan.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(output.id)}>
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
