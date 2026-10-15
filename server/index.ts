import { Hono, type Context } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { existsSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { buildLivenessResponse, getHealth } from '../scripts/health.ts'
import {
  buildOnlyOfficeWebSocketUrl,
  createOnlyOfficeWebSocketHandlers,
  getProxyPublicOrigin,
  isOnlyOfficeRequest,
  proxyOnlyOfficeHttp,
  type OnlyOfficeWsData,
} from './onlyoffice-proxy.ts'
import { buildPublikasiHtml, buildPublikasiListHtml, buildPuspenHtml } from './seo-meta.ts'
import { buildSitemapXml } from './sitemap.ts'
import { proxySipdRequest } from './sipd-proxy.ts'
import {
  bffUpstreamTimeoutMs,
  isLargeFileTransferPath,
  isSseStreamPath,
  BFF_UPSTREAM_TIMEOUT_MS,
} from './bff-timeout.ts'
const API_BASE = (
  Bun.env.APIAMIS_BASE_URL ||
  Bun.env.VITE_API_BASE_URL ||
  'http://apiamis.test/api'
).replace(/\/$/, '')
const ONLYOFFICE_BASE = (Bun.env.ONLYOFFICE_DOCUMENT_SERVER_URL || 'https://office.cianjur.space').replace(/\/$/, '')
const PORT = Number(Bun.env.PORT || '8787')

if (isLikelyMisconfiguredApiBase(API_BASE)) {
  console.error(
    `[BFF] APIAMIS_BASE_URL tampak mengarah ke AI gateway, bukan Laravel API: ${API_BASE}. ` +
      'Set ke https://apiamis.cianjur.space/api (bukan URL 9router /v1).',
  )
}
const isProd = Bun.env.BUN_ENV === 'production' || Bun.env.NODE_ENV === 'production'
const SESSION_COOKIE = Bun.env.SESSION_COOKIE_NAME || 'arumanis_session'
const IMPERSONATOR_COOKIE = Bun.env.IMPERSONATOR_COOKIE_NAME || 'arumanis_impersonator_session'
const COOKIE_SECURE = Bun.env.SESSION_COOKIE_SECURE != null
  ? `${Bun.env.SESSION_COOKIE_SECURE}` === 'true'
  : isProd
const DIST_DIR = resolve(process.cwd(), 'dist')

const app = new Hono()

app.get('/health/live', (c) => c.json(buildLivenessResponse()))

app.get('/health/ready', async (c) => {
  const verbose = c.req.query('verbose') === 'true'
  const { response, statusCode } = await getHealth(API_BASE, verbose)
  return c.json(response, statusCode as any)
})

app.get('/health', async (c) => {
  const verbose = c.req.query('verbose') === 'true'
  const { response, statusCode } = await getHealth(API_BASE, verbose)
  return c.json(response, statusCode as any)
})

app.get('/storage/*', async (c) => {
  const url = new URL(c.req.url)
  const apiHostBase = API_BASE.replace(/\/api\/?$/, '')
  const target = `${apiHostBase}${url.pathname}`
  try {
    const upstreamRes = await fetch(target, {
      headers: {
        ...(c.req.header('range') ? { range: c.req.header('range') } : {}),
        ...(c.req.header('accept') ? { accept: c.req.header('accept') } : {}),
      },
    })
    const responseHeaders = new Headers(upstreamRes.headers)
    responseHeaders.delete('content-encoding')
    responseHeaders.delete('content-length')
    responseHeaders.delete('transfer-encoding')

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    })
  } catch (err) {
    return c.text('Berkas storage tidak dapat diakses dari backend', 502)
  }
})

app.post('/bff/auth/login', async (c) => handleLogin(c))

app.post('/bff/auth/sync-token', async (c) => {
  const body = await safeJsonBody(c)
  const token = typeof body?.token === 'string' ? body.token.trim() : ''

  if (!token) {
    return c.json({ message: 'Token tidak valid' }, 400)
  }

  const verified = await verifyToken(token)
  if (!verified.ok) {
    return c.json({ message: 'Token tidak valid atau kedaluwarsa' }, 401)
  }

  setSessionCookie(c, token)
  return c.json({ message: 'Sesi disinkronkan', user: verified.user })
})

app.get('/bff/auth/me', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ user: null })
  }

  return forwardAuthRequest(c, `${API_BASE}/auth/me`, 'GET', {
    treatUnauthorizedAsAnonymous: true,
  })
})

app.get('/bff/swagger-docs', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ message: 'Unauthenticated' }, 401)
  }

  const verified = await verifyToken(token)
  if (!verified.ok) {
    return c.json({ message: 'Unauthenticated' }, 401)
  }

  if (!userHasRole(verified.user, 'admin')) {
    return c.json({ message: 'Akses ditolak. Dokumentasi API hanya untuk admin.' }, 403)
  }

  const swaggerBase = API_BASE.replace(/\/api\/?$/, '')
  const target = `${swaggerBase}/api/documentation?access_token=${encodeURIComponent(token)}`

  return c.redirect(target)
})

app.post('/bff/auth/logout', async (c) => {
  const response = await forwardAuthRequest(c, `${API_BASE}/auth/logout`, 'POST')
  deleteCookie(c, SESSION_COOKIE, sessionCookieOptions())
  deleteCookie(c, IMPERSONATOR_COOKIE, sessionCookieOptions())
  return response
})

app.post('/bff/auth/impersonate/:userId', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ message: 'Unauthenticated' }, 401)
  }

  const userId = c.req.param('userId')
  const response = await fetch(`${API_BASE}/auth/impersonate/${userId}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const payload = await safeParseResponse(response)
  if (!response.ok) {
    return c.json(payload ?? { message: 'Impersonation failed' }, response.status as any)
  }

  const targetToken = extractToken(payload)
  if (!targetToken) {
    return c.json({ message: 'Token impersonasi tidak ditemukan' }, 500)
  }

  const impersonator = await verifyToken(token)
  if (impersonator.ok) {
    setCookie(c, IMPERSONATOR_COOKIE, JSON.stringify({
      user: impersonator.user,
      token,
    }), impersonatorCookieOptions())
  }

  setSessionCookie(c, targetToken)

  return c.json({
    user: extractEntity((payload as any)?.user ?? payload),
    isImpersonating: true,
    message: (payload as any)?.message,
  })
})

app.post('/bff/auth/stop-impersonate', async (c) => {
  const impersonatorRaw = getCookie(c, IMPERSONATOR_COOKIE)
  if (!impersonatorRaw) {
    return c.json({ message: 'Tidak sedang impersonate' }, 400)
  }

  let impersonator: { user?: unknown; token?: string } | null = null
  try {
    impersonator = JSON.parse(impersonatorRaw)
  } catch {
    impersonator = null
  }

  const adminToken = impersonator?.token?.trim()
  if (!adminToken) {
    return c.json({ message: 'Data impersonator tidak valid' }, 400)
  }

  const verified = await verifyToken(adminToken)
  if (!verified.ok) {
    return c.json({ message: 'Sesi admin tidak valid' }, 401)
  }

  setSessionCookie(c, adminToken)
  deleteCookie(c, IMPERSONATOR_COOKIE, sessionCookieOptions())

  return c.json({
    user: verified.user,
    isImpersonating: false,
  })
})

app.post('/bff/auth/handoff', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ message: 'Unauthenticated' }, 401)
  }

  const response = await fetch(`${API_BASE}/auth/handoff`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const payload = await safeParseResponse(response)
  if (!response.ok) {
    return c.json(payload ?? { message: 'Handoff failed' }, response.status as any)
  }

  return c.json(payload)
})

app.post('/bff/ai/test-connection', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ ok: false, error: 'Unauthenticated' }, 401)
  }

  const verified = await verifyToken(token)
  if (!verified.ok) {
    return c.json({ ok: false, error: 'Sesi tidak valid' }, 401)
  }

  const body = await safeJsonBody(c)
  const baseUrl = typeof body?.baseUrl === 'string' ? body.baseUrl.trim().replace(/\/+$/, '') : ''
  const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : ''
  const model = typeof body?.model === 'string' ? body.model.trim() : ''

  if (!baseUrl || !isAllowedAiBaseUrl(baseUrl)) {
    return c.json({ ok: false, error: 'URL tidak valid.' }, 400)
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  try {
    const modelsResponse = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10_000),
    })

    if (!modelsResponse.ok) {
      const text = await modelsResponse.text().catch(() => '')
      return c.json({
        ok: false,
        stage: 'models',
        error: `HTTP ${modelsResponse.status}: ${text.slice(0, 120) || modelsResponse.statusText}`,
      })
    }

    if (!model) {
      return c.json({ ok: true, stage: 'models' })
    }

    const chatResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
        stream: false,
      }),
      signal: AbortSignal.timeout(20_000),
    })

    if (chatResponse.ok) {
      return c.json({ ok: true, stage: 'chat', model })
    }

    const chatError = formatAiGatewayError(await chatResponse.text().catch(() => ''), model)
    return c.json({
      ok: false,
      stage: 'chat',
      model,
      error: chatError,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ ok: false, error: `Gagal terhubung: ${msg}` })
  }
})

const AI_ANALYZE_MAX_CHARS = 12_000
const AI_ANALYZE_SYSTEM_PROMPT = [
  'Anda analis progres pembangunan infrastruktur air minum dan sanitasi.',
  'Tulis analisa singkat dalam Bahasa Indonesia berisi: (1) kondisi umum, (2) 2-3 temuan utama,',
  '(3) 2-3 rekomendasi tindakan. Gunakan hanya angka dari data yang diberikan dan jangan mengarang data.',
  'Jika data tidak cukup untuk suatu kesimpulan, katakan demikian.',
].join(' ')

/** Hanya angka dan teks pendek dari ringkasan dashboard yang dikirim ke model. */
function sanitizeRingkasanDashboard(raw: unknown) {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const statistikRaw = r.statistik && typeof r.statistik === 'object'
    ? (r.statistik as Record<string, unknown>)
    : {}
  const statistik = Object.fromEntries(
    Object.entries(statistikRaw)
      .filter(([, v]) => typeof v === 'number' && Number.isFinite(v))
      .slice(0, 20),
  )
  const perhatian = Array.isArray(r.pekerjaanPerluPerhatian)
    ? r.pekerjaanPerluPerhatian.slice(0, 10).flatMap((item) => {
        if (!item || typeof item !== 'object') return []
        const p = item as Record<string, unknown>
        const fisik = typeof p.fisik === 'number' && Number.isFinite(p.fisik) ? p.fisik : 0
        const keuangan = typeof p.keuangan === 'number' && Number.isFinite(p.keuangan) ? p.keuangan : 0
        return [{ nama: String(p.nama ?? '').slice(0, 200), fisik, keuangan }]
      })
    : []
  return {
    tahun: String(r.tahun ?? '').slice(0, 4),
    statistik,
    pekerjaanPerluPerhatian: perhatian,
  }
}

/** `POST /bff/ai/analyze`: analisa dashboard lewat endpoint OpenAI-compatible (`/v1/chat/completions`). Key tetap di server. */
app.post('/bff/ai/analyze', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ message: 'Sesi Arumanis tidak ditemukan. Masuk ulang.', code: 'BFF_NO_SESSION' }, 401)
  }

  const verified = await verifyToken(token)
  if (!verified.ok) {
    return c.json({ message: 'Sesi Arumanis tidak valid. Masuk ulang.', code: 'BFF_INVALID_SESSION' }, 401)
  }

  const baseUrl = (Bun.env.AI_BASE_URL || '').trim().replace(/\/+$/, '')
  const apiKey = (Bun.env.AI_API_KEY || '').trim()
  const model = (Bun.env.AI_MODEL || '').trim()
  if (!baseUrl || !model || !isAllowedAiBaseUrl(baseUrl)) {
    return c.json({
      message: 'Analisa AI belum dikonfigurasi. Set AI_BASE_URL dan AI_MODEL di server.',
      code: 'AI_NOT_CONFIGURED',
    }, 503)
  }

  const body = await safeJsonBody(c)
  const ringkasan = sanitizeRingkasanDashboard(body?.ringkasan)
  if (!ringkasan) {
    return c.json({ message: 'Ringkasan dashboard tidak valid.', code: 'AI_BAD_INPUT' }, 400)
  }
  const serialized = JSON.stringify(ringkasan)
  if (serialized.length > AI_ANALYZE_MAX_CHARS) {
    return c.json({ message: 'Ringkasan dashboard terlalu besar.', code: 'AI_BAD_INPUT' }, 413)
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 900,
        messages: [
          { role: 'system', content: AI_ANALYZE_SYSTEM_PROMPT },
          { role: 'user', content: `Data dashboard (JSON):\n${serialized}` },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    })

    const payload = await safeParseResponse(response)
    if (!response.ok) {
      const message = (payload as { error?: { message?: string }; message?: string } | null)?.error?.message
        ?? (payload as { message?: string } | null)?.message
        ?? response.statusText
      return c.json({ message: `Analisa AI gagal: ${message}`, code: 'AI_UPSTREAM_ERROR' }, 502)
    }

    const text = (payload as { choices?: Array<{ message?: { content?: unknown } }> } | null)
      ?.choices?.[0]?.message?.content
    if (typeof text !== 'string' || !text.trim()) {
      return c.json({ message: 'Model tidak mengembalikan analisa.', code: 'AI_UPSTREAM_ERROR' }, 502)
    }

    return c.json({ analisa: text.trim(), model })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ message: `Gagal terhubung ke layanan AI: ${msg}`, code: 'AI_UPSTREAM_ERROR' }, 502)
  }
})

/** Panggilan chat completion ke AI_BASE_URL. Dipakai bersama oleh fitur AI di BFF. */
async function panggilModelAi(messages: Array<{ role: string; content: string }>, maxTokens: number): Promise<string> {
  const baseUrl = (Bun.env.AI_BASE_URL || '').trim().replace(/\/+$/, '')
  const apiKey = (Bun.env.AI_API_KEY || '').trim()
  const model = (Bun.env.AI_MODEL || '').trim()
  if (!baseUrl || !model || !isAllowedAiBaseUrl(baseUrl)) {
    throw Object.assign(new Error('Fitur AI belum dikonfigurasi.'), { code: 'AI_NOT_CONFIGURED' })
  }
  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, temperature: 0.1, max_tokens: maxTokens, messages }),
    signal: AbortSignal.timeout(60_000),
  })
  const payload = await safeParseResponse(response)
  if (!response.ok) {
    const message = (payload as { error?: { message?: string }; message?: string } | null)?.error?.message
      ?? (payload as { message?: string } | null)?.message
      ?? response.statusText
    throw Object.assign(new Error(`Layanan AI gagal: ${message}`), { code: 'AI_UPSTREAM_ERROR' })
  }
  const text = (payload as { choices?: Array<{ message?: { content?: unknown } }> } | null)
    ?.choices?.[0]?.message?.content
  if (typeof text !== 'string' || !text.trim()) {
    throw Object.assign(new Error('Model tidak mengembalikan jawaban.'), { code: 'AI_UPSTREAM_ERROR' })
  }
  return text.trim()
}

/** GET ke API Rust dengan token pengguna, sehingga hak akses mengikuti role yang sudah ada. */
async function ambilApiUntukPengguna(path: string, token: string): Promise<any> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) {
    throw Object.assign(new Error(`Data tidak bisa diambil (HTTP ${response.status}).`), { code: 'DATA_FORBIDDEN_OR_FAILED', status: response.status })
  }
  return response.json()
}

const angkaDalamRentang = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Number(v)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}

/**
 * Daftar query yang boleh dipilih model. Model tidak menulis SQL atau path bebas.
 * Setiap tool hanya membaca dari endpoint yang sudah ada.
 */
const TANYA_TOOLS: Record<string, {
  deskripsi: string
  parameter: string
  jalankan: (args: Record<string, unknown>, token: string, tahun: string) => Promise<unknown>
}> = {
  statistik_dashboard: {
    deskripsi: 'Ringkasan total kegiatan, pekerjaan aktif, pagu, dan kontrak untuk tahun anggaran.',
    parameter: '{}',
    jalankan: async (_args, token, tahun) => {
      const data = await ambilApiUntukPengguna(`/dashboard/stats?tahun=${encodeURIComponent(tahun)}`, token)
      return {
        totalKegiatan: data.totalKegiatan,
        totalPekerjaan: data.totalPekerjaan,
        totalPaguPekerjaan: data.totalPaguPekerjaan,
        totalKontrak: data.totalKontrak,
        totalNilaiKontrak: data.totalNilaiKontrak,
      }
    },
  },
  pekerjaan_progres_rendah: {
    deskripsi: 'Pekerjaan aktif dengan progres fisik di bawah batas, diurutkan dari yang paling rendah (maksimal 20).',
    parameter: '{"batas": angka 0 sampai 100, default 50}',
    jalankan: async (args, token, tahun) => {
      const batas = angkaDalamRentang(args.batas, 0, 100, 50)
      const data = await ambilApiUntukPengguna(
        `/pekerjaan?per_page=50&tahun=${encodeURIComponent(tahun)}&status=active&summary=true`,
        token,
      )
      return (data.data ?? [])
        .map((p: any) => ({
          id: p.id,
          nama: String(p.nama_paket ?? '').slice(0, 200),
          fisik: Number(p.progress_estimasi_fisik ?? 0),
          keuangan: Number(p.progress_estimasi_keuangan ?? 0),
        }))
        .filter((p: { fisik: number }) => p.fisik < batas)
        .sort((a: { fisik: number }, b: { fisik: number }) => a.fisik - b.fisik)
        .slice(0, 20)
    },
  },
  pekerjaan_cari: {
    deskripsi: 'Cari pekerjaan aktif berdasarkan kata dalam nama paket (maksimal 10 hasil).',
    parameter: '{"kata": teks pencarian}',
    jalankan: async (args, token, tahun) => {
      const kata = String(args.kata ?? '').trim().slice(0, 100)
      if (!kata) return []
      const data = await ambilApiUntukPengguna(
        `/pekerjaan?per_page=10&tahun=${encodeURIComponent(tahun)}&status=active&summary=true&search=${encodeURIComponent(kata)}`,
        token,
      )
      return (data.data ?? []).slice(0, 10).map((p: any) => ({
        id: p.id,
        nama: String(p.nama_paket ?? '').slice(0, 200),
        fisik: Number(p.progress_estimasi_fisik ?? 0),
        keuangan: Number(p.progress_estimasi_keuangan ?? 0),
      }))
    },
  },
}

/** Ambil JSON dari balasan model, termasuk bila dibungkus pagar kode. */
function parseJsonDariModel(text: string): Record<string, unknown> | null {
  const bersih = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  try {
    const hasil = JSON.parse(bersih)
    return hasil && typeof hasil === 'object' ? (hasil as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/** `POST /bff/ai/tanya`: tanya-jawab data. Model memilih tool, backend menjalankannya, model merangkum hasilnya. */
app.post('/bff/ai/tanya', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ message: 'Sesi Arumanis tidak ditemukan. Masuk ulang.', code: 'BFF_NO_SESSION' }, 401)
  }
  const verified = await verifyToken(token)
  if (!verified.ok) {
    return c.json({ message: 'Sesi Arumanis tidak valid. Masuk ulang.', code: 'BFF_INVALID_SESSION' }, 401)
  }

  const body = await safeJsonBody(c)
  const pertanyaan = typeof body?.pertanyaan === 'string' ? body.pertanyaan.trim() : ''
  const tahun = typeof body?.tahun === 'string' ? body.tahun.trim() : ''
  if (!pertanyaan || pertanyaan.length > 500) {
    return c.json({ message: 'Pertanyaan wajib diisi, maksimal 500 karakter.', code: 'AI_BAD_INPUT' }, 400)
  }
  if (!/^\d{4}$/.test(tahun)) {
    return c.json({ message: 'Tahun anggaran tidak valid.', code: 'AI_BAD_INPUT' }, 400)
  }

  const daftarTool = Object.entries(TANYA_TOOLS)
    .map(([nama, t]) => `- ${nama}: ${t.deskripsi} Parameter: ${t.parameter}`)
    .join('\n')

  try {
    // Langkah 1: model memilih tool. Hanya nama dari daftar yang diterima.
    const pilihanText = await panggilModelAi([
      {
        role: 'system',
        content: [
          'Pilih satu tool untuk menjawab pertanyaan pengguna tentang data pembangunan air minum dan sanitasi.',
          'Balas HANYA dengan JSON tanpa penjelasan lain:',
          '{"tool": "<nama tool>", "args": {...}} atau {"tool": null, "alasan": "<singkat>"} bila tidak ada tool yang cocok.',
          'Tools:',
          daftarTool,
        ].join('\n'),
      },
      { role: 'user', content: pertanyaan },
    ], 200)

    const pilihan = parseJsonDariModel(pilihanText)
    const namaTool = typeof pilihan?.tool === 'string' ? pilihan.tool : null
    if (!namaTool || !TANYA_TOOLS[namaTool]) {
      return c.json({
        jawaban: 'Pertanyaan ini belum bisa dijawab dari data yang tersedia. Coba tanyakan tentang ringkasan dashboard, progres pekerjaan, atau mencari pekerjaan dengan nama tertentu.',
        sumber: null,
        model: Bun.env.AI_MODEL,
      })
    }

    const args = (pilihan?.args && typeof pilihan.args === 'object' ? pilihan.args : {}) as Record<string, unknown>
    const hasil = await TANYA_TOOLS[namaTool].jalankan(args, token, tahun)
    const dataText = JSON.stringify(hasil)
    const jumlahBaris = Array.isArray(hasil) ? hasil.length : null
    console.info('[AI tanya]', verified.user && (verified.user as { id?: unknown }).id, namaTool, jumlahBaris ?? 'objek')

    // Langkah 2: model merangkum hasil tool. Data dibatasi ukurannya.
    const jawaban = await panggilModelAi([
      {
        role: 'system',
        content: 'Jawab pertanyaan dalam Bahasa Indonesia HANYA berdasarkan data JSON yang diberikan. Sebut angka persis seperti di data. Jika data tidak menjawab pertanyaan, katakan demikian. Jangan mengarang.',
      },
      { role: 'user', content: `Pertanyaan: ${pertanyaan}\n\nData (${namaTool}):\n${dataText.slice(0, 8000)}` },
    ], 700)

    return c.json({
      jawaban,
      sumber: { tool: namaTool, args, jumlah_baris: jumlahBaris },
      model: Bun.env.AI_MODEL,
    })
  } catch (err) {
    const e = err as { code?: string; message?: string; status?: number }
    const status = e.code === 'AI_NOT_CONFIGURED' ? 503 : e.code === 'DATA_FORBIDDEN_OR_FAILED' ? (e.status === 403 ? 403 : 502) : 502
    return c.json({ message: e.message || 'Tanya-jawab gagal.', code: e.code || 'AI_UPSTREAM_ERROR' }, status as any)
  }
})

app.get('/version.json', (c) => {
  if (!isProd) {
    return c.json({ version: 'dev', buildId: 'dev', builtAt: '' })
  }

  const versionPath = resolve(DIST_DIR, 'version.json')
  if (!existsSync(versionPath)) {
    return c.text('Not Found', 404)
  }

  return new Response(Bun.file(versionPath), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-cache, no-store, must-revalidate',
      pragma: 'no-cache',
    },
  })
})

function shouldStreamUpstreamResponse(response: Response): boolean {
  if (!response.body) return false

  const contentType = (response.headers.get('content-type') || '').toLowerCase()
  if (contentType.includes('text/event-stream')) return true
  if (contentType.includes('application/zip')) return true
  if (contentType.includes('application/octet-stream')) return true
  if (contentType.includes('application/pdf')) return true
  if (contentType.startsWith('image/')) return true
  if (contentType.startsWith('video/')) return true
  if (contentType.startsWith('audio/')) return true

  const disposition = response.headers.get('content-disposition') || ''
  if (/attachment/i.test(disposition)) return true

  return false
}

app.post('/bff/broadcasting/auth', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ message: 'Unauthenticated' }, 401)
  }

  const headers = new Headers()
  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${token}`)
  const incomingContentType = c.req.header('content-type')
  if (incomingContentType) {
    headers.set('Content-Type', incomingContentType)
  }

  try {
    const response = await fetch(`${API_BASE}/broadcasting/auth`, {
      method: 'POST',
      headers,
      body: await c.req.arrayBuffer(),
      signal: AbortSignal.timeout(BFF_UPSTREAM_TIMEOUT_MS),
    })
    return await relayResponse(response)
  } catch (error) {
    console.error('[BFF] Broadcasting auth failed:', error)
    return c.json({ message: 'Upstream API tidak tersedia' }, 502)
  }
})

app.all('/bff/sipd/*', async (c) => {
  try {
    return await proxySipdRequest(c, {
      verifySession: verifyToken,
      getSessionToken: (ctx) => getCookie(ctx, SESSION_COOKIE),
    })
  } catch (error) {
    console.error('[BFF] Unhandled SIPD route error:', error)
    return c.json({
      message: 'Proxy SIPD gagal di server Arumanis.',
      code: 'SIPD_PROXY_FAILED',
    }, 502)
  }
})

app.all('/bff/api/*', async (c) => {
  const path = c.req.path.replace(/^\/bff\/api/, '') || '/'
  const targetPath = path.replace(/^\//, '')
  const target = new URL(targetPath, `${API_BASE}/`)
  target.search = new URL(c.req.url).search
  const method = c.req.method
  const largeFile = isLargeFileTransferPath(targetPath, method)
  const sseStream = isSseStreamPath(targetPath)

  const headers = new Headers()
  const incomingAccept = c.req.header('accept')
  // Prefer binary for large-file endpoints so intermediaries don't treat the
  // response as JSON / apply content negotiation that triggers buffering.
  headers.set('Accept', largeFile ? (incomingAccept || '*/*') : (incomingAccept || 'application/json'))
  const incomingContentType = c.req.header('content-type')
  if (incomingContentType) {
    headers.set('Content-Type', incomingContentType)
  }
  const incomingPin = c.req.header('x-pin')
  if (incomingPin) {
    headers.set('X-PIN', incomingPin)
  }
  // Avoid gzip/br on multi-GB bodies (Content-Length mismatch after decompress).
  if (largeFile) {
    headers.set('Accept-Encoding', 'identity')
  }

  const token = getCookie(c, SESSION_COOKIE)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const body = ['GET', 'HEAD'].includes(method) ? undefined : await c.req.arrayBuffer()
  const init: RequestInit = { method, headers }
  if (body !== undefined) {
    init.body = body
  }

  try {
    const timeoutMs = bffUpstreamTimeoutMs(targetPath, method)
    const response = await fetch(target, {
      ...init,
      ...(timeoutMs != null ? { signal: AbortSignal.timeout(timeoutMs) } : {}),
    })
    return await relayResponse(response, { forceStream: (largeFile || sseStream) && response.ok })
  } catch (error) {
    console.error('[BFF] Upstream fetch failed:', target.toString(), error)
    return c.json({ message: 'Upstream API tidak tersedia' }, 502)
  }
})

app.get('/sitemap.xml', async (c) => {
  if (!isProd) {
    return c.text('Not Found', 404)
  }

  const xml = await buildSitemapXml()
  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  })
})

app.get('*', async (c) => {
  if (isProd) {
    const requestPath = c.req.path

    // Fumadocs static site (docs-site/) is built into dist/docs and hosted at /docs/*
    if (requestPath === '/docs' || requestPath.startsWith('/docs/')) {
      const docsResponse = await serveDocsSite(requestPath)
      if (docsResponse) return docsResponse
    }

    const filePath = requestPath === '/' ? resolve(DIST_DIR, 'index.html') : resolve(DIST_DIR, `.${requestPath}`)
    const extension = extname(requestPath).toLowerCase()

    if (requestPath !== '/' && extension && existsSync(filePath)) {
      return new Response(Bun.file(filePath), {
        headers: {
          'content-type': contentTypeFor(filePath),
          ...cacheControlFor(requestPath),
        },
      })
    }

    if (isStaticAssetRequest(requestPath)) {
      return c.text('Not Found', 404, {
        'cache-control': 'no-cache, no-store, must-revalidate',
        pragma: 'no-cache',
      })
    }

    const indexPath = resolve(DIST_DIR, 'index.html')
    if (existsSync(indexPath)) {
      const spaHeaders = {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-cache, no-store, must-revalidate',
        pragma: 'no-cache',
      } as const

      const indexHtml = await Bun.file(indexPath).text()
      const normalizedPath = requestPath.replace(/\/+$/, '') || '/'

      if (normalizedPath === '/publikasi') {
        const html = buildPublikasiListHtml(indexHtml)
        return new Response(html, { headers: spaHeaders })
      }

      const publikasiMatch = normalizedPath.match(/^\/publikasi\/([^/]+)$/)
      if (publikasiMatch) {
        const html = await buildPublikasiHtml(publikasiMatch[1], normalizedPath, indexHtml)
        return new Response(html, { headers: spaHeaders })
      }

      if (normalizedPath.startsWith('/puspen')) {
        const html = buildPuspenHtml(normalizedPath, indexHtml)
        return new Response(html, { headers: spaHeaders })
      }

      return new Response(indexHtml, { headers: spaHeaders })
    }
  }

  return c.text('BFF server running. Use Vite dev server for local UI.', 404)
})

const HOST = Bun.env.HOST || '0.0.0.0'
const onlyOfficeWsHandlers = createOnlyOfficeWebSocketHandlers()

Bun.serve({
  hostname: HOST,
  port: PORT,
  // ponytail: SSE chat + unduhan besar butuh koneksi idle lama.
  // Default Bun 10s memutus stream tool-loop (>10s) sebelum event done.
  idleTimeout: 0,
  async fetch(req, server) {
    const url = new URL(req.url)

    if (isOnlyOfficeRequest(url.pathname)) {
      const upgrade = req.headers.get('upgrade')
      if (upgrade?.toLowerCase() === 'websocket') {
        const upstreamUrl = buildOnlyOfficeWebSocketUrl(url, ONLYOFFICE_BASE)
        const upgraded = server.upgrade(req, {
          data: {
            upstreamUrl,
            proxyOrigin: getProxyPublicOrigin(req, isProd),
            upstreamBase: ONLYOFFICE_BASE,
          } satisfies OnlyOfficeWsData,
        })

        if (upgraded) {
          return undefined as unknown as Response
        }

        return new Response('ONLYOFFICE WebSocket upgrade failed', { status: 500 })
      }

      return proxyOnlyOfficeHttp(req, ONLYOFFICE_BASE, isProd)
    }

    return app.fetch(req)
  },
  websocket: {
    open(ws) {
      onlyOfficeWsHandlers.open(ws)
    },
    message(ws, message) {
      onlyOfficeWsHandlers.message(ws, message)
    },
    close(ws) {
      onlyOfficeWsHandlers.close(ws)
    },
  },
})

console.log(`Arumanis server running on http://${HOST}:${PORT}`)

async function handleLogin(c: Context) {
  try {
    const body = await safeJsonBody(c)
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body ?? {}),
    })

    const payload = await safeParseResponse(response)
    if (!response.ok) {
      return c.json(payload ?? { message: 'Login gagal' }, response.status as any)
    }

    const token = extractToken(payload)
    if (token) {
      setSessionCookie(c, token)
    }

    return c.json({
      user: extractEntity((payload as any)?.user ?? payload),
    })
  } catch {
    return c.json({ message: 'Login gagal' }, 500)
  }
}

async function verifyToken(token: string) {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10_000),
    })

    const payload = await safeParseResponse(response)
    if (!response.ok) {
      return { ok: false as const, user: null }
    }

    return {
      ok: true as const,
      user: extractEntity(payload),
    }
  } catch {
    return { ok: false as const, user: null }
  }
}

async function forwardAuthRequest(
  c: Context,
  target: string,
  method: string,
  options?: { treatUnauthorizedAsAnonymous?: boolean },
) {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ user: null })
  }

  try {
    const response = await fetch(target, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const payload = await safeParseResponse(response)
    const gatewayError = detectAiGatewayPayload(payload)
    if (gatewayError) {
      console.error('[BFF] auth upstream returned AI gateway payload', { target, model: gatewayError.model })
      return c.json({
        message: 'Konfigurasi server salah: upstream auth mengembalikan respons AI gateway.',
        hint: 'Pastikan APIAMIS_BASE_URL=https://apiamis.cianjur.space/api di Coolify (terpisah dari chat_base_url 9router).',
      }, 502 as any)
    }

    if (!response.ok) {
      if (
        options?.treatUnauthorizedAsAnonymous &&
        (response.status === 401 || response.status === 403)
      ) {
        deleteCookie(c, SESSION_COOKIE, sessionCookieOptions())
        deleteCookie(c, IMPERSONATOR_COOKIE, sessionCookieOptions())
        return c.json({ user: null })
      }
      return c.json(payload ?? { message: 'Request failed' }, response.status as any)
    }

    const impersonatorCookie = getCookie(c, IMPERSONATOR_COOKIE)
    let isImpersonating = false
    let impersonator = null

    if (impersonatorCookie) {
      try {
        impersonator = JSON.parse(impersonatorCookie)
        isImpersonating = Boolean(impersonator)
      } catch {
        isImpersonating = false
      }
    }

    return c.json({
      user: extractEntity((payload as any)?.data ?? payload),
      isImpersonating,
      impersonator,
      message: (payload as any)?.message,
    })
  } catch {
    return c.json({ message: 'Auth service unavailable' }, 502)
  }
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'Strict' as const,
    path: '/',
  }
}

function impersonatorCookieOptions() {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'Strict' as const,
    path: '/',
    maxAge: 60 * 60 * 24,
  }
}

function setSessionCookie(c: Context, token: string) {
  setCookie(c, SESSION_COOKIE, token, {
    ...sessionCookieOptions(),
    maxAge: 60 * 60 * 12,
  })
}

function isLikelyMisconfiguredApiBase(value: string) {
  try {
    const url = new URL(value)
    const path = url.pathname.replace(/\/$/, '')
    if (/9router/i.test(url.hostname)) return true
    if (path.endsWith('/v1') && !path.endsWith('/api')) return true
    return false
  } catch {
    return false
  }
}

function detectAiGatewayPayload(payload: unknown): { model?: string } | null {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as Record<string, unknown>
  if (typeof record.model !== 'string') return null
  if ('user' in record || 'data' in record) return null
  if (record.success === false || typeof record.error === 'string') {
    return { model: record.model }
  }
  return null
}

function formatAiGatewayError(raw: string, model: string): string {
  try {
    const payload = JSON.parse(raw) as Record<string, unknown>
    const message = typeof payload.message === 'string'
      ? payload.message
      : typeof payload.error === 'string'
        ? payload.error
        : null
    const blocked = message?.toLowerCase().includes('blocked')
    const payloadModel = typeof payload.model === 'string' ? payload.model : model

    if (blocked) {
      return `Model "${payloadModel}" diblokir gateway AI. Ganti ke model yang didukung (mis. gc/gemini-2.5-flash).`
    }

    if (message) {
      return `Model "${payloadModel}": ${message}`
    }
  } catch {
    // Fall through to raw text.
  }

  const trimmed = raw.trim()
  if (trimmed) {
    return trimmed.slice(0, 200)
  }

  return `Model "${model}" gagal diuji.`
}

function isAllowedAiBaseUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

async function safeJsonBody(c: Context) {
  try {
    return await c.req.json()
  } catch {
    return null
  }
}

async function safeParseResponse(response: Response) {
  const contentType = response.headers.get('content-type') || ''
  if (response.status === 204) return null
  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }
  const text = await response.text()
  return text || null
}

function extractToken(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as Record<string, unknown>
  if (typeof record.token === 'string') return record.token
  if (record.data && typeof record.data === 'object' && typeof (record.data as Record<string, unknown>).token === 'string') {
    return (record.data as Record<string, unknown>).token as string
  }
  return null
}

function extractEntity(payload: unknown) {
  if (!payload || typeof payload !== 'object') return payload
  const record = payload as Record<string, unknown>
  if ('data' in record && record.data !== undefined && !Array.isArray(record.data)) return record.data
  if ('user' in record && record.user !== undefined) return record.user
  return payload
}

function userHasRole(user: unknown, roleName: string) {
  return extractUserRoles(user).includes(roleName)
}

function extractUserRoles(user: unknown) {
  if (!user || typeof user !== 'object') return [] as string[]
  const roles = (user as Record<string, unknown>).roles
  if (!Array.isArray(roles)) return [] as string[]

  return roles
    .map((role) => {
      if (typeof role === 'string') return role
      if (role && typeof role === 'object' && typeof (role as Record<string, unknown>).name === 'string') {
        return (role as Record<string, unknown>).name as string
      }
      return null
    })
    .filter((role): role is string => Boolean(role))
}

function relayResponse(response: Response, options?: { forceStream?: boolean }) {
  // Stream binary / attachment / SSE bodies. Buffering via arrayBuffer() OOMs or
  // times out on large backups (e.g. arumanis_*.zip with media) and surfaces as 502.
  const stream =
    Boolean(response.body) &&
    (options?.forceStream || shouldStreamUpstreamResponse(response))

  if (stream && response.body) {
    // Keep Content-Length only when body is not content-encoded (zip downloads).
    const hasContentEncoding = Boolean(response.headers.get('content-encoding'))
    const headers = filterResponseHeaders(response.headers, {
      keepContentLength: !hasContentEncoding,
    })
    // Discourage reverse proxies (nginx/Coolify) from buffering multi-GB bodies.
    if (!headers.has('X-Accel-Buffering')) {
      headers.set('X-Accel-Buffering', 'no')
    }
    if (!headers.has('Cache-Control')) {
      headers.set('Cache-Control', 'no-store, private')
    }
    return new Response(response.body, {
      status: response.status,
      headers,
    })
  }

  return response.arrayBuffer().then((body) => new Response(body, {
    status: response.status,
    headers: filterResponseHeaders(response.headers),
  }))
}

function filterResponseHeaders(headers: Headers, options?: { keepContentLength?: boolean }) {
  const next = new Headers()
  for (const [key, value] of headers.entries()) {
    const lower = key.toLowerCase()
    const hopByHop = [
      'content-encoding',
      'transfer-encoding',
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'upgrade',
    ]
    if (!options?.keepContentLength) {
      hopByHop.push('content-length')
    }
    if (hopByHop.includes(lower)) {
      continue
    }
    next.set(key, value)
  }
  return next
}

function contentTypeFor(filePath: string) {
  const ext = extname(filePath).toLowerCase()
  if (ext === '.js' || ext === '.mjs') return 'application/javascript; charset=utf-8'
  if (ext === '.css') return 'text/css; charset=utf-8'
  if (ext === '.html') return 'text/html; charset=utf-8'
  if (ext === '.svg') return 'image/svg+xml'
  if (ext === '.json') return 'application/json; charset=utf-8'
  if (ext === '.xml') return 'application/xml; charset=utf-8'
  if (ext === '.txt') return 'text/plain; charset=utf-8'
  return 'application/octet-stream'
}

/**
 * Serve Fumadocs static output from dist/docs (mounted at /docs).
 * Prefers prerendered HTML; falls back to SPA shell for client routes.
 */
async function serveDocsSite(requestPath: string): Promise<Response | null> {
  const docsRoot = resolve(DIST_DIR, 'docs')
  if (!existsSync(docsRoot)) return null

  // Map /docs → / and /docs/foo → /foo inside docsRoot
  let rel = requestPath === '/docs' || requestPath === '/docs/'
    ? '/'
    : requestPath.slice('/docs'.length) || '/'
  if (!rel.startsWith('/')) rel = `/${rel}`

  const candidate = resolve(docsRoot, `.${rel}`)
  if (!candidate.startsWith(docsRoot)) {
    return new Response('Not Found', { status: 404 })
  }

  const htmlHeaders = {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-cache, no-store, must-revalidate',
    pragma: 'no-cache',
  } as const

  // 1) Exact file (assets, data, etc.)
  if (extname(candidate) && existsSync(candidate)) {
    return new Response(Bun.file(candidate), {
      headers: {
        'content-type': contentTypeFor(candidate),
        ...cacheControlFor(requestPath),
      },
    })
  }

  // 2) Directory index (prerendered pages)
  const dirIndex = resolve(candidate, 'index.html')
  if (existsSync(dirIndex)) {
    return new Response(Bun.file(dirIndex), { headers: htmlHeaders })
  }

  // 3) Bare path + .html
  const htmlFile = `${candidate}.html`
  if (existsSync(htmlFile)) {
    return new Response(Bun.file(htmlFile), { headers: htmlHeaders })
  }

  // 4) SPA fallback for client-side navigation
  for (const name of ['__spa-fallback.html', 'index.html']) {
    const fallback = resolve(docsRoot, name)
    if (existsSync(fallback)) {
      return new Response(Bun.file(fallback), { headers: htmlHeaders })
    }
  }

  return new Response('Docs not found', { status: 404 })
}

function isStaticAssetRequest(requestPath: string) {
  if (requestPath.startsWith('/assets/') || requestPath.startsWith('/docs/assets/')) {
    return true
  }

  const extension = extname(requestPath).toLowerCase()
  return [
    '.js',
    '.mjs',
    '.css',
    '.wasm',
    '.map',
    '.json',
    '.xml',
    '.txt',
    '.svg',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.gif',
    '.ico',
    '.woff',
    '.woff2',
    '.ttf',
  ].includes(extension)
}

function cacheControlFor(requestPath: string) {
  if (requestPath === '/version.json') {
    return {
      'cache-control': 'no-cache, no-store, must-revalidate',
      pragma: 'no-cache',
    }
  }

  if (requestPath.startsWith('/assets/')) {
    return {
      'cache-control': 'public, max-age=31536000, immutable',
    }
  }

  if (/\.(svg|png|jpe?g|gif|ico|webp|woff2?|ttf|eot)$/i.test(requestPath)) {
    return {
      'cache-control': 'public, max-age=31536000, immutable',
    }
  }

  return {}
}