import { Link } from '@tanstack/react-router'
import { ArrowLeft, Gamepad2, LogOut } from 'lucide-react'
import { PUSPEN_UI } from '../../lib/tool-meta'
import { puspenBorder, puspenLabel, puspenPressable, puspenShadowSm } from '../../lib/tokens'
import { PuspenArcadeBanner } from './PuspenArcadeBanner'

type PuspenToolStatusBarProps = {
    slot: string
    toolName: string
    accent?: string
    playerName?: string
    showHubBack?: boolean
    showDashboardExit?: boolean
}

export function PuspenToolStatusBar({
    slot,
    toolName,
    accent = 'bg-[#FFB703]',
    playerName,
    showHubBack = true,
    showDashboardExit = true,
}: PuspenToolStatusBarProps) {
    return (
        <header className="border-b-[3px] border-[#111111]">
            <PuspenArcadeBanner compact label={toolName} />
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1A1A2E] px-4 py-3 text-[#FFF7E8] sm:px-6">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                {showHubBack ? (
                    <Link
                        to="/puspen"
                        className={`inline-flex items-center gap-2 bg-[#FFF7E8] px-3 py-1.5 text-[#111111] ${puspenBorder} ${puspenShadowSm} ${puspenPressable} hover:bg-[#FFB703]`}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                        <span className={puspenLabel}>{PUSPEN_UI.hub}</span>
                    </Link>
                ) : null}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-[#111111] ${accent} ${puspenBorder} ${puspenShadowSm}`}>
                    <Gamepad2 className="h-4 w-4" aria-hidden />
                    <span className={puspenLabel}>Slot {slot}</span>
                </div>
                <div className={`inline-flex max-w-full min-w-0 bg-[#FFF7E8] px-3 py-1.5 text-[#111111] ${puspenBorder} ${puspenShadowSm}`}>
                    <span className="truncate text-xs font-black uppercase tracking-[0.14em]">{toolName}</span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {playerName ? (
                    <div className={`inline-flex items-center gap-2 bg-[#8ECAE6] px-3 py-1.5 text-[#111111] ${puspenBorder} ${puspenShadowSm}`}>
                        <span className="text-xs font-black uppercase tracking-[0.14em]">{playerName}</span>
                    </div>
                ) : null}
                {showDashboardExit ? (
                    <Link
                        to="/dashboard"
                        className={`inline-flex items-center gap-2 bg-[#FFF7E8] px-3 py-1.5 text-[#111111] ${puspenBorder} ${puspenShadowSm} ${puspenPressable} hover:bg-[#FFB703]`}
                    >
                        <LogOut className="h-3.5 w-3.5" aria-hidden />
                        <span className={puspenLabel}>{PUSPEN_UI.exit}</span>
                    </Link>
                ) : null}
            </div>
            </div>
        </header>
    )
}