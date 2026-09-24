import api from '@/lib/api-client'

export interface SipdPekerjaanLink {
    id_rinci_sub_bl: number
    pekerjaan_id: number
}

interface LinksResponse {
    data: SipdPekerjaanLink[]
}

/** Daftar link manual untuk satu sub kegiatan SIPD. */
export async function getSipdPekerjaanLinks(idSubBl: number): Promise<SipdPekerjaanLink[]> {
    const res = await api.get<LinksResponse>('/sipd-pekerjaan-links', {
        params: { id_sub_bl: idSubBl },
    })
    return res.data
}

/** Set/simpan link baris rincian → pekerjaan. */
export async function setSipdPekerjaanLink(input: {
    idSubBl: number
    idRinciSubBl: number
    pekerjaanId: number
}): Promise<void> {
    await api.put('/sipd-pekerjaan-links', {
        id_sub_bl: input.idSubBl,
        id_rinci_sub_bl: input.idRinciSubBl,
        pekerjaan_id: input.pekerjaanId,
    })
}

/** Hapus link (lepas tautan) baris rincian. */
export async function removeSipdPekerjaanLink(input: {
    idSubBl: number
    idRinciSubBl: number
}): Promise<void> {
    await api.delete('/sipd-pekerjaan-links', {
        id_sub_bl: input.idSubBl,
        id_rinci_sub_bl: input.idRinciSubBl,
    })
}
