import { parseKoordinatLoose } from '@/lib/koordinat-utils'
import type { OnlineUser } from '@/features/dashboard/types/presence'

export type PengawasLocationPoint = OnlineUser & {
    lat: number
    lng: number
}

export function mapPengawasPresenceToLocationPoints(users: OnlineUser[]): PengawasLocationPoint[] {
    return users
        .filter((user) => user.app === 'pengawasan')
        .map((user) => {
            const parsed = parseKoordinatLoose(user.koordinat)
            if (!parsed) {
                return null
            }

            return {
                ...user,
                lat: parsed.lat,
                lng: parsed.lng,
            }
        })
        .filter((entry): entry is PengawasLocationPoint => entry != null)
}

export function countPengawasPresenceOnline(users: OnlineUser[]) {
    const pengawas = users.filter((user) => user.app === 'pengawasan')
    const withKoordinat = mapPengawasPresenceToLocationPoints(pengawas)

    return {
        online: pengawas.length,
        withKoordinat: withKoordinat.length,
        withoutKoordinat: pengawas.length - withKoordinat.length,
    }
}