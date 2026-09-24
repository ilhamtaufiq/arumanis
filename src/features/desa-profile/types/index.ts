import type { Desa } from '@/features/desa/types'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import type { SpmSanitasi } from '@/features/spm-sanitasi/types'
import type { UnitSpam } from '@/features/spam-unit/types'

export interface DesaRingkasan {
  kepadatan_penduduk: number | null
  total_pekerjaan: number
  pekerjaan_aktif: number
  pekerjaan_selesai: number
  total_pagu: number
  total_unit_spam: number
  unit_spam_simspam: number
  total_infrastruktur_sanitasi: number
  infrastruktur_berfungsi: number
  total_pemanfaat_kk: number
  total_pemanfaat_jiwa: number
  total_usulan_kegiatan: number
}

export interface DesaProfileData {
  desa: Desa
  ringkasan: DesaRingkasan
  pekerjaan: Pekerjaan[]
  spm_sanitasi: SpmSanitasi[]
  unit_spam: UnitSpam[]
}

export interface DesaProfileResponse {
  data: DesaProfileData
}