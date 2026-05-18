import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useState } from 'react'
import { getCookie } from '@/lib/cookies'
import {
  BarChart3,
  CheckCircle2,
  FileText,
  Globe,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import SplitText from '@/components/SplitText'
import ShinyText from '@/components/ShinyText'
import GooeyNav from '@/components/ui/GooeyNav'
import DecryptedText from '@/components/DecryptedText'
import SpotlightCard from '@/components/ui/SpotlightCard'

import { getAppSettings, getSettingValue } from '@/features/settings/api'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const Grainient = lazy(() => import('@/components/ui/Grainient'))

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const cookieState = getCookie(ACCESS_TOKEN)
    const accessToken = cookieState ? JSON.parse(cookieState) : ''

    // 1. If logged in, always go to dashboard
    if (accessToken) {
      throw redirect({
        to: '/dashboard',
      })
    }

    // 2. Check if landing page is active in settings
    let settings = null
    try {
      settings = await getAppSettings()
    } catch (error) {
      // Ignore API errors for landing page check
    }

    if (settings) {
      const landingActive = getSettingValue(settings.data, 'landing_page_active')
      // If specifically set to '0' (inactive), redirect to dashboard
      if (landingActive === '0') {
        throw redirect({
          to: '/dashboard',
        })
      }
    }
  },
  component: LandingPage,
})

function LandingPage() {
  const [showBackgroundEffect, setShowBackgroundEffect] = useState(false)

  useEffect(() => {
    const enableBackgroundEffect = () => setShowBackgroundEffect(true)

    const browserWindow = window as Window & typeof globalThis & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions
      ) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (browserWindow.requestIdleCallback && browserWindow.cancelIdleCallback) {
      const idleCallbackId = browserWindow.requestIdleCallback(enableBackgroundEffect, {
        timeout: 1200,
      })

      return () => browserWindow.cancelIdleCallback?.(idleCallbackId)
    }

    const timeoutId = window.setTimeout(enableBackgroundEffect, 250)
    return () => window.clearTimeout(timeoutId)
  }, [])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,159,252,0.9),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(82,39,255,0.95),transparent_42%),linear-gradient(135deg,#b497cf_0%,#8f78ff_48%,#5227ff_100%)] flex flex-col antialiased relative overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-5 md:top-8 w-full z-50 pointer-events-none">
        <div className="container mx-auto px-6 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <img src="/arumanis.svg" alt="Arumanis" className="h-10 w-auto drop-shadow-2xl" />
          </div>

          <div className="hidden md:block">
            <div className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-full px-2 py-1 shadow-2xl">
              <GooeyNav
                items={[
                  { label: "Fitur", href: "#features" },
                  { label: "Tentang", href: "#about" },
                  { label: "Publikasi", href: "#publikasi" },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#publikasi"
              className="md:hidden rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-2xl transition-colors hover:bg-white/15"
            >
              Publikasi
            </a>
            <Link
              to="/sign-in"
              className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-950 shadow-lg shadow-black/15 transition-colors hover:bg-white/90"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-28 lg:py-40 border-b border-white/10 overflow-hidden bg-transparent">
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="inline-block mb-8">
              <ShinyText
                text="Arumanis"
                disabled={false}
                speed={3}
                className="text-[18px] font-bold uppercase tracking-[0.3em] text-white"
              />
            </div>
            <h1 className="text-5xl lg:text-8xl font-medium tracking-tighter mb-8 text-white leading-[0.9]">
              <SplitText
                text="Air Minum dan Sanitasi."
                className="inline-block"
                delay={150}
              />
            </h1>
            <p className="text-base lg:text-xl text-white/85 max-w-xl mx-auto leading-relaxed font-light">
              Platform manajemen pekerjaan infrastruktur air minum dan sanitasi yang mengedepankan efisiensi, akurasi data, dan transparansi publik.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 lg:py-28 border-b border-white/10 bg-transparent">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-4 sticky top-32">
                <h2 className="text-4xl font-medium tracking-tight mb-6 text-white">
                  <DecryptedText text="Arsitektur Digital Untuk Pengawasan" animateOn="view" />
                </h2>
                <p className="text-white/80 leading-relaxed mb-8">
                  Setiap fitur dirancang untuk memberikan kendali penuh atas siklus hidup proyek infrastruktur, dari perencanaan hingga serah terima.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white dark:text-white" />
                    <span className="text-sm font-medium text-white/95">Monitoring Real-time</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white dark:text-white" />
                    <span className="text-sm font-medium text-white/95">Validasi Data Akurat</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-white dark:text-white" />
                    <span className="text-sm font-medium text-white/95">Pelaporan Otomatis</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 grid md:grid-cols-2 gap-x-12 gap-y-20">
                {[
                  {
                    title: "Geographic Insights",
                    desc: "Visualisasi lokasi dan sebaran pekerjaan melalui integrasi peta digital yang presisi.",
                    icon: <MapPin className="w-5 h-5" />,
                  },
                  {
                    title: "Document Control",
                    desc: "Pusat kendali dokumen kontrak dan administrasi yang terorganisir secara sistematis.",
                    icon: <FileText className="w-5 h-5" />,
                  },
                  {
                    title: "Advanced Analytics",
                    desc: "Analisis performa keuangan dan fisik melalui dashboard statistik yang komprehensif.",
                    icon: <BarChart3 className="w-5 h-5" />,
                  },
                  {
                    title: "Access Governance",
                    desc: "Manajemen hak akses yang ketat untuk menjaga integritas dan kerahasiaan data.",
                    icon: <ShieldCheck className="w-5 h-5" />,
                  },
                ].map((feature, i) => (
                  <SpotlightCard key={i} className="bg-white/5 border-white/10 p-10 group" spotlightColor="rgba(255, 255, 255, 0.1)">
                    <div className="mb-6 pb-6 border-b border-white/10">
                      <div className="text-white/40 group-hover:text-white transition-colors">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-medium mb-4 text-white">{feature.title}</h3>
                    <p className="text-white/75 leading-relaxed text-sm">
                      {feature.desc}
                    </p>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* About Section */}
        <section id="about" className="py-24 lg:py-28 bg-transparent border-b border-white/10">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl lg:text-5xl font-medium tracking-tighter mb-8 text-white">
                Membangun Ekosistem Air Minum dan Sanitasi yang Berkelanjutan.
              </h2>
              <p className="text-base lg:text-xl text-white/80 leading-relaxed font-light mb-12">
                Arumanis adalah platform manajemen proyek terintegrasi yang dirancang khusus untuk mendukung Bidang Air Minum dan Sanitasi. Kami percaya bahwa transparansi data dan efisiensi operasional adalah kunci untuk mewujudkan infrastruktur yang lebih baik bagi masyarakat.
              </p>
              <div className="grid md:grid-cols-3 gap-8 text-left">
                {[
                  { label: "Visi", text: "Menjadi standar utama dalam manajemen data infrastruktur air minum dan sanitasi." },
                  { label: "Misi", text: "Menyediakan alat kolaborasi yang transparan, akurat, dan mudah diakses oleh semua stakeholder." },
                  { label: "Nilai", text: "Integritas, Inovasi, dan Keberlanjutan dalam setiap tetes data yang kami kelola." }
                ].map((item, i) => (
                  <SpotlightCard key={i} className="bg-white/5 border-white/10 p-8" spotlightColor="rgba(255, 255, 255, 0.05)">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4 block">{item.label}</span>
                    <p className="text-white/85 text-sm leading-relaxed">{item.text}</p>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Publications Section */}
        <section id="publikasi" className="py-24 lg:py-28 bg-transparent border-b border-white/10">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <SpotlightCard
                className="bg-white/5 border-white/10 p-8 lg:p-10"
                spotlightColor="rgba(255, 255, 255, 0.08)"
              >
                <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/45 mb-4 block">
                      Publikasi
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-white mb-4">
                      Akses informasi publik secara lebih terbuka.
                    </h2>
                    <p className="text-white/78 leading-relaxed max-w-2xl">
                      Temukan dokumen, pembaruan, dan informasi publik terkait layanan air minum dan sanitasi dalam satu tempat yang mudah diakses.
                    </p>
                  </div>
                  <Link
                    to="/publikasi"
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-2xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  >
                    Lihat Publikasi
                  </Link>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 lg:py-16 bg-transparent">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-3 mb-6">
                <img src="/arumanis.svg" alt="Arumanis" className="h-8 w-auto" />
              </div>
              <p className="text-xs text-white/65 leading-relaxed uppercase tracking-widest font-semibold">
                arumanis - bidang air minum dan sanitasi
              </p>
            </div>

            <div className="grid grid-cols-2 gap-24">
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2">Navigasi</span>
                <a href="#features" className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Fitur</a>
                <a href="#about" className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Tentang</a>
                <a href="#publikasi" className="text-xs font-semibold uppercase tracking-widest text-white/75 hover:text-white transition-colors">Publikasi</a>
                <Link to="/dashboard" className="text-xs font-bold uppercase tracking-[0.2em] text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all w-fit mt-2 flex items-center gap-2">
                  Dashboard →
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2">Legal</span>
                <a href="#" className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Syarat</a>
                <a href="#" className="text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white transition-colors">Privasi</a>
              </div>
            </div>
          </div>
          <div className="mt-16 lg:mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
              © 2026 Arumanis.
            </p>
            <div className="flex gap-4">
              <Globe className="w-4 h-4 text-slate-300" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">ID / EN</span>
            </div>
          </div>
        </div>
      </footer>
      {showBackgroundEffect && (
        <Suspense fallback={null}>
          <Grainient
            className="fixed inset-0 z-[-1] opacity-90 dark:opacity-80 pointer-events-none overflow-hidden"
            color1="#FF9FFC"
            color2="#5227FF"
            color3="#B497CF"
            timeSpeed={0.15}
            warpStrength={0.8}
          />
        </Suspense>
      )}
    </div>
  )
}
