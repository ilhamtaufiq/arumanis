export interface AuditLog {
    id: number;
    user_id: number;
    event: 'created' | 'updated' | 'deleted';
    auditable_type: string;
    auditable_id: number;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    url: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface AuditLogParams {
    page?: number;
    per_page?: number;
    type?: string;
    event?: string;
    user_id?: number;
}
