import api, { ApiError } from '@/lib/api-client';

export type MailEncryption = 'tls' | 'ssl' | 'none';
export type MailBodyFormat = 'plain' | 'markdown' | 'html';

export const DEFAULT_MAIL_HOST = 'smtp.gmail.com';
export const DEFAULT_MAIL_PORT = '587';
export const DEFAULT_MAIL_ENCRYPTION: MailEncryption = 'tls';
export const DEFAULT_MAIL_SUBJECT = 'Uji Koneksi SMTP Arumanis';

export const DEFAULT_MAIL_BODY_MARKDOWN = `## Uji Koneksi SMTP

Email ini dikirim dari **Pengaturan Aplikasi** untuk memverifikasi konfigurasi SMTP **Arumanis**.

- Host, port, dan kredensial sudah benar jika email ini sampai ke Anda.
- Header logo dan footer ditambahkan otomatis saat dikirim.`;

export const DEFAULT_MAIL_BODY_HTML = `<h1 style="margin:0 0 20px;font-size:24px;line-height:1.3;font-weight:700;color:#0f172a;">Uji Koneksi SMTP</h1>
<p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:#64748b;">Verifikasi konfigurasi email Arumanis</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">Email ini dikirim dari Pengaturan Aplikasi untuk memastikan host, port, dan kredensial SMTP sudah benar.</p>
<div style="margin:20px 0;padding:16px 18px;background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #674bb5;border-radius:8px;font-size:14px;line-height:1.7;color:#334155;">
<strong style="color:#5740a0;">✓</strong> Jika Anda membaca pesan ini, pengiriman email berfungsi.<br>
<strong style="color:#5740a0;">✓</strong> Header logo dan footer ditambahkan otomatis saat dikirim.
</div>`;

export const DEFAULT_MAIL_BODY_PLAIN = `Uji Koneksi SMTP

Email ini memverifikasi konfigurasi SMTP Arumanis.

Jika Anda menerima pesan ini, pengaturan email sudah benar.`;

export function getDefaultMailBody(format: MailBodyFormat): string {
    if (format === 'html') return DEFAULT_MAIL_BODY_HTML;
    if (format === 'plain') return DEFAULT_MAIL_BODY_PLAIN;
    return DEFAULT_MAIL_BODY_MARKDOWN;
}

export type MailSettingsPayload = {
    mail_enabled?: string;
    mail_host?: string;
    mail_port?: string;
    mail_encryption?: MailEncryption;
    mail_username?: string;
    mail_password?: string;
    mail_from_address?: string;
    mail_from_name?: string;
    template_key?: string;
};

export type TestMailConnectionResult = {
    ok: boolean;
    error?: string;
    to?: string;
    format?: string;
    used_stored_password?: boolean;
};

export async function testMailConnection(
    to: string,
    settings?: MailSettingsPayload,
): Promise<TestMailConnectionResult> {
    try {
        const payload = await api.post<TestMailConnectionResult>('/app-settings/test-mail-connection', {
            to: to.trim(),
            mail_enabled: '1',
            ...(settings?.mail_host ? { mail_host: settings.mail_host } : {}),
            ...(settings?.mail_port ? { mail_port: settings.mail_port } : {}),
            ...(settings?.mail_encryption ? { mail_encryption: settings.mail_encryption } : {}),
            ...(settings?.mail_username ? { mail_username: settings.mail_username } : {}),
            ...(settings?.mail_password?.trim() ? { mail_password: settings.mail_password.trim() } : {}),
            ...(settings?.mail_from_address ? { mail_from_address: settings.mail_from_address } : {}),
            ...(settings?.mail_from_name ? { mail_from_name: settings.mail_from_name } : {}),
            ...(settings?.template_key ? { template_key: settings.template_key } : {}),
        });

        if (payload?.ok) {
            return payload;
        }

        return {
            ok: false,
            error: payload?.error || 'Uji koneksi email gagal',
            used_stored_password: payload?.used_stored_password,
            format: payload?.format,
        };
    } catch (err: unknown) {
        if (err instanceof ApiError && err.data && typeof err.data === 'object') {
            const data = err.data as TestMailConnectionResult;
            if (data.error) {
                return {
                    ok: false,
                    error: data.error,
                    used_stored_password: data.used_stored_password,
                    format: data.format,
                };
            }
        }

        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, error: `Gagal mengirim email uji: ${msg}` };
    }
}