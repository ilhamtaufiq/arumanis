import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Wifi, WifiOff, LogOut, Smartphone } from 'lucide-react'
import { connectSession, getSessionStatus, logoutSession } from '../api'
import type { WhatsAppStatus } from '../types'
import { toast } from 'sonner'

export default function ConnectionStatus() {
    const [status, setStatus] = useState<WhatsAppStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [connecting, setConnecting] = useState(false)

    const fetchStatus = useCallback(async () => {
        try {
            const data = await getSessionStatus()
            setStatus(data)
        } catch (error) {
            console.error('Failed to get status:', error)
            setStatus({
                status: 'disconnected',
                qrCode: null,
                connectedNumber: null,
                lastError: error instanceof Error ? error.message : 'Bridge tidak terjangkau',
            })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void fetchStatus()
        const interval = setInterval(() => {
            void fetchStatus()
        }, 3000)
        return () => clearInterval(interval)
    }, [fetchStatus])

    const handleConnect = async () => {
        setConnecting(true)
        try {
            await connectSession()
            toast.success('Memulai koneksi WhatsApp...')
            await fetchStatus()
        } catch {
            toast.error(
                'Gagal memulai koneksi. Pastikan bridge Baileys berjalan (bun run whatsapp:bridge).',
            )
        } finally {
            setConnecting(false)
        }
    }

    const handleLogout = async () => {
        try {
            await logoutSession()
            toast.success('Berhasil logout dari WhatsApp')
            await fetchStatus()
        } catch {
            toast.error('Gagal logout')
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Status Koneksi WhatsApp
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    {status?.status === 'connected' ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                            <Wifi className="mr-1 h-3 w-3" />
                            Terhubung
                        </Badge>
                    ) : status?.status === 'connecting' ? (
                        <Badge variant="secondary" className="animate-pulse">
                            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                            Menghubungkan...
                        </Badge>
                    ) : (
                        <Badge variant="destructive">
                            <WifiOff className="mr-1 h-3 w-3" />
                            Tidak Terhubung
                        </Badge>
                    )}
                </div>

                {status?.connectedNumber && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Nomor:</span>
                        <span className="font-mono font-medium">+{status.connectedNumber}</span>
                    </div>
                )}

                {status?.lastError && (
                    <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                        {status.lastError}
                    </p>
                )}

                {status?.status === 'connecting' && status.qrCode && (
                    <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6">
                        <p className="text-center text-sm text-muted-foreground">
                            Scan QR code ini dengan WhatsApp di HP Anda
                        </p>
                        <img src={status.qrCode} alt="WhatsApp QR Code" className="h-64 w-64" />
                        <p className="text-xs text-muted-foreground">QR code akan otomatis refresh</p>
                    </div>
                )}

                <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    Bridge Baileys: <code>bun run whatsapp:bridge</code> (port 4000). Sesi disimpan di{' '}
                    <code>data/whatsapp-auth</code>. API Laravel mem-proxy request admin ke bridge.
                </div>

                <div className="flex flex-wrap gap-2">
                    {status?.status === 'disconnected' && (
                        <Button onClick={handleConnect} disabled={connecting}>
                            {connecting ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Wifi className="mr-2 h-4 w-4" />
                            )}
                            Hubungkan WhatsApp
                        </Button>
                    )}
                    {status?.status === 'connected' && (
                        <Button variant="destructive" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => void fetchStatus()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
