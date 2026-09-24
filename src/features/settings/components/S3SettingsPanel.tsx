import { useEffect, useState } from 'react';
import { Cloud, Eye, EyeOff, Key, Wifi, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
    useAppSettings,
    useUpdateAppSettings,
    getSettingValue,
    isSettingConfigured,
    testS3Connection,
    type AppSettingsFormData
} from '../api';
import { getApiErrorMessage } from '@/lib/api-error-message';

export function S3SettingsPanel() {
    const { data, isLoading } = useAppSettings();
    const updateMutation = useUpdateAppSettings();

    const [s3BackupEnabled, setS3BackupEnabled] = useState(false);
    const [s3Endpoint, setS3Endpoint] = useState('');
    const [s3Region, setS3Region] = useState('');
    const [s3Bucket, setS3Bucket] = useState('');
    const [s3AccessKeyId, setS3AccessKeyId] = useState('');
    const [s3SecretAccessKey, setS3SecretAccessKey] = useState('');
    const [s3SecretAccessKeyConfigured, setS3SecretAccessKeyConfigured] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionResult, setConnectionResult] = useState<{ ok: boolean; error?: string; used_stored_key?: boolean } | null>(null);

    useEffect(() => {
        if (!data?.data) return;

        setS3BackupEnabled(getSettingValue(data.data, 's3_backup_enabled') === '1');
        setS3Endpoint(getSettingValue(data.data, 's3_endpoint'));
        setS3Region(getSettingValue(data.data, 's3_region'));
        setS3Bucket(getSettingValue(data.data, 's3_bucket'));
        setS3AccessKeyId(getSettingValue(data.data, 's3_access_key_id'));
        setS3SecretAccessKeyConfigured(isSettingConfigured(data.data, 's3_secret_access_key'));
    }, [data]);

    const handleTestConnection = async () => {
        if (!s3Endpoint.trim() || !s3Region.trim() || !s3Bucket.trim() || !s3AccessKeyId.trim()) {
            setConnectionResult({ ok: false, error: 'Semua field wajib diisi untuk uji koneksi (kecuali secret key jika sudah tersimpan).' });
            return;
        }

        setTestingConnection(true);
        setConnectionResult(null);

        try {
            const result = await testS3Connection({
                s3_endpoint: s3Endpoint.trim(),
                s3_region: s3Region.trim(),
                s3_bucket: s3Bucket.trim(),
                s3_access_key_id: s3AccessKeyId.trim(),
                s3_secret_access_key: s3SecretAccessKey.trim() || undefined,
            });
            setConnectionResult(result);
        } catch (error) {
            console.error('Failed to test S3 connection:', error);
            setConnectionResult({ ok: false, error: getApiErrorMessage(error, 'Koneksi gagal') });
        } finally {
            setTestingConnection(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: AppSettingsFormData = {
            s3_backup_enabled: s3BackupEnabled ? '1' : '0',
            s3_endpoint: s3Endpoint.trim(),
            s3_region: s3Region.trim(),
            s3_bucket: s3Bucket.trim(),
            s3_access_key_id: s3AccessKeyId.trim(),
        };

        if (s3SecretAccessKey.trim()) {
            payload.s3_secret_access_key = s3SecretAccessKey;
        }

        try {
            await updateMutation.mutateAsync(payload);
            toast.success('Pengaturan S3 berhasil disimpan');
            if (s3SecretAccessKey.trim()) {
                setS3SecretAccessKeyConfigured(true);
                setS3SecretAccessKey('');
            }
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Gagal menyimpan pengaturan S3'));
            console.error(error);
        }
    };

    if (isLoading) {
        return null;
    }

    return (
        <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-primary" />
                        <h2 className="font-bold">S3 Backup Storage</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Simpan arsip backup langsung ke S3 bucket yang kompatibel (AWS S3, MinIO, Cloudflare R2, dll).
                    </p>
                </div>
                <Switch checked={s3BackupEnabled} onCheckedChange={setS3BackupEnabled} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-6">
                <div className="space-y-2">
                    <Label htmlFor="s3_endpoint">Endpoint URL</Label>
                    <Input
                        id="s3_endpoint"
                        value={s3Endpoint}
                        onChange={(e) => setS3Endpoint(e.target.value)}
                        placeholder="https://s3.amazonaws.com atau custom endpoint"
                        disabled={!s3BackupEnabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="s3_region">Region</Label>
                    <Input
                        id="s3_region"
                        value={s3Region}
                        onChange={(e) => setS3Region(e.target.value)}
                        placeholder="us-east-1, ap-southeast-3, dll."
                        disabled={!s3BackupEnabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="s3_bucket">Bucket Name</Label>
                    <Input
                        id="s3_bucket"
                        value={s3Bucket}
                        onChange={(e) => setS3Bucket(e.target.value)}
                        placeholder="arumanis-backups"
                        disabled={!s3BackupEnabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="s3_access_key_id">Access Key ID</Label>
                    <Input
                        id="s3_access_key_id"
                        value={s3AccessKeyId}
                        onChange={(e) => setS3AccessKeyId(e.target.value)}
                        placeholder="Masukkan Access Key ID"
                        disabled={!s3BackupEnabled}
                    />
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="s3_secret_access_key" className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Secret Access Key
                    </Label>
                    <div className="relative">
                        <Input
                            id="s3_secret_access_key"
                            type={showSecretKey ? 'text' : 'password'}
                            value={s3SecretAccessKey}
                            onChange={(e) => setS3SecretAccessKey(e.target.value)}
                            placeholder={
                                s3SecretAccessKeyConfigured && !s3SecretAccessKey
                                    ? 'Secret Access Key tersimpan — isi ulang hanya jika ingin mengganti'
                                    : 'Masukkan Secret Access Key'
                            }
                            className="pr-10"
                            disabled={!s3BackupEnabled}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowSecretKey(!showSecretKey)}
                            tabIndex={-1}
                            disabled={!s3BackupEnabled}
                        >
                            {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6 pt-4 border-t">
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={testingConnection || !s3BackupEnabled}
                        className="gap-2"
                    >
                        <Wifi className="h-4 w-4" />
                        {testingConnection ? 'Menguji...' : 'Uji Koneksi'}
                    </Button>
                    {connectionResult && (
                        <span className={`text-sm ${connectionResult.ok ? 'text-green-600' : 'text-destructive'}`}>
                            {connectionResult.ok
                                ? `Koneksi S3 OK${connectionResult.used_stored_key ? ' (pakai key tersimpan)' : ''}`
                                : `Koneksi gagal: ${connectionResult.error}`}
                        </span>
                    )}
                </div>

                <Button type="submit" disabled={updateMutation.isPending || !s3BackupEnabled} className="gap-2">
                    {updateMutation.isPending ? (
                        <>Menyimpan...</>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Simpan Pengaturan S3
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
