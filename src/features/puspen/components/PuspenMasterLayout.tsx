import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PuspenMasterLayoutProps = {
    eyebrow: ReactNode
    title: string
    description: string
    children: ReactNode
    aside: ReactNode
    className?: string
}

export function PuspenMasterLayout({
    eyebrow,
    title,
    description,
    children,
    aside,
    className,
}: PuspenMasterLayoutProps) {
    return (
        <div
            className={cn(
                'relative min-h-[calc(100svh-2rem)] overflow-hidden border-[3px] border-[#111111] bg-[#FFF7E8] text-[#111111] shadow-[6px_6px_0_0_#111111]',
                className
            )}
            style={{
                backgroundImage: `
                    linear-gradient(90deg, rgba(17,17,17,0.05) 1px, transparent 1px),
                    linear-gradient(rgba(17,17,17,0.05) 1px, transparent 1px),
                    linear-gradient(45deg, rgba(255,183,3,0.10) 25%, transparent 25%),
                    linear-gradient(-45deg, rgba(142,202,230,0.10) 25%, transparent 25%)
                `,
                backgroundSize: '24px 24px, 24px 24px, 16px 16px, 16px 16px',
                backgroundPosition: '0 0, 0 0, 0 0, 8px 8px',
            }}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-[#111111]" />
            <div className="pointer-events-none absolute left-4 top-4 h-4 w-4 bg-[#FFB703] shadow-[4px_4px_0_0_#111111]" />
            <div className="pointer-events-none absolute right-4 top-4 h-4 w-4 bg-[#8ECAE6] shadow-[4px_4px_0_0_#111111]" />
            <div className="pointer-events-none absolute bottom-4 left-4 h-4 w-4 bg-[#FB8500] shadow-[4px_4px_0_0_#111111]" />
            <div className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 bg-[#2ECC71] shadow-[4px_4px_0_0_#111111]" />

            <div className="relative z-10 space-y-8 p-4 sm:p-6 lg:p-8">
                <section className="grid gap-6 lg:grid-cols-[1.5fr_0.85fr]">
                    <div className="relative overflow-hidden border-[3px] border-[#111111] bg-[#FFB703] p-6 shadow-[6px_6px_0_0_#111111] sm:p-8">
                        <div
                            className="pointer-events-none absolute inset-x-0 bottom-0 h-3"
                            style={{
                                backgroundImage: 'linear-gradient(90deg, #111111 0 25%, transparent 25% 50%, #111111 50% 75%, transparent 75% 100%)',
                                backgroundSize: '20px 12px',
                            }}
                        />
                        <div className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#FFF7E8] px-4 py-2 text-[10px] font-black uppercase tracking-[0.34em] shadow-[3px_3px_0_0_#111111]">
                        {eyebrow}
                        </div>

                        <div className="mt-6 max-w-2xl space-y-4">
                            <h1 className="text-4xl font-black uppercase leading-[0.92] tracking-[0.08em] sm:text-6xl lg:text-7xl">
                                {title}
                            </h1>
                            <p className="max-w-xl text-base font-bold leading-7 tracking-[0.02em] sm:text-lg">
                                {description}
                            </p>
                        </div>

                        {children}
                    </div>

                    <aside className="relative space-y-4 overflow-hidden border-[3px] border-[#111111] bg-[#8ECAE6] p-6 shadow-[6px_6px_0_0_#111111]">
                        <div
                            className="pointer-events-none absolute inset-x-0 top-0 h-3"
                            style={{
                                backgroundImage: 'linear-gradient(90deg, #111111 0 33%, transparent 33% 66%, #111111 66% 100%)',
                                backgroundSize: '18px 12px',
                            }}
                        />
                        {aside}
                    </aside>
                </section>
            </div>
        </div>
    )
}
