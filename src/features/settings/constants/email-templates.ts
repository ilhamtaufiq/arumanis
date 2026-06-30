import type { MailBodyFormat } from './mail-settings';

export type EmailTemplateCategory = 'sistem' | 'autentikasi' | 'notifikasi' | 'operasional';

export const EMAIL_TEMPLATE_CATEGORY_LABELS: Record<EmailTemplateCategory, string> = {
    sistem: 'Sistem',
    autentikasi: 'Autentikasi',
    notifikasi: 'Notifikasi',
    operasional: 'Operasional',
};

export type EmailTemplateKey =
    | 'smtp_test'
    | 'forgot_password'
    | 'welcome'
    | 'broadcast'
    | 'ticket_created'
    | 'ticket_updated'
    | 'task_assigned'
    | 'data_reminder'
    | 'contract_ready'
    | 'report_submitted';

export interface EmailTemplatePreset {
    subject: string;
    body: string;
}

export interface EmailTemplateMeta {
    key: EmailTemplateKey;
    label: string;
    description: string;
    category: EmailTemplateCategory;
    placeholders: string[];
    format: MailBodyFormat;
    subject: string;
    body: string;
    is_custom: boolean;
    updated_at: string | null;
    presets: Record<MailBodyFormat, EmailTemplatePreset>;
}

export type EmailTemplateDraft = Pick<EmailTemplateMeta, 'format' | 'subject' | 'body'>;

export const PLACEHOLDER_HINTS: Record<string, string> = {
    app_name: 'Nama aplikasi',
    user_name: 'Nama pengguna',
    user_email: 'Email pengguna',
    reset_link: 'Tautan reset password',
    expiry_minutes: 'Masa berlaku tautan (menit)',
    login_url: 'URL halaman login',
    title: 'Judul pengumuman',
    message: 'Isi pesan broadcast',
    action_url: 'Tautan aksi / detail',
    ticket_id: 'Nomor tiket',
    ticket_title: 'Judul tiket',
    ticket_url: 'URL halaman tiket',
    status: 'Status tiket terbaru',
    pekerjaan_name: 'Nama pekerjaan',
    pekerjaan_url: 'URL halaman pekerjaan',
    missing_fields: 'Daftar field yang belum lengkap',
    profile_url: 'URL halaman profil',
    kontrak_name: 'Nama / nomor kontrak',
    download_url: 'URL unduh dokumen',
    report_name: 'Nama laporan',
    report_url: 'URL halaman laporan',
};

export function groupTemplatesByCategory(templates: EmailTemplateMeta[]) {
    const groups = new Map<EmailTemplateCategory, EmailTemplateMeta[]>();

    for (const template of templates) {
        const list = groups.get(template.category) ?? [];
        list.push(template);
        groups.set(template.category, list);
    }

    return (Object.keys(EMAIL_TEMPLATE_CATEGORY_LABELS) as EmailTemplateCategory[])
        .map((category) => ({
            category,
            label: EMAIL_TEMPLATE_CATEGORY_LABELS[category],
            templates: groups.get(category) ?? [],
        }))
        .filter((group) => group.templates.length > 0);
}