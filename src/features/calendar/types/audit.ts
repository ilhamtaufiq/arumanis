// types/audit.ts

export type AuditLogPekerjaanTab =
    | 'kontrak'
    | 'output'
    | 'penerima'
    | 'foto'
    | 'berkas'
    | 'progress'

export interface AuditLogPekerjaan {
    id: number
    nama_paket: string | null
    tab: AuditLogPekerjaanTab | null
}

export interface AuditLog {
    id: number;
    user_id: number;
    event: 'created' | 'updated' | 'deleted';
    auditable_type: string;
    auditable_id: number;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    url: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
        avatar_url?: string;
    };
    pekerjaan?: AuditLogPekerjaan | null;
    auditable?: unknown;
}
