import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-stores';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TicketList from './TicketList';
import TicketForm from './TicketForm';
import type { Tiket } from '../types';

import { Route } from '@/routes/_authenticated/tiket/index';

export default function TiketPage() {
    const { ticketId } = Route.useSearch();
    const { auth } = useAuthStore();
    const isAdmin = auth.user?.roles?.includes('admin') || false;

    const [editingTiket, setEditingTiket] = useState<Tiket | null>(null);
    const [refreshTiket, setRefreshTiket] = useState(0);

    const handleTicketSuccess = () => {
        setEditingTiket(null);
        setRefreshTiket(prev => prev + 1);
    };

    return (
        <>
            <Header>
                <div className="flex items-center justify-between w-full">
                    <div>
                        <h1 className="text-2xl font-bold">Tiket & Laporan</h1>
                        <p className="text-muted-foreground">
                            {isAdmin
                                ? 'Kelola laporan bug dan permintaan dari pengawas lapangan'
                                : 'Laporkan kendala atau permintaan terkait pekerjaan Anda'}
                        </p>
                    </div>
                </div>
            </Header>

            <Main>
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    {isAdmin ? 'Semua Tiket' : 'Tiket Anda'}
                                </CardTitle>
                                <CardDescription>
                                    {isAdmin
                                        ? 'Daftar seluruh tiket yang masuk dari sistem.'
                                        : 'Daftar laporan yang telah Anda ajukan.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TicketList
                                    onEdit={setEditingTiket}
                                    refreshTrigger={refreshTiket}
                                    isAdmin={isAdmin}
                                    defaultTicketId={ticketId}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Main>
        </>
    );
}
