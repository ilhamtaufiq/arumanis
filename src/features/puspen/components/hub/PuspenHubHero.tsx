import { Zap } from 'lucide-react'
import { puspenBorder, puspenLabel, puspenShadowMd } from '../../lib/tokens'

type PuspenHubHeroProps = {
    activeTools: number
}

export function PuspenHubHero({ activeTools }: PuspenHubHeroProps) {
    return (
        <section className={`relative overflow-hidden bg-[#FFB703] p-6 sm:p-8 ${puspenBorder} shadow-[6px_6px_0_0_#111111]`}>
            <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-3"
                style={{
                    backgroundImage:
                        'linear-gradient(90deg, #111111 0 25%, transparent 25% 50%, #111111 50% 75%, transparent 75% 100%)',
                    backgroundSize: '20px 12px',
                }}
            />
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-2 opacity-30"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(90deg, #111111 0 8px, transparent 8px 16px)',
                }}
            />

            <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-2 bg-[#FFF7E8] px-4 py-2 text-[#111111] ${puspenBorder} ${puspenShadowMd}`}>
                        <Zap className="h-4 w-4" />
                        <span className={puspenLabel}>Puspen Arumanis</span>
                    </span>
                    <span className={`bg-[#1A1A2E] px-3 py-1.5 text-[#FFF7E8] ${puspenBorder} ${puspenShadowMd} ${puspenLabel}`}>
                        Lv.01 Hub
                    </span>
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-[0.1em] sm:text-6xl lg:text-7xl">
                        Puspen
                        <span className="block text-[#1A1A2E]">Arumanis</span>
                    </h1>
                    <p className="max-w-2xl text-base font-bold leading-7 sm:text-lg">
                        Command center untuk workflow Arumanis. Pilih alat kerja di bawah buat mempercepat SOP — lebih cepat, rapi, dan gak ribet.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className={`bg-[#FFF7E8] px-4 py-3 ${puspenBorder} ${puspenShadowMd}`}>
                        <div className={`${puspenLabel} text-[#111111]/60`}>Status</div>
                        <div className="mt-1 text-sm font-black uppercase tracking-[0.12em]">
                            {activeTools} Alat Aktif — Siap Pakai
                        </div>
                    </div>
                    <div className={`animate-pulse bg-[#1A1A2E] px-4 py-3 text-[#FFB703] ${puspenBorder} ${puspenShadowMd}`}>
                        <div className={`${puspenLabel} text-[#FFF7E8]/70`}>Prompt</div>
                        <div className="mt-1 text-sm font-black uppercase tracking-[0.2em]">
                            ▶ Pilih Alat Untuk Mulai
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}