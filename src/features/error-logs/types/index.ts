export type ErrorLogStatus = 'open' | 'resolved'

export interface ErrorLogUser {
    id: number
    name: string
    email: string
}

export interface ErrorLog {
    id: number
    user_id: number | null
    source: 'react' | 'window.error' | 'unhandledrejection' | 'manual'
    message: string
    stack: string | null
    component_stack: string | null
    url: string | null
    user_agent: string | null
    ip_address: string | null
    metadata: Record<string, unknown> | null
    resolved_at: string | null
    created_at: string
    updated_at: string
    user?: ErrorLogUser | null
}

export interface ErrorLogParams {
    page?: number
    per_page?: number
    search?: string
    source?: string
    status?: ErrorLogStatus
}

export interface ErrorLogResponse {
    success: boolean
    data: ErrorLog[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
        from: number | null
        to: number | null
    }
}
