import { Radio, Sparkles, Zap } from 'lucide-react'
import { PUSPEN_TOOLS, PUSPEN_UI } from '../../lib/tool-meta'
import {
    puspenBorder,
    puspenLabel,
    puspenPixelGridStyle,
    puspenShadowMd,
    puspenShadowSm,
} from '../../lib/tokens'
import { PuspenArcadeBanner } from './PuspenArcadeBanner'

const toolPreviews = Object.values(PUSPEN_TOOLS)

type PuspenHubHeroProps = {
    activeTools: number
}

function HeroStatCard({
    label,
    value,
    hint,
    tone = 'paper',
}: {
    label: string
    value: string
    hint?: string
    tone?: 'paper' | 'signal' | 'live'
}) {
    const toneClass = {
        paper: 'bg-[#FFF7E8] text-[#111111]',
        signal: 'bg-[#8ECAE6] text-[#111111]',
        live: 'bg-[#2ECC71] text-[#111111]',
    }[tone]

    return (
        <div className={`p-3 ${toneClass} ${puspenBorder} ${puspenShadowSm}`}>
            <div className={`${puspenLabel} text-[#111111]/55`}>{label}</div>
            <div className="mt-1 text-lg font-black uppercase tracking-[0.08em]">{value}</div>
            {hint ? <p className="mt-1 text-[10px] font-bold leading-4 text-[#111111]/65">{hint}</p> : null}
        </div>
    )
}

export function PuspenHubHero({ activeTools }: PuspenHubHeroProps) {
    return (
        <section className={`overflow-hidden ${puspenBorder} shadow-[6px_6px_0_0_#111111]`}>
            <PuspenArcadeBanner compact label={PUSPEN_UI.heroEyebrow} />

            <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,1fr)]">
                <div
                    className="relative overflow-hidden bg-[#FFB703] p-6 sm:p-8"
                    style={puspenPixelGridStyle}
                >
                    <div
                        className="pointer-events-none absolute -right-8 top-6 hidden h-28 w-28 rotate-12 border-[3px] border-[#111111] bg-[#FFF7E8] opacity-80 sm:block"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute -right-2 top-10 hidden h-20 w-20 border-[3px] border-[#111111] bg-[#8ECAE6] sm:block"
                        aria-hidden
                    />

                    <div className="relative space-y-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-2 bg-[#1A1A2E] px-4 py-2 text-[#FFF7E8] ${puspenBorder} ${puspenShadowMd}`}
                            >
                                <Radio className="h-4 w-4" aria-hidden />
                                <span className={puspenLabel}>{PUSPEN_UI.heroEyebrow}</span>
                            </span>
                            <span
                                className={`inline-flex items-center gap-2 bg-[#FFF7E8] px-3 py-1.5 text-[#111111] ${puspenBorder} ${puspenShadowSm}`}
                            >
                                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                                <span className={puspenLabel}>Workflow Live</span>
                            </span>
                        </div>

                        <div className="space-y-2">
                            <p className={`${puspenLabel} text-[#111111]/60`}>Selamat datang di</p>
                            <h1 className="text-[clamp(2.5rem,7vw,4.75rem)] font-black uppercase leading-[0.88] tracking-[0.06em] text-[#111111]">
                                Puspen
                                <span className="mt-1 block text-[#1A1A2E]">Arumanis</span>
                            </h1>
                        </div>

                        <p className="max-w-xl text-sm font-bold leading-6 text-[#111111] sm:text-base sm:leading-7">
                            {PUSPEN_UI.heroMission}
                        </p>

                        <div
                            className={`inline-flex max-w-full items-center gap-3 bg-[#1A1A2E] px-4 py-3 text-[#FFB703] ${puspenBorder} ${puspenShadowMd}`}
                        >
                            <Zap className="h-4 w-4 shrink-0" aria-hidden />
                            <span className="animate-pulse text-xs font-black uppercase tracking-[0.22em] sm:text-sm">
                                {PUSPEN_UI.pickToolPrompt}
                            </span>
                        </div>
                    </div>

                    <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-3"
                        style={{
                            backgroundImage:
                                'linear-gradient(90deg, #111111 0 25%, transparent 25% 50%, #111111 50% 75%, transparent 75% 100%)',
                            backgroundSize: '20px 12px',
                        }}
                        aria-hidden
                    />
                </div>

                <div className="flex flex-col border-t-[3px] border-[#111111] bg-[#FFF7E8] lg:border-l-[3px] lg:border-t-0">
                    <div className="border-b-[3px] border-[#111111] bg-[#1A1A2E] px-5 py-3 text-[#FFF7E8]">
                        <div className={`${puspenLabel} text-[#FFB703]`}>{PUSPEN_UI.heroInfoPanel}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs font-bold text-[#FFF7E8]/80">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping bg-[#2ECC71] opacity-50" />
                                <span className="relative inline-flex h-2 w-2 bg-[#2ECC71]" />
                            </span>
                            {PUSPEN_UI.heroBroadcast}
                        </div>
                    </div>

                    <div className="grid flex-1 gap-3 p-5 sm:grid-cols-2 sm:p-6">
                        <HeroStatCard
                            label="Alat"
                            value={activeTools.toString().padStart(2, '0')}
                            hint={PUSPEN_UI.activeTools}
                            tone="signal"
                        />
                        <HeroStatCard
                            label={PUSPEN_UI.heroSopRoute}
                            value={PUSPEN_UI.heroSopSteps}
                            hint="Alur kerja terstandar"
                        />
                        <HeroStatCard
                            label="Status"
                            value={PUSPEN_UI.online}
                            hint="Semua modul siap diakses"
                            tone="live"
                        />
                        <HeroStatCard
                            label="Mode"
                            value="SOP"
                            hint="Pilih alat di bawah untuk mulai"
                        />
                    </div>

                    <div className={`border-t-[3px] border-[#111111] bg-white p-4 ${puspenLabel}`}>
                        <div className="mb-2 text-[#111111]/55">Slot Alat</div>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                            {toolPreviews.map((tool) => (
                                <div
                                    key={tool.slot}
                                    className={`flex flex-col items-center gap-1 border-[2px] border-[#111111] p-2 shadow-[2px_2px_0_0_#111111] ${tool.accent}`}
                                    title={tool.title}
                                >
                                    <span className="text-[10px] font-black tracking-[0.18em] text-[#111111]">
                                        {tool.slot}
                                    </span>
                                    <span className="line-clamp-2 text-center text-[8px] font-black uppercase leading-3 tracking-[0.08em] text-[#111111]">
                                        {tool.tag}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}