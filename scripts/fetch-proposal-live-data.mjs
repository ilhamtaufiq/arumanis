import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'docs', 'proposal-live-data.json')

const BASE = process.env.API_BASE ?? 'https://apiamis.cianjur.space/api'
const EMAIL = process.env.API_EMAIL ?? 'ilhamtaufiq@gmail.com'
const PASSWORD = process.env.API_PASSWORD ?? 'Cianjur22!'

async function api(pathname, token, opts = {}) {
    const res = await fetch(`${BASE}${pathname}`, {
        ...opts,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...opts.headers,
        },
    })
    if (!res.ok) throw new Error(`${pathname} → ${res.status}`)
    return res.json()
}

async function login() {
    const body = await api('/auth/login', null, {
        method: 'POST',
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    })
    return body.token
}

async function fetchAllSpamUnits(token) {
    const units = []
    let page = 1
    let lastPage = 1
    while (page <= lastPage) {
        const resp = await api(`/spam-units?per_page=50&page=${page}`, token)
        lastPage = resp.meta?.last_page ?? 1
        units.push(...(resp.data ?? []))
        page++
    }
    return units
}

function aggregateAchievements(units) {
    const byYear = new Map()
    for (const unit of units) {
        for (const a of unit.achievements ?? []) {
            const tahun = String(a.tahun ?? 'N/A')
            if (!byYear.has(tahun)) {
                byYear.set(tahun, { tahun, records: 0, units: new Set(), kk: 0, jiwa: 0, sr: 0, bjp_kk: 0 })
            }
            const row = byYear.get(tahun)
            row.records++
            row.units.add(unit.id)
            row.kk += Number(a.jumlah_kk) || 0
            row.jiwa += Number(a.jumlah_jiwa) || 0
            row.sr += Number(a.jumlah_sr) || 0
            row.bjp_kk += Number(a.jumlah_bjp_kk) || 0
        }
    }
    return [...byYear.values()]
        .map((r) => ({
            tahun: r.tahun,
            records: r.records,
            units: r.units.size,
            kk: r.kk,
            jiwa: r.jiwa,
            sr: r.sr,
            bjp_kk: r.bjp_kk,
        }))
        .sort((a, b) => Number(a.tahun) - Number(b.tahun))
}

async function main() {
    const token = await login()

    const [dashAll, spam, sanitasi, pengawas] = await Promise.all([
        api('/dashboard/stats', token).then((r) => r.data ?? r),
        api('/spam-units/stats', token).then((r) => r.data ?? r),
        api('/spm-sanitasi/stats', token).then((r) => r.data ?? r),
        api('/pengawas/statistics', token).then((r) => r.data ?? r),
    ])

    const pekerjaanPerTahun = []
    for (let y = 2017; y <= 2026; y++) {
        const d = await api(`/dashboard/stats?tahun=${y}`, token).then((r) => r.data ?? r)
        pekerjaanPerTahun.push({
            tahun: String(y),
            kegiatan: d.totalKegiatan ?? 0,
            pekerjaan: d.totalPekerjaan ?? 0,
            kontrak: d.totalKontrak ?? 0,
            paguPekerjaan: d.totalPaguPekerjaan ?? 0,
            output: d.totalOutput ?? 0,
            penerima: d.totalPenerima ?? 0,
        })
    }

    const units = await fetchAllSpamUnits(token)
    const achievementPerTahun = aggregateAchievements(units)

    const earliestAchievementYear = achievementPerTahun[0]?.tahun ?? null
    const latestAchievementYear = achievementPerTahun.at(-1)?.tahun ?? null

    const out = {
        fetchedAt: new Date().toISOString(),
        dashboard: dashAll,
        spam,
        sanitasi,
        pengawas,
        pekerjaanPerTahun,
        achievementPerTahun,
        dataScope: {
            syncStartYear: 2017,
            earliestAchievementYear,
            latestAchievementYear,
            totalAchievementRecords: spam.achievement_records ?? achievementPerTahun.reduce((s, r) => s + r.records, 0),
            availableKegiatanYears: dashAll.availableYears ?? [],
            note: 'Rekapitulasi data yang telah dihimpun Arumanis dari impor multi-sumber sejak 2017. Capaian SPAM per tahun dihitung dari record achievement unit.',
        },
    }

    fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8')
    console.log(`✓ Data tersimpan: ${OUT}`)
    console.log(`  Achievement tahun: ${earliestAchievementYear}–${latestAchievementYear} (${achievementPerTahun.length} tahun)`)
    console.log(`  Pekerjaan aktif tahun: ${pekerjaanPerTahun.filter((p) => p.pekerjaan > 0).map((p) => `${p.tahun}=${p.pekerjaan}`).join(', ')}`)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})