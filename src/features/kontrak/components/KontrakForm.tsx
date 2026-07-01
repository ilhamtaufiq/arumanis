import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearch, Link } from '@tanstack/react-router';
import { createKontrak, getPenyedia, updateKontrak } from '../api/kontrak';
import { useKontrakDetail } from '../hooks/useKontrak';
import type { Kontrak } from '../types';
import { getKegiatan } from '@/features/kegiatan/api/kegiatan';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';
import type { Kegiatan } from '@/features/kegiatan/types';
import type { Pekerjaan } from '@/features/pekerjaan/types';
import type { Penyedia } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { AsyncSearchableMultiSelect, type AsyncSearchableMultiSelectOption } from "@/components/ui/async-searchable-multi-select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Wallet, Calendar, FileText, Briefcase, Building2, CheckCircle2 } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { Separator } from '@/components/ui/separator';

export default function KontrakForm() {
    const params = useParams({ strict: false });
    const id = params.id;
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false });
    const isEdit = !!id;
    const { tahunAnggaran } = useAppSettingsValues();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        kode_rup: '',
        kode_paket: '',
        nomor_penawaran: '',
        tanggal_penawaran: '',
        nilai_kontrak: 0,
        tgl_sppbj: '',
        tgl_spk: '',
        tgl_spmk: '',
        tgl_selesai: '',
        sppbj: '',
        spk: '',
        spmk: '',
        id_kegiatan: 0,
        pekerjaan_ids: [] as number[],
        id_penyedia: 0,
        is_checklist_complete: false,
    });
    const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
    const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([]);
    const [penyediaList, setPenyediaList] = useState<Penyedia[]>([]);
    const [selectedPekerjaanOptions, setSelectedPekerjaanOptions] = useState<AsyncSearchableMultiSelectOption[]>([]);
    const [loadingReference, setLoadingReference] = useState(false);

    const { data: kontrakRes, isLoading: loadingKontrak, isError: kontrakError } = useKontrakDetail(
        parseInt(id || '0'),
        isEdit && !!id,
    );

    useEffect(() => {
        const fetchReferenceData = async () => {
            try {
                setLoadingReference(true);

                const [penyediaRes, kegiatanRes, pekerjaanRes] = await Promise.all([
                    getPenyedia(),
                    getKegiatan(isEdit ? {} : { tahun: tahunAnggaran }),
                    getPekerjaan({ per_page: 10, tahun: tahunAnggaran }),
                ]);

                setPenyediaList(penyediaRes.data);
                setKegiatanList(kegiatanRes.data);
                setPekerjaanList(prev => {
                    const merged = [...pekerjaanRes.data];
                    prev.forEach(p => {
                        if (!merged.some(m => m.id === p.id)) {
                            merged.push(p);
                        }
                    });
                    return merged;
                });

                if (!isEdit) {
                    // @ts-ignore
                    const pekerjaanIdParam = searchParams.pekerjaan_id;
                    if (pekerjaanIdParam) {
                        const pId = parseInt(pekerjaanIdParam);
                        const pek = pekerjaanRes.data.find((p: Pekerjaan) => p.id === pId);

                        setFormData(prev => ({
                            ...prev,
                            pekerjaan_ids: [pId],
                            id_kegiatan: pek?.kegiatan_id || 0
                        }));

                        if (pek) {
                            setSelectedPekerjaanOptions([{ value: pId.toString(), label: pek.nama_paket }]);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch reference data:', error);
                toast.error('Gagal memuat data');
            } finally {
                setLoadingReference(false);
            }
        };

        if (isEdit || tahunAnggaran) {
            fetchReferenceData();
        }
    }, [isEdit, tahunAnggaran, searchParams]);

    useEffect(() => {
        if (!isEdit || !kontrakRes) return;

        const response = kontrakRes as { data: Kontrak };
        const data = response.data;

        if (data.pekerjaans && data.pekerjaans.length > 0) {
            const options: AsyncSearchableMultiSelectOption[] = [];

            setPekerjaanList(prev => {
                const newPekerjaanList = [...prev];
                data.pekerjaans!.forEach((p: Pekerjaan) => {
                    if (!newPekerjaanList.some(np => np.id === p.id)) {
                        newPekerjaanList.push(p);
                    }
                    options.push({ value: p.id.toString(), label: p.nama_paket });
                });
                return newPekerjaanList;
            });
            setSelectedPekerjaanOptions(options);
        }

        setFormData({
            kode_rup: data.kode_rup || '',
            kode_paket: data.kode_paket || '',
            nomor_penawaran: data.nomor_penawaran || '',
            tanggal_penawaran: data.tanggal_penawaran || '',
            nilai_kontrak: data.nilai_kontrak || 0,
            tgl_sppbj: data.tgl_sppbj || '',
            tgl_spk: data.tgl_spk || '',
            tgl_spmk: data.tgl_spmk || '',
            tgl_selesai: data.tgl_selesai || '',
            sppbj: data.sppbj || '',
            spk: data.spk || '',
            spmk: data.spmk || '',
            id_kegiatan: Number(data.kegiatan?.id) || 0,
            pekerjaan_ids: data.pekerjaans?.map((p: Pekerjaan) => Number(p.id)) || [],
            id_penyedia: Number(data.penyedia?.id) || 0,
            is_checklist_complete: data.is_checklist_complete || false,
        });
    }, [isEdit, kontrakRes]);

    useEffect(() => {
        if (kontrakError) {
            console.error('Failed to fetch kontrak');
            toast.error('Gagal memuat data');
            navigate({ to: '/kontrak' });
        }
    }, [kontrakError, navigate]);

    const loading = loadingReference || (isEdit && loadingKontrak);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'nilai_kontrak' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: parseInt(value) || 0,
        }));
    };

    const getSelectValue = (value: any) => {
        if (value === 0 || value === '0' || value === null || value === undefined || value === '') {
            return undefined;
        }
        return value.toString();
    };

    // Server-side search for pekerjaan
    const searchPekerjaan = async (query: string) => {
        try {
            const response = await getPekerjaan({
                per_page: 20,
                tahun: tahunAnggaran,
                search: query
            });
            
            // Sync fetched list so we can access kegiatan_id later
            setPekerjaanList(prev => {
                const newItems = [...prev];
                response.data.forEach((p: Pekerjaan) => {
                    if (!newItems.some(existing => existing.id === p.id)) {
                        newItems.push(p);
                    }
                });
                return newItems;
            });

            return response.data.map((pek: Pekerjaan) => ({
                value: pek.id.toString(),
                label: pek.nama_paket,
            }));
        } catch (error) {
            console.error('Search pekerjaan error:', error);
            return [];
        }
    };

    const createMutation = useMutation({
        mutationKey: ['kontrak', 'create'],
        mutationFn: createKontrak,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kontrak'] });
            toast.success('Kontrak berhasil ditambahkan');
            navigate({ to: '/kontrak' });
        },
        onError: () => toast.error('Gagal menambahkan kontrak'),
    });

    const updateMutation = useMutation({
        mutationKey: ['kontrak', 'update'],
        mutationFn: ({ id, data }: { id: number; data: typeof formData }) => updateKontrak(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kontrak'] });
            toast.success('Kontrak berhasil diperbarui');
            navigate({ to: '/kontrak' });
        },
        onError: () => toast.error('Gagal memperbarui kontrak'),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.pekerjaan_ids.length === 0 || !formData.id_penyedia) {
            toast.error('Pekerjaan dan Penyedia harus dipilih');
            return;
        }

        if (isEdit && id) {
            updateMutation.mutate({ id: parseInt(id), data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <PageContainer>
            <div className="w-full space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                            <Link to="/kontrak">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {isEdit ? 'Edit Kontrak' : 'Kontrak Baru'}
                            </h1>
                            <p className="text-muted-foreground">
                                {isEdit ? 'Perbarui informasi kontrak dan legalitas paket' : 'Input data kontrak dan pemenang penyedia'}
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-card rounded-xl border border-dashed border-muted">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                        <p className="text-muted-foreground font-medium">Menghubungkan data kontrak...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Section: General & Relation */}
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2 text-primary mb-1">
                                            <Briefcase className="w-5 h-5" />
                                            <CardTitle className="text-lg">Koneksi Paket</CardTitle>
                                        </div>
                                        <CardDescription>Hubungkan kontrak dengan paket pekerjaan dan kegiatan</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Paket Pekerjaan <span className="text-red-500">*</span></Label>
                                            <AsyncSearchableMultiSelect
                                                initialOptions={pekerjaanList.map((pek) => ({
                                                    value: pek.id.toString(),
                                                    label: pek.nama_paket,
                                                }))}
                                                onSearch={searchPekerjaan}
                                                values={formData.pekerjaan_ids.map(id => id.toString())}
                                                selectedOptions={selectedPekerjaanOptions}
                                                onValuesChange={(vals, options) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        pekerjaan_ids: vals.map(v => parseInt(v))
                                                    }));
                                                    setSelectedPekerjaanOptions(options);
                                                    
                                                    // Automatically sync activity from the first selected pekerjaan
                                                    if (vals.length > 0) {
                                                        const firstOptionId = vals[0];
                                                        // Important to use a functional state update if relying on current state 
                                                        // or just directly from the known updated pekerjaanList reference
                                                        const option = pekerjaanList.find(p => p.id.toString() === firstOptionId);
                                                        if (option && option.kegiatan_id) {
                                                            handleSelectChange('id_kegiatan', option.kegiatan_id.toString());
                                                        }
                                                    } else {
                                                        handleSelectChange('id_kegiatan', '0');
                                                    }
                                                }}
                                                placeholder="Cari & Pilih Paket Pekerjaan"
                                                searchPlaceholder="Ketik nama paket..."
                                                // @ts-ignore
                                                disabled={!!searchParams.pekerjaan_id}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Penyedia / Pelaksana <span className="text-red-500">*</span></Label>
                                                <SearchableSelect
                                                    options={penyediaList.map((pen) => ({
                                                        value: pen.id.toString(),
                                                        label: pen.nama,
                                                    }))}
                                                    value={getSelectValue(formData.id_penyedia)}
                                                    onValueChange={(val) => handleSelectChange('id_penyedia', val)}
                                                    placeholder="Pilih Penyedia"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Sub Kegiatan (Otomatis)</Label>
                                                <Select
                                                    value={formData.id_kegiatan ? formData.id_kegiatan.toString() : '0'}
                                                    onValueChange={(val) => handleSelectChange('id_kegiatan', val)}
                                                    disabled={true}
                                                >
                                                    <SelectTrigger className="bg-slate-50 cursor-not-allowed text-slate-500">
                                                        <SelectValue placeholder="Pilih Kegiatan (Opsional)" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0" className="italic text-muted-foreground">Tanpa Kegiatan</SelectItem>
                                                        <Separator className="my-1" />
                                                        {kegiatanList.map((keg) => (
                                                            <SelectItem key={keg.id} value={keg.id.toString()}>
                                                                {keg.nama_sub_kegiatan}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Section: Legalitas & Penawaran */}
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2 text-primary mb-1">
                                            <FileText className="w-5 h-5" />
                                            <CardTitle className="text-lg">Legalitas & Penawaran</CardTitle>
                                        </div>
                                        <CardDescription>Informasi dokumen pengadaan dan penawaran</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Kode RUP (Sirup)</Label>
                                                <Input
                                                    id="kode_rup"
                                                    name="kode_rup"
                                                    value={formData.kode_rup}
                                                    onChange={handleChange}
                                                    placeholder="Contoh: 34567890"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Kode Paket (LPSE)</Label>
                                                <Input
                                                    id="kode_paket"
                                                    name="kode_paket"
                                                    value={formData.kode_paket}
                                                    onChange={handleChange}
                                                    placeholder="Contoh: 12345678"
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Nomor Surat Penawaran</Label>
                                                <Input
                                                    id="nomor_penawaran"
                                                    name="nomor_penawaran"
                                                    value={formData.nomor_penawaran}
                                                    onChange={handleChange}
                                                    placeholder="No. Surat dari Penyedia"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tanggal Penawaran</Label>
                                                <Input
                                                    id="tanggal_penawaran"
                                                    name="tanggal_penawaran"
                                                    type="date"
                                                    value={formData.tanggal_penawaran}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Section: Timeline */}
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2 text-primary mb-1">
                                            <Calendar className="w-5 h-5" />
                                            <CardTitle className="text-lg">Timeline Kontrak</CardTitle>
                                        </div>
                                        <CardDescription>Penetapan tanggal-tanggal penting pelaksanaan</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-muted">
                                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Penerbitan SPPBJ</Label>
                                                <Input type="date" name="tgl_sppbj" value={formData.tgl_sppbj} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-muted">
                                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Penandatanganan SPK</Label>
                                                <Input type="date" name="tgl_spk" value={formData.tgl_spk} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                                <Label className="text-[10px] font-bold uppercase text-primary/70">Mulai Kerja (SPMK) <span className="text-red-500">*</span></Label>
                                                <Input type="date" name="tgl_spmk" value={formData.tgl_spmk} onChange={handleChange} />
                                            </div>
                                            <div className="space-y-2 p-3 bg-orange-500/5 rounded-lg border border-orange-500/20">
                                                <Label className="text-[10px] font-bold uppercase text-orange-500/70">Target Selesai <span className="text-red-500">*</span></Label>
                                                <Input type="date" name="tgl_selesai" value={formData.tgl_selesai} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-8">
                                {/* Section: Financials */}
                                <Card className="shadow-sm border-t-4 border-t-primary">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2 text-primary mb-1">
                                            <Wallet className="w-5 h-5" />
                                            <CardTitle className="text-lg">Nilai Kontrak</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Total Nilai Kontrak (Rp)</Label>
                                            <CurrencyInput
                                                id="nilai_kontrak"
                                                name="nilai_kontrak"
                                                value={formData.nilai_kontrak}
                                                onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
                                                className="text-xl font-bold h-12"
                                            />
                                            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                                Masukkan nilai penawaran terkoreksi atau nilai yang tertera pada dokumen kontrak.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Section: Admin Info */}
                                <Card className="shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-2 text-primary mb-1">
                                            <Building2 className="w-5 h-5" />
                                            <CardTitle className="text-lg">Administrasi</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nomor SPPBJ</Label>
                                            <Input name="sppbj" value={formData.sppbj} onChange={handleChange} placeholder="No. SPPBJ" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nomor SPK / Kontrak</Label>
                                            <Input name="spk" value={formData.spk} onChange={handleChange} placeholder="No. Kontrak" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nomor SPMK</Label>
                                            <Input name="spmk" value={formData.spmk} onChange={handleChange} placeholder="No. SPMK" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Submission */}
                                <div className="bg-primary/5 rounded-xl p-6 border border-primary/10 space-y-4 sticky top-24">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-sm">Validasi Data</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Pastikan nomor dokumen dan tanggal sudah sesuai dengan fisik kontrak yang ditandatangani.
                                            </p>
                                        </div>
                                    </div>
                                    <Separator className="bg-primary/10" />
                                    <div className="flex flex-col gap-2">
                                        <Button 
                                            type="submit" 
                                            disabled={loading || createMutation.isPending || updateMutation.isPending}
                                            className="w-full h-12 text-md font-bold shadow-lg"
                                        >
                                            {(loading || createMutation.isPending || updateMutation.isPending) ? (
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            ) : (
                                                <Save className="mr-2 h-5 w-5" />
                                            )}
                                            {isEdit ? 'Simpan Perubahan' : 'Terbitkan Kontrak'}
                                        </Button>
                                        <Button variant="ghost" type="button" className="w-full text-muted-foreground" onClick={() => navigate({ to: '/kontrak' })}>
                                            Batalkan
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </PageContainer>
    );
}
