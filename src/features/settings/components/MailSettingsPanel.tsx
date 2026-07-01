import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Eye, EyeOff, Key, Mail, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { getSettingValue, isSettingConfigured, type AppSetting } from '../api';
import {
    DEFAULT_MAIL_ENCRYPTION,
    DEFAULT_MAIL_HOST,
    DEFAULT_MAIL_PORT,
    testMailConnection,
    type MailEncryption,
    type MailSettingsPayload,
} from '../constants/mail-settings';

export type MailSettingsDraft = MailSettingsPayload & {
    mail_test_to: string;
    contact_email?: string;
};

interface MailSettingsPanelProps {
    settings?: AppSetting[];
    appName: string;
    onDraftChange: (draft: MailSettingsDraft) => void;
}

function buildDraft(state: Omit<MailSettingsDraft, 'mail_test_to'> & { mail_test_to?: string }): MailSettingsDraft {
    return {
        mail_enabled: state.mail_enabled,
        mail_host: state.mail_host,
        mail_port: state.mail_port,
        mail_encryption: state.mail_encryption,
        mail_username: state.mail_username,
        mail_password: state.mail_password,
        mail_from_address: state.mail_from_address,
        mail_from_name: state.mail_from_name,
        contact_email: state.contact_email,
        mail_test_to: state.mail_test_to ?? '',
    };
}

export function MailSettingsPanel({ settings, appName, onDraftChange }: MailSettingsPanelProps) {
    const [mailEnabled, setMailEnabled] = useState(false);
    const [mailHost, setMailHost] = useState(DEFAULT_MAIL_HOST);
    const [mailPort, setMailPort] = useState(DEFAULT_MAIL_PORT);
    const [mailEncryption, setMailEncryption] = useState<MailEncryption>(DEFAULT_MAIL_ENCRYPTION);
    const [mailUsername, setMailUsername] = useState('');
    const [mailPassword, setMailPassword] = useState('');
    const [mailPasswordConfigured, setMailPasswordConfigured] = useState(false);
    const [showMailPassword, setShowMailPassword] = useState(false);
    const [mailFromAddress, setMailFromAddress] = useState('');
    const [mailFromName, setMailFromName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [mailTestTo, setMailTestTo] = useState('');
    const [testingMail, setTestingMail] = useState(false);
    const [mailTestResult, setMailTestResult] = useState<{
        ok: boolean;
        error?: string;
        used_stored_password?: boolean;
    } | null>(null);

    useEffect(() => {
        if (!settings) return;

        setMailEnabled(getSettingValue(settings, 'mail_enabled') === '1');
        setMailHost(getSettingValue(settings, 'mail_host') || DEFAULT_MAIL_HOST);
        setMailPort(getSettingValue(settings, 'mail_port') || DEFAULT_MAIL_PORT);
        setMailEncryption(
            (getSettingValue(settings, 'mail_encryption') as MailEncryption) || DEFAULT_MAIL_ENCRYPTION
        );
        setMailUsername(getSettingValue(settings, 'mail_username'));
        setMailPasswordConfigured(isSettingConfigured(settings, 'mail_password'));
        setMailFromAddress(getSettingValue(settings, 'mail_from_address'));
        setMailFromName(getSettingValue(settings, 'mail_from_name'));
        setContactEmail(getSettingValue(settings, 'contact_email'));
    }, [settings]);

    useEffect(() => {
        onDraftChange(
            buildDraft({
                mail_enabled: mailEnabled ? '1' : '0',
                mail_host: mailHost.trim() || DEFAULT_MAIL_HOST,
                mail_port: mailPort.trim() || DEFAULT_MAIL_PORT,
                mail_encryption: mailEncryption,
                mail_username: mailUsername.trim(),
                mail_password: mailPassword.trim() || undefined,
                mail_from_address: mailFromAddress.trim(),
                mail_from_name: mailFromName.trim() || appName.trim(),
                contact_email: contactEmail.trim(),
                mail_test_to: mailTestTo,
            })
        );
    }, [
        mailEnabled,
        mailHost,
        mailPort,
        mailEncryption,
        mailUsername,
        mailPassword,
        mailFromAddress,
        mailFromName,
        contactEmail,
        mailTestTo,
        appName,
        onDraftChange,
    ]);

    const handleTestMailConnection = async () => {
        const to = mailTestTo.trim() || mailUsername.trim() || mailFromAddress.trim();
        if (!to) {
            setMailTestResult({ ok: false, error: 'Isi alamat email tujuan uji atau username Gmail.' });
            return;
        }

        setTestingMail(true);
        setMailTestResult(null);

        try {
            const result = await testMailConnection(to, {
                mail_enabled: '1',
                mail_host: mailHost.trim() || DEFAULT_MAIL_HOST,
                mail_port: mailPort.trim() || DEFAULT_MAIL_PORT,
                mail_encryption: mailEncryption,
                mail_username: mailUsername.trim() || undefined,
                mail_password: mailPassword.trim() || undefined,
                mail_from_address: mailFromAddress.trim() || undefined,
                mail_from_name: mailFromName.trim() || undefined,
                template_key: 'smtp_test',
            });
            setMailTestResult(result);
        } finally {
            setTestingMail(false);
        }
    };

    return (
        <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Pengaturan Email (Gmail SMTP)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Konfigurasi server pengiriman email. Subjek dan isi template dikelola di halaman terpisah.
                    </p>
                </div>
                <Switch checked={mailEnabled} onCheckedChange={setMailEnabled} />
            </div>

            <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-3 text-sm">
                <p className="text-muted-foreground">
                    Template transaksional (lupa password, broadcast, tiket, dll.) ada di{' '}
                    <Link to="/settings/email-templates" className="font-medium text-primary hover:underline">
                        Template Email
                    </Link>
                    .
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="mail_host">SMTP Host</Label>
                    <Input
                        id="mail_host"
                        value={mailHost}
                        onChange={(e) => setMailHost(e.target.value)}
                        placeholder={DEFAULT_MAIL_HOST}
                        disabled={!mailEnabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mail_port">Port</Label>
                    <Input
                        id="mail_port"
                        type="number"
                        value={mailPort}
                        onChange={(e) => setMailPort(e.target.value)}
                        placeholder={DEFAULT_MAIL_PORT}
                        disabled={!mailEnabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mail_encryption">Enkripsi</Label>
                    <Select
                        value={mailEncryption}
                        onValueChange={(v) => setMailEncryption(v as MailEncryption)}
                        disabled={!mailEnabled}
                    >
                        <SelectTrigger id="mail_encryption">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tls">TLS (port 587, Gmail)</SelectItem>
                            <SelectItem value="ssl">SSL (port 465)</SelectItem>
                            <SelectItem value="none">Tanpa enkripsi</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mail_username">Username Gmail</Label>
                    <Input
                        id="mail_username"
                        type="email"
                        value={mailUsername}
                        onChange={(e) => setMailUsername(e.target.value)}
                        placeholder="nama@gmail.com"
                        disabled={!mailEnabled}
                    />
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="mail_password" className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        App Password Gmail
                    </Label>
                    <div className="relative">
                        <Input
                            id="mail_password"
                            type={showMailPassword ? 'text' : 'password'}
                            value={mailPassword}
                            onChange={(e) => setMailPassword(e.target.value)}
                            placeholder={
                                mailPasswordConfigured && !mailPassword
                                    ? 'App Password tersimpan — isi ulang hanya jika ingin mengganti'
                                    : '16 karakter App Password dari Google'
                            }
                            className="pr-10"
                            disabled={!mailEnabled}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowMailPassword(!showMailPassword)}
                            tabIndex={-1}
                            disabled={!mailEnabled}
                        >
                            {showMailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mail_from_address">From Address</Label>
                    <Input
                        id="mail_from_address"
                        type="email"
                        value={mailFromAddress}
                        onChange={(e) => setMailFromAddress(e.target.value)}
                        placeholder={mailUsername || 'nama@gmail.com'}
                        disabled={!mailEnabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mail_from_name">From Name</Label>
                    <Input
                        id="mail_from_name"
                        value={mailFromName}
                        onChange={(e) => setMailFromName(e.target.value)}
                        placeholder={appName || 'Arumanis'}
                        disabled={!mailEnabled}
                    />
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="contact_email">Email Hubungi Kami (Landing Page)</Label>
                    <Input
                        id="contact_email"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder={mailFromAddress || mailUsername || 'admin@example.com'}
                        disabled={!mailEnabled}
                    />
                    <p className="text-xs text-muted-foreground">
                        Pesan dari formulir Hubungi Kami di landing page dikirim ke alamat ini.
                        Kosongkan untuk memakai From Address.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="mail_test_to">Email Tujuan Uji</Label>
                    <Input
                        id="mail_test_to"
                        type="email"
                        value={mailTestTo}
                        onChange={(e) => setMailTestTo(e.target.value)}
                        placeholder={mailUsername || 'admin@example.com'}
                        disabled={!mailEnabled}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestMailConnection}
                    disabled={testingMail || !mailEnabled}
                    className="gap-2 sm:mb-0.5"
                >
                    <Wifi className="h-4 w-4" />
                    {testingMail ? 'Mengirim...' : 'Uji Kirim SMTP'}
                </Button>
            </div>
            {mailTestResult && (
                <p className={`text-sm ${mailTestResult.ok ? 'text-green-600' : 'text-destructive'}`}>
                    {mailTestResult.ok
                        ? `Email uji SMTP terkirim${mailTestResult.used_stored_password ? ' — pakai App Password tersimpan' : ''}.`
                        : `Gagal: ${mailTestResult.error}`}
                </p>
            )}
        </div>
    );
}