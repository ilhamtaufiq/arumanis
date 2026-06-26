// --- Config ---

const APP_VERSION: string = Bun.env.APP_VERSION || '0.0.0';

const START_TIME = Date.now();
const CACHE_TTL_MS = 5_000;
const CHECK_TIMEOUT_MS = 3_000;

const ENABLED_CHECKS = (Bun.env.HEALTH_CHECK_DEPENDENCIES || 'backend_api,whatsapp_bridge')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const WHATSAPP_BRIDGE_URL = Bun.env.WHATSAPP_BRIDGE_URL || 'http://localhost:4000/status';

// --- Types ---

export interface DependencyResult {
  status: 'up' | 'down' | 'skipped';
  latency_ms?: number;
  reason?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  dependencies?: Record<string, DependencyResult>;
}

// --- Cache ---

interface CacheEntry {
  response: HealthResponse;
  statusCode: number;
  ts: number;
}

let cache: CacheEntry | null = null;

function isCacheValid(): boolean {
  return cache !== null && performance.now() - cache.ts < CACHE_TTL_MS;
}

// --- Helpers ---

async function fetchWithTimeout(url: string): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CHECK_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// --- Dependency checks ---

async function checkBackendApi(apiBaseUrl: string): Promise<DependencyResult> {
  // /api/ requires auth and may render a view; /auth/me returns 401 when reachable.
  const url = `${apiBaseUrl.replace(/\/+$/, '')}/auth/me`;
  const start = performance.now();
  try {
    const res = await fetchWithTimeout(url);
    const lat = Math.round(performance.now() - start);
    return res.ok || res.status < 500
      ? { status: 'up', latency_ms: lat }
      : { status: 'down', latency_ms: lat, reason: `HTTP ${res.status}` };
  } catch (err) {
    const lat = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[health] backend_api check failed:', msg);
    return {
      status: 'down',
      latency_ms: lat,
      reason: msg.includes('AbortError') || msg.includes('timeout') ? 'timeout' : msg.split('\n')[0],
    };
  }
}

async function checkWhatsappBridge(): Promise<DependencyResult> {
  const start = performance.now();
  try {
    const res = await fetchWithTimeout(WHATSAPP_BRIDGE_URL);
    const lat = Math.round(performance.now() - start);
    return res.ok
      ? { status: 'up', latency_ms: lat }
      : { status: 'down', latency_ms: lat, reason: `HTTP ${res.status}` };
  } catch (err) {
    const lat = Math.round(performance.now() - start);
    const msg = err instanceof Error ? err.message : String(err);
    const isConnRefused = msg.includes('Connection refused') || msg.includes('ECONNREFUSED');
    // If bridge not explicitly configured + connection refused, mark skipped
    if (!Bun.env.WHATSAPP_BRIDGE_URL && isConnRefused) {
      return { status: 'skipped', reason: 'not_configured' };
    }
    console.error('[health] whatsapp_bridge check failed:', msg);
    return {
      status: 'down',
      latency_ms: lat,
      reason: msg.includes('AbortError') || msg.includes('timeout') ? 'timeout' : msg.split('\n')[0],
    };
  }
}

// --- Public API ---

export function buildLivenessResponse(): HealthResponse {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    version: APP_VERSION,
  };
}

export async function getHealth(
  apiBaseUrl: string,
  verbose: boolean,
): Promise<{ response: HealthResponse; statusCode: number }> {
  if (!verbose && isCacheValid()) {
    return { response: cache!.response, statusCode: cache!.statusCode };
  }

  const deps: Record<string, DependencyResult> = {};

  for (const check of ENABLED_CHECKS) {
    switch (check) {
      case 'backend_api':
        if (apiBaseUrl) {
          deps[check] = await checkBackendApi(apiBaseUrl);
        } else {
          deps[check] = { status: 'skipped', reason: 'not_configured' };
        }
        break;
      case 'whatsapp_bridge':
        deps[check] = await checkWhatsappBridge();
        break;
      default:
        deps[check] = { status: 'skipped', reason: 'not_configured' };
    }
  }

  const criticalDown = Object.values(deps).some((d) => d.status === 'down');
  const response: HealthResponse = {
    status: criticalDown ? 'unhealthy' : 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    version: APP_VERSION,
  };

  if (verbose || Object.keys(deps).length > 0) {
    response.dependencies = deps;
  }

  const statusCode = criticalDown ? 503 : 200;

  if (!verbose) {
    cache = { response, statusCode, ts: performance.now() };
  }

  return { response, statusCode };
}
