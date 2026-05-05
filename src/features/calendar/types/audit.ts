import type { CalendarAttachment } from './index';

export interface AuditLog {
    id: number;
    user_id: number;
    event: 'created' | 'updated' | 'deleted';
    auditable_type: string;
    auditable_id: number;
    old_values: any;
    new_values: any;
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
    auditable?: any;
}
