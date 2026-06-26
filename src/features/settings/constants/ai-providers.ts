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

export type TestConnectionResult = {
    ok: boolean;
    error?: string;
    stage?: 'models' | 'chat';
    model?: string;
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
                model: model?.trim() || undefined,
            }),
            signal: signal ?? AbortSignal.timeout(30_000),
        });

        const payload = (await res.json().catch(() => null)) as TestConnectionResult | null;

        if (res.ok && payload?.ok) {
            return {
                ok: true,
                stage: payload.stage,
                model: payload.model,
            };
        }

        return {
            ok: false,
            error: payload?.error || `HTTP ${res.status}: ${res.statusText}`,
        };
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { ok: false, error: `Gagal terhubung: ${msg}` };
    }
}
