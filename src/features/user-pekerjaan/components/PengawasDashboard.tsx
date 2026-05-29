import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Briefcase,
    MapPin,
    Calendar,
    FileText,
    MessageSquare,
    ClipboardList,
    Plus,
    Droplet,
    Sparkles,
    Wrench
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from '@/stores/auth-stores';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import api from '@/lib/api-client';
import { submitKontrakAddendum } from '@/features/kontrak/api/kontrak';
import TicketList from '@/features/tiket/components/TicketList';
import TicketForm from '@/features/tiket/components/TicketForm';
import type { Tiket } from '@/features/tiket/types';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Pekerjaan {
    id: number;
    nama_paket: string;
    pagu: number;
    kecamatan?: { nama: string };
    desa?: { nama: string };
    kegiatan?: { nama_sub_kegiatan: string; sub_bidang?: string };
    assignment_sources?: string[];
    kontrak?: Array<{
        id: number;
        tgl_spmk: string;
        tgl_selesai: string;
        addendums?: Array<{
            id: number;
            addendum_ke: number;
            nomor_addendum: string | null;
            status: 'draft' | 'diajukan' | 'disetujui' | 'ditolak';
        }>;
    }>;
}

const requiredAddendumAttachments = [
    { key: 'surat_permohonan', label: 'Surat Permohonan' },
    { key: 'surat_undangan_pembahasan', label: 'Surat Undangan Pembahasan' },
    { key: 'risalah_rapat_pembahasan', label: 'Risalah Rapat Pembahasan' },
    { key: 'surat_perintah_pelaksanaan_kerja_sesuai_addendum', label: 'Surat Perintah Pelaksanaan Kerja Sesuai Addendum' },
    { key: 'cco', label: 'CCO', accept: '.pdf,.xls,.xlsx' },
    { key: 'laporan_pekerjaan', label: 'Laporan Pekerjaan' },
    { key: 'berita_acara', label: 'Berita Acara' },
    { key: 'sk_peneliti_kontrak', label: 'SK Peneliti Kontrak' },
];

export function PengawasDashboard() {
    const queryClient = useQueryClient();
    const { auth } = useAuthStore();
    const userId = auth.user?.id;
    const isAdmin = auth.user?.roles?.includes('admin') || false;

    const [editingTiket, setEditingTiket] = useState<Tiket | null>(null);
    const [addendumTarget, setAddendumTarget] = useState<Pekerjaan | null>(null);
    const [addendumForm, setAddendumForm] = useState({
        tanggal_addendum: new Date().toISOString().slice(0, 10),
        alasan: '',
        deskripsi_perubahan: '',
        attachments: {} as Record<string, File | undefined>,
    });
    const [refreshTiket, setRefreshTiket] = useState(0);
    const [activeTab, setActiveTab] = useState('pekerjaan');

    const { tahunAnggaran } = useAppSettingsValues();
    const { data: assignedPekerjaan = [], isLoading } = useQuery({
        queryKey: ['my-assigned-pekerjaan', userId, tahunAnggaran],
        queryFn: async () => {
            const response = await api.get<{ data: Pekerjaan[] }>('/pekerjaan', {
                params: { tahun: tahunAnggaran }
            });
            return response.data;
        },
        enabled: !!userId,
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const handleTicketSuccess = () => {
        setEditingTiket(null);
        setRefreshTiket(prev => prev + 1);
    };

    const submitAddendumMutation = useMutation({
        mutationFn: (id: number) => submitKontrakAddendum(id),
        onSuccess: () => {
            toast.success('Addendum berhasil diajukan');
            queryClient.invalidateQueries({ queryKey: ['my-assigned-pekerjaan'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Gagal mengajukan addendum');
        },
    });

    const createAndSubmitAddendumMutation = useMutation({
        mutationFn: async () => {
            const kontrak = addendumTarget?.kontrak?.[0];

            if (!kontrak) {
                throw new Error('Pekerjaan ini belum memiliki kontrak');
            }

            const nextAddendumKe = (kontrak.addendums || [])
                .reduce((max, addendum) => Math.max(max, addendum.addendum_ke), 0) + 1;

            const formData = new FormData();
            formData.append('addendum_ke', String(nextAddendumKe));
            formData.append('tanggal_addendum', addendumForm.tanggal_addendum);
            formData.append('jenis_addendum', 'lainnya');
            formData.append('alasan', addendumForm.alasan);
            formData.append('deskripsi_perubahan', addendumForm.deskripsi_perubahan);

            requiredAddendumAttachments.forEach((attachment) => {
                const file = addendumForm.attachments[attachment.key];
                if (file) {
                    formData.append(`attachments[${attachment.key}]`, file);
                }
            });

            const response = await api.post<{ data: { id: number } }>(`/kontrak/${kontrak.id}/addendums`, formData);

            await submitKontrakAddendum(response.data.id);
        },
        onSuccess: () => {
            toast.success('Pengajuan addendum berhasil dikirim');
            setAddendumTarget(null);
            setAddendumForm({
                tanggal_addendum: new Date().toISOString().slice(0, 10),
                alasan: '',
                deskripsi_perubahan: '',
                attachments: {},
            });
            queryClient.invalidateQueries({ queryKey: ['my-assigned-pekerjaan'] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Gagal mengajukan addendum');
        },
    });

    // Aggregate key metrics dynamically for the summary dashboard widgets
    const totalPagu = assignedPekerjaan.reduce((acc, p) => acc + (p.pagu || 0), 0);
    
    // Count tasks per category
    let airMinumCount = 0;
    let sanitasiCount = 0;
    
    assignedPekerjaan.forEach((pekerjaan) => {
        const subBidang = pekerjaan.kegiatan?.sub_bidang;
        const textToAnalyze = `${pekerjaan.nama_paket} ${pekerjaan.kegiatan?.nama_sub_kegiatan || ''}`.toLowerCase();
        
        if (subBidang === 'Air Minum' || textToAnalyze.includes('water meter') || textToAnalyze.includes('air minum') || textToAnalyze.includes('spam')) {
            airMinumCount++;
        } else if (subBidang === 'Sanitasi' || textToAnalyze.includes('sanitasi') || textToAnalyze.includes('limbah') || textToAnalyze.includes('mck') || textToAnalyze.includes('toilet')) {
            sanitasiCount++;
        }
    });

    return (
        <>
            <Header>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Selamat Datang, {auth.user?.name}!
                        </h1>
                        <p className="text-muted-foreground">
                            Panel kontrol pengawasan infrastruktur
                        </p>
                    </div>
                    {activeTab === 'tiket' && !editingTiket && (
                        <Button onClick={() => setActiveTab('pekerjaan')} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" /> Buat dari Pekerjaan
                        </Button>
                    )}
                </div>
            </Header>
            <Main>
                {/* Executive Summary Stats Card */}
                <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-muted mb-6 bg-card">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                            
                            {/* Primary Metric: Total Pagu */}
                            <div className="space-y-2 border-b lg:border-b-0 lg:border-r border-muted pb-4 lg:pb-0 pr-0 lg:pr-6">
                                <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground">Total Pagu Anggaran</span>
                                <div className="text-3xl font-black tracking-tight text-primary leading-none">
                                    {formatCurrency(totalPagu)}
                                </div>
                                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                                    Dalam pengawasan aktif ({assignedPekerjaan.length} Paket)
                                </p>
                            </div>

                            {/* Secondary Metrics & Visual Distribution */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground">Distribusi Sub-Bidang</span>
                                    <span className="text-xs font-semibold text-primary">{assignedPekerjaan.length} Total Paket</span>
                                </div>

                                {/* Custom Multi-segment Progress Bar */}
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                                    {assignedPekerjaan.length > 0 ? (
                                        <>
                                            {airMinumCount > 0 && (
                                                <div 
                                                    style={{ width: `${(airMinumCount / assignedPekerjaan.length) * 100}%` }}
                                                    className="bg-sky-500 h-full transition-all duration-500"
                                                    title={`Air Minum: ${airMinumCount} Paket`}
                                                />
                                            )}
                                            {sanitasiCount > 0 && (
                                                <div 
                                                    style={{ width: `${(sanitasiCount / assignedPekerjaan.length) * 100}%` }}
                                                    className="bg-emerald-500 h-full transition-all duration-500"
                                                    title={`Sanitasi: ${sanitasiCount} Paket`}
                                                />
                                            )}
                                            {assignedPekerjaan.length - airMinumCount - sanitasiCount > 0 && (
                                                <div 
                                                    style={{ width: `${((assignedPekerjaan.length - airMinumCount - sanitasiCount) / assignedPekerjaan.length) * 100}%` }}
                                                    className="bg-purple-500 h-full transition-all duration-500"
                                                    title={`Lainnya: ${assignedPekerjaan.length - airMinumCount - sanitasiCount} Paket`}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full bg-muted h-full" />
                                    )}
                                </div>

                                {/* Legend with Metrics */}
                                <div className="flex flex-wrap gap-x-6 gap-y-2">
                                    <div className="flex items-center gap-2 text-xs font-medium">
                                        <div className="w-3 h-3 rounded-full bg-sky-500 shrink-0" />
                                        <span className="text-muted-foreground">Air Minum:</span>
                                        <span className="font-bold text-foreground">{airMinumCount} Paket</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                                        <span className="text-muted-foreground">Sanitasi:</span>
                                        <span className="font-bold text-foreground">{sanitasiCount} Paket</span>
                                    </div>
                                    {assignedPekerjaan.length - airMinumCount - sanitasiCount > 0 && (
                                        <div className="flex items-center gap-2 text-xs font-medium">
                                            <div className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                                            <span className="text-muted-foreground">Lainnya:</span>
                                            <span className="font-bold text-foreground">{assignedPekerjaan.length - airMinumCount - sanitasiCount} Paket</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="pekerjaan" className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Pekerjaan
                        </TabsTrigger>
                        <TabsTrigger value="tiket" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Tiket & Laporan
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pekerjaan" className="space-y-6 mt-0">
                        <Card className="shadow-sm border-t-2 border-t-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-primary" />
                                    Daftar Pekerjaan
                                </CardTitle>
                                <CardDescription>
                                    Pekerjaan yang di-assign untuk Anda awasi. Gunakan tombol tiket di setiap item untuk melapor kendala.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <Card key={i} className="animate-pulse border border-muted bg-card">
                                                <CardContent className="p-5 flex flex-col gap-4">
                                                    <div className="flex justify-between items-center w-full">
                                                        <Skeleton className="h-6 w-1/3 rounded" />
                                                        <Skeleton className="h-5 w-16 rounded-full" />
                                                    </div>
                                                    <Skeleton className="h-4 w-2/3 rounded" />
                                                    <div className="flex gap-4">
                                                        <Skeleton className="h-4 w-1/4 rounded" />
                                                        <Skeleton className="h-4 w-1/4 rounded" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : assignedPekerjaan.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground bg-muted/20 border border-dashed border-muted rounded-xl">
                                        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground/60" />
                                        <p className="font-semibold text-sm">Belum ada pekerjaan yang ditugaskan</p>
                                        <p className="text-xs text-muted-foreground mt-1">Silakan hubungi admin untuk melakukan penugasan pengawas.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {assignedPekerjaan.map((pekerjaan: Pekerjaan) => {
                                            // Dynamic theme borders & sub-bidang tags
                                            const subBidang = pekerjaan.kegiatan?.sub_bidang;
                                            const textToAnalyze = `${pekerjaan.nama_paket} ${pekerjaan.kegiatan?.nama_sub_kegiatan || ''}`.toLowerCase();
                                            
                                            const isAirMinum = subBidang === 'Air Minum' || textToAnalyze.includes('water meter') || textToAnalyze.includes('air minum') || textToAnalyze.includes('spam');
                                            const isSanitasi = subBidang === 'Sanitasi' || textToAnalyze.includes('sanitasi') || textToAnalyze.includes('limbah') || textToAnalyze.includes('mck') || textToAnalyze.includes('toilet');
                                            const pendingAddendum = pekerjaan.kontrak
                                                ?.flatMap((kontrak) => kontrak.addendums || [])
                                                .find((addendum) => addendum.status === 'draft' || addendum.status === 'ditolak');

                                            let borderStyle = "border-l-[#6366f1] hover:border-l-[#4f46e5]";
                                            let subBidangBadge = null;

                                             if (isAirMinum) {
                                                borderStyle = "border-l-[#0284c7] hover:border-l-[#0369a1]";
                                                subBidangBadge = (
                                                    <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100 hover:bg-sky-200 border-none flex items-center gap-1 text-[10px] font-bold">
                                                        <Droplet className="w-3 h-3" /> Air Minum
                                                    </Badge>
                                                );
                                            } else if (isSanitasi) {
                                                borderStyle = "border-l-[#16a34a] hover:border-l-[#15803d]";
                                                subBidangBadge = (
                                                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 hover:bg-emerald-200 border-none flex items-center gap-1 text-[10px] font-bold">
                                                        <Sparkles className="w-3 h-3" /> Sanitasi
                                                    </Badge>
                                                );
                                            } else {
                                                subBidangBadge = (
                                                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 hover:bg-purple-200 border-none flex items-center gap-1 text-[10px] font-bold">
                                                        <Wrench className="w-3 h-3" /> Infrastruktur
                                                    </Badge>
                                                );
                                            }

                                            return (
                                                <Card 
                                                    key={pekerjaan.id} 
                                                    className={`hover:shadow-md hover:-translate-y-[2px] transition-all duration-300 group border border-muted border-l-4 ${borderStyle}`}
                                                >
                                                    <CardContent className="p-5">
                                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                    {subBidangBadge}
                                                                    <div className="flex gap-1">
                                                                        {pekerjaan.assignment_sources?.includes('manual') && (
                                                                            <Badge variant="outline" className="text-[10px] h-5 bg-blue-50 text-blue-700 border-blue-200">
                                                                                Manual
                                                                            </Badge>
                                                                        )}
                                                                        {pekerjaan.assignment_sources?.includes('role') && (
                                                                            <Badge variant="outline" className="text-[10px] h-5 bg-purple-50 text-purple-700 border-purple-200">
                                                                                Role
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
                                                                    {pekerjaan.nama_paket}
                                                                </h3>
                                                                
                                                                <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-3 flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                                                                    {pekerjaan.kegiatan?.nama_sub_kegiatan}
                                                                </p>

                                                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t border-muted/65 pt-3">
                                                                    <span className="flex items-center gap-1">
                                                                        <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                                                        {pekerjaan.kecamatan?.nama} — {pekerjaan.desa?.nama}
                                                                    </span>
                                                                    {pekerjaan.kontrak?.[0] && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                                                                            {new Date(pekerjaan.kontrak[0].tgl_spmk).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} — {new Date(pekerjaan.kontrak[0].tgl_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                        </span>
                                                                    )}
                                                                    {pendingAddendum && (
                                                                        <span className="flex items-center gap-1">
                                                                            <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                                                            Addendum ke-{pendingAddendum.addendum_ke} siap diajukan
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row md:flex-col justify-between gap-4 shrink-0 md:items-end border-t md:border-t-0 border-muted pt-3 md:pt-0">
                                                                <div className="md:text-right">
                                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Nilai Pagu</span>
                                                                    <p className="font-extrabold text-primary text-md leading-none mt-1">
                                                                        {formatCurrency(pekerjaan.pagu || 0)}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="secondary"
                                                                        size="sm"
                                                                        className="font-medium text-xs shadow-sm"
                                                                        onClick={() => {
                                                                            setEditingTiket({
                                                                                pekerjaan_id: pekerjaan.id,
                                                                                subjek: `Kendala: ${pekerjaan.nama_paket}`,
                                                                                pekerjaan: pekerjaan
                                                                            } as any);
                                                                            setActiveTab('tiket');
                                                                        }}
                                                                    >
                                                                        <MessageSquare className="h-3.5 w-3.5 mr-1 text-primary shrink-0" />
                                                                        Lapor Tiket
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="font-medium text-xs shadow-sm"
                                                                        disabled={!pekerjaan.kontrak?.[0] || submitAddendumMutation.isPending || createAndSubmitAddendumMutation.isPending}
                                                                        onClick={() => {
                                                                            if (pendingAddendum) {
                                                                                submitAddendumMutation.mutate(pendingAddendum.id);
                                                                                return;
                                                                            }

                                                                            setAddendumTarget(pekerjaan);
                                                                        }}
                                                                        title={pekerjaan.kontrak?.[0] ? 'Ajukan addendum kontrak' : 'Pekerjaan ini belum memiliki kontrak'}
                                                                    >
                                                                        <FileText className="h-3.5 w-3.5 mr-1 shrink-0" />
                                                                        Ajukan Addendum
                                                                    </Button>
                                                                    <Button asChild variant="outline" size="sm" className="font-medium text-xs shadow-sm">
                                                                        <a href={`/pekerjaan/${pekerjaan.id}`}>
                                                                            <FileText className="h-3.5 w-3.5 mr-1 shrink-0" />
                                                                            Detail
                                                                        </a>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tiket" className="space-y-6 mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 space-y-6">
                                <TicketForm
                                    initialData={editingTiket}
                                    onSuccess={handleTicketSuccess}
                                    onCancel={() => setEditingTiket(null)}
                                    isAdmin={isAdmin}
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Daftar Tiket Anda</CardTitle>
                                        <CardDescription>
                                            Status laporan bug atau kendala teknis pekerjaan yang Anda ajukan.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <TicketList
                                            onEdit={setEditingTiket}
                                            refreshTrigger={refreshTiket}
                                            isAdmin={isAdmin}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </Main>

            <Dialog open={!!addendumTarget} onOpenChange={(open) => !open && setAddendumTarget(null)}>
                <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] flex-col overflow-hidden sm:max-w-[960px]">
                    <DialogHeader>
                        <DialogTitle>Ajukan Addendum Kontrak</DialogTitle>
                        <DialogDescription>
                            Pengajuan akan dikirim untuk pekerjaan {addendumTarget?.nama_paket}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
                        <div className="space-y-2">
                            <Label>Tanggal Addendum</Label>
                            <Input
                                type="date"
                                value={addendumForm.tanggal_addendum}
                                onChange={(event) => setAddendumForm((current) => ({
                                    ...current,
                                    tanggal_addendum: event.target.value,
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Alasan</Label>
                            <Textarea
                                value={addendumForm.alasan}
                                onChange={(event) => setAddendumForm((current) => ({
                                    ...current,
                                    alasan: event.target.value,
                                }))}
                                placeholder="Jelaskan alasan pengajuan addendum"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Deskripsi Perubahan</Label>
                            <Textarea
                                value={addendumForm.deskripsi_perubahan}
                                onChange={(event) => setAddendumForm((current) => ({
                                    ...current,
                                    deskripsi_perubahan: event.target.value,
                                }))}
                                placeholder="Ringkas perubahan yang diajukan"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label>Lampiran Wajib</Label>
                            <div className="grid grid-cols-1 gap-3">
                                {requiredAddendumAttachments.map((attachment) => (
                                    <div key={attachment.key} className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground">{attachment.label}</Label>
                                        <Input
                                            type="file"
                                            accept={attachment.accept || '.pdf'}
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                setAddendumForm((current) => ({
                                                    ...current,
                                                    attachments: {
                                                        ...current.attachments,
                                                        [attachment.key]: file,
                                                    },
                                                }));
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t pt-4">
                        <Button variant="outline" onClick={() => setAddendumTarget(null)}>
                            Batal
                        </Button>
                        <Button
                            disabled={
                                createAndSubmitAddendumMutation.isPending ||
                                requiredAddendumAttachments.some((attachment) => !addendumForm.attachments[attachment.key])
                            }
                            onClick={() => createAndSubmitAddendumMutation.mutate()}
                        >
                            Kirim Pengajuan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
