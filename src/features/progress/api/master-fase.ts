/** Re-export — source of truth: `@/features/master-fase` */
export {
    getMasterFasePekerjaan,
    createMasterFasePekerjaan,
    updateMasterFasePekerjaan,
    deleteMasterFasePekerjaan,
} from '@/features/master-fase/api'

import { getMasterFasePekerjaan as getList } from '@/features/master-fase/api'
import type { MasterFasePekerjaan } from '@/features/master-fase/types'

/** Backward-compatible: string arg = jenis_proyek, activeOnly default for auto-fill */
export async function getMasterFasePekerjaanForJenis(
    jenisProyek?: string,
    activeOnly = false,
): Promise<MasterFasePekerjaan[]> {
    return getList({ jenisProyek, activeOnly })
}
