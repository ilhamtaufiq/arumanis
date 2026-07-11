import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSettings, useUpdateAppSettings, getSettingValue, isSettingConfigured, type AppSettingsFormData } from '../api';
import { useAppSettingsStore } from '@/stores/app-settings-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, Upload, Image, FileImage, Calendar, Layout, BarChart3, Eye, EyeOff, Link, Key, Wifi, Construction } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { parseBypassEmails } from '../lib/maintenance';
import {
    DEFAULT_CHAT_BASE_URL,
    DEFAULT_CHAT_MODEL,
    isValidUrl,
    sanitizeUrl,
    testProviderConnection,
} from '../constants/ai-providers';
import { getApiErrorMessage } from '@/lib/api-error-message';
import { MailSettingsPanel, type MailSettingsDraft } from './MailSettingsPanel';

function revokeBlobPreview(ref: React.MutableRefObject<string | null>) {
    if (ref.current?.startsWith('blob:')) {
        URL.revokeObjectURL(ref.current);
        ref.current = null;
    }
}

export default function AppSettingsForm() {
    const { data, isLoading, error } = useAppSettings();
    const updateMutation = useUpdateAppSettings();
    const setGlobalTahunAnggaran = useAppSettingsStore((state) => state.setTahunAnggaran);

    const [appName, setAppName] = useState('');
    const [appDescription, setAppDescription] = useState('');
    const [tahunAnggaran, setTahunAnggaran] = useState(new Date().getFullYear().toString());
    const [chatBaseUrl, setChatBaseUrl] = useState('');
    const [chatModel, setChatModel] = useState('');
    const [chatApiKey, setChatApiKey] = useState('');
    const [chatApiKeyConfigured, setChatApiKeyConfigured] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionResult, setConnectionResult] = useState<{ ok: boolean; error?: string; model?: string; used_stored_key?: boolean } | null>(null);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [landingPageActive, setLandingPageActive] = useState(true);
    const [spmDetailPageActive, setSpmDetailPageActive] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceBypassEmails, setMaintenanceBypassEmails] = useState('ilhamtaufiq@gmail.com');

    const mailDraftRef = useRef<MailSettingsDraft | null>(null);
    const handleMailDraftChange = useCallback((draft: MailSettingsDraft) => {
        mailDraftRef.current = draft;
    }, []);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);
    const logoBlobUrlRef = useRef<string | null>(null);
    const faviconBlobUrlRef = useRef<string | null>(null);

    const sanitizedChatUrl = chatBaseUrl.trim() ? sanitizeUrl(chatBaseUrl) : '';
    const hasInvalidChatUrl = Boolean(chatBaseUrl.trim() && !isValidUrl(sanitizedChatUrl));
    const isTestConnectionDisabled = !sanitizedChatUrl || !isValidUrl(sanitizedChatUrl);

    // Initialize form values from API data
    useEffect(() => {
        if (data?.data) {
            setAppName(getSettingValue(data.data, 'app_name'));
            setAppDescription(getSettingValue(data.data, 'app_description'));
            const tahun = getSettingValue(data.data, 'tahun_anggaran');
            if (tahun) setTahunAnggaran(tahun);

            setChatBaseUrl(getSettingValue(data.data, 'chat_base_url') || DEFAULT_CHAT_BASE_URL);
            setChatModel(getSettingValue(data.data, 'chat_model') || DEFAULT_CHAT_MODEL);
            setChatApiKeyConfigured(isSettingConfigured(data.data, 'chat_api_key_local'));

            const logoUrl = getSettingValue(data.data, 'logo');
            const faviconUrl = getSettingValue(data.data, 'favicon');

            if (logoUrl) {
                revokeBlobPreview(logoBlobUrlRef);
                setLogoPreview(logoUrl);
            }
            if (faviconUrl) {
                revokeBlobPreview(faviconBlobUrlRef);
                setFaviconPreview(faviconUrl);
            }

            const landingActive = getSettingValue(data.data, 'landing_page_active');
            setLandingPageActive(landingActive === '1' || landingActive === ''); // Default to true if not set

            const maintenanceActive = getSettingValue(data.data, 'maintenance_mode');
            setMaintenanceMode(maintenanceActive === '1' || maintenanceActive === 'true');
            const bypassEmails = getSettingValue(data.data, 'maintenance_bypass_emails');
            setMaintenanceBypassEmails(
                bypassEmails.trim()
                    ? parseBypassEmails(bypassEmails).join(', ')
                    : 'ilhamtaufiq@gmail.com',
            );

            const spmDetailActive = getSettingValue(data.data, 'spm_detail_page_active');
            setSpmDetailPageActive(spmDetailActive === '1' || spmDetailActive === '');
        }
    }, [data]);

    useEffect(() => {
        return () => {
            revokeBlobPreview(logoBlobUrlRef);
            revokeBlobPreview(faviconBlobUrlRef);
        };
    }, []);

    const handleUrlChange = (value: string) => {
        setChatBaseUrl(value);
        setConnectionResult(null);
        if (value.trim() && !isValidUrl(sanitizeUrl(value))) {
            setUrlError('Format URL tidak valid. Gunakan http:// atau https://');
        } else {
            setUrlError(null);
        }
    };

    const handleTestConnection = async () => {
        const url = sanitizeUrl(chatBaseUrl);
        if (!isValidUrl(url)) {
            setUrlError('Format URL tidak valid.');
            return;
        }

        setTestingConnection(true);
        setConnectionResult(null);

        try {
            const result = await testProviderConnection(
                url,
                chatApiKey || undefined,
                chatModel.trim() || DEFAULT_CHAT_MODEL,
            );
            setConnectionResult(result);
        } finally {
            setTestingConnection(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            revokeBlobPreview(logoBlobUrlRef);
            const previewUrl = URL.createObjectURL(file);
            logoBlobUrlRef.current = previewUrl;
            setLogoFile(file);
            setLogoPreview(previewUrl);
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            revokeBlobPreview(faviconBlobUrlRef);
            const previewUrl = URL.createObjectURL(file);
            faviconBlobUrlRef.current = previewUrl;
            setFaviconFile(file);
            setFaviconPreview(previewUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (hasInvalidChatUrl) {
            setUrlError('Format URL tidak valid.');
            return;
        }

        const payload: AppSettingsFormData = {
            app_name: appName,
            app_description: appDescription,
            tahun_anggaran: tahunAnggaran,
            landing_page_active: landingPageActive ? '1' : '0',
            spm_detail_page_active: spmDetailPageActive ? '1' : '0',
            maintenance_mode: maintenanceMode ? '1' : '0',
            maintenance_bypass_emails: maintenanceBypassEmails.trim() || 'ilhamtaufiq@gmail.com',
            logo: logoFile || undefined,
            favicon: faviconFile || undefined,
        };

        if (sanitizedChatUrl && isValidUrl(sanitizedChatUrl)) {
            payload.chat_provider = 'local';
            payload.chat_base_url = sanitizedChatUrl;
            payload.chat_model = chatModel.trim() || DEFAULT_CHAT_MODEL;
            if (chatApiKey.trim()) {
                payload.chat_api_key = chatApiKey;
            }
        }

        const mailDraft = mailDraftRef.current;
        if (mailDraft) {
            payload.mail_enabled = mailDraft.mail_enabled;
            payload.mail_host = mailDraft.mail_host;
            payload.mail_port = mailDraft.mail_port;
            payload.mail_encryption = mailDraft.mail_encryption;
            payload.mail_username = mailDraft.mail_username;
            payload.mail_from_address = mailDraft.mail_from_address;
            payload.mail_from_name = mailDraft.mail_from_name;
            payload.contact_email = mailDraft.contact_email;
            if (mailDraft.mail_password) {
                payload.mail_password = mailDraft.mail_password;
            }
        }

        try {
            await updateMutation.mutateAsync(payload);

            setGlobalTahunAnggaran(tahunAnggaran);
            const savedSecrets: string[] = [];
            if (chatApiKey.trim()) savedSecrets.push('API key AI');
            if (mailDraft?.mail_password) savedSecrets.push('App Password Gmail');
            toast.success(
                savedSecrets.length > 0
                    ? `Pengaturan disimpan. ${savedSecrets.join(' dan ')} tersimpan di database.`
                    : 'Pengaturan berhasil disimpan',
            );
            if (chatApiKey.trim()) {
                setChatApiKeyConfigured(true);
                setChatApiKey('');
            }

            setLogoFile(null);
            setFaviconFile(null);
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Gagal menyimpan pengaturan'));
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

                    {/* Maintenance Mode */}
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <Label className="text-base flex items-center gap-2">
                                    <Construction className="h-4 w-4" />
                                    Mode Maintenance
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Jika aktif, semua pengguna melihat halaman maintenance dan API mengembalikan 503.
                                    Akun bypass (default <code className="rounded bg-muted px-1 text-xs">ilhamtaufiq@gmail.com</code>) tetap bisa masuk dan mematikan mode ini.
                                </p>
                            </div>
                            <Switch
                                checked={maintenanceMode}
                                onCheckedChange={(checked) => {
                                    setMaintenanceMode(checked)
                                    if (checked) {
                                        toast.message('Maintenance akan aktif setelah disimpan. Pastikan akun bypass bisa login.')
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maintenance_bypass_emails">Email bypass (pisahkan koma)</Label>
                            <Input
                                id="maintenance_bypass_emails"
                                value={maintenanceBypassEmails}
                                onChange={(e) => setMaintenanceBypassEmails(e.target.value)}
                                placeholder="ilhamtaufiq@gmail.com"
                                autoComplete="off"
                            />
                        </div>
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

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Halaman Detail Capaian SPM
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Aktifkan agar publik dapat membuka halaman detail capaian di{' '}
                                    <code className="rounded bg-muted px-1 py-0.5 text-xs">/capaian-spm</code>.
                                    Jika dinonaktifkan, halaman detail diblokir dan tautannya disembunyikan di landing page.
                                </p>
                            </div>
                            <Switch
                                checked={spmDetailPageActive}
                                onCheckedChange={setSpmDetailPageActive}
                            />
                        </div>
                    </div>

                    {/* AI Settings — Single Local Provider */}
                    <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium">Pengaturan AI Lokal</h3>
                            <p className="text-sm text-muted-foreground">
                                Konfigurasi endpoint AI lokal (mis. Ollama, LM Studio, atau server OpenAI-compatible lainnya).
                            </p>
                        </div>

                        {/* Endpoint URL */}
                        <div className="space-y-2">
                            <Label htmlFor="chat_base_url" className="flex items-center gap-2">
                                <Link className="h-4 w-4" />
                                API Endpoint URL <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="chat_base_url"
                                type="url"
                                value={chatBaseUrl}
                                onChange={(e) => handleUrlChange(e.target.value)}
                                placeholder={DEFAULT_CHAT_BASE_URL}
                            />
                            {urlError && (
                                <p className="text-sm text-destructive">{urlError}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Contoh: https://9router.cianjur.space/v1 atau http://localhost:11434/v1 (Ollama).
                            </p>
                        </div>

                        {/* Model */}
                        <div className="space-y-2">
                            <Label htmlFor="chat_model">Model AI</Label>
                            <Input
                                id="chat_model"
                                value={chatModel}
                                onChange={(e) => setChatModel(e.target.value)}
                                placeholder={DEFAULT_CHAT_MODEL}
                            />
                            <p className="text-sm text-muted-foreground">
                                ID model dari endpoint. Rekomendasi: gc/gemini-2.5-flash. Beberapa model (mis. combos, mmf/mimo-auto) bisa diblokir meski muncul di daftar /models.
                            </p>
                        </div>

                        {/* API Key */}
                        <div className="space-y-2">
                            <Label htmlFor="chat_api_key" className="flex items-center gap-2">
                                <Key className="h-4 w-4" />
                                API Key
                            </Label>
                            <div className="relative">
                                <Input
                                    id="chat_api_key"
                                    type={showApiKey ? 'text' : 'password'}
                                    value={chatApiKey}
                                    onChange={(e) => setChatApiKey(e.target.value)}
                                    placeholder={
                                        chatApiKeyConfigured && !chatApiKey
                                            ? 'API key tersimpan — isi ulang hanya jika ingin mengganti'
                                            : 'Masukkan API key (jika diperlukan)'
                                    }
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    tabIndex={-1}
                                >
                                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {chatApiKeyConfigured
                                    ? 'API key tersimpan di database apiamis. Uji Koneksi memakai key tersimpan jika field dikosongkan.'
                                    : 'Opsional untuk endpoint lokal (mis. Ollama). Isi lalu Simpan jika gateway membutuhkan autentikasi.'}
                            </p>
                        </div>

                        {/* Test Connection */}
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleTestConnection}
                                disabled={testingConnection || isTestConnectionDisabled}
                                className="gap-2"
                            >
                                <Wifi className="h-4 w-4" />
                                {testingConnection ? 'Menguji...' : 'Uji Koneksi'}
                            </Button>
                            {connectionResult && (
                                <span className={`text-sm ${connectionResult.ok ? 'text-green-600' : 'text-destructive'}`}>
                                    {connectionResult.ok
                                        ? `Koneksi & model ${connectionResult.model || chatModel} OK${connectionResult.used_stored_key ? ' (pakai API key tersimpan)' : ''}`
                                        : `Koneksi gagal: ${connectionResult.error}`}
                                </span>
                            )}
                        </div>
                    </div>

                    <MailSettingsPanel
                        settings={data?.data}
                        appName={appName}
                        onDraftChange={handleMailDraftChange}
                    />

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
