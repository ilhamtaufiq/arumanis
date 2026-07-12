import { useMemo } from 'react'
import { ExternalLink, Instagram } from 'lucide-react'
import { useInstagramGallery } from '@/features/instagram/hooks/useInstagram'
import { usePublicLocale } from '../i18n/use-public-locale'

export function LandingInstagramGallery() {
  const { messages } = usePublicLocale()
  const copy = messages.landing.instagram
  const { data, isLoading, isError } = useInstagramGallery(9)

  const items = useMemo(() => data?.data ?? [], [data])
  const username = data?.profile?.username || 'bidang_ams'
  const profileUrl = `https://www.instagram.com/${username}/`

  if (isLoading) {
    return (
      <p className="mt-8 text-sm text-white/55" role="status">
        {copy.loading}
      </p>
    )
  }

  if (isError || (!data?.configured && items.length === 0)) {
    return (
      <div className="mt-8 rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center">
        <p className="text-sm text-white/65">{copy.unavailable}</p>
        <a
          href="https://www.instagram.com/bidang_ams/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-pink-200/90 transition hover:text-white"
        >
          <Instagram className="h-4 w-4" aria-hidden />
          @bidang_ams
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className="mt-8 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
        {copy.empty}
      </p>
    )
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white/70">
          {data?.profile?.profile_picture_url ? (
            <img
              src={data.profile.profile_picture_url}
              alt=""
              className="h-8 w-8 rounded-full border border-white/20 object-cover"
            />
          ) : (
            <Instagram className="h-5 w-5 text-pink-300" aria-hidden />
          )}
          <span className="text-sm font-semibold">@{username}</span>
        </div>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 transition hover:text-white"
        >
          {copy.viewProfile}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => {
          const src = item.thumbnail_url || item.media_url
          const href = item.permalink || profileUrl
          return (
            <a
              key={item.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/20"
            >
              {src ? (
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/40">
                  <Instagram className="h-8 w-8" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              {item.caption ? (
                <p className="pointer-events-none absolute inset-x-0 bottom-0 line-clamp-2 p-2 text-[10px] leading-snug text-white/90 opacity-0 transition group-hover:opacity-100">
                  {item.caption}
                </p>
              ) : null}
            </a>
          )
        })}
      </div>
    </div>
  )
}
