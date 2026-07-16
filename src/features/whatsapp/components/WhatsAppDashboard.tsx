import PageContainer from '@/components/layout/page-container'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Settings, Wand2 } from 'lucide-react'
import ConnectionStatus from './ConnectionStatus'
import MessageSender from './MessageSender'
import TemplateSender from './TemplateSender'

export default function WhatsAppDashboard() {
    return (
        <PageContainer
            pageTitle="WhatsApp"
            pageDescription="Bridge Baileys — koneksi, kirim manual, dan template notifikasi operasional."
        >
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
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                        <Wand2 className="h-4 w-4" />
                        Template
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="connection">
                    <ConnectionStatus />
                </TabsContent>

                <TabsContent value="send">
                    <MessageSender />
                </TabsContent>

                <TabsContent value="templates">
                    <TemplateSender />
                </TabsContent>
            </Tabs>
        </PageContainer>
    )
}
