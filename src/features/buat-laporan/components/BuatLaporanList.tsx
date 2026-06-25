import React, { useMemo, useState } from 'react';
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
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, MapPin } from 'lucide-react';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { SearchInput } from '@/components/shared/SearchInput';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ListPageLayout } from '@/components/shared/ListPageLayout';
import { ListPagination } from '@/components/shared/ListPagination';

const BuatLaporanRow = React.memo(({ item, index }: { item: any; index: number }) => {
    const progress = item.progress_total || 0;

    return (
        <TableRow>
            <TableCell className="text-center font-bold text-muted-foreground">{index}</TableCell>
            <TableCell>
                <div className="font-semibold text-sm leading-tight">{item.nama_paket}</div>
                {item.kode_rekening && (
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{item.kode_rekening}</div>
                )}
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.kecamatan?.nama_kecamatan || '-'} • {item.desa?.nama_desa || '-'}
                </div>
            </TableCell>
            <TableCell>
                <div className="text-sm">{item.kegiatan?.nama_sub_kegiatan || '-'}</div>
            </TableCell>
            <TableCell>
                <div className="flex flex-col gap-1.5 min-w-[160px]">
                    <div className="flex justify-between items-center">
                        <span
                            className={`text-xs font-bold ${
                                progress >= 100
                                    ? 'text-green-600'
                                    : progress >= 75
                                      ? 'text-emerald-500'
                                      : progress >= 50
                                        ? 'text-amber-500'
                                        : progress >= 25
                                          ? 'text-orange-500'
                                          : 'text-rose-500'
                            }`}
                        >
                            {progress.toFixed(2)}%
                        </span>
                    </div>
                    <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                progress >= 100
                                    ? 'bg-green-600'
                                    : progress >= 75
                                      ? 'bg-emerald-500'
                                      : progress >= 50
                                        ? 'bg-amber-500'
                                        : progress >= 25
                                          ? 'bg-orange-500'
                                          : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                </div>
            </TableCell>
            <TableCell>
                {item.pengawas?.nama ? (
                    <span className="text-sm">{item.pengawas.nama}</span>
                ) : (
                    <Badge variant="outline" className="text-xs">
                        Belum ada
                    </Badge>
                )}
            </TableCell>
            <TableCell className="text-right">
                <Button size="sm" asChild className="rounded-full font-semibold">
                    <Link to="/buat-laporan/$id" params={{ id: item.id.toString() }}>
                        <FileSpreadsheet className="mr-2 h-3.5 w-3.5" />
                        Buat Laporan
                    </Link>
                </Button>
            </TableCell>
        </TableRow>
    );
});

BuatLaporanRow.displayName = 'BuatLaporanRow';

export default function BuatLaporanList() {
    const [selectedKecamatan, setSelectedKecamatan] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { tahunAnggaran } = useAppSettingsValues();

    const { data: kecamatanRes } = useQuery({
        queryKey: ['kecamatan'],
        queryFn: () => getKecamatan(),
    });
    const kecamatanList = kecamatanRes?.data || [];

    const filters = useMemo(
        () => ({
            page: currentPage,
            kecamatan_id: selectedKecamatan === 'all' ? undefined : parseInt(selectedKecamatan),
            search: debouncedSearch || undefined,
            tahun: tahunAnggaran,
            summary: true,
        }),
        [currentPage, selectedKecamatan, debouncedSearch, tahunAnggaran],
    );

    const { data: pekerjaanRes, isLoading: loading } = useQuery({
        queryKey: ['buat-laporan-pekerjaan', filters],
        queryFn: () => getPekerjaan(filters),
    });

    const pekerjaanList = pekerjaanRes?.data || [];
    const totalPages = pekerjaanRes?.meta?.last_page || 1;
    const total = pekerjaanRes?.meta?.total || pekerjaanList.length;

    const handleSearch = (value: string) => {
        setDebouncedSearch(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <ListPageLayout
            shell
            title="Buat Laporan"
            description="Pilih pekerjaan untuk membuat atau memperbarui laporan progress fisik"
            cardTitle="Daftar Pekerjaan"
            toolbar={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput
                        defaultValue={debouncedSearch}
                        onSearch={handleSearch}
                        placeholder="Cari pekerjaan..."
                        className="w-full sm:max-w-sm"
                    />
                    <Select
                        value={selectedKecamatan}
                        onValueChange={(value) => {
                            setSelectedKecamatan(value);
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Filter Kecamatan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kecamatan</SelectItem>
                            {kecamatanList.map((kecamatan: { id: number; nama_kecamatan: string }) => (
                                <SelectItem key={kecamatan.id} value={kecamatan.id.toString()}>
                                    {kecamatan.nama_kecamatan}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            }
            footer={
                totalPages > 1 ? (
                    <ListPagination
                        page={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        disabled={loading}
                        meta={{
                            from: pekerjaanRes?.meta?.from,
                            to: pekerjaanRes?.meta?.to,
                            total,
                            label: 'pekerjaan',
                        }}
                    />
                ) : undefined
            }
        >
            {loading ? (
                <TableSkeleton columns={6} rows={8} />
            ) : pekerjaanList.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                    Tidak ada pekerjaan yang ditemukan.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 text-center">No</TableHead>
                                <TableHead>Nama Paket</TableHead>
                                <TableHead>Kegiatan</TableHead>
                                <TableHead>Progres</TableHead>
                                <TableHead>Pengawas</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pekerjaanList.map((item: any, index: number) => (
                                <BuatLaporanRow
                                    key={item.id}
                                    item={item}
                                    index={(pekerjaanRes?.meta?.from || 1) + index}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </ListPageLayout>
    );
}