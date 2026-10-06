import { useLandingCopy } from "../i18n";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Newspaper, X } from "lucide-react";
import { getPublikasi } from "@/features/publikasi/api";
import { formatPublikasiDate } from "@/features/publikasi/lib/format";

const STORAGE_KEY = "arumanis:latest-publikasi-alert-dismissed";

export function LatestPublikasiAlert() {
  const [dismissedSlug, setDismissedSlug] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const { copy } = useLandingCopy();

  useEffect(() => {
    try {
      setDismissedSlug(localStorage.getItem(STORAGE_KEY));
    } catch {
      setDismissedSlug(null);
    }
  }, []);

  const { data } = useQuery({
    queryKey: ["publikasi", "latest-landing"],
    queryFn: () => getPublikasi({ published: true }),
    staleTime: 5 * 60 * 1000,
  });

  const latest = (data?.data ?? [])
    .filter((post) => post.is_published && !post.is_internal)
    .sort((a, b) => {
      const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
      const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
      return bTime - aTime;
    })[0];

  useEffect(() => {
    if (!latest || dismissedSlug === latest.slug) return;
    const timer = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(timer);
  }, [latest, dismissedSlug]);

  if (!latest || dismissedSlug === latest.slug || !ready) {
    return null;
  }

  const dismiss = () => {
    setReady(false);
    setDismissedSlug(latest.slug);
    try {
      localStorage.setItem(STORAGE_KEY, latest.slug);
    } catch {
      // storage tidak tersedia — alert cukup disembunyikan sesi ini
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[380px]"
    >
      <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-background/95 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Newspaper className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {copy.publikasi.alertLabel}
              {latest.published_at
                ? ` · ${formatPublikasiDate(latest.published_at, "short")}`
                : null}
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {latest.title}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={copy.publikasi.alertDismiss}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 border-t border-foreground/10 bg-foreground/[0.02] px-4 py-3">
          <Link
            to="/publikasi/$slug"
            params={{ slug: latest.slug }}
            onClick={dismiss}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {copy.publikasi.alertView}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {copy.publikasi.alertLater}
          </button>
        </div>
      </div>
    </div>
  );
}
