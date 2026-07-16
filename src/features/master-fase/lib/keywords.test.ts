import { describe, expect, it } from 'vitest'
import {
    findKeywordHits,
    parseKeywords,
    previewClassifyPhase,
} from './keywords'

describe('parseKeywords', () => {
    it('parses array and comma string', () => {
        expect(parseKeywords([' a ', 'b'])).toEqual(['a', 'b'])
        expect(parseKeywords('sumur, intake,  ')).toEqual(['sumur', 'intake'])
    })
})

describe('findKeywordHits', () => {
    it('prefers longer keyword', () => {
        const hits = findKeywordHits('Pipa PVC transmisi', ['pipa', 'pipa pvc', 'valve'])
        expect(hits[0].keyword).toBe('pipa pvc')
    })
})

describe('previewClassifyPhase', () => {
    const fases = [
        {
            id: 1,
            kode_fase: 'transmisi',
            nama_fase: 'Perpipaan Transmisi',
            prioritas: 4,
            is_active: true,
            keywords: ['transmisi', 'pipa pvc'],
        },
        {
            id: 2,
            kode_fase: 'distribusi',
            nama_fase: 'Perpipaan Distribusi',
            prioritas: 5,
            is_active: true,
            keywords: ['distribusi', 'jaringan'],
        },
        {
            id: 3,
            kode_fase: 'off',
            nama_fase: 'Nonaktif',
            prioritas: 0,
            is_active: false,
            keywords: ['transmisi'],
        },
    ]

    it('matches by longer keyword and skips inactive', () => {
        const hit = previewClassifyPhase('Pekerjaan pipa pvc transmisi', fases)
        expect(hit?.faseId).toBe(1)
        expect(hit?.bestKeyword).toBe('transmisi')
    })

    it('returns null when no hit', () => {
        expect(previewClassifyPhase('Jasa konsultan', fases)).toBeNull()
    })
})
