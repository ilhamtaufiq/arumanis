/**
 * SPSE network recorder — browser headed, login & navigasi manual (CAPTCHA).
 *
 * Usage:
 *   bun run spse:record
 *   bun run spse:record:kontrak
 *   bun run spse:record -- --url "https://spse.inaproc.id/cianjurkab/beranda/nontender"
 *   bun run spse:record -- --scenario kontrak
 *
 * Output (gitignored): scripts/spse-discovery/output/
 */

import { chromium } from 'playwright'
import { createInterface } from 'node:readline'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUTPUT_DIR = join(ROOT, 'scripts', 'spse-discovery', 'output')
const PROFILE_DIR = join(ROOT, 'scripts', 'spse-discovery', '.browser-profile')

const DEFAULT_URL = 'https://spse.inaproc.id/cianjurkab'
const MAX_BODY_BYTES = 512_000
const INTERESTING_HOST_RE = /(inaproc\.id|lkpp\.go\.id)/i

/** Field Arumanis yang nanti perlu dipush ke SPSE — catat nama field di form SPSE saat rekaman. */
const KONTRAK_FIELD_MAPPING = [
    { arumanis: 'kode_paket', spse: '(belum diketahui — catat dari URL /nontender/{id})', wajib: true },
    { arumanis: 'kode_rup', spse: '(belum diketahui)', wajib: false },
    { arumanis: 'spk + tgl_spk', spse: '(belum diketahui)', wajib: false },
    { arumanis: 'spmk + tgl_spmk', spse: '(belum diketahui)', wajib: false },
    { arumanis: 'sppbj + tgl_sppbj', spse: '(belum diketahui)', wajib: false },
    { arumanis: 'nilai_kontrak', spse: '(belum diketahui)', wajib: false },
    { arumanis: 'tgl_selesai', spse: '(belum diketahui)', wajib: false },
    { arumanis: 'penyedia.nama', spse: '(belum diketahui — pemenang/penyedia)', wajib: true },
    { arumanis: 'nomor_penawaran + tanggal_penawaran', spse: '(belum diketahui)', wajib: false },
]

const SCENARIOS = {
    default: {
        title: 'Eksplorasi umum SPSE',
        startUrl: DEFAULT_URL,
        steps: null,
    },
    kontrak: {
        title: 'Rekam alur INPUT kontrak di SPSE (untuk sync Arumanis → SPSE)',
        startUrl: 'https://spse.inaproc.id/cianjurkab/beranda/nontender',
        steps: [
            {
                id: 'login',
                title: 'Login SPSE + CAPTCHA',
                hint: 'Gunakan akun PPK. Session tersimpan di .browser-profile untuk sesi berikutnya.',
            },
            {
                id: 'daftar_pl',
                title: 'Buka daftar Pengadaan Langsung (PPK)',
                hint: 'Pastikan tabel paket muncul. Request /dt/paket-ppk-pl akan tertangkap.',
            },
            {
                id: 'detail_pl',
                title: 'Buka DETAIL satu paket PL',
                hint: 'Klik nama paket → URL seperti /nontender/{kode_paket}. Catat kode_paket ini.',
            },
            {
                id: 'menu_kontrak_pl',
                title: 'Cari menu input kontrak / hasil pengadaan / penetapan',
                hint: 'Jelajahi tab/menu: hasil pengadaan, kontrak, SPK, SPMK, pemenang, dll.',
            },
            {
                id: 'simpan_kontrak_pl',
                title: 'ISI form kontrak lalu klik SIMPAN',
                hint: 'PENTING: ini yang direkam untuk sync. Perhatikan [WRITE] di terminal.',
                critical: true,
            },
            {
                id: 'tender_optional',
                title: '(Opsional) Ulangi untuk Tender/Seleksi',
                hint: 'Home → tender → detail /tender/{kode} → input kontrak → simpan.',
                optional: true,
            },
        ],
    },
}

function parseArgs(argv) {
    const args = { url: null, scenario: 'default' }
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--url' && argv[i + 1]) {
            args.url = argv[++i]
        } else if (argv[i] === '--scenario' && argv[i + 1]) {
            args.scenario = argv[++i]
        } else if (argv[i] === '--help' || argv[i] === '-h') {
            args.help = true
        }
    }
    return args
}

function printHelp() {
    console.log(`
SPSE Network Recorder

  bun run spse:record              eksplorasi bebas
  bun run spse:record:kontrak      panduan rekam input kontrak (sync Arumanis → SPSE)

Opsi:
  --scenario kontrak|default
  --url <start-url>
  --help

Output: scripts/spse-discovery/output/<timestamp>/
  network-log.json         semua request
  write-operations.json    POST/PUT simpan form (penting untuk sync)
  endpoints-summary.json   ringkasan endpoint
  scenario-log.json        langkah terpandu (mode kontrak)
  kontrak-field-mapping.json  template field Arumanis ↔ SPSE
`)
}

function urlPattern(url) {
    try {
        const u = new URL(url)
        return `${u.origin}${u.pathname}`
    } catch {
        return url
    }
}

function truncate(text, max = 2000) {
    if (!text || text.length <= max) return text
    return `${text.slice(0, max)}… [truncated ${text.length - max} chars]`
}

function summarizeJsonBody(body) {
    if (!body || typeof body !== 'object') return null
    const summary = { keys: Object.keys(body) }
    if (Array.isArray(body.data) && body.data.length > 0) {
        summary.dataRowCount = body.data.length
        summary.sampleRow = body.data[0]
        if (Array.isArray(body.data[0])) {
            summary.sampleRowColumnCount = body.data[0].length
        }
    }
    if (body.draw !== undefined) summary.draw = body.draw
    if (body.recordsTotal !== undefined) summary.recordsTotal = body.recordsTotal
    return summary
}

function parseFormBody(postData) {
    if (!postData || typeof postData !== 'string') return null
    try {
        const params = new URLSearchParams(postData)
        const obj = {}
        for (const [k, v] of params.entries()) {
            if (obj[k] !== undefined) {
                if (!Array.isArray(obj[k])) obj[k] = [obj[k]]
                obj[k].push(v)
            } else {
                obj[k] = v
            }
        }
        return obj
    } catch {
        return null
    }
}

function isNoiseUrl(url) {
    return (
        url.includes('/cdn-cgi/') ||
        url.includes('google.com') ||
        url.includes('googletagmanager') ||
        url.includes('gstatic.com') ||
        url.includes('/public/css/') ||
        url.includes('/public/js/') ||
        url.includes('/public/images/')
    )
}

function isDataTableRead(entry) {
    return entry.method === 'POST' && entry.url.includes('/dt/')
}

function isWriteOperation(entry) {
    if (!['POST', 'PUT', 'PATCH'].includes(entry.method)) return false
    if (!entry.url.includes('inaproc.id')) return false
    if (isNoiseUrl(entry.url)) return false
    if (isDataTableRead(entry)) return false
    return true
}

async function waitForEnter(message) {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    await new Promise((resolve) => {
        rl.question(message, () => {
            rl.close()
            resolve()
        })
    })
}

function printKontrakMapping() {
    console.log('')
    console.log('Field Arumanis → yang perlu dicari di form SPSE:')
    console.log('─'.repeat(60))
    for (const row of KONTRAK_FIELD_MAPPING) {
        const mark = row.wajib ? '*' : ' '
        console.log(`  ${mark} ${row.arumanis.padEnd(32)} → ${row.spse}`)
    }
    console.log('  * = wajib untuk matching/sync')
    console.log('')
}

async function runGuidedSteps(page, steps, scenarioLog) {
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        const prefix = step.optional ? '[opsional] ' : step.critical ? '[PENTING] ' : ''
        console.log('')
        console.log(`── Langkah ${i + 1}/${steps.length}: ${step.title} ${prefix}`)
        console.log(`   ${step.hint}`)
        if (step.critical) {
            console.log('   ⚠ Setelah klik Simpan, cek terminal ada baris [WRITE] ...')
        }
        await waitForEnter(`   Selesai langkah ini? Tekan ENTER untuk lanjut... `)

        const stepEntry = {
            stepId: step.id,
            title: step.title,
            completedAt: new Date().toISOString(),
            pageUrl: page.url(),
            critical: Boolean(step.critical),
            optional: Boolean(step.optional),
        }
        scenarioLog.push(stepEntry)
        console.log(`   ✓ URL saat ini: ${stepEntry.pageUrl}`)
    }
}

async function main() {
    const parsed = parseArgs(process.argv.slice(2))
    if (parsed.help) {
        printHelp()
        return
    }

    const scenario = SCENARIOS[parsed.scenario] ?? SCENARIOS.default
    if (parsed.scenario && !SCENARIOS[parsed.scenario]) {
        console.error(`Skenario tidak dikenal: ${parsed.scenario}`)
        console.error(`Tersedia: ${Object.keys(SCENARIOS).join(', ')}`)
        process.exit(1)
    }

    const startUrl = parsed.url ?? scenario.startUrl
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const runDir = join(OUTPUT_DIR, stamp)
    const scenarioLog = []

    await mkdir(runDir, { recursive: true })

    console.log('')
    console.log('=== SPSE Network Recorder ===')
    console.log(`Skenario  : ${parsed.scenario} — ${scenario.title}`)
    console.log(`Start URL : ${startUrl}`)
    console.log(`Output    : ${runDir}`)
    console.log('')

    if (parsed.scenario === 'kontrak') {
        console.log('Tujuan: merekam request SIMPAN saat input kontrak di SPSE,')
        console.log('       supaya kontrak Arumanis bisa di-push balik lewat API yang sama.')
        console.log('')
        console.log('Rekaman sebelumnya (2026-07-03) hanya menangkap BACA daftar paket (/dt/paket-ppk).')
        console.log('Belum ada POST simpan kontrak — langkah 5 di bawah wajib dilakukan.')
        printKontrakMapping()
    } else {
        console.log('Browser akan terbuka. Lakukan manual:')
        console.log('  1. Login SPSE + CAPTCHA')
        console.log('  2. Buka daftar paket, detail, form, dll.')
        console.log('  3. Tekan ENTER di terminal untuk simpan & tutup')
        console.log('')
    }

    const context = await chromium.launchPersistentContext(PROFILE_DIR, {
        headless: false,
        viewport: { width: 1400, height: 900 },
        locale: 'id-ID',
        timezoneId: 'Asia/Jakarta',
        acceptDownloads: true,
    })

    const page = context.pages()[0] ?? (await context.newPage())
    const entries = []
    const pending = new Map()
    let writeCount = 0

    const shouldCapture = (requestUrl) => INTERESTING_HOST_RE.test(requestUrl)

    page.on('request', (request) => {
        if (!shouldCapture(request.url())) return
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        pending.set(request, {
            id,
            startedAt: new Date().toISOString(),
            method: request.method(),
            url: request.url(),
            resourceType: request.resourceType(),
            requestHeaders: request.headers(),
            postData: truncate(request.postData() ?? null),
            referer: request.headers().referer ?? null,
        })
    })

    page.on('response', async (response) => {
        const request = response.request()
        const meta = pending.get(request)
        if (!meta) return
        pending.delete(request)

        const entry = {
            ...meta,
            finishedAt: new Date().toISOString(),
            status: response.status(),
            statusText: response.statusText(),
            responseHeaders: response.headers(),
            urlPattern: urlPattern(meta.url),
        }

        if (entry.postData) {
            entry.postDataParsed = parseFormBody(entry.postData)
        }

        const contentType = response.headers()['content-type'] ?? ''
        const isJson = contentType.includes('json') || meta.url.includes('/dt/')

        if (isJson) {
            try {
                const text = await response.text()
                if (text.length <= MAX_BODY_BYTES) {
                    try {
                        entry.responseJson = JSON.parse(text)
                        entry.responseSummary = summarizeJsonBody(entry.responseJson)
                    } catch {
                        entry.responseText = truncate(text)
                    }
                } else {
                    entry.responseText = truncate(text, 4000)
                    entry.responseTooLarge = true
                    entry.responseByteLength = text.length
                }
            } catch (err) {
                entry.responseError = String(err)
            }
        }

        entries.push(entry)

        if (isWriteOperation(entry)) {
            writeCount++
            console.log(`  [WRITE #${writeCount}] ${entry.method} ${entry.status} ${entry.urlPattern}`)
            if (entry.postDataParsed) {
                const keys = Object.keys(entry.postDataParsed).slice(0, 12)
                console.log(`             fields: ${keys.join(', ')}${keys.length < Object.keys(entry.postDataParsed).length ? '…' : ''}`)
            }
        } else if (entry.url.includes('/dt/') || entry.resourceType === 'xhr' || entry.resourceType === 'fetch') {
            const tag = isDataTableRead(entry) ? 'read-dt' : 'captured'
            console.log(`  [${tag}] ${entry.method} ${entry.status} ${entry.urlPattern}`)
        }
    })

    await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 })

    if (scenario.steps) {
        await runGuidedSteps(page, scenario.steps, scenarioLog)
        await waitForEnter('\nSemua langkah selesai. Tekan ENTER untuk simpan rekaman & tutup browser... ')
    } else {
        await waitForEnter('\nTekan ENTER setelah selesai browsing/login (simpan rekaman)... ')
    }

    const cookies = await context.cookies()
    const cookieDomains = [...new Set(cookies.map((c) => c.domain))]

    const endpointMap = new Map()
    for (const e of entries) {
        const key = `${e.method} ${e.urlPattern}`
        if (!endpointMap.has(key)) {
            endpointMap.set(key, {
                method: e.method,
                urlPattern: e.urlPattern,
                exampleUrl: e.url,
                statuses: [],
                count: 0,
                hasPostData: false,
                samplePostData: null,
                samplePostDataParsed: null,
                sampleResponseSummary: null,
                isWriteOperation: isWriteOperation(e),
            })
        }
        const row = endpointMap.get(key)
        row.count++
        if (!row.statuses.includes(e.status)) row.statuses.push(e.status)
        if (e.postData) {
            row.hasPostData = true
            row.samplePostData = e.postData
            row.samplePostDataParsed = e.postDataParsed ?? parseFormBody(e.postData)
        }
        if (e.responseSummary) row.sampleResponseSummary = e.responseSummary
    }

    const endpoints = [...endpointMap.values()].sort((a, b) => b.count - a.count)
    const writeOps = entries.filter(isWriteOperation).map((e) => ({
        method: e.method,
        url: e.url,
        urlPattern: e.urlPattern,
        status: e.status,
        referer: e.referer,
        postData: e.postData,
        postDataParsed: e.postDataParsed,
        responseSummary: e.responseSummary,
        startedAt: e.startedAt,
    }))

    const dtPaket = entries.filter((e) => e.url.includes('/dt/paket-ppk'))
    const report = {
        recordedAt: new Date().toISOString(),
        scenario: parsed.scenario,
        startUrl,
        totalEntries: entries.length,
        writeOperationCount: writeOps.length,
        cookieDomains,
        cookieCount: cookies.length,
        endpoints,
        writeOperations: writeOps,
        dtPaketPpkSamples: dtPaket.map((e) => ({
            url: e.url,
            method: e.method,
            postData: e.postData,
            status: e.status,
            responseSummary: e.responseSummary,
        })),
    }

    const mappingDoc = {
        purpose: 'Mapping field kontrak Arumanis → form/API SPSE (isi setelah rekaman)',
        recordedAt: new Date().toISOString(),
        scenario: parsed.scenario,
        arumanisSource: 'tbl_kontrak via /kontrak form',
        spseWriteEndpointsFound: writeOps.map((w) => w.urlPattern),
        fields: KONTRAK_FIELD_MAPPING.map((f) => ({
            ...f,
            spseFieldName: null,
            spseApiParam: null,
            notes: '',
        })),
        nextSteps: [
            'Buka write-operations.json — endpoint POST simpan kontrak ada di sini',
            'Catat nama field form dari postDataParsed',
            'Update mapping di kontrak-field-mapping.json',
            'Implement SpseKontrakPushService di APIAMIS',
        ],
    }

    await writeFile(join(runDir, 'network-log.json'), JSON.stringify(entries, null, 2), 'utf8')
    await writeFile(join(runDir, 'endpoints-summary.json'), JSON.stringify(report, null, 2), 'utf8')
    await writeFile(join(runDir, 'write-operations.json'), JSON.stringify(writeOps, null, 2), 'utf8')
    await writeFile(join(runDir, 'kontrak-field-mapping.json'), JSON.stringify(mappingDoc, null, 2), 'utf8')
    if (scenarioLog.length > 0) {
        await writeFile(join(runDir, 'scenario-log.json'), JSON.stringify(scenarioLog, null, 2), 'utf8')
    }
    await writeFile(join(runDir, 'cookies.json'), JSON.stringify(cookies, null, 2), 'utf8')

    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ')
    await writeFile(join(runDir, 'cookie-header.txt'), cookieHeader, 'utf8')

    console.log('')
    console.log('Tersimpan:')
    console.log(`  ${join(runDir, 'network-log.json')}`)
    console.log(`  ${join(runDir, 'write-operations.json')}  ← penting untuk sync kontrak`)
    console.log(`  ${join(runDir, 'endpoints-summary.json')}`)
    console.log(`  ${join(runDir, 'kontrak-field-mapping.json')}`)
    if (scenarioLog.length > 0) {
        console.log(`  ${join(runDir, 'scenario-log.json')}`)
    }
    console.log(`  ${join(runDir, 'cookies.json')}  (RAHASIA — jangan commit)`)
    console.log('')
    console.log(`Total request : ${entries.length}`)
    console.log(`Write ops     : ${writeOps.length}${writeOps.length === 0 ? ' ⚠ belum ada POST simpan — ulangi langkah 5' : ''}`)
    console.log(`Endpoint unik : ${endpoints.length}`)
    if (dtPaket.length > 0) {
        console.log(`/dt/paket-ppk  : ${dtPaket.length} sample(s)`)
    }
    console.log('')

    await context.close()
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})