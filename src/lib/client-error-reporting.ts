import api from '@/lib/api-client'
import { ApiError } from '@/lib/api-client'

type ClientErrorSource = 'react' | 'window.error' | 'unhandledrejection' | 'console.error' | 'manual'

type ClientErrorPayload = {
    source: ClientErrorSource
    message: string
    stack?: string
    component_stack?: string
    url: string
    user_agent: string
    metadata?: Record<string, unknown>
}

const reportedErrors = new Map<string, number>()
const REPORT_TTL = 60_000
let listenersRegistered = false
let originalConsoleError: typeof console.error | null = null

const PUBLIC_REPORT_PATH_PREFIXES = [
    '/',
    '/sign-in',
    '/publikasi',
    '/terms',
    '/privacy-policy',
    '/tujuan-manfaat-hasil',
    '/rancang-bangun-inovasi',
]

function isPublicUnauthenticatedSurface() {
    if (typeof window === 'undefined') return false
    const path = window.location.pathname
    return PUBLIC_REPORT_PATH_PREFIXES.some(
        (prefix) => path === prefix || (prefix !== '/' && path.startsWith(`${prefix}/`)),
    )
}

const IGNORED_MESSAGE_PATTERNS = [
    /\[vite\]/i,
    /document-start\.js/i,
    /could not establish connection/i,
    /receiving end does not exist/i,
    /chrome-extension:\/\//i,
    /moz-extension:\/\//i,
    /safari-extension:\/\//i,
]

function normalizeReason(reason: unknown): { message: string; stack?: string; metadata?: Record<string, unknown> } {
    if (reason instanceof ApiError) {
        return {
            message: reason.message,
            stack: reason.stack,
            metadata: {
                status: reason.status,
                data: reason.data,
            },
        }
    }

    if (reason instanceof Error) {
        return {
            message: reason.message || reason.name,
            stack: reason.stack,
        }
    }

    if (typeof reason === 'string') {
        return { message: reason }
    }

    return {
        message: 'Unhandled client error',
        metadata: { reason },
    }
}

function shouldReport(payload: ClientErrorPayload) {
    if (!payload.message.trim()) return false
    const combined = `${payload.message}\n${payload.stack || ''}\n${payload.url}`

    if (IGNORED_MESSAGE_PATTERNS.some(pattern => pattern.test(combined))) {
        return false
    }

    const key = `${payload.source}:${payload.message}:${payload.stack?.slice(0, 180) || ''}`
    const now = Date.now()
    const lastReportedAt = reportedErrors.get(key)

    if (lastReportedAt && now - lastReportedAt < REPORT_TTL) {
        return false
    }

    reportedErrors.set(key, now)
    return true
}

function serializeConsoleArg(arg: unknown): string {
    if (arg instanceof Error) return arg.stack || arg.message
    if (typeof arg === 'string') return arg

    try {
        return JSON.stringify(arg)
    } catch {
        return String(arg)
    }
}

function shouldReportConsoleError(args: unknown[]) {
    const text = args.map(serializeConsoleArg).join(' ')
    if (!text.trim()) return false
    if (IGNORED_MESSAGE_PATTERNS.some(pattern => pattern.test(text))) return false

    return args.some(arg => arg instanceof Error)
        || /\b(TypeError|ReferenceError|SyntaxError|RangeError|ApiError)\b/i.test(text)
        || /\b(HTTP|status)\s*(500|502|503|504|419|401|403)\b/i.test(text)
        || /\b(500|502|503|504)\b/.test(text)
        || /Failed to fetch/i.test(text)
}

export function reportClientError(
    source: ClientErrorSource,
    reason: unknown,
    extra?: { componentStack?: string; metadata?: Record<string, unknown> }
) {
    const normalized = normalizeReason(reason)
    const payload: ClientErrorPayload = {
        source,
        message: normalized.message,
        stack: normalized.stack,
        component_stack: extra?.componentStack,
        url: window.location.href,
        user_agent: navigator.userAgent,
        metadata: {
            ...normalized.metadata,
            ...extra?.metadata,
        },
    }

    if (!shouldReport(payload)) return
    if (isPublicUnauthenticatedSurface()) return

    api.post('/client-error-reports', payload).catch(() => {
        // Error reporting must never break the app or trigger a visible error loop.
    })
}

export function registerClientErrorReporting() {
    if (listenersRegistered || typeof window === 'undefined') return
    listenersRegistered = true

    window.addEventListener('error', (event) => {
        reportClientError('window.error', event.error || event.message, {
            metadata: {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            },
        })
    })

    window.addEventListener('unhandledrejection', (event) => {
        reportClientError('unhandledrejection', event.reason)
    })

    originalConsoleError = console.error
    console.error = (...args: unknown[]) => {
        originalConsoleError?.(...args)

        if (!shouldReportConsoleError(args)) return

        const primaryError = args.find((arg): arg is Error => arg instanceof Error)
        const message = args.map(serializeConsoleArg).join(' ')

        reportClientError('console.error', primaryError || message, {
            metadata: {
                console_args: args.map(serializeConsoleArg).slice(0, 5),
            },
        })
    }
}
