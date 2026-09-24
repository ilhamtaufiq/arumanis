import { describe, expect, it } from 'vitest'
import type { OnlineUser } from '@/features/dashboard/types/presence'
import {
    AMI_OCCUPANT,
    OFFICE_ROOMS,
    assignCharacter,
    assignPetType,
    assignRoomId,
    buildOccupants,
    dayPhase,
    groupOccupantsByRoom,
    occupantSlot,
} from '../lib/office-layout'

function user(id: number, name = `User ${id}`): OnlineUser {
    return {
        id,
        name,
        email: `${id}@cianjur.space`,
        avatar: null,
        gender: null,
        last_seen_at: '2026-09-19T08:00:00Z',
    }
}

describe('office-layout', () => {
    it('keeps AMI at the Pekerjaan desk and assigns every user to a real room', () => {
        const occupants = buildOccupants([user(1), user(2), user(3)], 1)
        const grouped = groupOccupantsByRoom(occupants)

        expect(occupants).toContainEqual(AMI_OCCUPANT)
        expect(grouped.pekerjaan?.some((item) => item.key === 'ami')).toBe(true)

        const roomIds = new Set(occupants.map((item) => item.roomId))
        for (const roomId of roomIds) {
            expect(OFFICE_ROOMS.some((room) => room.id === roomId)).toBe(true)
        }
    })

    it('assigns the same user to the same room', () => {
        expect(assignRoomId(42)).toBe(assignRoomId(42))
        expect(OFFICE_ROOMS.some((room) => room.id === assignRoomId(42))).toBe(true)
    })

    it('pins AMI to cat and even/odd users to cat/pug', () => {
        expect(AMI_OCCUPANT.pet).toBe('cat')
        expect(assignPetType(2)).toBe('cat')
        expect(assignPetType(3)).toBe('pug')
        expect(buildOccupants([user(2), user(3)], 99).map((item) => item.pet)).toEqual(['cat', 'cat', 'pug'])
    })

    it('assigns walkable characters and stable slots', () => {
        expect(assignCharacter(2)).toBe('guy2')
        expect(assignCharacter(3)).toBe('guy3')
        expect(occupantSlot(0)).toEqual(occupantSlot(6))
        expect(OFFICE_ROOMS.every((room) => room.x + room.w <= 100 && room.y + room.h <= 100)).toBe(true)
    })

    it('maps clock hours to day phase', () => {
        expect(dayPhase(6)).toBe('pagi')
        expect(dayPhase(12)).toBe('siang')
        expect(dayPhase(16)).toBe('sore')
        expect(dayPhase(22)).toBe('malam')
        expect(dayPhase(3)).toBe('malam')
    })
})
