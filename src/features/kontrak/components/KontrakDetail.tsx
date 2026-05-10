import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from '@tanstack/react-router';
import { getKontrakById, exportKontrakDoc, exportKontrakRingkasan } from '../api/kontrak';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    Calendar, 
    FileText, 
    User, 
    MapPin, 
    Briefcase, 
    Building2, 
    Clock, 
    ArrowLeft, 
    Pencil,
    Download,
    CheckCircle2,
    AlertCircle,
    Info,
    History
} from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { formatCurrency } from '@/lib/format';

const DetailItem = ({ icon: Icon, label, value, className = "" }: { icon: any, label: string, value: string | React.ReactNode, className?: string }) => (
    <div className={`flex items-start gap-3 py-3 border-b border-border/50 last:border-0 ${className}`}>
        <div className="mt-1 bg-primary/10 p-2 rounded-lg">
            <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            <span className="text-sm font-semibold text-foreground leading-relaxed">{value || '-'}</span>
        </div>
    </div>
);

export default function KontrakDetail() {
    const { id } = useParams({ strict: false });
    
    const { data: response, isLoading, error } = useQuery({
        queryKey: ['kontrak', id],
        queryFn: () => getKontrakById(Number(id)),
    });

    const kontrak = response?.data;

    const handleExport = async (type: 'spk' | 'ringkasan') => {
        if (!kontrak?.is_checklist_complete) {
            toast.error("Checklist pekerjaan belum 100% lengkap bos!");
            return;
        }

        const toastId = toast.loading(`Generating ${type.toUpperCase()}...`);
        try {
            const blob = type === 'spk' 
                ? await exportKontrakDoc(kontrak.id)
                : await exportKontrakRingkasan(kontrak.id);
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type.toUpperCase()}_${kontrak.pekerjaan?.nama_paket?.replace(/\s+/g, '_')}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success(`${type.toUpperCase()} berhasil digenerate`, { id: toastId });
        } catch (err) {
            toast.error(`Gagal generate ${type.toUpperCase()}`, { id: toastId });
        }
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    if (isLoading) return (
        <>
            <Header />
            <Main>
                <div className="space-y-6">
                    <Skeleton className="h-8 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-[400px] col-span-2" />
                        <Skeleton className="h-[400px]" />
                    </div>
                </div>
            </Main>
        </>
    );

    if (error || !kontrak) return (
        <>
            <Header />
            <Main>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                    <h2 className="text-xl font-bold">Kontrak Tidak Ditemukan</h2>
                    <p className="text-muted-foreground mb-6">Data kontrak mungkin sudah dihapus atau ID tidak valid.</p>
                    <Button asChild variant="outline">
                        <Link to="/kontrak">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Daftar
                        </Link>
                    </Button>
                </div>
            </Main>
        </>
    );

    return (
        <>
            <Header />
            <Main>
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="sm" className="-ml-2 h-8">
                                <Link to="/kontrak">
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Kembali
                                </Link>
                            </Button>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                {kontrak.pekerjaan?.kegiatan?.tahun_anggaran}
                            </Badge>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                            Detail Kontrak
                        </h1>
                        <Link 
                            to="/pekerjaan/$id" 
                            params={{ id: kontrak.id_pekerjaan.toString() }}
                            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 text-sm"
                        >
                            <Briefcase className="w-4 h-4" />
                            {kontrak.pekerjaan?.nama_paket}
                        </Link>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link to="/kontrak/$id/edit" params={{ id: id?.toString() || "" }}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Data
                            </Link>
                        </Button>
                        <Button onClick={() => handleExport('spk')} size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Cetak SPK
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Info Utama */}
                        <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
                                <div className="flex items-center gap-2 text-primary font-semibold">
                                    <Info className="w-5 h-5" />
                                    <span>Informasi Pekerjaan & Anggaran</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    <div className="p-6 border-r border-border/40 space-y-1">
                                        <DetailItem icon={Briefcase} label="Nama Paket Pekerjaan" value={kontrak.pekerjaan?.nama_paket} />
                                        <DetailItem icon={FileText} label="Kode Rekening" value={kontrak.pekerjaan?.kode_rekening} />
                                        <DetailItem icon={MapPin} label="Lokasi" value={`${kontrak.pekerjaan?.desa?.nama_desa}, Kec. ${kontrak.pekerjaan?.kecamatan?.nama_kecamatan}`} />
                                    </div>
                                    <div className="p-6 space-y-1">
                                        <DetailItem icon={Building2} label="Kegiatan" value={kontrak.pekerjaan?.kegiatan?.nama_kegiatan} />
                                        <DetailItem icon={History} label="Tahun Anggaran" value={kontrak.pekerjaan?.kegiatan?.tahun_anggaran} />
                                        <DetailItem 
                                            icon={Clock} 
                                            label="Status Checklist" 
                                            value={
                                                <div className="flex items-center gap-2">
                                                    {kontrak.is_checklist_complete ? (
                                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                                            Lengkap (100%)
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                                            <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                                                            Belum Lengkap
                                                        </Badge>
                                                    )}
                                                </div>
                                            } 
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Detail Kontrak */}
                        <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
                                <div className="flex items-center gap-2 text-primary font-semibold">
                                    <FileText className="w-5 h-5" />
                                    <span>Detail Kontrak & SPK</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                                    <DetailItem icon={FileText} label="Nomor SPK" value={kontrak.spk || kontrak.kode_paket} />
                                    <DetailItem icon={Calendar} label="Tanggal SPK" value={formatDate(kontrak.tgl_spk)} />
                                    <DetailItem icon={FileText} label="Nomor SPMK" value={kontrak.spmk} />
                                    <DetailItem icon={Calendar} label="Tanggal SPMK" value={formatDate(kontrak.tgl_spmk)} />
                                    <DetailItem icon={Calendar} label="Tanggal Selesai" value={formatDate(kontrak.tgl_selesai)} />
                                    <DetailItem 
                                        icon={Clock} 
                                        label="Durasi Pelaksanaan" 
                                        value={(() => {
                                            if (!kontrak.tgl_spmk || !kontrak.tgl_selesai) return '-';
                                            const start = new Date(kontrak.tgl_spmk);
                                            const end = new Date(kontrak.tgl_selesai);
                                            const diff = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                            return `${diff} Hari Kalender`;
                                        })()} 
                                    />
                                    <div className="md:col-span-2 pt-4 mt-4 border-t border-border/40">
                                        <div className="bg-primary/5 rounded-2xl p-6 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-primary uppercase tracking-widest">Nilai Kontrak</span>
                                                <h2 className="text-2xl md:text-3xl font-black text-primary">
                                                    {formatCurrency(kontrak.nilai_kontrak || 0)}
                                                </h2>
                                            </div>
                                            <div className="hidden md:block">
                                                <Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold">
                                                    Penyedia Terpilih
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Info Penyedia */}
                        <Card className="border-primary/20 shadow-lg shadow-primary/5 overflow-hidden">
                            <CardHeader className="bg-primary/5 border-b border-primary/10">
                                <CardTitle className="text-base flex items-center gap-2 text-primary">
                                    <User className="w-5 h-5" />
                                    Penyedia Jasa
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-1">
                                <div className="mb-4 pb-4 border-b border-border/50">
                                    <h3 className="text-lg font-bold text-foreground leading-snug">
                                        {kontrak.penyedia?.nama}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                        {kontrak.penyedia?.alamat}
                                    </p>
                                </div>
                                <DetailItem icon={User} label="Direktur" value={kontrak.penyedia?.direktur} />
                                <DetailItem icon={FileText} label="Nomor Akta" value={kontrak.penyedia?.no_akta} />
                                <DetailItem icon={Building2} label="Bank" value={`${kontrak.penyedia?.bank} - ${kontrak.penyedia?.norek}`} />
                                
                                <div className="mt-6 pt-6">
                                    <Button asChild variant="outline" className="w-full justify-start text-xs h-9">
                                        <Link to="/penyedia">
                                            <Info className="w-3.5 h-3.5 mr-2" />
                                            Daftar Penyedia
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Aksi Cepat */}
                        <Card className="border-border/40 shadow-sm overflow-hidden">
                            <CardHeader className="py-4">
                                <CardTitle className="text-sm">Dokumen Tersedia</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-2">
                                <Button 
                                    variant="secondary" 
                                    className="w-full justify-between h-11 text-sm font-medium"
                                    onClick={() => handleExport('spk')}
                                >
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                        Surat Perjanjian (SPK)
                                    </div>
                                    <Download className="w-4 h-4 opacity-50" />
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    className="w-full justify-between h-11 text-sm font-medium"
                                    onClick={() => handleExport('ringkasan')}
                                >
                                    <div className="flex items-center">
                                        <ClipboardList className="w-4 h-4 mr-2 text-green-600" />
                                        Ringkasan Kontrak
                                    </div>
                                    <Download className="w-4 h-4 opacity-50" />
                                </Button>
                                <p className="text-[10px] text-muted-foreground text-center mt-4 italic">
                                    *Dokumen hanya dapat dicetak jika checklist pekerjaan lengkap
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Main>
        </>
    );
}

// Reuse some icons we need
const ClipboardList = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <path d="M12 11h4"/>
        <path d="M12 16h4"/>
        <path d="M8 11h.01"/>
        <path d="M8 16h.01"/>
    </svg>
);
