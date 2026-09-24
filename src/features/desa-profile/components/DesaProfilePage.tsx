import { useMemo, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getDesaProfile } from '../api'
import { getSpamIntegrationByDesa } from '@/features/spam-unit/api'
import { getSpmSanitasiIntegrationByDesa } from '@/features/spm-sanitasi/api'
import { getFotoList } from '@/features/foto/api'
import { getOutput } from '@/features/output/api/output'
import { SpamCompareCard } from '@/features/spam-unit/components/SpamCompareCard'
import { SpmCompareCard } from '@/features/spm-sanitasi/components/SpmCompareCard'
import { formatDesaNumber } from '@/features/desa/lib/format'
import { formatCurrency } from '@/lib/format'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { createProgressMarkerIcon } from '@/features/map/utils/MapIcon'
import { buildPekerjaanPins, filterFotoWithCoords, getProgressColor, formatProgressLabel } from '@/features/map/utils/map-utils'
import type { MapPekerjaanPin } from '@/features/map/utils/map-utils'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import type { Output } from '@/features/output/types'
import type { Foto } from '@/features/foto/types'
import {
  MapPin, Users, Home, Building2, Droplets, Wrench,
  FileText, TrendingUp, ArrowLeft, CheckCircle2, Clock, XCircle, Map as MapIcon,
} from 'lucide-react'

const sectionClass = 'grid gap-4 md:grid-cols-2 lg:grid-cols-4'
const statCardClass = 'flex items-center gap-3 rounded-lg border bg-muted/30 p-4'

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className={statCardClass}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-lg font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  )
}

// ── Map helpers ──

function MapFitBounds({ pins }: { pins: MapPekerjaanPin[] }) {
  const map = useMap()
  useEffect(() => {
    if (pins.length === 0) return
    if (pins.length === 1) {
      map.setView([pins[0].coords.lat, pins[0].coords.lng], 15)
      return
    }
    const bounds = L.latLngBounds(pins.map((p) => [p.coords.lat, p.coords.lng]))
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16 })
  }, [map, pins])
  return null
}

function DesaMap({ pins, pekerjaanList }: { pins: MapPekerjaanPin[]; pekerjaanList: Pekerjaan[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const center: [number, number] = useMemo(() => {
    if (pins.length > 0) return [pins[0].coords.lat, pins[0].coords.lng]
    return [-6.82, 107.14]
  }, [pins])

  if (!mounted) {
    return (
      <div className="flex h-[300px] items-center justify-center bg-muted/30 rounded-lg">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    )
  }

  if (pins.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center bg-muted/30 rounded-lg text-sm text-muted-foreground">
        Belum ada foto dengan koordinat untuk pekerjaan di desa ini.
      </div>
    )
  }

  return (
    <div className="h-[380px] overflow-hidden rounded-lg border">
      <MapContainer center={center} zoom={14} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFitBounds pins={pins} />
        {pins.map((pin) => (
          <Marker
            key={pin.pekerjaanId}
            position={[pin.coords.lat, pin.coords.lng]}
            icon={createProgressMarkerIcon(pin.highestProgress)}
          >
            <Popup maxWidth={320}>
              <div className="space-y-1 text-xs min-w-[200px]">
                <p className="font-bold text-sm">{pin.namaPaket}</p>
                <p className="text-muted-foreground">{pin.lokasi}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge
                    style={{ backgroundColor: getProgressColor(pin.highestProgress), color: '#fff' }}
                    className="text-[10px]"
                  >
                    {formatProgressLabel(pin.highestProgress)}
                  </Badge>
                  {pin.progressTotal != null && (
                    <Badge variant="secondary" className="text-[10px]">Progress {pin.progressTotal.toFixed(1)}%</Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">{pin.fotos.length} foto</Badge>
                </div>
                {pin.outputs.length > 0 && (
                  <div className="pt-1 space-y-0.5">
                    {pin.outputs.slice(0, 3).map((o) => (
                      <span key={o.id} className="inline-block mr-1 mb-1 rounded bg-muted px-1.5 py-0.5 text-[10px]">{o.komponen}</span>
                    ))}
                  </div>
                )}
                <div className="pt-1">
                  <Button asChild size="sm" variant="outline" className="h-7 text-[10px]">
                    <Link to="/pekerjaan/$id" params={{ id: pin.pekerjaanId.toString() }}>
                      Detail pekerjaan
                    </Link>
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

// ── Main Page ──

export default function DesaProfilePage() {
  const params = useParams({ from: '/_authenticated/desa/$id' })
  const desaId = parseInt(params.id)

  const { data, isLoading, error } = useQuery({
    queryKey: ['desa-profile', desaId],
    queryFn: () => getDesaProfile(desaId),
    enabled: !isNaN(desaId),
  })

  const { data: spamData, isLoading: spamLoading } = useQuery({
    queryKey: ['desa-profile-spam', desaId],
    queryFn: () => getSpamIntegrationByDesa(desaId),
    enabled: !isNaN(desaId),
  })

  const { data: spmData, isLoading: spmLoading } = useQuery({
    queryKey: ['desa-profile-spm', desaId],
    queryFn: () => getSpmSanitasiIntegrationByDesa(desaId),
    enabled: !isNaN(desaId),
  })

  const { data: fotoRes } = useQuery({
    queryKey: ['desa-profile-fotos', desaId],
    queryFn: () => getFotoList({ per_page: 5000 }),
    enabled: !isNaN(desaId),
  })

  const { data: outputRes } = useQuery({
    queryKey: ['desa-profile-outputs'],
    queryFn: () => getOutput({ per_page: 5000 }),
    enabled: !isNaN(desaId),
  })

  if (isLoading) return <LoadingState />
  if (error || !data?.data) return <ErrorState desaId={desaId} />

  const { desa, ringkasan, pekerjaan } = data.data
  const spamDetail = spamData?.data
  const spmDetail = spmData?.data

  const allFotos: Foto[] = (fotoRes as any)?.data ?? []
  const allOutputs: Output[] = (outputRes as any)?.data ?? []

  const pekerjaanIds = useMemo(() => new Set(pekerjaan.map((p) => p.id)), [pekerjaan])
  const desaFotos = useMemo(
    () => allFotos.filter((f) => pekerjaanIds.has(f.pekerjaan_id)),
    [allFotos, pekerjaanIds],
  )
  const mapPins = useMemo(
    () => buildPekerjaanPins(filterFotoWithCoords(desaFotos), pekerjaan, allOutputs),
    [desaFotos, pekerjaan, allOutputs],
  )

  const statusBadge = (status: string | undefined) => {
    if (status === 'active') return <Badge variant="default" className="gap-1"><Clock className="h-3 w-3" />Aktif</Badge>
    if (status === 'completed') return <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" />Selesai</Badge>
    if (status === 'canceled') return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Batal</Badge>
    return <Badge variant="outline">{status}</Badge>
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/desa">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{desa.nama_desa}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {desa.kecamatan?.nama_kecamatan ?? `Kecamatan ID ${desa.kecamatan_id}`}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link to="/desa/$id/edit" params={{ id: params.id }}>
            <Wrench className="mr-2 h-4 w-4" /> Edit Desa
          </Link>
        </Button>
      </div>

      {/* Section 1: Informasi Dasar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={sectionClass}>
            <StatCard icon={MapPin} label="Luas Wilayah" value={`${formatDesaNumber(desa.luas)} Ha`} />
            <StatCard icon={Users} label="Jumlah Penduduk" value={formatDesaNumber(desa.jumlah_penduduk)} />
            <StatCard icon={Home} label="Jumlah KK" value={formatDesaNumber(desa.jumlah_kk)} />
            <StatCard
              icon={Users}
              label="Kepadatan"
              value={ringkasan.kepadatan_penduduk !== null
                ? `${formatDesaNumber(ringkasan.kepadatan_penduduk)} jiwa/Ha`
                : '-'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Ringkasan Statistik */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ringkasan</CardTitle>
          <CardDescription>Data agregat pembangunan di desa ini</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={sectionClass}>
            <StatCard icon={Building2} label="Total Pekerjaan" value={ringkasan.total_pekerjaan} />
            <StatCard icon={CheckCircle2} label="Pekerjaan Aktif" value={ringkasan.pekerjaan_aktif} />
            <StatCard icon={TrendingUp} label="Total Pagu" value={formatCurrency(ringkasan.total_pagu)} />
            <StatCard icon={FileText} label="Usulan Kegiatan" value={ringkasan.total_usulan_kegiatan} />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Peta Lokasi Pekerjaan */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={MapIcon} title="Peta Lokasi Pekerjaan" />
          <CardDescription>
            {mapPins.length > 0
              ? `${mapPins.length} titik pekerjaan dari ${desaFotos.length} foto berkoordinat`
              : 'Pin berdasarkan foto dokumentasi yang memiliki koordinat'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DesaMap pins={mapPins} pekerjaanList={pekerjaan} />
        </CardContent>
      </Card>

      {/* Section 4: Infrastruktur Air Minum */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Droplets} title="Infrastruktur Air Minum" />
        </CardHeader>
        <CardContent>
          {spamLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          ) : spamDetail ? (
            <div className="space-y-4">
              <div className={sectionClass}>
                <StatCard icon={Droplets} label="Total Unit" value={spamDetail.unit_count} />
                <StatCard icon={CheckCircle2} label="Paket Tertaut" value={spamDetail.linked_count ?? 0} />
                <StatCard icon={Home} label="SR Capaian" value={formatDesaNumber(spamDetail.derived.sr)} />
                <StatCard icon={Users} label="KK Capaian" value={formatDesaNumber(spamDetail.derived.kk)} />
              </div>

              <SpamCompareCard
                derived={spamDetail.derived}
                manual={spamDetail.manual}
              />

              {spamDetail.units.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Unit</TableHead>
                        <TableHead>Sistem Layanan</TableHead>
                        <TableHead>SIMSPAM</TableHead>
                        <TableHead>POKMAS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spamDetail.units.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name || '-'}</TableCell>
                          <TableCell>{u.sistem_layanan || '-'}</TableCell>
                          <TableCell>{u.is_simspam ? '✅' : '❌'}</TableCell>
                          <TableCell>{u.pokmas || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4">Belum ada unit SPAM terdaftar di desa ini.</p>
              )}

              {spamDetail.pekerjaan.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Paket Pekerjaan Air Minum ({spamDetail.pekerjaan.length})</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Paket</TableHead>
                          <TableHead>Tahun</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Capaian</TableHead>
                          <TableHead className="text-right">Nilai Kontrak</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {spamDetail.pekerjaan.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.nama_paket}</TableCell>
                            <TableCell>{p.tahun_anggaran || '-'}</TableCell>
                            <TableCell>{p.progress_total}%</TableCell>
                            <TableCell>{p.sr} SR / {p.kk} KK</TableCell>
                            <TableCell className="text-right">{formatCurrency(p.nilai_kontrak)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">Gagal memuat data infrastruktur air minum.</p>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Infrastruktur Sanitasi */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Droplets} title="Infrastruktur Sanitasi" />
        </CardHeader>
        <CardContent>
          {spmLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          ) : spmDetail ? (
            <div className="space-y-4">
              <div className={sectionClass}>
                <StatCard icon={Building2} label="Total Infrastruktur" value={spmDetail.infrastruktur_count} />
                <StatCard icon={CheckCircle2} label="Paket Tertaut" value={spmDetail.linked_count} />
                <StatCard icon={Home} label="Pemanfaat KK" value={formatDesaNumber(spmDetail.derived.kk)} />
                <StatCard icon={Users} label="Pemanfaat Jiwa" value={formatDesaNumber(spmDetail.derived.jiwa)} />
              </div>

              <SpmCompareCard
                infrastrukturCount={spmDetail.infrastruktur_count}
                derived={spmDetail.derived}
                manual={spmDetail.manual}
              />

              {spmDetail.infrastruktur.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Infrastruktur</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Pemanfaat KK</TableHead>
                        <TableHead>Pekerjaan Tertaut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spmDetail.infrastruktur.map((infra) => (
                        <TableRow key={infra.id}>
                          <TableCell className="font-medium">{infra.nama_infrastruktur}</TableCell>
                          <TableCell>{infra.jenis}</TableCell>
                          <TableCell>{formatDesaNumber(infra.jumlah_pemanfaat_kk)}</TableCell>
                          <TableCell>{infra.linked_pekerjaan_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4">Belum ada infrastruktur sanitasi di desa ini.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">Gagal memuat data infrastruktur sanitasi.</p>
          )}
        </CardContent>
      </Card>

      {/* Section 6: Daftar Pekerjaan */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Building2} title="Daftar Pekerjaan" />
        </CardHeader>
        <CardContent>
          {pekerjaan.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Belum ada pekerjaan di desa ini.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Paket</TableHead>
                    <TableHead>Kode Rekening</TableHead>
                    <TableHead>Pagu</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pekerjaan.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nama_paket}</TableCell>
                      <TableCell className="font-mono text-xs">{p.kode_rekening || '-'}</TableCell>
                      <TableCell>{formatCurrency(p.pagu)}</TableCell>
                      <TableCell>{statusBadge(p.status)}</TableCell>
                      <TableCell>
                        {p.progress_total != null ? `${p.progress_total}%` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32 mt-1" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-16 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ErrorState({ desaId }: { desaId: number }) {
  return (
    <div className="space-y-6 p-6">
      <Button variant="ghost" size="icon" asChild>
        <Link to="/desa">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="text-lg font-semibold text-muted-foreground">Gagal memuat data desa</p>
        <p className="text-sm text-muted-foreground">ID: {desaId}</p>
        <Button variant="outline" asChild>
          <Link to="/desa">Kembali ke daftar desa</Link>
        </Button>
      </div>
    </div>
  )
}