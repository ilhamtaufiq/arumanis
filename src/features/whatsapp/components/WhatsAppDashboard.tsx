import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Settings } from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';
import MessageSender from './MessageSender';

export default function WhatsAppDashboard() {
    return (
        <>
            <Header />
            <Main>
                <div className="space-y-6">
                    {/* Page Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">WhatsApp</h1>
                        <p className="text-muted-foreground">
                            Kelola koneksi dan kirim pesan WhatsApp
                        </p>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="connection" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="connection" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Koneksi
                            </TabsTrigger>
                            <TabsTrigger value="send" className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Kirim Pesan
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="connection">
                            <ConnectionStatus />
                        </TabsContent>

                        <TabsContent value="send">
                            <MessageSender />
                        </TabsContent>
                    </Tabs>
                </div>
            </Main>
        </>
    );
}
