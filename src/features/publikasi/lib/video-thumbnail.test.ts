import { describe, expect, it } from 'vitest'
import { getVideoThumbnailSeekTime } from './video-thumbnail'

describe('video-thumbnail', () => {
  it('seeks to half duration for very short clips', () => {
    expect(getVideoThumbnailSeekTime(0.4)).toBe(0)
    expect(getVideoThumbnailSeekTime(0.8)).toBe(0.4)
  })

  it('seeks up to one second for longer clips', () => {
    expect(getVideoThumbnailSeekTime(10)).toBe(1)
    expect(getVideoThumbnailSeekTime(120)).toBe(1)
  })

  it('falls back to zero when duration is invalid', () => {
    expect(getVideoThumbnailSeekTime(Number.NaN)).toBe(0)
    expect(getVideoThumbnailSeekTime(0)).toBe(0)
  })
})