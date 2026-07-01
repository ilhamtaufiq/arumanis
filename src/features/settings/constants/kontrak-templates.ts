export type KontrakTemplateKey =
    | 'kontrak_template_spk'
    | 'kontrak_template_ringkasan'
    | 'kontrak_template_bap'
    | 'kontrak_template_cover_am'
    | 'kontrak_template_cover_san';

export type KontrakTemplateFormField =
    | 'kontrak_template_spk'
    | 'kontrak_template_ringkasan'
    | 'kontrak_template_bap'
    | 'kontrak_template_cover_am'
    | 'kontrak_template_cover_san';

export interface KontrakTemplateMeta {
    key: KontrakTemplateKey;
    label: string;
    description: string;
    default_filename: string;
    form_field: KontrakTemplateFormField;
    format?: 'docx' | 'xlsx';
    has_custom: boolean;
    filename?: string | null;
    updated_at?: string | null;
}

export const KONTRAK_TEMPLATE_PLACEHOLDERS = [
    '{nama_paket}',
    '{nilai_kontrak}',
    '{nomor_spk}',
    '{nama_penyedia}',
    '{tgl_spk}',
    '{tahun}',
    '— lihat daftar placeholder lengkap di dokumentasi backend',
] as const;