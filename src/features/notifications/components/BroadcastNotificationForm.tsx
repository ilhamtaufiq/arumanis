import { History, Send } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBroadcastHistory } from '../hooks/useNotifications'
import { BroadcastHero } from './BroadcastHero'
import { BroadcastForm } from './BroadcastForm'
import { BroadcastHistoryList } from './BroadcastHistoryList'

export default function BroadcastNotificationForm() {
    const { data: historyData, isLoading } = useBroadcastHistory(1)
    const history = historyData?.history?.data ?? []

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Broadcast Notifikasi</h1>
                <p className="text-sm text-muted-foreground">
                    Kirim pengumuman ke user dan pantau riwayat broadcast yang telah dikirim.
                </p>
            </div>

            <BroadcastHero history={history} isLoading={isLoading} />

            <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1">
                    <TabsTrigger value="create" className="gap-2">
                        <Send className="h-4 w-4" />
                        Kirim Broadcast
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2">
                        <History className="h-4 w-4" />
                        Riwayat
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="mt-6">
                    <BroadcastForm />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <BroadcastHistoryList />
                </TabsContent>
            </Tabs>
        </div>
    )
}