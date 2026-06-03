import { useState, useEffect, useRef } from 'react';
import { useAppSettings, useUpdateAppSettings, getSettingValue } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, Upload, Image, FileImage, Calendar, Layout } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { ChatProviderId } from '../constants/ai-providers';
import {
    CHAT_PROVIDER_OPTIONS,
    CHAT_PROVIDER_SELECTION_OPTIONS,
    DEFAULT_CHAT_PROVIDER,
    getChatApiKeySettingKey,
    getChatProviderOption,
} from '../constants/ai-providers';

export default function AppSettingsForm() {
    const { data, isLoading, error } = useAppSettings();
    const updateMutation = useUpdateAppSettings();

    const [appName, setAppName] = useState('');
    const [appDescription, setAppDescription] = useState('');
    const [tahunAnggaran, setTahunAnggaran] = useState(new Date().getFullYear().toString());
    const [chatProvider, setChatProvider] = useState<ChatProviderId | 'auto'>(DEFAULT_CHAT_PROVIDER);
    const [chatApiKeys, setChatApiKeys] = useState<Partial<Record<ChatProviderId, string>>>({});
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [landingPageActive, setLandingPageActive] = useState(true);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    // Initialize form values from API data
    useEffect(() => {
        if (data?.data) {
            setAppName(getSettingValue(data.data, 'app_name'));
            setAppDescription(getSettingValue(data.data, 'app_description'));
            const tahun = getSettingValue(data.data, 'tahun_anggaran');
            if (tahun) setTahunAnggaran(tahun);

            const provider = getSettingValue(data.data, 'chat_provider');
            const resolvedProvider = (provider || DEFAULT_CHAT_PROVIDER) as ChatProviderId | 'auto';
            setChatProvider(resolvedProvider);

            const logoUrl = getSettingValue(data.data, 'logo');
            const faviconUrl = getSettingValue(data.data, 'favicon');

            if (logoUrl) setLogoPreview(logoUrl);
            if (faviconUrl) setFaviconPreview(faviconUrl);

            const landingActive = getSettingValue(data.data, 'landing_page_active');
            setLandingPageActive(landingActive === '1' || landingActive === ''); // Default to true if not set
        }
    }, [data]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFaviconFile(file);
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateMutation.mutateAsync({
                app_name: appName,
                app_description: appDescription,
                tahun_anggaran: tahunAnggaran,
                chat_provider: chatProvider,
                chat_api_keys: chatApiKeys,
                landing_page_active: landingPageActive ? '1' : '0',
                logo: logoFile || undefined,
                favicon: faviconFile || undefined,
            });

            toast.success('Pengaturan berhasil disimpan');
            setLogoFile(null);
            setFaviconFile(null);
        } catch (error) {
            toast.error('Gagal menyimpan pengaturan');
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error loading settings: {error.message}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        Pengaturan Aplikasi
                    </CardTitle>
                    <CardDescription>
                        Kelola nama, deskripsi, logo, dan favicon aplikasi
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* App Name */}
                    <div className="space-y-2">
                        <Label htmlFor="app_name">Nama Aplikasi</Label>
                        <Input
                            id="app_name"
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            placeholder="Masukkan nama aplikasi"
                        />
                    </div>

                    {/* App Description */}
                    <div className="space-y-2">
                        <Label htmlFor="app_description">Deskripsi Aplikasi</Label>
                        <Input
                            id="app_description"
                            value={appDescription}
                            onChange={(e) => setAppDescription(e.target.value)}
                            placeholder="Masukkan deskripsi aplikasi"
                        />
                    </div>

                    {/* Tahun Anggaran */}
                    <div className="space-y-2">
                        <Label htmlFor="tahun_anggaran" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Tahun Anggaran Aktif
                        </Label>
                        <Select value={tahunAnggaran} onValueChange={setTahunAnggaran}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => {
                                    const year = new Date().getFullYear() - 5 + i;
                                    return (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            Tahun ini akan digunakan sebagai filter default di seluruh aplikasi
                        </p>
                    </div>

                    {/* Landing Page Toggle */}
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base flex items-center gap-2">
                                    <Layout className="h-4 w-4" />
                                    Halaman Index (Landing Page)
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Aktifkan untuk menampilkan landing page saat mengakses root URL (/). Jika dinonaktifkan, user akan langsung diarahkan ke Dashboard.
                                </p>
                            </div>
                            <Switch
                                checked={landingPageActive}
                                onCheckedChange={setLandingPageActive}
                            />
                        </div>
                    </div>

                    {/* AI Settings */}
                    <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium">Pengaturan AI</h3>
                            <p className="text-sm text-muted-foreground">
                                Pilih provider, lalu isi API key yang dibutuhkan. Model dipilih otomatis oleh provider.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="chat_provider">Provider AI</Label>
                            <Select
                                value={chatProvider}
                                onValueChange={(value) => {
                                    if (value === 'auto') {
                                        setChatProvider('auto');
                                        return;
                                    }

                                    const selected = CHAT_PROVIDER_OPTIONS.find((item) => item.value === value);
                                    if (!selected || !selected.supported) return;
                                    setChatProvider(value as ChatProviderId);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih provider AI" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CHAT_PROVIDER_SELECTION_OPTIONS.map((provider) => (
                                        <SelectItem key={provider.value} value={provider.value} disabled={!provider.supported}>
                                            {provider.label}
                                            {!provider.supported ? ' (belum didukung)' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                {chatProvider === 'auto'
                                    ? 'Rotasi otomatis memilih provider yang tersedia.'
                                    : getChatProviderOption(chatProvider).notes || `Base URL: ${getChatProviderOption(chatProvider).baseUrl}`}
                            </p>
                        </div>
                        <div className="space-y-4 pt-2">
                            <h4 className="text-sm font-medium">API Keys</h4>
                            <p className="text-sm text-muted-foreground">
                                Isi key yang dibutuhkan provider. Field kosong tidak akan menimpa key yang sudah tersimpan.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {CHAT_PROVIDER_OPTIONS.filter((provider) => provider.supported).map((provider) => {
                                    const apiKeySettingKey = getChatApiKeySettingKey(provider.value);
                                    const value = chatApiKeys[provider.value] || '';

                                    return (
                                        <div key={provider.value} className="space-y-2">
                                            <Label htmlFor={apiKeySettingKey}>
                                                {provider.label} API Key
                                            </Label>
                                            <Input
                                                id={apiKeySettingKey}
                                                type="password"
                                                value={value}
                                                onChange={(e) => setChatApiKeys((prev) => ({
                                                    ...prev,
                                                    [provider.value]: e.target.value,
                                                }))}
                                                placeholder={provider.apiKeyEnv ? `Env fallback: ${provider.apiKeyEnv}` : 'Tidak diperlukan'}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {provider.apiKeyEnv
                                                    ? `Disimpan sebagai ${apiKeySettingKey}.`
                                                    : 'Provider ini tidak memerlukan API key.'}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Logo & Favicon */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <Label>Logo Aplikasi</Label>
                            <div
                                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                                onClick={() => logoInputRef.current?.click()}
                            >
                                {logoPreview ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <img
                                            src={logoPreview}
                                            alt="Logo Preview"
                                            className="max-h-24 max-w-full object-contain"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            Klik untuk mengganti
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 py-4">
                                        <FileImage className="h-10 w-10 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Klik untuk upload logo
                                        </span>
                                    </div>
                                )}
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/svg+xml"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Favicon Upload */}
                        <div className="space-y-2">
                            <Label>Favicon</Label>
                            <div
                                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                                onClick={() => faviconInputRef.current?.click()}
                            >
                                {faviconPreview ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <img
                                            src={faviconPreview}
                                            alt="Favicon Preview"
                                            className="max-h-24 max-w-full object-contain"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            Klik untuk mengganti
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 py-4">
                                        <Upload className="h-10 w-10 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Klik untuk upload favicon
                                        </span>
                                    </div>
                                )}
                                <input
                                    ref={faviconInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/svg+xml,image/x-icon"
                                    onChange={handleFaviconChange}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? (
                                <>Menyimpan...</>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan Pengaturan
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
