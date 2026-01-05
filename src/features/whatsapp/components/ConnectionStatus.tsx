import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff, LogOut, Smartphone } from 'lucide-react';
import { getSessionStatus, connectSession, logoutSession } from '../api';
import type { WhatsAppStatus } from '../types';
import { toast } from 'sonner';

export default function ConnectionStatus() {
    const [status, setStatus] = useState<WhatsAppStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);

    const fetchStatus = async () => {
        try {
            const data = await getSessionStatus();
            setStatus(data);
        } catch (error) {
            console.error('Failed to get status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        // Poll status every 3 seconds when connecting
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleConnect = async () => {
        setConnecting(true);
        try {
            await connectSession();
            toast.success('Memulai koneksi WhatsApp...');
            fetchStatus();
        } catch (error) {
            toast.error('Gagal memulai koneksi');
        } finally {
            setConnecting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutSession();
            toast.success('Berhasil logout dari WhatsApp');
            fetchStatus();
        } catch (error) {
            toast.error('Gagal logout');
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
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
                {/* Status Badge */}
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    {status?.status === 'connected' ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                            <Wifi className="h-3 w-3 mr-1" />
                            Terhubung
                        </Badge>
                    ) : status?.status === 'connecting' ? (
                        <Badge variant="secondary" className="animate-pulse">
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Menghubungkan...
                        </Badge>
                    ) : (
                        <Badge variant="destructive">
                            <WifiOff className="h-3 w-3 mr-1" />
                            Tidak Terhubung
                        </Badge>
                    )}
                </div>

                {/* Connected Number */}
                {status?.connectedNumber && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Nomor:</span>
                        <span className="font-mono font-medium">+{status.connectedNumber}</span>
                    </div>
                )}

                {/* QR Code */}
                {status?.status === 'connecting' && status.qrCode && (
                    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg">
                        <p className="text-sm text-muted-foreground text-center">
                            Scan QR code ini dengan WhatsApp di HP Anda
                        </p>
                        <img
                            src={status.qrCode}
                            alt="WhatsApp QR Code"
                            className="w-64 h-64"
                        />
                        <p className="text-xs text-muted-foreground">
                            QR code akan otomatis refresh
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    {status?.status === 'disconnected' && (
                        <Button onClick={handleConnect} disabled={connecting}>
                            {connecting ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Wifi className="h-4 w-4 mr-2" />
                            )}
                            Hubungkan WhatsApp
                        </Button>
                    )}
                    {status?.status === 'connected' && (
                        <Button variant="destructive" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    )}
                    <Button variant="outline" onClick={fetchStatus}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
