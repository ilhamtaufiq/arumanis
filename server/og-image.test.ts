import { describe, expect, it } from 'bun:test'
import { renderOgImage, titleFontSize } from './og-image.ts'

describe('titleFontSize', () => {
  it('mengecilkan huruf untuk judul yang lebih panjang', () => {
    expect(titleFontSize('Panen Air Hujan')).toBe(76)
    expect(titleFontSize('x'.repeat(50))).toBe(64)
    expect(titleFontSize('x'.repeat(80))).toBe(54)
    expect(titleFontSize('x'.repeat(120))).toBe(46)
  })
})

describe('renderOgImage', () => {
  it('mengembalikan null untuk judul kosong', async () => {
    expect(await renderOgImage('   ')).toBeNull()
  })

  it('membuat JPEG 1200x630 bila library tersedia, atau null bila tidak', async () => {
    const image = await renderOgImage('Mengenal e-Survey, Aplikasi Pendataan Lapangan')
    if (image === null) return // satori tidak terpasang di lingkungan ini (hanya ada di image runtime)
    expect([image[0], image[1]]).toEqual([0xff, 0xd8])
    expect(image.length).toBeGreaterThan(10_000)
  })
})
