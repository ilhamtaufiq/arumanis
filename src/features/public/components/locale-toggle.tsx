import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePublicLocale } from '../i18n/use-public-locale'
import type { PublicLocale } from '../i18n/types'

type LocaleToggleProps = {
    className?: string
    variant?: 'footer' | 'header' | 'legal'
}

const LOCALES: PublicLocale[] = ['id', 'en']

export function LocaleToggle({ className, variant = 'footer' }: LocaleToggleProps) {
    const { locale, setLocale } = usePublicLocale()
    const isFooter = variant === 'footer'
    const isLegal = variant === 'legal'

    return (
        <div
            className={cn(
                'inline-flex items-center gap-2',
                isFooter ? 'text-slate-400' : isLegal ? 'text-[#111111]/70' : 'text-white/80',
                className,
            )}
            role="group"
            aria-label="Language"
        >
            <Globe
                className={cn(
                    'h-4 w-4 shrink-0',
                    isFooter ? 'text-slate-300' : isLegal ? 'text-[#111111]/55' : undefined,
                )}
                aria-hidden
            />
            <div
                className={cn(
                    'inline-flex items-center rounded-full border p-0.5',
                    isFooter
                        ? 'border-white/15 bg-white/5'
                        : isLegal
                          ? 'border-[#111111] bg-white shadow-[2px_2px_0_0_#111111]'
                          : 'border-white/20 bg-black/20',
                )}
            >
                {LOCALES.map((item) => {
                    const active = locale === item

                    return (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setLocale(item)}
                            aria-pressed={active}
                            className={cn(
                                'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors',
                                active
                                    ? isLegal
                                        ? 'bg-[#FB8500] text-[#111111]'
                                        : 'bg-white text-slate-950'
                                    : isFooter
                                      ? 'text-slate-400 hover:text-white'
                                      : isLegal
                                        ? 'text-[#111111]/55 hover:text-[#111111]'
                                        : 'text-white/65 hover:text-white',
                            )}
                        >
                            {item}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}