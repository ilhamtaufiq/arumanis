import type { OnlineUser } from '@/features/dashboard/types/presence'

export type OfficeHref =
    | '/dashboard'
    | '/pekerjaan'
    | '/map'
    | '/tiket'
    | '/asisten-ai'
    | '/kontrak'
    | '/kanban'
    | '/foto'
    | '/notifications'
    | '/progress_rekap'

export type OfficeRoom = {
    id: string
    name: string
    hint: string
    href: OfficeHref
    accent: string
    /** Hotspot on PixelOffice map, percent of image. */
    x: number
    y: number
    w: number
    h: number
}

export type OfficePet = 'cat' | 'pug'

export type OfficeCharacter = 'guy2' | 'guy3'

export type OfficeOccupant = {
    key: string
    name: string
    roomId: string
    kind: 'user' | 'self' | 'agent'
    pet: OfficePet
    character: OfficeCharacter
    user?: OnlineUser
}

export const OFFICE_ROOMS: OfficeRoom[] = [
    {
        id: 'pekerjaan',
        name: 'Ruang Pekerjaan',
        hint: 'Paket & progres',
        href: '/pekerjaan',
        accent: 'border-sky-500/40 bg-sky-500/10',
        x: 2,
        y: 2,
        w: 96,
        h: 96,
    },
    {
        id: 'kontrak',
        name: 'Ruang Kontrak',
        hint: 'Kontrak & addendum',
        href: '/kontrak',
        accent: 'border-indigo-500/40 bg-indigo-500/10',
        x: 8,
        y: 8,
        w: 40,
        h: 30,
    },
    {
        id: 'rekap',
        name: 'Rekap Progress',
        hint: 'Rekap progress kegiatan',
        href: '/progress_rekap',
        accent: 'border-emerald-500/40 bg-emerald-500/10',
        x: 54,
        y: 62,
        w: 40,
        h: 30,
    },
]

/** Walk slots on the map floor, percent of image. */
const WALK_SLOTS = [
    { x: 10, y: 44 },
    { x: 30, y: 40 },
    { x: 52, y: 46 },
    { x: 70, y: 52 },
    { x: 22, y: 66 },
    { x: 44, y: 70 },
] as const

export function occupantSlot(index: number): { x: number; y: number } {
    return WALK_SLOTS[index % WALK_SLOTS.length] ?? WALK_SLOTS[0]
}

export const AMI_OCCUPANT: OfficeOccupant = {
    key: 'ami',
    name: 'AMI',
    roomId: 'pekerjaan',
    kind: 'agent',
    pet: 'cat',
    character: 'guy3',
}

export function assignPetType(userId: number): OfficePet {
    return Math.abs(userId) % 2 === 0 ? 'cat' : 'pug'
}

export function assignCharacter(userId: number): OfficeCharacter {
    return Math.abs(userId) % 2 === 0 ? 'guy2' : 'guy3'
}

export function assignRoomId(userId: number): string {
    const index = Math.abs(userId) % OFFICE_ROOMS.length
    return OFFICE_ROOMS[index]?.id ?? OFFICE_ROOMS[0].id
}

export function dayPhase(hour: number): 'pagi' | 'siang' | 'sore' | 'malam' {
    if (hour >= 5 && hour < 11) return 'pagi'
    if (hour >= 11 && hour < 15) return 'siang'
    if (hour >= 15 && hour < 18) return 'sore'
    return 'malam'
}

export function buildOccupants(
    users: OnlineUser[],
    currentUserId?: number,
): OfficeOccupant[] {
    const occupants: OfficeOccupant[] = [AMI_OCCUPANT]

    for (const user of users) {
        const isSelf = user.id === currentUserId
        occupants.push({
            key: `user-${user.id}`,
            name: user.name,
            roomId: assignRoomId(user.id),
            kind: isSelf ? 'self' : 'user',
            pet: assignPetType(user.id),
            character: assignCharacter(user.id),
            user,
        })
    }

    return occupants
}

export function groupOccupantsByRoom(
    occupants: OfficeOccupant[],
): Record<string, OfficeOccupant[]> {
    const grouped: Record<string, OfficeOccupant[]> = {}
    for (const room of OFFICE_ROOMS) grouped[room.id] = []
    for (const occupant of occupants) {
        const bucket = grouped[occupant.roomId] ?? (grouped[occupant.roomId] = [])
        bucket.push(occupant)
    }
    return grouped
}
