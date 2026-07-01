import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { PuspenHubShell } from './hub/PuspenHubShell'
import { PuspenToolStatusBar } from './hub/PuspenToolStatusBar'
import { puspenBorder, puspenShadowLg } from '../lib/tokens'

export type PuspenToolMeta = {
    slot: string
    toolName: string
    accent?: string
}

type PuspenToolLayoutProps = PuspenToolMeta & {
    eyebrow: ReactNode
    title: string
    description: string
    children: ReactNode
    aside?: ReactNode
    className?: string
    playerName?: string
    showHubBack?: boolean
    showDashboardExit?: boolean
    showStatusBar?: boolean
}

export function PuspenToolLayout({
    slot,
    toolName,
    accent = 'bg-[#FFB703]',
    eyebrow,
    title,
    description,
    children,
    aside,
    className,
    playerName,
    showHubBack = true,
    showDashboardExit = true,
    showStatusBar = true,
}: PuspenToolLayoutProps) {
    return (
        <PuspenHubShell className={className}>
            {showStatusBar ? (
                <PuspenToolStatusBar
                    slot={slot}
                    toolName={toolName}
                    accent={accent}
                    playerName={playerName}
                    showHubBack={showHubBack}
                    showDashboardExit={showDashboardExit}
                />
            ) : null}

            <div className="space-y-8 p-4 sm:p-6 lg:p-8">
                <section className={cn('grid gap-6', aside && 'lg:grid-cols-[1.5fr_0.85fr]')}>
                    <div className={`relative overflow-hidden ${accent} p-6 sm:p-8 ${puspenBorder} ${puspenShadowLg}`}>
                        <div
                            className="pointer-events-none absolute inset-x-0 bottom-0 h-3"
                            style={{
                                backgroundImage:
                                    'linear-gradient(90deg, #111111 0 25%, transparent 25% 50%, #111111 50% 75%, transparent 75% 100%)',
                                backgroundSize: '20px 12px',
                            }}
                        />
                        <div className={`inline-flex items-center gap-2 bg-[#FFF7E8] px-4 py-2 text-[#111111] ${puspenBorder} shadow-[3px_3px_0_0_#111111] text-[10px] font-black uppercase tracking-[0.34em]`}>
                            {eyebrow}
                        </div>

                        <div className="relative mt-6 max-w-2xl space-y-4">
                            <div className={`inline-block bg-[#1A1A2E] px-3 py-1 text-[#FFB703] ${puspenBorder} shadow-[2px_2px_0_0_#111111] text-[10px] font-black uppercase tracking-[0.22em]`}>
                                Slot {slot}
                            </div>
                            <h1 className="text-3xl font-black uppercase leading-[0.92] tracking-[0.08em] text-[#111111] sm:text-5xl lg:text-6xl">
                                {title}
                            </h1>
                            <p className="max-w-xl text-base font-bold leading-7 tracking-[0.02em] text-[#111111] sm:text-lg">
                                {description}
                            </p>
                        </div>

                        <div className="relative mt-6">{children}</div>
                    </div>

                    {aside ? (
                        <aside className={`relative space-y-4 overflow-hidden bg-[#8ECAE6] p-6 ${puspenBorder} ${puspenShadowLg}`}>
                            <div
                                className="pointer-events-none absolute inset-x-0 top-0 h-3"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(90deg, #111111 0 33%, transparent 33% 66%, #111111 66% 100%)',
                                    backgroundSize: '18px 12px',
                                }}
                            />
                            {aside}
                        </aside>
                    ) : null}
                </section>
            </div>
        </PuspenHubShell>
    )
}