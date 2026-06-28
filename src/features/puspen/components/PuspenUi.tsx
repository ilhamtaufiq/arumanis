import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { puspenBorder, puspenLabel, puspenPressable, puspenShadowSm } from '../lib/tokens'

export const puspenInputClass = cn(
    'w-full bg-white px-4 py-3 font-black text-[#111111]',
    puspenBorder,
    'outline-none focus:bg-[#8ECAE6]',
)

export const puspenSelectClass = cn(
    'w-full bg-white px-4 py-3 font-black text-[#111111]',
    puspenBorder,
    'outline-none focus:bg-[#8ECAE6]',
)

type PuspenFieldProps = {
    label: string
    children: ReactNode
    className?: string
}

export function PuspenField({ label, children, className }: PuspenFieldProps) {
    return (
        <div className={cn('space-y-1.5', className)}>
            <div className={`${puspenLabel} text-[#111111]/60`}>{label}</div>
            {children}
        </div>
    )
}

export function PuspenInput(props: InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className={cn(puspenInputClass, props.className)} />
}

export function PuspenSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
    return <select {...props} className={cn(puspenSelectClass, props.className)} />
}

type PuspenButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'nav'

const buttonVariants: Record<PuspenButtonVariant, string> = {
    primary: 'bg-[#FFB703] hover:brightness-105',
    secondary: 'bg-[#8ECAE6] hover:brightness-105',
    success: 'bg-[#2ECC71] hover:brightness-105',
    danger: 'bg-[#EF233C] text-white hover:brightness-105',
    ghost: 'bg-[#FFF7E8] hover:bg-[#FFB703]',
    nav: 'bg-[#FFF7E8] hover:bg-[#E63946] hover:text-white',
}

export function PuspenButton({
    variant = 'ghost',
    className,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: PuspenButtonVariant }) {
    return (
        <button
            type="button"
            {...props}
            className={cn(
                'inline-flex items-center gap-2 px-4 py-2 font-black uppercase tracking-[0.16em] text-[#111111] disabled:opacity-50',
                puspenBorder,
                puspenShadowSm,
                puspenPressable,
                buttonVariants[variant],
                className,
            )}
        >
            {children}
        </button>
    )
}

export function PuspenBadge({
    children,
    tone = 'paper',
    className,
}: {
    children: ReactNode
    tone?: 'paper' | 'crt' | 'accent' | 'danger' | 'warning' | 'success'
    className?: string
}) {
    const tones = {
        paper: 'bg-[#FFF7E8] text-[#111111]',
        crt: 'bg-[#1A1A2E] text-[#FFB703]',
        accent: 'bg-[#E63946] text-white',
        danger: 'bg-[#EF233C] text-white',
        warning: 'bg-[#FB8500] text-[#111111]',
        success: 'bg-[#2ECC71] text-[#111111]',
    }

    return (
        <span
            className={cn(
                'inline-block px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em]',
                puspenBorder,
                puspenShadowSm,
                tones[tone],
                className,
            )}
        >
            {children}
        </span>
    )
}

export function PuspenChip({ children }: { children: ReactNode }) {
    return (
        <span className={`inline-block bg-[#1A1A2E] px-3 py-1.5 text-[#FFB703] ${puspenBorder} ${puspenShadowSm} ${puspenLabel}`}>
            {children}
        </span>
    )
}

type PuspenTableColumn<T> = {
    key: string
    header: ReactNode
    cell: (row: T) => ReactNode
    className?: string
}

export function PuspenDataTable<T>({
    title,
    columns,
    rows,
    getRowKey,
    emptyMessage = 'Tidak ada data.',
}: {
    title?: string
    columns: PuspenTableColumn<T>[]
    rows: T[]
    getRowKey: (row: T) => string | number
    emptyMessage?: string
}) {
    return (
        <div className={`overflow-hidden bg-white ${puspenBorder} ${puspenShadowSm}`}>
            {title ? (
                <div className="border-b-[3px] border-[#111111] bg-[#1A1A2E] px-4 py-3 font-black uppercase tracking-[0.18em] text-[#FFB703]">
                    {title}
                </div>
            ) : null}
            {rows.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm font-black uppercase tracking-widest text-[#111111]/55">
                    {emptyMessage}
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] border-collapse text-sm">
                        <thead>
                            <tr className="bg-[#FFF7E8] text-left uppercase tracking-[0.14em] text-[#111111]/70">
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        scope="col"
                                        className={cn(
                                            'border-b-[3px] border-r-[3px] border-[#111111] p-3 font-black last:border-r-0',
                                            column.className,
                                        )}
                                    >
                                        {column.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={getRowKey(row)} className="border-b border-[#111111]/25 hover:bg-[#FFF7E8]/70">
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={cn(
                                                'border-r-[3px] border-[#111111] p-3 font-bold text-[#111111] last:border-r-0',
                                                column.className,
                                            )}
                                        >
                                            {column.cell(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}