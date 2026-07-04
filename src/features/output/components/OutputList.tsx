import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';
import type { Pekerjaan } from '@/features/pekerjaan/types';
import {
    createOutput,
    deleteOutput,
    getOutput,
    updateOutput,
} from '../api/output';
import type { Output } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { cn } from '@/lib/utils';
import {
    ArrowRight,
    CheckCircle2,
    FileText,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Save,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { toast } from 'sonner';

type OutputFormData = {
    pekerjaan_id: number;
    komponen: string;
    satuan: string;
    volume: number;
    penerima_is_optional: boolean;
};

const emptyForm = (pekerjaanId: number): OutputFormData => ({
    pekerjaan_id: pekerjaanId,
    komponen: '',
    satuan: '',
    volume: 0,
    penerima_is_optional: false,
});

function formatLocation(pekerjaan: Pekerjaan) {
    return [pekerjaan.kecamatan?.nama_kecamatan, pekerjaan.desa?.nama_desa].filter(Boolean).join(' / ') || 'Lokasi belum tersedia';
}

export default function OutputList() {
    const queryClient = useQueryClient();
    const { tahunAnggaran } = useAppSettingsValues();
    const [search, setSearch] = useState('');
    const [selectedPekerjaanId, setSelectedPekerjaanId] = useState<number | null>(null);
    const [editingOutput, setEditingOutput] = useState<Output | null>(null);
    const [formData, setFormData] = useState<OutputFormData>(emptyForm(0));

    const pekerjaanQuery = useQuery({
        queryKey: ['pekerjaan', 'output-flow', tahunAnggaran],
        queryFn: async () => {
            const response = await getPekerjaan({
                per_page: -1,
                tahun: tahunAnggaran,
                sort_by: 'nama_paket',
                sort_direction: 'asc',
            });
            return response.data;
        },
    });

    const pekerjaanList = useMemo(() => pekerjaanQuery.data ?? [], [pekerjaanQuery.data]);

    useEffect(() => {
        if (!selectedPekerjaanId && pekerjaanList.length > 0) {
            setSelectedPekerjaanId(pekerjaanList[0].id);
        }
    }, [pekerjaanList, selectedPekerjaanId]);

    const selectedPekerjaan = useMemo(
        () => pekerjaanList.find((pekerjaan) => pekerjaan.id === selectedPekerjaanId) ?? null,
        [pekerjaanList, selectedPekerjaanId],
    );

    useEffect(() => {
        if (!selectedPekerjaanId) return;

        if (editingOutput) {
            setFormData({
                pekerjaan_id: selectedPekerjaanId,
                komponen: editingOutput.komponen,
                satuan: editingOutput.satuan,
                volume: editingOutput.volume,
                penerima_is_optional: editingOutput.penerima_is_optional,
            });
            return;
        }

        setFormData(emptyForm(selectedPekerjaanId));
    }, [editingOutput, selectedPekerjaanId]);

    const outputQuery = useQuery({
        queryKey: ['output', { pekerjaan_id: selectedPekerjaanId }],
        enabled: !!selectedPekerjaanId,
        queryFn: async () => {
            const response = await getOutput({ pekerjaan_id: selectedPekerjaanId ?? undefined });
            return response.data;
        },
    });

    const filteredPekerjaan = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return pekerjaanList;

        return pekerjaanList.filter((pekerjaan) =>
            [
                pekerjaan.nama_paket,
                pekerjaan.kecamatan?.nama_kecamatan,
                pekerjaan.desa?.nama_desa,
                pekerjaan.kegiatan?.nama_kegiatan,
            ]
                .filter(Boolean)
                .some((value) => value?.toLowerCase().includes(keyword)),
        );
    }, [pekerjaanList, search]);

    const outputList = outputQuery.data ?? [];
    const totalVolume = outputList.reduce((total, output) => total + Number(output.volume || 0), 0);

    const saveMutation = useMutation({
        mutationFn: (data: OutputFormData) => {
            if (editingOutput) {
                return updateOutput(editingOutput.id, data);
            }
            return createOutput(data);
        },
        onSuccess: () => {
            toast.success(editingOutput ? 'Output berhasil diperbarui' : 'Output berhasil ditambahkan');
            queryClient.invalidateQueries({ queryKey: ['output'] });
            setEditingOutput(null);
            if (selectedPekerjaanId) {
                setFormData(emptyForm(selectedPekerjaanId));
            }
        },
        onError: () => toast.error('Gagal menyimpan output'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteOutput(id),
        onSuccess: () => {
            toast.success('Output berhasil dihapus');
            queryClient.invalidateQueries({ queryKey: ['output'] });
        },
        onError: () => toast.error('Gagal menghapus output'),
    });

    const handleSelectPekerjaan = (pekerjaanId: number) => {
        setSelectedPekerjaanId(pekerjaanId);
        setEditingOutput(null);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'volume' ? Number.parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedPekerjaanId) {
            toast.error('Pilih paket pekerjaan terlebih dahulu');
            return;
        }

        if (!formData.komponen.trim()) {
            toast.error('Silakan isi komponen');
            return;
        }

        if (!formData.satuan.trim()) {
            toast.error('Silakan isi satuan');
            return;
        }

        saveMutation.mutate({
            ...formData,
            pekerjaan_id: selectedPekerjaanId,
        });
    };

    return (
        <>
            <Header />
            <Main>
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Output Pekerjaan</h1>
                        <p className="text-muted-foreground">
                            Isi data output berdasarkan nama paket pekerjaan{tahunAnggaran ? ` tahun ${tahunAnggaran}` : ''}.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link to="/pekerjaan">
                            Lihat Pekerjaan
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Paket tersedia</p>
                                <p className="text-2xl font-bold">{pekerjaanList.length.toLocaleString('id-ID')}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Output paket terpilih</p>
                                <p className="text-2xl font-bold">{outputList.length.toLocaleString('id-ID')}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <RefreshCw className="h-5 w-5 text-sky-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total volume</p>
                                <p className="text-2xl font-bold">{totalVolume.toLocaleString('id-ID')}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                    <Card className="lg:sticky lg:top-20 lg:self-start">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Pilih Paket
                            </CardTitle>
                            <CardDescription>Cari berdasarkan nama paket, kecamatan, atau desa.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari nama paket..."
                            />

                            <ScrollArea className="h-[520px] pr-3">
                                {pekerjaanQuery.isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                                    </div>
                                ) : filteredPekerjaan.length === 0 ? (
                                    <div className="py-12 text-center text-sm text-muted-foreground">
                                        Paket pekerjaan tidak ditemukan.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredPekerjaan.map((pekerjaan) => (
                                            <button
                                                key={pekerjaan.id}
                                                type="button"
                                                onClick={() => handleSelectPekerjaan(pekerjaan.id)}
                                                className={cn(
                                                    'w-full rounded-md border p-3 text-left transition-colors hover:bg-muted',
                                                    selectedPekerjaanId === pekerjaan.id && 'border-primary bg-primary/5',
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 space-y-1">
                                                        <p className="line-clamp-2 text-sm font-semibold leading-snug">
                                                            {pekerjaan.nama_paket}
                                                        </p>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {formatLocation(pekerjaan)}
                                                        </p>
                                                    </div>
                                                    {selectedPekerjaanId === pekerjaan.id && (
                                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <CardTitle>{selectedPekerjaan?.nama_paket ?? 'Paket belum dipilih'}</CardTitle>
                                        <CardDescription>
                                            {selectedPekerjaan ? formatLocation(selectedPekerjaan) : 'Pilih paket di panel kiri untuk mulai mengisi output.'}
                                        </CardDescription>
                                    </div>
                                    {selectedPekerjaan && (
                                        <Badge variant="outline" className="w-fit">
                                            ID #{selectedPekerjaan.id}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>

                        <Card className={editingOutput ? 'border-primary' : ''}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {editingOutput ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                    {editingOutput ? 'Edit Output Paket' : 'Tambah Output Paket'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="komponen">Komponen *</Label>
                                        <Select
                                            value={formData.komponen}
                                            onValueChange={(value) => setFormData((prev) => ({ ...prev, komponen: value }))}
                                            disabled={!selectedPekerjaanId || saveMutation.isPending}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih komponen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Sambungan Rumah">Sambungan Rumah</SelectItem>
                                                <SelectItem value="MCK">MCK</SelectItem>
                                                <SelectItem value="MCK Individu">MCK Individu</SelectItem>
                                                <SelectItem value="MCK Komunal">MCK Komunal</SelectItem>
                                                <SelectItem value="Pipa">Pipa</SelectItem>
                                                <SelectItem value="Kran Umum">Kran Umum</SelectItem>
                                                <SelectItem value="Hidran Umum">Hidran Umum</SelectItem>
                                                <SelectItem value="Broncaptering">Broncaptering</SelectItem>
                                                <SelectItem value="Reservoir">Reservoir</SelectItem>
                                                <SelectItem value="Tangki Septik Individu">Tangki Septik Individu</SelectItem>
                                                <SelectItem value="Tangki Septik Komunal">Tangki Septik Komunal</SelectItem>
                                                <SelectItem value="Sumur Bor">Sumur Bor</SelectItem>
                                                <SelectItem value="Pompa">Pompa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="satuan">Satuan *</Label>
                                            <Select
                                                value={formData.satuan}
                                                onValueChange={(value) => setFormData((prev) => ({ ...prev, satuan: value }))}
                                                disabled={!selectedPekerjaanId || saveMutation.isPending}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih satuan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Unit">Unit</SelectItem>
                                                    <SelectItem value="Meter">Meter</SelectItem>
                                                    <SelectItem value="Meter Persegi">Meter Persegi</SelectItem>
                                                    <SelectItem value="Meter Kubik">Meter Kubik</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="volume">Volume *</Label>
                                            <Input
                                                id="volume"
                                                name="volume"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.volume}
                                                onChange={handleChange}
                                                required
                                                disabled={!selectedPekerjaanId || saveMutation.isPending}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="penerima_is_optional"
                                            checked={formData.penerima_is_optional}
                                            disabled={!selectedPekerjaanId || saveMutation.isPending}
                                            onCheckedChange={(checked) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    penerima_is_optional: checked === true,
                                                }))
                                            }
                                        />
                                        <Label htmlFor="penerima_is_optional" className="text-sm font-medium">
                                            Komponen komunal
                                        </Label>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        {editingOutput && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setEditingOutput(null)}
                                                disabled={saveMutation.isPending}
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                Batal
                                            </Button>
                                        )}
                                        <Button type="submit" disabled={!selectedPekerjaanId || saveMutation.isPending}>
                                            {saveMutation.isPending ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="mr-2 h-4 w-4" />
                                            )}
                                            {saveMutation.isPending ? 'Menyimpan...' : editingOutput ? 'Update Output' : 'Simpan Output'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Data Output Paket
                                </CardTitle>
                                <CardDescription>Daftar output untuk paket pekerjaan yang sedang dipilih.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {outputQuery.isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : outputList.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <FileText className="mx-auto mb-3 h-10 w-10 opacity-30" />
                                        <p>Belum ada output untuk paket ini.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Komponen</TableHead>
                                                    <TableHead>Satuan</TableHead>
                                                    <TableHead className="text-right">Volume</TableHead>
                                                    <TableHead>Jenis</TableHead>
                                                    <TableHead className="text-right">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {outputList.map((output) => (
                                                    <TableRow key={output.id}>
                                                        <TableCell className="font-medium">{output.komponen}</TableCell>
                                                        <TableCell>{output.satuan}</TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {Number(output.volume).toLocaleString('id-ID')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={output.penerima_is_optional ? 'secondary' : 'outline'}>
                                                                {output.penerima_is_optional ? 'Komunal' : 'Penerima wajib'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setEditingOutput(output)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button type="button" variant="ghost" size="icon">
                                                                            <Trash2 className="h-4 w-4" />
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
                                                                            <AlertDialogAction onClick={() => deleteMutation.mutate(output.id)}>
                                                                                Hapus
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Main>
        </>
    );
}
