const DEFAULT_SEEK_SECONDS = 1

export function getVideoThumbnailSeekTime(duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) {
    return 0
  }

  if (duration <= 0.5) {
    return 0
  }

  return Math.min(DEFAULT_SEEK_SECONDS, duration / 2)
}

function waitForVideoEvent(video: HTMLVideoElement, eventName: keyof HTMLVideoElementEventMap) {
  return new Promise<void>((resolve, reject) => {
    const onSuccess = () => {
      cleanup()
      resolve()
    }
    const onError = () => {
      cleanup()
      reject(new Error('Gagal memuat video untuk thumbnail'))
    }
    const cleanup = () => {
      video.removeEventListener(eventName, onSuccess)
      video.removeEventListener('error', onError)
    }

    video.addEventListener(eventName, onSuccess, { once: true })
    video.addEventListener('error', onError, { once: true })
  })
}

export async function captureVideoThumbnail(file: File): Promise<File | null> {
  if (typeof document === 'undefined') return null

  const objectUrl = URL.createObjectURL(file)

  try {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    video.src = objectUrl

    await waitForVideoEvent(video, 'loadeddata')

    const seekTime = getVideoThumbnailSeekTime(video.duration)
    video.currentTime = seekTime
    await waitForVideoEvent(video, 'seeked')

    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) return null

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) return null

    context.drawImage(video, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.85)
    })

    if (!blob) return null

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'video'
    return new File([blob], `${baseName}-poster.jpg`, { type: 'image/jpeg' })
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}