#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'docs', 'kemanfaatan-live-data.json')
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
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`${pathname} → ${res.status} ${text.slice(0, 200)}`)
  }
  return res.json()
}

async function login() {
  const body = await api('/auth/login', null, {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  return body.token
}

async function fetchAllUsers(token) {
  const items = []
  let page = 1
  let lastPage = 1
  while (page <= lastPage) {
    const resp = await api(`/users?per_page=100&page=${page}`, token)
    lastPage = resp.meta?.last_page ?? 1
    items.push(...(resp.data ?? []))
    page++
  }
  return items
}

function countRoles(users) {
  const counts = {}
  for (const u of users) {
    for (const r of u.roles ?? []) {
      const name = typeof r === 'string' ? r : r.name
      if (name) counts[name] = (counts[name] || 0) + 1
    }
  }
  return counts
}

function summarizeKpi(rows) {
  if (!rows?.length) {
    return { count: 0, total_foto: 0, total_pekerjaan: 0, avg_score: 0 }
  }
  const totalFoto = rows.reduce((s, r) => s + (Number(r.foto_count) || 0), 0)
  const totalPekerjaan = rows.reduce((s, r) => s + (Number(r.pekerjaan_count) || 0), 0)
  const totalScore = rows.reduce((s, r) => s + (Number(r.score) || 0), 0)
  return {
    count: rows.length,
    total_foto: totalFoto,
    total_pekerjaan: totalPekerjaan,
    avg_score: rows.length ? Math.round((totalScore / rows.length) * 10) / 10 : 0,
  }
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
  return items
}

function isSanitasiPekerjaan(p) {
  const text = `${p.nama_paket ?? ''} ${p.kegiatan?.sub_bidang ?? ''} ${p.kegiatan?.nama_sub_kegiatan ?? ''}`
  return /septik|sanitasi|mck|limbah|spald/i.test(text)
}

function isDakPekerjaan(p) {
  return String(p.kegiatan?.sumber_dana ?? '').toUpperCase() === 'DAK'
}

function summarizeDakSanitasi(pekerjaanList) {
  const dakSan = pekerjaanList.filter((p) => isDakPekerjaan(p) && isSanitasiPekerjaan(p))
  const byTahun = new Map()
  for (const p of dakSan) {
    const tahun = String(p.kegiatan?.tahun_anggaran ?? 'N/A')
    if (!byTahun.has(tahun)) {
      byTahun.set(tahun, { tahun, pekerjaan: 0, pagu: 0, foto: 0, kontrak: 0 })
    }
    const row = byTahun.get(tahun)
    row.pekerjaan++
    row.pagu += Number(p.pagu) || 0
    row.foto += Number(p.foto_count) || 0
    if (p.kontrak?.length) row.kontrak++
  }

  const topFoto = [...dakSan]
    .sort((a, b) => (Number(b.foto_count) || 0) - (Number(a.foto_count) || 0))
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      nama_paket: p.nama_paket,
      desa: p.desa?.nama_desa,
      kecamatan: p.kecamatan?.nama_kecamatan,
      tahun_anggaran: p.kegiatan?.tahun_anggaran,
      foto_count: Number(p.foto_count) || 0,
      pagu: Number(p.pagu) || 0,
      sub_kegiatan: p.kegiatan?.nama_sub_kegiatan,
    }))

  return {
    total_pekerjaan: dakSan.length,
    total_pagu: dakSan.reduce((s, p) => s + (Number(p.pagu) || 0), 0),
    total_foto: dakSan.reduce((s, p) => s + (Number(p.foto_count) || 0), 0),
    total_kontrak: dakSan.filter((p) => (p.kontrak ?? []).length > 0).length,
    per_tahun: [...byTahun.values()].sort((a, b) => Number(a.tahun) - Number(b.tahun)),
    top5_foto: topFoto,
    kegiatan_dak_count: new Set(dakSan.map((p) => p.kegiatan?.id).filter(Boolean)).size,
  }
}

async function main() {
  const token = await login()
  const tahun = new Date().getFullYear()

  const [
    proposalRaw,
    publicSpam,
    publicSan,
    spamStats,
    sanStats,
    pengawasStats,
    kpiPengawas,
    kpiKonsultan,
    users,
    me,
    integrationSpam,
    integrationSan,
  ] = await Promise.all([
    fs.promises.readFile(path.join(__dirname, '..', 'docs', 'proposal-live-data.json'), 'utf8').then(JSON.parse),
    api('/public/spam-units/stats', null).then((r) => r.data ?? r),
    api('/public/spm-sanitasi/stats', null).then((r) => r.data ?? r),
    api('/spam-units/stats', token).then((r) => r.data ?? r),
    api('/spm-sanitasi/stats', token).then((r) => r.data ?? r),
    api('/pengawas/statistics', token).then((r) => r.data ?? r),
    api(`/puspen/pengawas-kpi?per_page=100&peran=pengawas&tahun=${tahun}`, token),
    api(`/puspen/pengawas-kpi?per_page=100&peran=konsultan_pengawas&tahun=${tahun}`, token),
    fetchAllUsers(token),
    api('/auth/me', token),
    api('/spam-units/integration?per_page=5', token).then((r) => r.data ?? r),
    api('/spm-sanitasi/integration?per_page=5', token).then((r) => r.data ?? r),
  ])

  const roleCounts = countRoles(users)
  const tflUsers = users.filter((u) => (u.roles ?? []).some((r) => (r.name ?? r) === 'tfl'))
  const pekerjaanList = await fetchAllPekerjaan(token)
  const dakSanitasi = summarizeDakSanitasi(pekerjaanList)

  const out = {
    fetchedAt: new Date().toISOString(),
    tahun,
    dashboard: proposalRaw.dashboard,
    spam: spamStats,
    sanitasi: sanStats,
    publicSpam,
    publicSan,
    pengawas: pengawasStats,
    achievementPerTahun: proposalRaw.achievementPerTahun,
    pekerjaanPerTahun: proposalRaw.pekerjaanPerTahun,
    studiKasus: proposalRaw.studiKasus,
    roleCounts,
    kpi: {
      pengawas: {
        summary: kpiPengawas.summary,
        aggregate: summarizeKpi(kpiPengawas.data),
        top5: (kpiPengawas.data ?? []).slice(0, 5),
      },
      konsultan_pengawas: {
        summary: kpiKonsultan.summary,
        aggregate: summarizeKpi(kpiKonsultan.data),
        top5: (kpiKonsultan.data ?? []).slice(0, 5),
      },
    },
    tfl: {
      user_count: tflUsers.length,
      peran: 'Tim Fasilitator Lapangan (setara konsultan pengawasan, lingkup Sanitasi DAK)',
      users: tflUsers.slice(0, 10).map((u) => ({
        id: u.id,
        nama: u.nama,
        email: u.email,
      })),
      dak_sanitasi: dakSanitasi,
    },
    integrationSamples: {
      spam: Array.isArray(integrationSpam) ? integrationSpam.slice(0, 3) : integrationSpam,
      sanitasi: Array.isArray(integrationSan) ? integrationSan.slice(0, 3) : integrationSan,
    },
    authUser: {
      nama: me.nama ?? me.name,
      roles: (me.roles ?? []).map((r) => r.name ?? r),
    },
  }

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8')
  console.log(`Written: ${OUT}`)
  console.log(`Roles:`, roleCounts)
  console.log(`KPI pengawas:`, out.kpi.pengawas.aggregate)
  console.log(`KPI konsultan:`, out.kpi.konsultan_pengawas.aggregate)
  console.log(`DAK Sanitasi:`, dakSanitasi.total_pekerjaan, 'pekerjaan,', dakSanitasi.total_foto, 'foto')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})