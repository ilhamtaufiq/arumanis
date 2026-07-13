/**
 * Ukur metrik efisiensi Arumanis dari data live (API + audit log).
 *
 * Metodologi:
 * 1) SESUDAH (terukur sistem)
 *    - Waktu rekap digital: rantai API spam-units/stats + spm-sanitasi/stats + dashboard/stats
 *      (n trial, median ms → dinyatakan same-day / <1 jam kerja operasional).
 *    - Interval update progres: selisih hari antar tanggal distinct di audit-logs type=Progress
 *      (median/p25/p75).
 *    - Cakupan update progress-fisik: % paket updated_at dalam 7/14/30 hari.
 *    - Kelengkapan: foto audit, KPI pengawas (foto/fisik), output paket.
 * 2) SEBELUM (rekonstruksi proses pra-penerapan — bukan log sistem)
 *    - Rekap SPM multi-desa manual: 5–10 hari kerja (titik tengah 7,5 HK).
 *    - Interval laporan pengawas manual: 14–28 hari (titik tengah 21 hari).
 *    - Alasan: tbl_audit_logs baru aktif sejak akhir Des 2025; tidak ada jejak pra-2024.
 *
 * Usage:
 *   bun scripts/measure-efficiency-baseline.mjs
 * Env: API_BASE, API_EMAIL, API_PASSWORD
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'docs', 'efficiency-baseline-live.json')
const LEGACY_PATH = path.join(__dirname, '..', 'docs', 'baseline-legacy-repos.json')

const BASE = process.env.API_BASE ?? 'https://apiamis.cianjur.space/api'
const EMAIL = process.env.API_EMAIL ?? 'ilhamtaufiq@gmail.com'
const PASSWORD = process.env.API_PASSWORD ?? 'Cianjur22!'

function loadLegacyBaseline() {
    if (!fs.existsSync(LEGACY_PATH)) return null
    try {
        return JSON.parse(fs.readFileSync(LEGACY_PATH, 'utf8').replace(/^\uFEFF/, ''))
    } catch {
        return null
    }
}

async function api(pathname, token, opts = {}) {
    const t0 = performance.now()
    const res = await fetch(`${BASE}${pathname}`, {
        ...opts,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...opts.headers,
        },
    })
    const ms = performance.now() - t0
    if (!res.ok) {
        const body = await res.text()
        throw new Error(`${pathname} → ${res.status} ${body.slice(0, 200)}`)
    }
    return { json: await res.json(), ms }
}

function pct(arr, p) {
    if (!arr.length) return null
    const s = [...arr].sort((a, b) => a - b)
    const i = Math.min(s.length - 1, Math.round((p / 100) * (s.length - 1)))
    return s[i]
}

function avg(arr) {
    if (!arr.length) return null
    return arr.reduce((a, b) => a + b, 0) / arr.length
}

function round(n, d = 2) {
    if (n == null || Number.isNaN(n)) return null
    const f = 10 ** d
    return Math.round(n * f) / f
}

async function fetchAllAudit(token, type) {
    const rows = []
    const first = await api(`/audit-logs?per_page=50&type=${encodeURIComponent(type)}`, token)
    const meta = first.json.meta ?? {}
    rows.push(...(first.json.data ?? []))
    const lastPage = meta.last_page ?? 1
    for (let page = 2; page <= lastPage; page++) {
        const r = await api(
            `/audit-logs?per_page=50&page=${page}&type=${encodeURIComponent(type)}`,
            token,
        )
        rows.push(...(r.json.data ?? []))
    }
    return rows
}

async function main() {
    const login = await api('/auth/login', null, {
        method: 'POST',
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    })
    const token = login.json.token
    if (!token) throw new Error('Login gagal: token kosong')

    // --- 1) Waktu rekap digital (n trial) ---
    const rekapTrialsMs = []
    for (let i = 0; i < 5; i++) {
        const t0 = performance.now()
        await api('/spam-units/stats', token)
        await api('/spm-sanitasi/stats', token)
        await api('/dashboard/stats', token)
        rekapTrialsMs.push(Math.round(performance.now() - t0))
    }
    const rekapMedianMs = pct(rekapTrialsMs, 50)

    // --- 2) Progress fisik snapshot ---
    const pfAll = []
    let pfPage = 1
    let pfLast = 1
    while (pfPage <= pfLast) {
        const r = await api(`/puspen/progress-fisik?per_page=50&page=${pfPage}`, token)
        pfLast = r.json.meta?.last_page ?? 1
        pfAll.push(...(r.json.data ?? []))
        pfPage++
    }
    const now = Date.now()
    const pfUpdated = pfAll
        .map((p) => p.updated_at)
        .filter(Boolean)
        .map((d) => new Date(d))
    const withinDays = (days) =>
        pfUpdated.filter((d) => now - d.getTime() <= days * 86400000).length
    const pfN = pfAll.length || 1

    // --- 3) Interval audit Progress ---
    const progLogs = await fetchAllAudit(token, 'Progress')
    const byPek = new Map()
    for (const row of progLogs) {
        const pid =
            row.pekerjaan?.id ??
            row.new_values?.pekerjaan_id ??
            row.auditable_id
        const d = row.created_at
        if (!pid || !d) continue
        if (!byPek.has(pid)) byPek.set(pid, [])
        byPek.get(pid).push(new Date(d))
    }
    const intervals = []
    let multiDayPackages = 0
    for (const dates of byPek.values()) {
        const dayKeys = [
            ...new Set(dates.map((d) => d.toISOString().slice(0, 10))),
        ]
            .map((s) => new Date(`${s}T00:00:00Z`))
            .sort((a, b) => a - b)
        if (dayKeys.length >= 2) {
            multiDayPackages++
            for (let i = 1; i < dayKeys.length; i++) {
                intervals.push((dayKeys[i] - dayKeys[i - 1]) / 86400000)
            }
        }
    }

    // --- 4) Foto / KPI ---
    const fotoMeta = (
        await api('/audit-logs?per_page=1&type=Foto&event=created', token)
    ).json.meta
    const earliest = (
        await api(
            `/audit-logs?per_page=1&page=${(await api('/audit-logs?per_page=1', token)).json.meta.last_page}`,
            token,
        )
    ).json.data?.[0]
    const kpi = (await api('/puspen/pengawas-kpi?per_page=50', token)).json
    const kpiRows = kpi.data ?? []
    const spam = (await api('/spam-units/stats', token)).json.data ?? {}
    const san = (await api('/spm-sanitasi/stats', token)).json.data ?? {}
    const dash = (await api('/dashboard/stats', token)).json.data ?? {}
    const pengawas = (await api('/pengawas/statistics', token)).json.data ?? {}

    // Baseline SEBELUM: rekonstruksi proses + bukti artefak repo legacy (sandb, amspro)
    const legacy = loadLegacyBaseline()
    const legProc = legacy?.process_baseline
    const rekapLeg = legProc?.estimasi_waktu_rekap_dari_bukti_arsitektur
    const intLeg = legProc?.estimasi_interval_laporan_lapangan
    const sebelum = {
        sumber: legacy
            ? 'rekonstruksi_proses_plus_artefak_repo_legacy'
            : 'rekonstruksi_proses_bidang_ams_pra_penerapan',
        catatan: legacy
            ? 'Baseline diperkuat bukti kode publik: Database Sanitasi (sandb, 2022) dan AMS Pro (amspro, 2024–2025) — fragmentasi multi-aplikasi sebelum unifikasi Arumanis. Bukan stopwatch 2023; dihitung dari langkah lintas sistem + praktik Bidang AMS.'
            : 'Bukan dari audit log (log baru aktif akhir Des 2025). Titik tengah rentang praktik manual.',
        rekap_spm_hari_kerja: {
            min: rekapLeg?.total_hari_kerja_min ?? 5,
            max: rekapLeg?.total_hari_kerja_max ?? 10,
            midpoint: rekapLeg?.midpoint ?? 7.5,
        },
        interval_laporan_pengawas_hari: {
            min: intLeg?.min_hari ?? 14,
            max: intLeg?.max_hari ?? 28,
            midpoint: intLeg?.midpoint ?? 21,
        },
        kanal_data: [
            'Excel',
            'PDF',
            'WhatsApp',
            'berkas fisik',
            ...(legacy
                ? [
                      'repo sandb (Database Sanitasi)',
                      'repo amspro (AMS Pro manajemen proyek)',
                  ]
                : []),
        ],
        bukti_repo_legacy: legacy
            ? {
                  sources: legacy.sources,
                  fragmentasi: legProc?.fragmentasi,
                  fitur_hanya_di_arumanis: legProc?.fitur_hanya_di_arumanis,
                  langkah_rekap: rekapLeg?.langkah_manual,
                  sandb_periode: legProc?.periode_legacy?.sandb,
                  amspro_periode: legProc?.periode_legacy?.amspro,
                  file_detail: 'docs/baseline-legacy-repos.json',
              }
            : null,
    }

    const sesudah = {
        sumber: 'pengukuran_live_api_dan_audit_log',
        diukur_pada: new Date().toISOString(),
        rekap_digital: {
            metode:
                'Median latensi rantai API: GET /spam-units/stats + /spm-sanitasi/stats + /dashboard/stats (n=5, berurutan).',
            trials_ms: rekapTrialsMs,
            median_ms: rekapMedianMs,
            median_detik: round(rekapMedianMs / 1000, 2),
            interpretasi_operasional:
                'Rekap capaian SPM + ringkasan pekerjaan tersedia dalam hitungan detik (same-day / <1 jam kerja termasuk validasi operator).',
            hari_kerja_setara: 0.1,
        },
        interval_update_progres: {
            metode:
                'Selisih hari kalender antar tanggal distinct created_at pada audit-logs?type=Progress, dikelompokkan per pekerjaan.',
            audit_events: progLogs.length,
            paket_multi_hari: multiDayPackages,
            interval_n: intervals.length,
            median_hari: pct(intervals, 50),
            p25_hari: pct(intervals, 25),
            p75_hari: pct(intervals, 75),
            mean_hari: round(avg(intervals), 2),
        },
        cakupan_progress_fisik: {
            metode: 'Snapshot GET /puspen/progress-fisik — proporsi paket by updated_at.',
            total_paket: pfAll.length,
            updated_7_hari: withinDays(7),
            updated_14_hari: withinDays(14),
            updated_30_hari: withinDays(30),
            pct_updated_7_hari: round((100 * withinDays(7)) / pfN, 1),
            pct_updated_14_hari: round((100 * withinDays(14)) / pfN, 1),
            pct_updated_30_hari: round((100 * withinDays(30)) / pfN, 1),
            realisasi_gt_0: pfAll.filter((p) => Number(p.realisasi) > 0).length,
            has_outputs: pfAll.filter((p) => p.has_outputs).length,
            pho_completed: pfAll.filter((p) => p.pho_completed).length,
        },
        kelengkapan_dokumentasi: {
            foto_audit_created: fotoMeta?.total ?? null,
            audit_log_sejak: earliest?.created_at ?? null,
            kpi_pengawas_n: kpiRows.length,
            kpi_dengan_foto: kpiRows.filter((r) => Number(r.foto_count) > 0).length,
            kpi_dengan_fisik: kpiRows.filter((r) => Number(r.fisik_count) > 0).length,
            mean_foto_per_pengawas: round(
                avg(kpiRows.map((r) => Number(r.foto_count) || 0)),
                1,
            ),
            total_foto_stats: spam.total_foto_dokumentasi ?? null,
            total_pekerjaan: dash.totalPekerjaan ?? null,
            total_pengawas: pengawas.total_pengawas ?? null,
            total_lokasi: pengawas.total_lokasi ?? null,
        },
        volume_data: {
            spam_units: spam.total_units ?? null,
            spm_air_pct: spam.coverage_percentage ?? null,
            spm_san_pct: san.coverage_kk_percentage ?? null,
            sanitasi_infra: san.total_count ?? null,
        },
    }

    // Efisiensi dihitung hanya jika numerator/denominator valid
    const rekapSebelum = sebelum.rekap_spm_hari_kerja.midpoint
    const rekapSesudah = sesudah.rekap_digital.hari_kerja_setara
    const rekapEfisiensiPct = round(
        (100 * (rekapSebelum - rekapSesudah)) / rekapSebelum,
        1,
    )

    const intervalSebelum = sebelum.interval_laporan_pengawas_hari.midpoint
    const intervalSesudah =
        sesudah.interval_update_progres.median_hari ?? intervalSebelum
    const intervalEfisiensiPct = round(
        (100 * (intervalSebelum - intervalSesudah)) / intervalSebelum,
        1,
    )

    const result = {
        fetchedAt: new Date().toISOString(),
        apiBase: BASE,
        metodologi: {
            versi: '1.1',
            ringkas:
                'Sesudah = pengukuran live (API latency + audit log + snapshot progress). Sebelum = rekonstruksi proses yang diperkuat artefak repo legacy publik (sandb 2022, amspro 2024–2025) + titik tengah rentang langkah lintas sistem.',
            batasan: [
                'Audit log dimulai ~29 Des 2025; tidak merepresentasikan seluruh masa sejak penerapan Apr 2024.',
                'Latensi API mengukur ketersediaan rekap digital, bukan waktu pengetikan laporan naratif.',
                'Interval progress hanya dari paket yang memiliki ≥2 hari audit Progress.',
                'Repo legacy membuktikan fragmentasi fitur/arsitektur; tidak menyimpan timestamp jam-kerja operator 2023–2024.',
            ],
            bukti_baseline_2024: legacy
                ? {
                      amspro: 'https://github.com/ilhamtaufiq/amspro',
                      sandb: 'https://github.com/ilhamtaufiq/sandb',
                      detail: 'docs/baseline-legacy-repos.json',
                  }
                : null,
        },
        sebelum,
        sesudah,
        efisiensi: {
            rekap_spm: {
                sebelum_hari_kerja: rekapSebelum,
                sesudah_hari_kerja: rekapSesudah,
                sesudah_median_detik: sesudah.rekap_digital.median_detik,
                efisiensi_pct: rekapEfisiensiPct,
                rumus: '(sebelum − sesudah) / sebelum × 100',
            },
            interval_laporan_progres: {
                sebelum_hari: intervalSebelum,
                sesudah_median_hari: intervalSesudah,
                efisiensi_pct: intervalEfisiensiPct,
                rumus: '(sebelum − sesudah) / sebelum × 100; sesudah = median interval audit Progress',
                catatan_desain: 'Target operasional sistem: mingguan; realisasi median terukur ~biweekly.',
            },
        },
        narasi_proposal: {
            metode_singkat: buildMetodeNarasi({
                rekapMedianMs,
                rekapEfisiensiPct,
                intervalSesudah,
                intervalEfisiensiPct,
                sesudah,
                sebelum,
            }),
        },
    }

    fs.writeFileSync(OUT, JSON.stringify(result, null, 2), 'utf8')
    console.log(JSON.stringify(result.efisiensi, null, 2))
    console.log('rekap trials ms:', rekapTrialsMs, 'median', rekapMedianMs)
    console.log('progress intervals median', pct(intervals, 50), 'n', intervals.length)
    console.log('Wrote', OUT)
}

function buildMetodeNarasi({
    rekapMedianMs,
    rekapEfisiensiPct,
    intervalSesudah,
    intervalEfisiensiPct,
    sesudah,
    sebelum,
}) {
    const det = (rekapMedianMs / 1000).toFixed(1).replace('.', ',')
    const pf = sesudah.cakupan_progress_fisik
    const kel = sesudah.kelengkapan_dokumentasi
    return (
        `Metodologi pengukuran efisiensi (hibrida). ` +
        `SEBELUM (rekonstruksi proses Bidang AMS pra-penerapan, bukan log sistem): ` +
        `rekapitulasi SPM multi-desa manual ${sebelum.rekap_spm_hari_kerja.min}–${sebelum.rekap_spm_hari_kerja.max} hari kerja ` +
        `(titik tengah ${sebelum.rekap_spm_hari_kerja.midpoint} HK); ` +
        `interval laporan pengawas ${sebelum.interval_laporan_pengawas_hari.min}–${sebelum.interval_laporan_pengawas_hari.max} hari ` +
        `(titik tengah ${sebelum.interval_laporan_pengawas_hari.midpoint} hari) melalui Excel/PDF/WhatsApp/berkas. ` +
        `SESUDAH (terukur live): (1) waktu ketersediaan rekap digital SPM+dashboard = median ${det} detik ` +
        `(n=5 trial rantai API /spam-units/stats + /spm-sanitasi/stats + /dashboard/stats; setara <0,1 HK / same-day) → ` +
        `efisiensi waktu rekap ≈ ${String(rekapEfisiensiPct).replace('.', ',')}%; ` +
        `(2) interval antar-hari update progres dari audit log Progress: median ${intervalSesudah} hari ` +
        `(n=${sesudah.interval_update_progres.interval_n} interval, ${sesudah.interval_update_progres.paket_multi_hari} paket) → ` +
        `efisiensi interval ≈ ${String(intervalEfisiensiPct).replace('.', ',')}% vs titik tengah manual; ` +
        `(3) snapshot progress fisik: ${pf.pct_updated_14_hari}% paket di-update ≤14 hari, ` +
        `${pf.pct_updated_30_hari}% ≤30 hari (dari ${pf.total_paket} paket); ` +
        `(4) kelengkapan: ${kel.kpi_dengan_foto}/${kel.kpi_pengawas_n} pengawas KPI punya foto, ` +
        `${kel.foto_audit_created} event foto di audit log (sejak ${String(kel.audit_log_sejak || '').slice(0, 10)}). ` +
        `Batasan: audit log belum mencakup seluruh masa sejak penerapan April 2024.`
    )
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
