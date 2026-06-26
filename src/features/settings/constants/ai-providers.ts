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
        const res = await fetch('/bff/ai/test-connection', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                baseUrl: url,
                apiKey: apiKey?.trim() || undefined,
            }),
            signal: signal ?? AbortSignal.timeout(15_000),
        });

        const payload = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

        if (res.ok && payload?.ok) return { ok: true };

        return {
            ok: false,
            error: payload?.error || `HTTP ${res.status}: ${res.statusText}`,
        };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, error: `Gagal terhubung: ${msg}` };
    }
}
