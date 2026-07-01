export type ChatProviderId = 'local';

export type ChatProviderSelection = 'auto' | 'local';

export const DEFAULT_CHAT_PROVIDER: ChatProviderSelection = 'local';

export const CHAT_PROVIDER_SELECTION_OPTIONS: {
    value: ChatProviderSelection;
    label: string;
    supported: boolean;
}[] = [
    { value: 'local', label: 'Lokal', supported: true },
];

export const DEFAULT_CHAT_BASE_URL = 'https://9router.cianjur.space/v1';

export const DEFAULT_CHAT_MODEL = 'gc/gemini-2.5-flash';

/** Strip whitespace and trailing slashes. */
export function sanitizeUrl(url: string): string {
    return url.trim().replace(/\/+$/, '');
}

/** Validate a URL string. */
export function isValidUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

import api, { ApiError } from '@/lib/api-client';

export type TestConnectionResult = {
    ok: boolean;
    error?: string;
    stage?: 'models' | 'chat';
    model?: string;
    used_stored_key?: boolean;
};

/**
 * Verify endpoint reachability and (when model is set) a minimal chat completion.
 */
export async function testProviderConnection(
    baseUrl: string,
    apiKey?: string,
    model?: string,
    signal?: AbortSignal,
): Promise<TestConnectionResult> {
    const url = sanitizeUrl(baseUrl);
    if (!isValidUrl(url)) {
        return { ok: false, error: 'URL tidak valid.' };
    }

    try {
        void signal;

        const payload = await api.post<TestConnectionResult>('/app-settings/test-ai-connection', {
            base_url: url,
            model: model?.trim() || undefined,
            ...(apiKey?.trim() ? { api_key: apiKey.trim() } : {}),
        });

        if (payload?.ok) {
            return {
                ok: true,
                stage: payload.stage,
                model: payload.model,
                used_stored_key: payload.used_stored_key,
            };
        }

        return {
            ok: false,
            error: payload?.error || 'Uji koneksi gagal',
            stage: payload?.stage,
            model: payload?.model,
        };
    } catch (err: unknown) {
        if (err instanceof ApiError && err.data && typeof err.data === 'object') {
            const data = err.data as TestConnectionResult;
            if (data.error) {
                return {
                    ok: false,
                    error: data.error,
                    stage: data.stage,
                    model: data.model,
                    used_stored_key: data.used_stored_key,
                };
            }
        }

        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, error: `Gagal terhubung: ${msg}` };
    }
}
