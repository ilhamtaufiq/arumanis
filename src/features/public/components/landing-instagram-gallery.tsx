import { useMemo, useState } from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { id as idLocale, enUS } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  ExternalLink,
  Images,
  Instagram,
  Play,
} from 'lucide-react'
import type { InstagramMediaItem } from '@/features/instagram/types'
import { useInstagramGallery } from '@/features/instagram/hooks/useInstagram'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { usePublicLocale } from '../i18n/use-public-locale'

function isVideo(item: InstagramMediaItem) {
  return (item.media_type || '').toUpperCase() === 'VIDEO'
}

function isCarousel(item: InstagramMediaItem) {
  return (item.media_type || '').toUpperCase() === 'CAROUSEL_ALBUM'
}

function formatPostDate(value: string | undefined, locale: 'id' | 'en') {
  if (!value) return null
  const date = parseISO(value)
  if (!isValid(date)) return null
  return format(date, 'd MMM yyyy · HH:mm', {
    locale: locale === 'id' ? idLocale : enUS,
  })
}

function PostThumb({
  item,
  onOpen,
  openLabel,
}: {
  item: InstagramMediaItem
  onOpen: () => void
  openLabel: string
}) {
  const src = item.thumbnail_url || item.media_url
  const video = isVideo(item)
  const carousel = isCarousel(item)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-black/30 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      aria-label={openLabel}
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

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-80 transition group-hover:opacity-100" />

      {/* Type badges */}
      <div className="pointer-events-none absolute right-2 top-2 flex gap-1">
        {video ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            <Play className="h-3 w-3 fill-white" aria-hidden />
            Video
          </span>
        ) : null}
        {carousel ? (
          <span className="inline-flex items-center rounded-full bg-black/55 p-1.5 text-white backdrop-blur-sm">
            <Images className="h-3.5 w-3.5" aria-hidden />
          </span>
        ) : null}
      </div>

      {video ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white shadow-lg backdrop-blur-md ring-1 ring-white/30 transition group-hover:scale-110 group-hover:bg-white/30">
            <Play className="ml-0.5 h-6 w-6 fill-white" aria-hidden />
          </span>
        </div>
      ) : null}

      {item.caption ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-0 line-clamp-2 p-2.5 text-[11px] leading-snug text-white/95 opacity-90 transition group-hover:opacity-100">
          {item.caption}
        </p>
      ) : null}
    </button>
  )
}

function PostDetailMedia({ item }: { item: InstagramMediaItem }) {
  const video = isVideo(item)
  const poster = item.thumbnail_url || undefined
  const src = item.media_url || item.thumbnail_url

  if (!src) {
    return (
      <div className="flex aspect-square items-center justify-center bg-black/40 text-white/40">
        <Instagram className="h-12 w-12" />
      </div>
    )
  }

  if (video && item.media_url) {
    return (
      <video
        key={item.id}
        className="max-h-[min(70vh,640px)] w-full bg-black object-contain"
        src={item.media_url}
        poster={poster}
        controls
        playsInline
        preload="metadata"
      >
        <track kind="captions" />
      </video>
    )
  }

  return (
    <img
      src={src}
      alt=""
      className="max-h-[min(70vh,640px)] w-full bg-black object-contain"
    />
  )
}

export function LandingInstagramGallery() {
  const { locale, messages } = usePublicLocale()
  const copy = messages.landing.instagram
  const { data, isLoading, isError } = useInstagramGallery(12)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const items = useMemo(() => data?.data ?? [], [data])
  const username = data?.profile?.username || 'bidang_ams'
  const profileUrl = `https://www.instagram.com/${username}/`
  const active = activeIndex != null ? items[activeIndex] : null
  const open = active != null

  function openAt(index: number) {
    setActiveIndex(index)
  }

  function close() {
    setActiveIndex(null)
  }

  function goPrev() {
    if (activeIndex == null || items.length === 0) return
    setActiveIndex((activeIndex - 1 + items.length) % items.length)
  }

  function goNext() {
    if (activeIndex == null || items.length === 0) return
    setActiveIndex((activeIndex + 1) % items.length)
  }

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

  const postedAt = active ? formatPostDate(active.timestamp, locale) : null

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
        {items.map((item, index) => (
          <PostThumb
            key={item.id}
            item={item}
            onOpen={() => openAt(index)}
            openLabel={copy.openPost}
          />
        ))}
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close()
        }}
      >
        <DialogContent
          showCloseButton
          className={cn(
            'max-h-[min(92vh,900px)] gap-0 overflow-hidden border-white/15 bg-slate-950 p-0 text-white sm:max-w-3xl',
            '[&_[data-slot=dialog-close]]:text-white/80 [&_[data-slot=dialog-close]]:hover:text-white',
          )}
        >
          {active ? (
            <>
              <DialogHeader className="space-y-0 border-b border-white/10 px-4 py-3 text-left sm:px-5">
                <div className="flex items-center gap-3 pr-8">
                  {data?.profile?.profile_picture_url ? (
                    <img
                      src={data.profile.profile_picture_url}
                      alt=""
                      className="h-9 w-9 rounded-full border border-white/20 object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500/20 text-pink-200">
                      <Instagram className="h-4 w-4" aria-hidden />
                    </span>
                  )}
                  <div className="min-w-0">
                    <DialogTitle className="truncate text-sm font-semibold text-white">
                      @{username}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-white/55">
                      {postedAt || copy.postDetail}
                      {isVideo(active) ? ` · ${copy.video}` : null}
                      {isCarousel(active) ? ` · ${copy.carousel}` : null}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="relative bg-black">
                <PostDetailMedia item={active} />

                {items.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                      aria-label={copy.prevPost}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                      aria-label={copy.nextPost}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
              </div>

              <div className="space-y-3 border-t border-white/10 px-4 py-4 sm:px-5">
                {active.caption ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">
                    <span className="mr-2 font-semibold text-white">@{username}</span>
                    {active.caption}
                  </p>
                ) : (
                  <p className="text-sm text-white/50">{copy.noCaption}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/45">
                    {isVideo(active) ? (
                      <Clapperboard className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <Instagram className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {activeIndex != null ? `${activeIndex + 1} / ${items.length}` : null}
                  </span>

                  {active.permalink ? (
                    <a
                      href={active.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/20"
                    >
                      {copy.openOnInstagram}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
