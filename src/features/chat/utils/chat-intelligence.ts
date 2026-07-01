// ── Chat Intelligence Module ──────────────────────────────────
// Handles: dynamic greeting, intent classification, session memory,
// tone calibration, rate limiting, offline fallbacks, quick prompts

// ── Types ─────────────────────────────────────────────────────

export type GreetingLocale = 'id' | 'en' | 'su' | 'none'
export type Intent = 'greeting' | 'question' | 'command' | 'complaint' | 'casual' | 'ambiguous'
export type Tone = 'professional' | 'friendly' | 'casual' | 'empathetic'

export interface ConversationState {
    lastActivity: number
    sessionStart: number
    messageCount: number
    usedGreetings: string[]
    lastTopics: string[]
    locale: GreetingLocale
    preferredTone: Tone
}

export interface IntentResult {
    intent: Intent
    confidence: number
    locale: 'id' | 'en'
    query: string
}

export interface RateLimitState {
    lastTimestamps: number[]
}

// ── Constants ─────────────────────────────────────────────────

const SESSION_STORAGE_KEY = 'ami_chat_session_state'
const RATE_LIMIT_KEY = 'ami_chat_rate_limit'
const GREETING_PREF_KEY = 'ami_greeting_preference'
const IDLE_THRESHOLD_MS = 30 * 60 * 1000 // 30 min
const RATE_LIMIT_WINDOW_MS = 2000 // 2s between messages
const MAX_HISTORY_CONTEXT = 10

const GREETINGS: Record<GreetingLocale, { morning: string[]; afternoon: string[]; evening: string[] }> = {
    id: {
        morning: [
            'Selamat pagi! Ada yang bisa saya bantu?',
            'Pagi! Siap membantu Anda hari ini.',
            'Selamat pagi, bagaimana kabar Anda hari ini?',
        ],
        afternoon: [
            'Selamat siang! Ada yang bisa saya bantu?',
            'Siang! Silakan tanya apa saja.',
            'Selamat siang, ada yang bisa saya bantu?',
        ],
        evening: [
            'Selamat sore! Ada yang bisa saya bantu?',
            'Sore! Ada yang perlu dibantu?',
            'Selamat malam! Silakan tanya apa saja.',
        ],
    },
    en: {
        morning: [
            'Good morning! How can I help you?',
            'Morning! Ready to assist you.',
            'Good morning! What can I do for you today?',
        ],
        afternoon: [
            'Good afternoon! How can I help you?',
            'Afternoon! What can I do for you?',
            'Good afternoon! Feel free to ask anything.',
        ],
        evening: [
            'Good evening! How can I help you?',
            'Evening! What can I assist you with?',
            'Good evening! Feel free to ask anything.',
        ],
    },
    su: {
        morning: [
            'Wilujeng enjing! Aya anu tiasa dibantos?',
            'Enjing! Siap ngabantos anjeun.',
            'Wilujeng enjing, kumaha damang?',
        ],
        afternoon: [
            'Wilujeng siang! Aya anu tiasa dibantos?',
            'Siang! Mangga tiasa naros naon waé.',
            'Wilujeng siang, aya anu tiasa dibantos?',
        ],
        evening: [
            'Wilujeng sonten! Aya anu tiasa dibantos?',
            'Sonten! Mangga tiasa naros.',
            'Wilujeng wengi! Aya anu peryogi?',
        ],
    },
    none: { morning: [''], afternoon: [''], evening: [''] },
}

const KNOWN_GREETING_PATTERNS = [
    /^(halo|hai|hi|hey|hello|pagi|siang|sore|malam|wilujeng|enjing|siang|sonten)\b/i,
    /^(assalamualaikum|salam|permisi)\b/i,
    /^(good\s*(morning|afternoon|evening|day)|morning|afternoon|evening|hey\s*there)\b/i,
]

const KNOWN_COMMANDS = [
    /^(buat|create|add|tambah|bikin|new)\b/i,
    /^(cari|search|find|lookup)\b/i,
    /^(hapus|delete|remove|destroy)\b/i,
    /^(update|ubah|edit|change|set)\b/i,
    /^(tampilkan|show|lihat|list|tampil|display)\b/i,
]

const COMPLAINT_PATTERNS = [
    /(error|bug|salah|rusak|gagal|tidak\s*bisa|ga\s*bisa|nggak\s*bisa|fail|broken|wrong)/i,
    /(kecewa|frustrasi|lambat|lama|jelek|buruk|disappoint|slow|bad)/i,
    /(kenapa\s*ga|kok\s*ga|why\s*(is|does|can|won't|doesn't))/i,
]

const QUESTION_PATTERNS = [
    /(\?)$/,
    /^(apa|siapa|kapan|dimana|mengapa|bagaimana|berapa|apakah|what|who|when|where|why|how|is|are|can|could|would|will|do|does)\b/i,
    /^(tolong|please)\s.*(\?)/,
]

// ── Helpers ───────────────────────────────────────────────────

function getTimePeriod(): 'morning' | 'afternoon' | 'evening' {
    const h = new Date().getHours()
    if (h >= 4 && h < 12) return 'morning'
    if (h >= 12 && h < 18) return 'afternoon'
    return 'evening'
}

function detectLocale(text: string): 'id' | 'en' {
    const idWords = ['yang', 'dengan', 'tidak', 'akan', 'untuk', 'saya', 'kami', 'kita', 'dan', 'di', 'ke', 'dari', 'bisa', 'ada', 'tolong', 'apa', 'siapa', 'kapan', 'dimana', 'bagaimana', 'kenapa', 'ga', 'nggak', 'nya']
    const enWords = ['the', 'is', 'are', 'can', 'will', 'would', 'could', 'what', 'who', 'when', 'where', 'why', 'how', 'this', 'that', 'with', 'from', 'please', 'help', 'hello', 'hi', 'hey']
    const lower = text.toLowerCase()
    let idScore = 0, enScore = 0
    for (const w of idWords) { if (lower.includes(w)) idScore++ }
    for (const w of enWords) { if (lower.includes(w)) enScore++ }
    return idScore >= enScore ? 'id' : 'en'
}

function randomPick(arr: string[], used: string[] = []): string {
    const available = arr.filter(g => !used.includes(g))
    if (available.length === 0) return arr[Math.floor(Math.random() * arr.length)]
    return available[Math.floor(Math.random() * available.length)]
}

// ── Session State ─────────────────────────────────────────────

export function loadSessionState(): ConversationState {
    try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY)
        if (raw) return JSON.parse(raw) as ConversationState
    } catch { /* ignore */ }
    return {
        lastActivity: 0,
        sessionStart: Date.now(),
        messageCount: 0,
        usedGreetings: [],
        lastTopics: [],
        locale: 'id',
        preferredTone: 'friendly',
    }
}

export function saveSessionState(state: ConversationState) {
    try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state))
    } catch { /* quota */ }
}

export function loadGreetingPreference(): GreetingLocale {
    try {
        const v = localStorage.getItem(GREETING_PREF_KEY)
        if (v === 'id' || v === 'en' || v === 'su' || v === 'none') return v
    } catch { /* ignore */ }
    return 'id'
}

export function saveGreetingPreference(locale: GreetingLocale) {
    try {
        localStorage.setItem(GREETING_PREF_KEY, locale)
    } catch { /* ignore */ }
}

// ── Greeting Engine ───────────────────────────────────────────

export function shouldGreet(state: ConversationState): boolean {
    if (state.messageCount === 0) return true
    if (Date.now() - state.lastActivity > IDLE_THRESHOLD_MS) return true
    return false
}

export function generateGreeting(locale: GreetingLocale, usedGreetings: string[]): string {
    if (locale === 'none') return ''
    const period = getTimePeriod()
    const pool = GREETINGS[locale][period]
    const greeting = randomPick(pool, usedGreetings)
    return greeting
}

// ── Intent Classifier ─────────────────────────────────────────

export function classifyIntent(text: string, state: ConversationState): IntentResult {
    const trimmed = text.trim()
    const locale = detectLocale(trimmed)
    const query = trimmed

    for (const p of KNOWN_GREETING_PATTERNS) {
        if (p.test(trimmed)) {
            return { intent: 'greeting', confidence: 0.9, locale, query }
        }
    }

    for (const p of COMPLAINT_PATTERNS) {
        if (p.test(trimmed)) {
            return { intent: 'complaint', confidence: 0.8, locale, query }
        }
    }

    for (const p of KNOWN_COMMANDS) {
        if (p.test(trimmed)) {
            return { intent: 'command', confidence: 0.85, locale, query }
        }
    }

    for (const p of QUESTION_PATTERNS) {
        if (p.test(trimmed)) {
            return { intent: 'question', confidence: 0.8, locale, query }
        }
    }

    if (trimmed.length < 20) {
        return { intent: 'casual', confidence: 0.6, locale, query }
    }

    return { intent: 'question', confidence: 0.5, locale, query }
}

// ── Tone Calibration ──────────────────────────────────────────

export function calibrateTone(intent: Intent, state: ConversationState): Tone {
    if (intent === 'complaint') return 'empathetic'
    if (intent === 'command') return 'professional'
    if (intent === 'greeting') return 'friendly'
    if (intent === 'casual') return 'casual'
    return state.preferredTone
}

// ── Response Post-Processing ──────────────────────────────────

const KNOWN_GREETING_PREFIXES = [
    'Wilujeng enjing, bos! 😊',
    'Wilujeng enjing, bos!',
    'Wilujeng enjing!',
    'Wilujeng siang, bos!',
    'Wilujeng siang!',
    'Wilujeng sonten, bos!',
    'Wilujeng sonten!',
    'Wilujeng wengi, bos!',
    'Wilujeng wengi!',
    'Selamat pagi, bos!',
    'Selamat pagi!',
    'Selamat siang, bos!',
    'Selamat siang!',
    'Selamat sore, bos!',
    'Selamat sore!',
    'Selamat malam, bos!',
    'Selamat malam!',
    'Halo! 😊',
    'Halo!',
    'Hai! 😊',
    'Hai!',
]

export function stripServerGreeting(response: string): string {
    let cleaned = response.trim()
    for (const prefix of KNOWN_GREETING_PREFIXES) {
        if (cleaned.startsWith(prefix)) {
            cleaned = cleaned.slice(prefix.length).trim()
            break
        }
    }
    return cleaned
}

export function applyGreetingPrefix(response: string, greeting: string): string {
    if (!greeting) return response
    return `${greeting}\n\n${response}`
}

// ── Offline / Static Fallbacks ────────────────────────────────

export interface FallbackResponse {
    type: 'command_result' | 'error' | 'clarification' | 'offline'
    text: string
}

export function getStaticFallback(intent: IntentResult): FallbackResponse {
    const isId = intent.locale === 'id'
    switch (intent.intent) {
        case 'greeting':
            return {
                type: 'command_result',
                text: isId
                    ? 'Halo! Saya asisten AI Arumanis. Silakan tanyakan seputar data pekerjaan, kontrak, atau penyedia.'
                    : 'Hello! I am the Arumanis AI assistant. Ask me about project data, contracts, or vendors.',
            }
        case 'command':
            return {
                type: 'command_result',
                text: isId
                    ? 'Perintah diterima. Saat ini mode offline, beberapa perintah terbatas. Coba: "tampilkan tugas saya" atau "apa yang jatuh tempo hari ini?"'
                    : 'Command received. Currently offline, limited commands available. Try: "show my tasks" or "what\'s due today?"',
            }
        case 'complaint':
            return {
                type: 'error',
                text: isId
                    ? 'Maaf atas ketidaknyamanannya. Tim kami akan meninjau masalah ini. Sementara, coba refresh halaman atau hubungi admin.'
                    : 'Sorry for the inconvenience. Our team will review this issue. Try refreshing the page or contact admin.',
            }
        case 'ambiguous':
        default:
            return {
                type: 'clarification',
                text: isId
                    ? 'Maaf, saya kurang paham maksud Anda. Bisa dijelaskan lebih detail? Contoh: "cari kontrak paket XXX" atau "tampilkan progres pekerjaan"'
                    : 'Sorry, I didn\'t understand. Could you elaborate? Example: "search contract XXX" or "show work progress"',
            }
    }
}

// ── Suggested Prompts ─────────────────────────────────────────

export interface SuggestedPrompt {
    id: string
    textId: string
    textEn: string
    icon?: string
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
    { id: 'tasks', textId: 'Tampilkan tugas saya', textEn: 'Show my tasks' },
    { id: 'due', textId: 'Apa yang jatuh tempo hari ini?', textEn: 'What\'s due today?' },
    { id: 'progress', textId: 'Ringkasan progres pekerjaan', textEn: 'Work progress summary' },
    { id: 'contracts', textId: 'Cari kontrak terbaru', textEn: 'Find recent contracts' },
]

// ── Rate Limiter ──────────────────────────────────────────────

export function loadRateLimit(): RateLimitState {
    try {
        const raw = localStorage.getItem(RATE_LIMIT_KEY)
        if (raw) return JSON.parse(raw) as RateLimitState
    } catch { /* ignore */ }
    return { lastTimestamps: [] }
}

export function saveRateLimit(state: RateLimitState) {
    try {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state))
    } catch { /* ignore */ }
}

export function checkRateLimit(): boolean {
    const state = loadRateLimit()
    const now = Date.now()
    state.lastTimestamps = state.lastTimestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
    if (state.lastTimestamps.length >= 3) return false
    state.lastTimestamps.push(now)
    saveRateLimit(state)
    return true
}

// ── Input Validation ──────────────────────────────────────────

export function validateInput(text: string): { valid: boolean; reason?: string } {
    const trimmed = text.trim()
    if (!trimmed) return { valid: false, reason: 'empty' }
    if (/^[\s]+$/.test(text)) return { valid: false, reason: 'whitespace_only' }
    if (/^[\p{Emoji}\s]+$/u.test(trimmed) && trimmed.length <= 5) return { valid: false, reason: 'emoji_only' }
    if (trimmed.length > 4000) return { valid: false, reason: 'too_long' }
    return { valid: true }
}

// ── Topic Tracking ────────────────────────────────────────────

const STOP_WORDS = new Set(['dan', 'di', 'ke', 'dari', 'yang', 'ini', 'itu', 'dengan', 'untuk', 'pada', 'adalah', 'bisa', 'tidak', 'akan', 'sudah', 'telah', 'saya', 'kami', 'anda', 'the', 'is', 'are', 'this', 'that', 'with', 'for', 'and', 'not', 'can', 'will', 'has', 'have', 'been', 'was', 'were'])

function extractTopics(text: string): string[] {
    const words = text.toLowerCase().split(/[\s,.\-!?;:()]+/).filter(w => w.length > 3 && !STOP_WORDS.has(w))
    return [...new Set(words)].slice(0, 5)
}

export function updateTopics(state: ConversationState, userMessage: string, assistantReply: string) {
    const topics = [...extractTopics(userMessage), ...extractTopics(assistantReply)]
    state.lastTopics = [...new Set([...topics, ...state.lastTopics])].slice(0, 10)
}

// ── Context Injection ─────────────────────────────────────────

export function buildContextPrefix(state: ConversationState): string {
    if (state.lastTopics.length === 0) return ''
    const isId = state.locale === 'id'
    const topics = state.lastTopics.slice(0, 3).join(', ')
    return isId
        ? `(Konteks: sebelumnya Anda membahas ${topics}) `
        : `(Context: earlier you discussed ${topics}) `
}
