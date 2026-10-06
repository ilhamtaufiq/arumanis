import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getPublikasi } from "@/features/publikasi/api";
import {
  formatPublikasiDate,
  getCoverImage,
  getExcerpt,
} from "@/features/publikasi/lib/format";

export function LatestPublikasiSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["publikasi", "latest-landing"],
    queryFn: () => getPublikasi({ published: true }),
    staleTime: 5 * 60 * 1000,
  });

  const posts = (data?.data ?? [])
    .filter((post) => post.is_published && !post.is_internal)
    .sort((a, b) => {
      const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
      const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 3);

  if (!isLoading && (isError || posts.length === 0)) {
    return null;
  }

  return (
    <section
      id="publikasi"
      ref={sectionRef}
      className="relative py-24 lg:py-32 border-t border-foreground/10"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between mb-16">
          <div>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-primary" />
              Publikasi terbaru
            </span>
            <h2
              className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Kabar terkini
              <br />
              <span className="text-muted-foreground">dari lapangan.</span>
            </h2>
          </div>

          <Link
            to="/publikasi"
            className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
          >
            Lihat semua publikasi
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="border border-foreground/10 animate-pulse"
              >
                <div className="aspect-[16/10] bg-foreground/5" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-24 bg-foreground/10" />
                  <div className="h-5 w-full bg-foreground/10" />
                  <div className="h-4 w-2/3 bg-foreground/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`grid md:grid-cols-3 gap-6 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {posts.map((post, index) => (
              <Link
                key={post.id}
                to="/publikasi/$slug"
                params={{ slug: post.slug }}
                className="group relative flex flex-col border border-foreground/10 bg-background hover:border-foreground/25 transition-colors duration-300"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={getCoverImage(post.cover_image)}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70" />
                  {post.category ? (
                    <span className="absolute left-4 top-4 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground">
                      {post.category}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-6">
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatPublikasiDate(post.published_at, "short")}
                  </p>
                  <h3 className="font-display text-xl leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {getExcerpt(post.content, 120)}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground group-hover:text-primary transition-colors">
                    Baca artikel
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
