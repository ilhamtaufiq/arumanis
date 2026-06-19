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

export const DEFAULT_CHAT_BASE_URL = 'http://localhost:11434/v1';

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

/**
 * Ping the /v1/models endpoint to verify reachability.
 * Returns { ok, error? }.
 */
export async function testProviderConnection(
    baseUrl: string,
    apiKey?: string,
    signal?: AbortSignal,
): Promise<{ ok: boolean; error?: string }> {
    const url = sanitizeUrl(baseUrl);
    if (!isValidUrl(url)) {
        return { ok: false, error: 'URL tidak valid.' };
    }

    try {
        const headers: Record<string, string> = { 'Accept': 'application/json' };
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const res = await fetch(`${url}/models`, {
            method: 'GET',
            headers,
            signal: signal ?? AbortSignal.timeout(10_000),
        });

        if (res.ok) return { ok: true };

        const text = await res.text().catch(() => '');
        return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 120) || res.statusText}` };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, error: `Gagal terhubung: ${msg}` };
    }
}
