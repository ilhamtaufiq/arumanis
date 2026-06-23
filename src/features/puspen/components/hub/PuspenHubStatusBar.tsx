import { Link } from '@tanstack/react-router'
import { Gamepad2, LogOut, User } from 'lucide-react'
import { PUSPEN_UI } from '../../lib/tool-meta'
import { puspenBorder, puspenLabel, puspenShadowSm } from '../../lib/tokens'

type PuspenHubStatusBarProps = {
    playerName?: string
    activeTools: number
}

export function PuspenHubStatusBar({ playerName, activeTools }: PuspenHubStatusBarProps) {
    return (
        <header
            className={`flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#111111] bg-[#1A1A2E] px-4 py-3 text-[#FFF7E8] sm:px-6`}
        >
            <div className="flex flex-wrap items-center gap-3">
                <div className={`inline-flex items-center gap-2 bg-[#FFB703] px-3 py-1.5 text-[#111111] ${puspenBorder} ${puspenShadowSm}`}>
                    <Gamepad2 className="h-4 w-4" aria-hidden />
                    <span className={puspenLabel}>{PUSPEN_UI.commandCenter}</span>
                </div>
                <div className={`hidden items-center gap-2 bg-[#FFF7E8] px-3 py-1.5 text-[#111111] sm:inline-flex ${puspenBorder} ${puspenShadowSm}`}>
                    <span className={puspenLabel}>{PUSPEN_UI.tools}</span>
                    <span className="font-black">{activeTools.toString().padStart(2, '0')}</span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {playerName ? (
                    <div className={`inline-flex items-center gap-2 bg-[#8ECAE6] px-3 py-1.5 text-[#111111] ${puspenBorder} ${puspenShadowSm}`}>
                        <User className="h-3.5 w-3.5" aria-hidden />
                        <span className="text-xs font-black uppercase tracking-[0.14em]">{playerName}</span>
                    </div>
                ) : null}
                <div className={`inline-flex items-center gap-2 bg-[#2ECC71] px-3 py-1.5 text-[#111111] ${puspenBorder} ${puspenShadowSm}`}>
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-none bg-[#111111] opacity-40" />
                        <span className="relative inline-flex h-2 w-2 bg-[#111111]" />
                    </span>
                    <span className={puspenLabel}>{PUSPEN_UI.online}</span>
                </div>
                <Link
                    to="/dashboard"
                    className={`inline-flex items-center gap-2 bg-[#FFF7E8] px-3 py-1.5 text-[#111111] ${puspenBorder} ${puspenShadowSm} transition hover:bg-[#FFB703] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
                >
                    <LogOut className="h-3.5 w-3.5" aria-hidden />
                    <span className={puspenLabel}>{PUSPEN_UI.exitToApp}</span>
                </Link>
            </div>
        </header>
    )
}