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

async function fetchAllPekerjaan(token) {
    const items = []
    let page = 1
    let lastPage = 1
    while (page <= lastPage) {
        const resp = await api(`/pekerjaan?per_page=50&page=${page}`, token)
        lastPage = resp.meta?.last_page ?? 1
        items.push(...(resp.data ?? []))
        page++
    }
    const byId = new Map()
    for (const p of items) {
        if (!byId.has(p.id)) byId.set(p.id, p)
    }
    return [...byId.values()]
}

function isValidDesa(p) {
    const desa = p.desa?.nama_desa
    const kec = p.kecamatan?.nama_kecamatan
    return desa && desa !== 'NULLs' && kec && kec !== 'Cianjurkab'
}

function isKonsultanOnly(p) {
    return (p.tags ?? []).some((t) => t.slug === 'konsultan') && (p.foto_count ?? 0) === 0
}

function detectBidang(p) {
    const text = `${p.nama_paket ?? ''} ${p.kegiatan?.sub_bidang ?? ''} ${p.kegiatan?.nama_sub_kegiatan ?? ''}`
    if (/spam|air minum|pipa|sumur bor/i.test(text)) return 'air_minum'
    if (/septik|sanitasi|mck|limbah|spald/i.test(text)) return 'sanitasi'
    return 'lainnya'
}

function summarizePekerjaan(p) {
    const kontrak = p.kontrak?.[0]
    return {
        id: p.id,
        nama_paket: p.nama_paket,
        desa: p.desa?.nama_desa,
        kecamatan: p.kecamatan?.nama_kecamatan,
        pagu: Number(p.pagu) || 0,
        foto_count: Number(p.foto_count) || 0,
        progress_total: p.progress_total ?? null,
        deviasi: p.deviasi ?? null,
        pengawas: p.pengawas?.nama ?? null,
        penerima_count: Number(p.penerima_count) || 0,
        tahun_anggaran: p.kegiatan?.tahun_anggaran ?? null,
        sumber_dana: p.kegiatan?.sumber_dana ?? null,
        sub_kegiatan: p.kegiatan?.nama_sub_kegiatan ?? null,
        bidang: detectBidang(p),
        kontrak: kontrak
            ? {
                  spk: kontrak.spk,
                  nilai_kontrak: Number(kontrak.nilai_kontrak) || 0,
                  penyedia: kontrak.penyedia?.nama ?? null,
              }
            : null,
    }
}

function pickStudiKasus(pekerjaanList) {
    const valid = pekerjaanList.filter((p) => isValidDesa(p) && !isKonsultanOnly(p))

    const sanitasi = [...valid]
        .filter((p) => detectBidang(p) === 'sanitasi')
        .sort((a, b) => (b.foto_count ?? 0) - (a.foto_count ?? 0))[0]

    const airMinum = [...valid]
        .filter((p) => detectBidang(p) === 'air_minum')
        .sort((a, b) => {
            const fotoDiff = (b.foto_count ?? 0) - (a.foto_count ?? 0)
            if (fotoDiff !== 0) return fotoDiff
            return (b.pengawas ? 1 : 0) - (a.pengawas ? 1 : 0)
        })[0]

    return {
        sanitasi: sanitasi ? summarizePekerjaan(sanitasi) : null,
        air_minum: airMinum ? summarizePekerjaan(airMinum) : null,
    }
}

function buildChartData(dash, spam, pekerjaanPerTahun) {
    const topKecamatan = [...(dash.pekerjaanPerKecamatan ?? [])]
        .filter((k) => k.name !== 'Cianjurkab' && k.name !== 'NULLs')
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

    return {
        pekerjaanPerTahun: pekerjaanPerTahun
            .filter((p) => p.pekerjaan > 0)
            .map((p) => ({
                tahun: p.tahun,
                pekerjaan: p.pekerjaan,
                kontrak: p.kontrak,
                paguMilyar: Number((p.paguPekerjaan / 1_000_000_000).toFixed(2)),
            })),
        topKecamatan,
        dampakSistem: [
            { indikator: 'Waktu rekapitulasi SPM (hari kerja)', sebelum: 7.5, sesudah: 1 },
            { indikator: 'Interval laporan pengawas (hari)', sebelum: 21, sesudah: 7 },
            { indikator: 'Paket pekerjaan terpantau (jumlah)', sebelum: 0, sesudah: dash.totalPekerjaan ?? 0 },
            { indikator: 'Foto dokumentasi terindeks', sebelum: 0, sesudah: spam.total_foto_dokumentasi ?? 0 },
        ],
        sumberDana: dash.kegiatanPerSumberDana ?? [],
    }
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

    const [units, pekerjaanList] = await Promise.all([
        fetchAllSpamUnits(token),
        fetchAllPekerjaan(token),
    ])
    const achievementPerTahun = aggregateAchievements(units)
    const studiKasus = pickStudiKasus(pekerjaanList)
    const chartData = buildChartData(dashAll, spam, pekerjaanPerTahun)

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
        studiKasus,
        chartData,
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
    if (studiKasus.air_minum) {
        console.log(`  Studi kasus SPAM: #${studiKasus.air_minum.id} ${studiKasus.air_minum.desa} (${studiKasus.air_minum.foto_count} foto)`)
    }
    if (studiKasus.sanitasi) {
        console.log(`  Studi kasus sanitasi: #${studiKasus.sanitasi.id} ${studiKasus.sanitasi.desa} (${studiKasus.sanitasi.foto_count} foto)`)
    }
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})