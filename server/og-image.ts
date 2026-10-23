import { join } from 'node:path'

/**
 * Gambar pratinjau (Open Graph) per publikasi: judul artikel digambar di atas ilustrasi program.
 *
 * `satori`, `@resvg/resvg-wasm`, dan `jpeg-js` hanya dipasang di image runtime (lihat Dockerfile), jadi
 * ketiganya di-import dinamis. Bila tidak tersedia, `renderOgImage` mengembalikan `null` dan pemanggil
 * memakai gambar default statis. Hasilnya JPEG karena PNG ilustrasi ini terlalu besar untuk pratinjau.
 */

const WIDTH = 1200
const HEIGHT = 630
const CACHE_LIMIT = 200
const JPEG_QUALITY = 88
const ASSET_DIR = join(import.meta.dir, 'assets')

type Renderer = (title: string, label: string) => Promise<Uint8Array>

let rendererPromise: Promise<Renderer | null> | null = null
const cache = new Map<string, Uint8Array>()

/** Ukuran huruf judul menurun mengikuti panjang judul supaya muat di empat baris. */
export function titleFontSize(title: string): number {
  if (title.length <= 36) return 76
  if (title.length <= 60) return 64
  if (title.length <= 90) return 54
  return 46
}

async function createRenderer(): Promise<Renderer | null> {
  try {
    const [{ default: satori }, resvg, jpeg] = await Promise.all([
      import('satori'),
      import('@resvg/resvg-wasm'),
      import('jpeg-js'),
    ])

    const wasmUrl = new URL('./index_bg.wasm', import.meta.resolve('@resvg/resvg-wasm'))
    await resvg.initWasm(await Bun.file(wasmUrl).arrayBuffer())

    const [fontData, baseData] = await Promise.all([
      Bun.file(join(ASSET_DIR, 'fonts', 'Inter-Bold-subset.otf')).arrayBuffer(),
      Bun.file(join(ASSET_DIR, 'og-base.jpg')).arrayBuffer(),
    ])
    const baseSrc = `data:image/jpeg;base64,${Buffer.from(baseData).toString('base64')}`

    return async (title, label) => {
      const tree = {
        type: 'div',
        props: {
          style: { width: WIDTH, height: HEIGHT, display: 'flex', position: 'relative', fontFamily: 'Inter' },
          children: [
            {
              type: 'img',
              props: { src: baseSrc, width: WIDTH, height: HEIGHT, style: { position: 'absolute', left: 0, top: 0 } },
            },
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  left: 64,
                  top: 170,
                  width: 640,
                  display: 'flex',
                  flexDirection: 'column',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: 24, fontWeight: 700, color: '#E05A33', letterSpacing: 3, marginBottom: 20 },
                      children: label,
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: titleFontSize(title),
                        fontWeight: 700,
                        color: '#111111',
                        lineHeight: 1.14,
                        lineClamp: 4,
                      },
                      children: title,
                    },
                  },
                ],
              },
            },
          ],
        },
      }

      const svg = await satori(tree as never, {
        width: WIDTH,
        height: HEIGHT,
        fonts: [{ name: 'Inter', data: fontData, weight: 700, style: 'normal' }],
      })
      const image = new resvg.Resvg(svg, { fitTo: { mode: 'width', value: WIDTH }, background: '#ffffff' }).render()
      const encode = jpeg.encode ?? jpeg.default.encode
      return new Uint8Array(
        encode({ data: Buffer.from(image.pixels), width: image.width, height: image.height }, JPEG_QUALITY).data,
      )
    }
  } catch (error) {
    console.error('OG image renderer tidak tersedia, memakai gambar default:', error)
    return null
  }
}

/** JPEG pratinjau untuk judul tertentu, atau `null` bila renderer tidak tersedia atau gagal. */
export async function renderOgImage(title: string, label = 'PUBLIKASI'): Promise<Uint8Array | null> {
  const clean = title.replace(/\s+/g, ' ').trim()
  if (!clean) return null

  const key = `${label}\u0000${clean}`
  const cached = cache.get(key)
  if (cached) return cached

  rendererPromise ??= createRenderer()
  const render = await rendererPromise
  if (!render) return null

  try {
    const image = await render(clean, label)
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value as string)
    cache.set(key, image)
    return image
  } catch (error) {
    console.error('Gagal membuat OG image:', error)
    return null
  }
}
