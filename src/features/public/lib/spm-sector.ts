import type { LandingSpmSector } from '../api/spam-stats'

export function parseSpmSector(value: unknown): LandingSpmSector {
    return value === 'sanitasi' ? 'sanitasi' : 'air_minum'
}