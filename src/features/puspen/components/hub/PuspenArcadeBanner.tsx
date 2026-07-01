import '../../styles/arcade.css'
import { puspenBorder } from '../../lib/tokens'

function Pellet() {
    return (
        <span
            className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#FFF7E8]"
            style={{ imageRendering: 'pixelated' }}
            aria-hidden
        />
    )
}

function PowerPellet() {
    return (
        <span
            className="inline-block h-3 w-3 shrink-0 rounded-full bg-[#FFB703] ring-2 ring-[#FFF7E8]"
            style={{ imageRendering: 'pixelated' }}
            aria-hidden
        />
    )
}

function PacmanSprite() {
    return (
        <span className="relative mx-1 inline-flex h-7 w-7 shrink-0 items-center justify-center" aria-hidden>
            <span
                className="puspen-pacman-body absolute inset-0 bg-[#FFB703]"
                style={{
                    borderRadius: '50%',
                    boxShadow: '0 0 0 2px #111111',
                    imageRendering: 'pixelated',
                }}
            />
        </span>
    )
}

function GhostSprite({ color }: { color: string }) {
    return (
        <span className="puspen-ghost-body relative mx-1 inline-flex h-7 w-6 shrink-0 flex-col items-center" aria-hidden>
            <span
                className="h-5 w-full rounded-t-full"
                style={{ backgroundColor: color, boxShadow: '0 0 0 2px #111111' }}
            />
            <span className="-mt-px flex w-full justify-between px-0.5">
                <span className="h-1.5 w-1.5 bg-[#111111]" />
                <span className="h-1.5 w-1.5 bg-[#111111]" />
                <span className="h-1.5 w-1.5 bg-[#111111]" />
            </span>
            <span className="absolute top-2 flex w-full justify-between px-1">
                <span className="puspen-ghost-eye h-1.5 w-1.5 rounded-full bg-white" />
                <span className="puspen-ghost-eye h-1.5 w-1.5 rounded-full bg-white" />
            </span>
        </span>
    )
}

function ArcadeLane() {
    const segment = (
        <>
            <Pellet />
            <Pellet />
            <Pellet />
            <PowerPellet />
            <Pellet />
            <Pellet />
            <GhostSprite color="#EF233C" />
            <Pellet />
            <Pellet />
            <PacmanSprite />
            <Pellet />
            <Pellet />
            <Pellet />
            <GhostSprite color="#8ECAE6" />
            <Pellet />
            <Pellet />
            <PowerPellet />
            <Pellet />
            <Pellet />
            <GhostSprite color="#7C3AED" />
            <Pellet />
            <Pellet />
            <Pellet />
        </>
    )

    return (
        <div className="flex w-max items-center gap-3 px-4 py-3">
            {segment}
            {segment}
        </div>
    )
}

type PuspenArcadeBannerProps = {
    compact?: boolean
    label?: string
}

export function PuspenArcadeBanner({ compact = false, label = 'Puspen Arcade' }: PuspenArcadeBannerProps) {
    return (
        <div
            className={`relative overflow-hidden bg-[#1A1A2E] ${compact ? 'h-12' : 'h-16 sm:h-20'} ${puspenBorder} border-x-0 border-t-0`}
            role="img"
            aria-label={`Animasi arcade 8-bit ${label}`}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                    backgroundImage:
                        'linear-gradient(90deg, rgba(255,247,232,0.15) 1px, transparent 1px), linear-gradient(rgba(255,247,232,0.15) 1px, transparent 1px)',
                    backgroundSize: '12px 12px',
                    imageRendering: 'pixelated',
                }}
            />
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-40"
                style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, #FFB703 0 6px, transparent 6px 12px)',
                }}
            />

            {!compact ? (
                <div className="absolute left-3 top-2 z-10 hidden sm:block">
                    <span className="text-[8px] font-black uppercase tracking-[0.35em] text-[#FFB703]">8-Bit Mode</span>
                </div>
            ) : null}

            <div className="absolute inset-0 flex items-center overflow-hidden">
                <div className="puspen-arcade-scroll flex min-w-max">
                    <ArcadeLane />
                    <ArcadeLane />
                </div>
            </div>

            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: 'repeating-linear-gradient(0deg, rgba(17,17,17,0.12) 0 1px, transparent 1px 3px)',
                }}
            />
        </div>
    )
}