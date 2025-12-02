import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDesa, deleteDesa } from '../api/desa';
import { getKecamatan } from '@/features/kecamatan/api/kecamatan';
import type { Desa } from '../types';
import type { Kecamatan } from '@/features/kecamatan/types';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
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

export default function DesaList() {
    const [desaList, setDesaList] = useState<Desa[]>([]);
    const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
    const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchKecamatan = async () => {
        try {
            const response = await getKecamatan();
            setKecamatanList(response.data);
        } catch (error) {
            console.error('Failed to fetch kecamatan:', error);
        }
    };

    const fetchDesa = async (page: number, kecamatanId?: number) => {
        try {
            setLoading(true);
            const response = await getDesa({
                page,
                kecamatan_id: kecamatanId,
            });
            setDesaList(response.data);
            setTotalPages(response.meta.last_page);
        } catch (error) {
            console.error('Failed to fetch desa:', error);
            toast.error('Gagal memuat data desa');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKecamatan();
    }, []);

    useEffect(() => {
        const kecamatanId = selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan);
        fetchDesa(currentPage, kecamatanId);
    }, [currentPage, selectedKecamatan]);


    const handleDelete = async (id: number) => {
        try {
            await deleteDesa(id);
            toast.success('Desa berhasil dihapus');
            const kecamatanId = selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan);
            fetchDesa(currentPage, kecamatanId);
        } catch (error) {
            console.error('Failed to delete desa:', error);
            toast.error('Gagal menghapus desa');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Daftar Desa</h1>
                <Button asChild>
                    <Link to="/desa/new">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Desa
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Data Desa</CardTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Filter Kecamatan:</span>
                            <Select value={selectedKecamatan} onValueChange={(value) => {
                                setSelectedKecamatan(value)
                                setCurrentPage(1)
                            }}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Semua Kecamatan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kecamatan</SelectItem>
                                    {kecamatanList.map((kec) => (
                                        <SelectItem key={kec.id} value={kec.id.toString()}>
                                            {kec.nama_kecamatan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Desa</TableHead>
                                    <TableHead>Kecamatan</TableHead>
                                    <TableHead>Luas (Ha)</TableHead>
                                    <TableHead>Jumlah Penduduk</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {desaList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Belum ada data desa.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    desaList.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.nama_desa}</TableCell>
                                            <TableCell>{item.kecamatan?.nama_kecamatan || '-'}</TableCell>
                                            <TableCell>{item.luas.toLocaleString('id-ID')}</TableCell>
                                            <TableCell>{item.jumlah_penduduk.toLocaleString('id-ID')}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="icon" asChild>
                                                    <Link to={`/desa/${item.id}/edit`}>
                                                        .                                                       <Pencil className="h-4 w-4" />
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
                                                            <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tindakan ini tidak dapat dibatalkan. Data desa akan dihapus permanen.
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
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
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
                                                handlePageChange(currentPage - 1);
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
                                                        handlePageChange(item as number);
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
                                                handlePageChange(currentPage + 1);
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
        </div>
    );
}
