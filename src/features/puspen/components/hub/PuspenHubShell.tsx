import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { puspenBorder, puspenHeadingReset, puspenPixelGridStyle, puspenShadowLg } from '../../lib/tokens'

type PuspenHubShellProps = {
    children: ReactNode
    className?: string
}

export function PuspenHubShell({ children, className }: PuspenHubShellProps) {
    return (
        <div
            className={cn(
                'relative min-h-[calc(100svh-2rem)] overflow-hidden bg-[#FFF7E8] text-[#111111]',
                puspenHeadingReset,
                puspenBorder,
                puspenShadowLg,
                className
            )}
            style={puspenPixelGridStyle}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-3 bg-[#111111]" />
            <div
                className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03]"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(0deg, #111111 0px, #111111 1px, transparent 1px, transparent 3px)',
                }}
            />
            <div className="pointer-events-none absolute left-4 top-5 z-10 h-4 w-4 bg-[#FFB703] shadow-[4px_4px_0_0_#111111]" />
            <div className="pointer-events-none absolute right-4 top-5 z-10 h-4 w-4 bg-[#8ECAE6] shadow-[4px_4px_0_0_#111111]" />
            <div className="pointer-events-none absolute bottom-4 left-4 z-10 h-4 w-4 bg-[#FB8500] shadow-[4px_4px_0_0_#111111]" />
            <div className="pointer-events-none absolute bottom-4 right-4 z-10 h-4 w-4 bg-[#2ECC71] shadow-[4px_4px_0_0_#111111]" />

            <div className="relative z-10">{children}</div>
        </div>
    )
}