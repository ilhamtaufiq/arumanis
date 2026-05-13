import React, { useState, useMemo, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';
import { getKecamatan } from '@/features/kecamatan/api/kecamatan';
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
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Eye, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

const ProgressRow = React.memo(({ item, index }: any) => {
    const progress = item.progress_total || 0;
    
    return (
        <TableRow>
            <TableCell className="text-center font-bold text-muted-foreground">{index}</TableCell>
            <TableCell>
                <div className="font-bold text-sm leading-tight">{item.nama_paket}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                    {item.kecamatan?.nama_kecamatan || '-'} • {item.desa?.nama_desa || '-'}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex flex-col gap-1.5 min-w-[200px]">
                    <div className="flex justify-between items-center px-0.5">
                        <span className={`text-xs font-black ${
                            progress >= 100 ? 'text-green-600' :
                            progress >= 75 ? 'text-emerald-500' :
                            progress >= 50 ? 'text-amber-500' :
                            progress >= 25 ? 'text-orange-500' :
                            'text-rose-500'
                        }`}>
                            {progress.toFixed(2)}%
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Progres Fisik</span>
                    </div>
                    <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden border border-muted/5">
                        <div 
                            className={`h-full transition-all duration-1000 ease-out rounded-full ${
                                progress >= 100 ? 'bg-green-600' :
                                progress >= 75 ? 'bg-emerald-500' :
                                progress >= 50 ? 'bg-amber-500' :
                                progress >= 25 ? 'bg-orange-500' :
                                'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild className="h-8 rounded-full font-bold">
                    <Link to="/pekerjaan/$id" params={{ id: item.id.toString() }}>
                        <Eye className="mr-2 h-3.5 w-3.5" /> Detail
                    </Link>
                </Button>
            </TableCell>
        </TableRow>
    );
});

ProgressRow.displayName = 'ProgressRow';

export default function ProgressRekap() {
    const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { tahunAnggaran } = useAppSettingsValues();

    const { data: kecamatanRes } = useQuery({
        queryKey: ['kecamatan'],
        queryFn: () => getKecamatan(),
    });
    const kecamatanList = kecamatanRes?.data || [];

    const filters = useMemo(() => ({
        page: currentPage,
        kecamatan_id: selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan),
        search: debouncedSearch || undefined,
        tahun: tahunAnggaran
    }), [currentPage, selectedKecamatan, debouncedSearch, tahunAnggaran]);

    const { data: pekerjaanRes, isLoading: loading } = useQuery({
        queryKey: ['pekerjaan-rekap', filters],
        queryFn: () => getPekerjaan(filters),
    });
    
    const pekerjaanList = pekerjaanRes?.data || [];
    const totalPages = pekerjaanRes?.meta?.last_page || 1;

    const handleExportExcel = useCallback(async () => {
        try {
            // Get all data without pagination for export
            const allDataRes = await getPekerjaan({ 
                kecamatan_id: selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan),
                search: debouncedSearch || undefined,
                tahun: tahunAnggaran,
                per_page: -1 // Get all relevant records for export
            });

            const dataToExport = allDataRes.data.map((item: any, index: number) => ({
                'No': index + 1,
                'Nama Paket Pekerjaan': item.nama_paket,
                'Kecamatan': item.kecamatan?.nama_kecamatan || '-',
                'Desa': item.desa?.nama_desa || '-',
                'Pagu (Rp)': item.pagu,
                'Progres Fisik (%)': item.progress_total || 0,
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Progress');

            // Adjust column widths
            const wscols = [
                { wch: 5 },  // No
                { wch: 50 }, // Nama Paket
                { wch: 20 }, // Kecamatan
                { wch: 20 }, // Desa
                { wch: 15 }, // Pagu
                { wch: 15 }, // Progress
            ];
            worksheet['!cols'] = wscols;

            XLSX.writeFile(workbook, `Rekap_Progress_${tahunAnggaran}_${new Date().getTime()}.xlsx`);
            
            toast.success("Data rekap progress telah diekspor ke Excel.");
        } catch (error) {
            console.error('Export error:', error);
            toast.error("Terjadi kesalahan saat mengekspor data.");
        }
    }, [selectedKecamatan, debouncedSearch, tahunAnggaran]);

    const renderPagination = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 3; i++) pages.push(i);
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('ellipsis');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
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
                                if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                                        setCurrentPage(p as number);
                                    }}
                                    isActive={currentPage === p}
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
                                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    return (
        <>
            <Header />
            <Main>
                <div className="mb-6">
                    <h1 className="text-2xl font-black tracking-tight">Rekap Progres Fisik</h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        Pemantauan real-time capaian seluruh pekerjaan lapangan
                    </p>
                </div>

                <Card className="border-none shadow-xl bg-background/60 backdrop-blur-md">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div className="w-full md:w-1/3">
                                <span className="text-[10px] font-black uppercase text-muted-foreground ml-1">Cari Pekerjaan</span>
                                <SearchInput 
                                    defaultValue={debouncedSearch} 
                                    onSearch={setDebouncedSearch} 
                                />
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="flex flex-col gap-1 w-full md:w-[200px]">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground ml-1">Kecamatan</span>
                                    <Select value={selectedKecamatan} onValueChange={(value) => {
                                        setSelectedKecamatan(value)
                                        setCurrentPage(1)
                                    }}>
                                        <SelectTrigger className="rounded-xl border-muted/20">
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
                                <Button 
                                    variant="outline" 
                                    className="rounded-xl border-muted/20 h-10 font-bold bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                                    onClick={handleExportExcel}
                                    disabled={loading || pekerjaanList.length === 0}
                                >
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Ekspor Excel
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <TableSkeleton columns={4} rows={10} />
                        ) : pekerjaanList.length === 0 ? (
                            <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-muted">
                                <p className="text-muted-foreground font-medium italic">Tidak ada data pekerjaan yang ditemukan.</p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-muted/10 overflow-hidden bg-background/40">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="w-[60px] text-center font-black uppercase text-[10px]">No</TableHead>
                                            <TableHead className="font-black uppercase text-[10px]">Pekerjaan</TableHead>
                                            <TableHead className="font-black uppercase text-[10px]">Progres Total</TableHead>
                                            <TableHead className="text-right font-black uppercase text-[10px]">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pekerjaanList.map((item, idx) => (
                                            <ProgressRow 
                                                key={item.id} 
                                                item={item} 
                                                index={(currentPage - 1) * 20 + idx + 1}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center border-t py-4">
                        {totalPages > 1 && renderPagination()}
                    </CardFooter>
                </Card>
            </Main>
        </>
    );
}
