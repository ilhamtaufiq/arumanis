import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-stores';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import UsulanKegiatanList from './UsulanKegiatanList';
import UsulanKegiatanForm from './UsulanKegiatanForm';
import type { UsulanKegiatan } from '../types';

export default function UsulanKegiatanPage() {
    const { auth } = useAuthStore();
    const isAdmin = auth.user?.roles?.includes('admin') || false;

    const [editingUsulan, setEditingUsulan] = useState<UsulanKegiatan | null>(null);
    const [refreshUsulan, setRefreshUsulan] = useState(0);

    const handleSuccess = () => {
        setEditingUsulan(null);
        setRefreshUsulan(prev => prev + 1);
    };

    return (
        <>
            <Header>
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-2xl font-bold">Usulan Kegiatan</h1>
                        <p className="text-muted-foreground">
                            {isAdmin
                                ? 'Kelola daftar usulan kegiatan dari berbagai pengusul.'
                                : 'Ajukan dan pantau usulan kegiatan untuk sub bidang Air Minum atau Sanitasi.'}
                        </p>
                    </div>
                </div>
            </Header>

            <Main>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <UsulanKegiatanForm
                            initialData={editingUsulan}
                            onSuccess={handleSuccess}
                            onCancel={() => setEditingUsulan(null)}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    {isAdmin ? 'Semua Usulan Kegiatan' : 'Daftar Usulan Anda'}
                                </CardTitle>
                                <CardDescription>
                                    {isAdmin
                                        ? 'Daftar usulan pembangunan yang masuk dari sistem.'
                                        : 'Daftar riwayat usulan yang telah Anda ajukan sebelumnya.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UsulanKegiatanList
                                    onEdit={setEditingUsulan}
                                    refreshTrigger={refreshUsulan}
                                    isAdmin={isAdmin}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Main>
        </>
    );
}
