import { describe, expect, it } from 'vitest'
import {
    correctIndonesiaCoordSigns,
    formatKoordinat,
    formatKoordinatDisplay,
    normalizeKoordinatInput,
    parseKoordinatLoose,
    parseKoordinatString,
} from '../koordinat-utils'

describe('koordinat-utils', () => {
    it('parses decimal coordinate pair', () => {
        expect(parseKoordinatString('-6.794353, 107.228834')).toEqual({
            lat: -6.794353,
            lng: 107.228834,
        })
    })

    it('formats coordinate pair', () => {
        expect(formatKoordinat(-6.7943532, 107.2288341)).toBe('-6.794353, 107.228834')
    })

    it('rejects invalid coordinate string', () => {
        expect(parseKoordinatString('manual')).toBeNull()
    })

    it('parses concatenated OCR output without comma', () => {
        expect(parseKoordinatLoose('-7.1653984107.1545166')).toEqual({
            lat: -7.1653984,
            lng: 107.1545166,
        })
    })

    it('normalizes loose coordinate input', () => {
        expect(normalizeKoordinatInput('-7.1653984107.1545166')).toBe('-7.165398, 107.154517')
    })

    it('formats display for malformed stored value', () => {
        expect(formatKoordinatDisplay('-7.1653984107.1545166')).toBe('-7.165398, 107.154517')
    })

    it('corrects missing minus on Java latitude from OCR', () => {
        expect(correctIndonesiaCoordSigns(6.794353, 107.228834)).toEqual({
            lat: -6.794353,
            lng: 107.228834,
        })
    })

    it('parses coordinate pair when OCR drops latitude minus', () => {
        expect(parseKoordinatString('6.794353, 107.228834')).toEqual({
            lat: -6.794353,
            lng: 107.228834,
        })
    })

    it('normalizes loose OCR output without latitude minus', () => {
        expect(normalizeKoordinatInput('6.7943534107.228834')).toBe('-6.794353, 107.228834')
    })
})