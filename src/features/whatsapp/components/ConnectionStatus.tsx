
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff, LogOut, Smartphone } from 'lucide-react';
import { useConnectWhatsapp, useLogoutWhatsapp, useWhatsappStatus } from '../hooks/useWhatsapp';

import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConnectionStatus() {
    const { data: status = null, isLoading: loading, refetch } = useWhatsappStatus(3000);
    const connectMutation = useConnectWhatsapp();
    const logoutMutation = useLogoutWhatsapp();

    const handleConnect = () => {
        connectMutation.mutate(undefined, {
            onSuccess: () => toast.success('Memulai koneksi WhatsApp...'),
            onError: () => toast.error('Gagal memulai koneksi'),
        });
    };

    const handleLogout = () => {
        logoutMutation.mutate(undefined, {
            onSuccess: () => toast.success('Berhasil logout dari WhatsApp'),
            onError: () => toast.error('Gagal logout'),
        });
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="space-y-6 py-12">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-40" />
                        <Skeleton className="h-10 w-24" />
                    </div>
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
                        <Button onClick={handleConnect} disabled={connectMutation.isPending}>
                            {connectMutation.isPending ? (
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
                    <Button variant="outline" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
