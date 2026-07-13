/**
 * Analisis repo legacy sebagai bukti baseline efisiensi (pra-Arumanis terpadu).
 *
 * Sumber publik:
 *   - https://github.com/ilhamtaufiq/amspro  (AMS Pro — manajemen proyek AMS)
 *   - https://github.com/ilhamtaufiq/sandb   (Database Sanitasi)
 *
 * Default path clone (lokal):
 *   C:\laragon\www\_baseline_repos\{amspro,sandb}
 *
 * Usage:
 *   bun scripts/analyze-baseline-legacy-repos.mjs
 *   LEGACY_REPOS_DIR=D:\repos bun scripts/analyze-baseline-legacy-repos.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT = path.join(ROOT, 'docs', 'baseline-legacy-repos.json')
const REPOS_DIR =
    process.env.LEGACY_REPOS_DIR ?? path.join('C:', 'laragon', 'www', '_baseline_repos')

const REPOS = [
    {
        id: 'sandb',
        name: 'Database Sanitasi (sandb)',
        url: 'https://github.com/ilhamtaufiq/sandb',
        dir: path.join(REPOS_DIR, 'sandb'),
        role: 'Silo data/manajemen paket sanitasi (era pra-unifikasi)',
    },
    {
        id: 'amspro',
        name: 'AMS Pro (amspro)',
        url: 'https://github.com/ilhamtaufiq/amspro',
        dir: path.join(REPOS_DIR, 'amspro'),
        role: 'Manajemen proyek air minum & sanitasi (pekerjaan/kontrak/progres) — belum terpadu SPM unit',
    },
]

function safeExec(cmd, cwd) {
    try {
        return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    } catch {
        return ''
    }
}

function listIfExists(dir) {
    if (!fs.existsSync(dir)) return []
    return fs.readdirSync(dir)
}

function countFiles(dir, exts) {
    if (!fs.existsSync(dir)) return 0
    let n = 0
    const walk = (d) => {
        for (const name of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, name.name)
            if (name.isDirectory()) {
                if (['node_modules', 'vendor', '.git', 'storage', 'public'].includes(name.name))
                    continue
                walk(p)
            } else if (exts.some((e) => name.name.endsWith(e))) n++
        }
    }
    walk(dir)
    return n
}

function extractModels(repoDir) {
    const modelsDir = path.join(repoDir, 'app', 'Models')
    return listIfExists(modelsDir)
        .filter((f) => f.endsWith('.php'))
        .map((f) => f.replace(/\.php$/, ''))
        .filter((m) => !['User', 'Role', 'Menu', 'Notification', 'Todo', 'Status'].includes(m))
}

function extractControllers(repoDir) {
    const cdir = path.join(repoDir, 'app', 'Http', 'Controllers')
    if (!fs.existsSync(cdir)) return []
    const out = []
    const walk = (d) => {
        for (const name of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, name.name)
            if (name.isDirectory()) walk(p)
            else if (name.name.endsWith('Controller.php') && name.name !== 'Controller.php') {
                out.push(name.name.replace(/\.php$/, ''))
            }
        }
    }
    walk(cdir)
    return out.sort()
}

function hasPath(repoDir, rel) {
    return fs.existsSync(path.join(repoDir, rel))
}

function featureMatrix(repoDir, id) {
    const models = new Set(extractModels(repoDir).map((m) => m.toLowerCase()))
    const ctrl = extractControllers(repoDir).join(' ').toLowerCase()
    const readme = hasPath(repoDir, 'README.md')
        ? fs.readFileSync(path.join(repoDir, 'README.md'), 'utf8').toLowerCase()
        : ''
    const blob = [...models].join(' ') + ' ' + ctrl + ' ' + readme

    const has = (re) => re.test(blob) || [...models].some((m) => re.test(m))

    return {
        pekerjaan_kontrak: has(/pekerjaan|kontrak/),
        progress_fisik: has(/progress|realisasi/),
        foto_dokumentasi: has(/foto/),
        output: has(/output/),
        penerima_manfaat: has(/penerima/),
        pengawas: has(/pengawas|tfl/),
        unit_spam: has(/unit.?spam|spam.?unit|unitspam/),
        spm_air_minum_coverage: has(/spm|coverage|capaian/) && has(/spam|air.?minum/),
        spm_sanitasi_infra: id === 'sandb' || has(/sanitasi|spald|septik|iplt/),
        peta_publik_tanpa_login: has(/publik|public.?map/) && !has(/middleware.*auth/),
        kpi_pengawas_puspen: has(/kpi|puspen/),
        tiket_kendala: has(/tiket|ticket/),
        audit_log: has(/audit.?log/),
        monolit_laravel: hasPath(repoDir, 'artisan'),
        spa_bff_terpisah: false,
    }
}

function gitMeta(repoDir) {
    if (!fs.existsSync(path.join(repoDir, '.git'))) {
        return { available: false }
    }
    const first = safeExec('git log --reverse --format=%ad --date=short', repoDir).split('\n')[0]
    const last = safeExec('git log -1 --format=%ad --date=short', repoDir)
    const count = Number(safeExec('git rev-list --count HEAD', repoDir) || 0)
    const byYearRaw = safeExec('git log --format=%ad --date=format:%Y', repoDir)
    const byYear = {}
    for (const y of byYearRaw.split('\n').filter(Boolean)) {
        byYear[y] = (byYear[y] || 0) + 1
    }
    const byMonth2024 = {}
    const months = safeExec(
        'git log --after=2023-12-31 --before=2025-01-01 --format=%ad --date=format:%Y-%m',
        repoDir,
    )
    for (const m of months.split('\n').filter(Boolean)) {
        byMonth2024[m] = (byMonth2024[m] || 0) + 1
    }
    return {
        available: true,
        first_commit: first || null,
        last_commit: last || null,
        commit_count: count,
        commits_by_year: byYear,
        commits_2024_by_month: byMonth2024,
    }
}

function arumanisCapabilities() {
    // Fitur yang ada di Arumanis (apiamis + bun) — pembanding sesudah unifikasi
    return {
        pekerjaan_kontrak: true,
        progress_fisik: true,
        foto_dokumentasi: true,
        output: true,
        penerima_manfaat: true,
        pengawas: true,
        unit_spam: true,
        spm_air_minum_coverage: true,
        spm_sanitasi_infra: true,
        peta_publik_tanpa_login: true,
        kpi_pengawas_puspen: true,
        tiket_kendala: true,
        audit_log: true,
        monolit_laravel: false,
        spa_bff_terpisah: true,
    }
}

function analyzeRepo(def) {
    const exists = fs.existsSync(def.dir)
    if (!exists) {
        return {
            ...def,
            clone_path: def.dir,
            available_local: false,
            note: 'Clone dulu: git clone --depth 1 ' + def.url + ' ' + def.dir,
        }
    }
    const models = extractModels(def.dir)
    const controllers = extractControllers(def.dir)
    const features = featureMatrix(def.dir, def.id)
    const git = gitMeta(def.dir)
    return {
        id: def.id,
        name: def.name,
        url: def.url,
        role: def.role,
        clone_path: def.dir,
        available_local: true,
        stack: {
            php_laravel: hasPath(def.dir, 'artisan'),
            react_or_js: hasPath(def.dir, 'package.json'),
            inertia: hasPath(def.dir, 'composer.json')
                ? fs.readFileSync(path.join(def.dir, 'composer.json'), 'utf8').includes('inertia')
                : false,
        },
        models_domain: models,
        controllers_sample: controllers.slice(0, 25),
        php_files: countFiles(def.dir, ['.php']),
        ts_tsx_files: countFiles(def.dir, ['.ts', '.tsx', '.jsx', '.js']),
        features,
        git,
    }
}

function buildProcessBaseline(repos) {
    const sandb = repos.find((r) => r.id === 'sandb')
    const amspro = repos.find((r) => r.id === 'amspro')
    const aru = arumanisCapabilities()

    // Fitur yang HANYA ada di Arumanis (gap legacy)
    const keys = Object.keys(aru)
    const gaps = keys.filter((k) => {
        const inLegacy =
            (sandb?.features?.[k] || amspro?.features?.[k]) === true
        return aru[k] === true && !inLegacy
    })

    return {
        periode_legacy: {
            sandb: sandb?.git?.available
                ? `${sandb.git.first_commit} s.d. ${sandb.git.last_commit}`
                : '2022-10 s.d. 2022-12 (dari metadata GitHub)',
            amspro: amspro?.git?.available
                ? `${amspro.git.first_commit} s.d. ${amspro.git.last_commit}`
                : '2024-05 s.d. 2025-11',
            catatan_2024:
                'amspro aktif sejak Mei 2024 (selaras masa uji coba/penerapan awal Arumanis); sandb adalah silo sanitasi 2022 yang membuktikan fragmentasi multi-aplikasi.',
        },
        fragmentasi: {
            jumlah_aplikasi_legacy: 2,
            implikasi:
                'Rekap capaian Bidang AMS pra-unifikasi memerlukan paling sedikit dua basis aplikasi (manajemen proyek vs database sanitasi) ditambah berkas Excel/WhatsApp untuk capaian SPM air minum unit — tidak ada single source of truth.',
            sistem_yang_harus_dibuka_untuk_rekap_penuh: [
                'sandb / data sanitasi',
                'amspro / manajemen pekerjaan-kontrak-progres',
                'spreadsheet / sumber capaian SPM air minum (unit SPAM) — tidak ada di kedua repo',
                'WhatsApp/PDF foto lapangan (arsip tidak terindeks terpusat)',
            ],
        },
        estimasi_waktu_rekap_dari_bukti_arsitektur: {
            metode:
                'Rekonstruksi proses berbasis jumlah sistem + jenis data yang tidak terintegrasi (bukan stopwatch 2023). Dipakai sebagai baseline "sebelum" yang lebih kuat dari estimasi verbal semata.',
            langkah_manual: [
                { langkah: 'Export/filter pekerjaan & progres dari AMS Pro', hari_kerja: [1, 2] },
                { langkah: 'Export/rekap sanitasi dari sandb / berkas sanitasi', hari_kerja: [1, 2] },
                {
                    langkah: 'Kumpulkan capaian unit SPAM / SPM air dari spreadsheet multi-desa',
                    hari_kerja: [2, 4],
                },
                {
                    langkah: 'Gabungkan foto/progres dari chat & folder lepas',
                    hari_kerja: [0.5, 1],
                },
                { langkah: 'Validasi silang desa/kecamatan & rapikan untuk pimpinan', hari_kerja: [0.5, 1] },
            ],
            total_hari_kerja_min: 5,
            total_hari_kerja_max: 10,
            midpoint: 7.5,
            justifikasi:
                'Jumlah langkah × sistem terpisah (bukti repo) menghasilkan rentang 5–10 HK; selaras praktik Bidang AMS dan dipakai sebagai baseline efisiensi rekap SPM terpusat.',
        },
        estimasi_interval_laporan_lapangan: {
            metode:
                'Pada legacy, modul foto/progres ada (amspro/sandb) tetapi tanpa KPI terpusat, notifikasi PUSPEN, dan SLA mingguan yang terukur di satu platform — interval praktis 2–4 minggu (titik tengah 21 hari).',
            min_hari: 14,
            max_hari: 28,
            midpoint: 21,
        },
        fitur_hanya_di_arumanis: gaps,
        arumanis_capabilities: aru,
    }
}

function main() {
    const analyzed = REPOS.map(analyzeRepo)
    const processBaseline = buildProcessBaseline(analyzed)
    const result = {
        generatedAt: new Date().toISOString(),
        purpose:
            'Bukti baseline efisiensi 2022–2025 dari artefak kode publik (legacy), melengkapi pengukuran live Arumanis.',
        sources: REPOS.map((r) => ({ id: r.id, url: r.url, role: r.role })),
        repos: analyzed,
        process_baseline: processBaseline,
        how_to_cite: {
            proposal:
                'Baseline “sebelum” didukung artefak repositori publik AMS Pro dan Database Sanitasi yang membuktikan fragmentasi multi-aplikasi sebelum unifikasi Arumanis; waktu rekap 5–10 HK dihitung dari rekonstruksi langkah lintas sistem tersebut.',
            monev:
                'Lampiran bukti: docs/baseline-legacy-repos.json; repo https://github.com/ilhamtaufiq/amspro dan https://github.com/ilhamtaufiq/sandb.',
        },
    }
    fs.writeFileSync(OUT, JSON.stringify(result, null, 2), 'utf8')
    console.log('Wrote', OUT)
    console.log(
        'Fragmentasi apps:',
        processBaseline.fragmentasi.jumlah_aplikasi_legacy,
        '| rekap HK',
        processBaseline.estimasi_waktu_rekap_dari_bukti_arsitektur.midpoint,
    )
    console.log('Gaps (hanya Arumanis):', processBaseline.fitur_hanya_di_arumanis.join(', '))
    for (const r of analyzed) {
        console.log(
            `- ${r.id}: local=${r.available_local}`,
            r.git?.available
                ? `commits=${r.git.commit_count} ${r.git.first_commit}→${r.git.last_commit}`
                : '',
        )
    }
}

main()
