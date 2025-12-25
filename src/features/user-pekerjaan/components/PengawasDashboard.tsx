import { useQuery } from '@tanstack/react-query';
import {
    Briefcase,
    MapPin,
    Calendar,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth-stores';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import api from '@/lib/api-client';

interface Pekerjaan {
    id: number;
    nama_paket: string;
    pagu: number;
    kecamatan?: { nama: string };
    desa?: { nama: string };
    kegiatan?: { nama_sub_kegiatan: string };
    assignment_sources?: string[];
    kontrak?: Array<{
        tgl_spmk: string;
        tgl_selesai: string;
    }>;
}

export function PengawasDashboard() {
    const { auth } = useAuthStore();
    const userId = auth.user?.id;

    const { data: assignedPekerjaan = [], isLoading } = useQuery({
        queryKey: ['my-assigned-pekerjaan', userId],
        queryFn: async () => {
            const response = await api.get<{ data: Pekerjaan[] }>('/pekerjaan');
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

    return (
        <>
            <Header>
                <div>
                    <h1 className="text-2xl font-bold">
                        Selamat Datang, {auth.user?.name}!
                    </h1>
                    <p className="text-muted-foreground">
                        Berikut adalah pekerjaan yang di-assign kepada Anda
                    </p>
                </div>
            </Header>
            <Main>
                <div className="space-y-6">
                    {/* Pekerjaan List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Pekerjaan Saya
                            </CardTitle>
                            <CardDescription>
                                Pekerjaan yang di-assign untuk Anda awasi
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-24 w-full" />
                                    ))}
                                </div>
                            ) : assignedPekerjaan.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Belum ada pekerjaan yang di-assign ke Anda</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {assignedPekerjaan.map((pekerjaan: Pekerjaan) => (
                                        <Card key={pekerjaan.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-lg truncate">
                                                                {pekerjaan.nama_paket}
                                                            </h3>
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
                                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-4 w-4" />
                                                                {pekerjaan.kecamatan?.nama} - {pekerjaan.desa?.nama}
                                                            </span>
                                                            {pekerjaan.kontrak?.[0] && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4" />
                                                                    {new Date(pekerjaan.kontrak[0].tgl_spmk).toLocaleDateString('id-ID')} - {new Date(pekerjaan.kontrak[0].tgl_selesai).toLocaleDateString('id-ID')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm mt-1 text-muted-foreground">
                                                            {pekerjaan.kegiatan?.nama_sub_kegiatan}
                                                        </p>
                                                        <p className="font-medium text-primary mt-2">
                                                            {formatCurrency(pekerjaan.pagu || 0)}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button asChild variant="outline" size="sm">
                                                            <a href={`/pekerjaan/${pekerjaan.id}`}>
                                                                <FileText className="h-4 w-4 mr-1" />
                                                                Detail
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Main>
        </>
    );
}
