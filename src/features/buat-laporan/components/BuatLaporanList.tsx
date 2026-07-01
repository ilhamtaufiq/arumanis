import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SearchInput } from '@/components/shared/SearchInput'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { ListPageLayout } from '@/components/shared/ListPageLayout'
import { ListPagination } from '@/components/shared/ListPagination'
import { useBuatLaporanList } from '../hooks/useBuatLaporanList'
import { BuatLaporanRow } from './BuatLaporanRow'

export default function BuatLaporanList() {
    const {
        kecamatanList,
        desaList,
        pengawasList,
        pekerjaanList,
        pekerjaanRes,
        isLoading,
        currentPage,
        setCurrentPage,
        selectedKecamatan,
        selectedDesa,
        selectedPengawas,
        debouncedSearch,
        handleSearch,
        handleKecamatanChange,
        handleDesaChange,
        handlePengawasChange,
    } = useBuatLaporanList()

    const totalPages = pekerjaanRes?.meta?.last_page || 1
    const total = pekerjaanRes?.meta?.total || pekerjaanList.length

    return (
        <ListPageLayout
            shell
            title="Buat Laporan"
            description="Pilih pekerjaan untuk membuat atau memperbarui laporan progress fisik"
            cardTitle="Daftar Pekerjaan"
            toolbar={
                <SearchInput
                    defaultValue={debouncedSearch}
                    onSearch={handleSearch}
                    placeholder="Cari pekerjaan..."
                    className="w-full sm:max-w-sm"
                />
            }
            footer={
                totalPages > 1 ? (
                    <ListPagination
                        page={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        disabled={isLoading}
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
            <div className="mb-4 space-y-4">
                <div className="rounded-lg border bg-muted/20 p-3 sm:p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Filter
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <label className="flex min-w-0 flex-col gap-1.5">
                            <span className="text-sm text-muted-foreground">Kecamatan</span>
                            <Select value={selectedKecamatan} onValueChange={handleKecamatanChange}>
                                <SelectTrigger className="w-full bg-background">
                                    <SelectValue placeholder="Semua Kecamatan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kecamatan</SelectItem>
                                    {kecamatanList.map((kecamatan) => (
                                        <SelectItem
                                            key={kecamatan.id}
                                            value={kecamatan.id.toString()}
                                        >
                                            {kecamatan.nama_kecamatan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </label>

                        <label className="flex min-w-0 flex-col gap-1.5">
                            <span className="text-sm text-muted-foreground">Desa</span>
                            <Select
                                value={selectedDesa}
                                onValueChange={handleDesaChange}
                                disabled={selectedKecamatan === 'all'}
                            >
                                <SelectTrigger className="w-full bg-background">
                                    <SelectValue
                                        placeholder={
                                            selectedKecamatan === 'all'
                                                ? 'Pilih kecamatan dulu'
                                                : 'Semua Desa'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Desa</SelectItem>
                                    {desaList.map((desa) => (
                                        <SelectItem key={desa.id} value={desa.id.toString()}>
                                            {desa.nama_desa}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </label>

                        <label className="flex min-w-0 flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
                            <span className="text-sm text-muted-foreground">Pengawas</span>
                            <Select value={selectedPengawas} onValueChange={handlePengawasChange}>
                                <SelectTrigger className="w-full bg-background">
                                    <SelectValue placeholder="Semua Pengawas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Pengawas</SelectItem>
                                    {pengawasList.map((pengawas) => (
                                        <SelectItem
                                            key={pengawas.id}
                                            value={pengawas.id.toString()}
                                        >
                                            {pengawas.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </label>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground px-0.5">
                    Diurutkan progres laporan terendah dulu pada halaman ini.
                </p>
            </div>

            {isLoading ? (
                <TableSkeleton columns={7} rows={8} />
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
                                <TableHead>Status</TableHead>
                                <TableHead>Progres Laporan</TableHead>
                                <TableHead>Pengawas</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pekerjaanList.map((item, index) => (
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
    )
}