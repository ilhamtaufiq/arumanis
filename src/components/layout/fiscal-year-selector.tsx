import { useAuthStore } from '@/stores/auth-stores'
import { useAppSettingsStore } from '@/stores/app-settings-store'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

type FiscalYearSelectorProps = {
    compact?: boolean
}

export function FiscalYearSelector({ compact = false }: FiscalYearSelectorProps) {
    const { auth } = useAuthStore()
    const { tahunAnggaran, setTahunAnggaran } = useAppSettingsStore()
    const isAdmin = auth.user?.roles?.includes('admin') || false

    // Generate a list of years, e.g., 2020 to current year + 2
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 10 }, (_, i) => (currentYear - 5 + i).toString())

    if (!isAdmin) {
        return (
            <Badge
                variant='outline'
                className={cn(
                    'flex h-8 items-center gap-1.5 rounded-full border-secondary-foreground/10 bg-secondary/30 px-2 text-xs font-medium sm:px-3',
                    compact && 'max-[380px]:px-2',
                )}
            >
                <CalendarDays className='size-3.5 shrink-0 text-muted-foreground' />
                <span className={cn(compact && 'max-[380px]:sr-only')}>TA {tahunAnggaran}</span>
            </Badge>
        )
    }

    return (
        <div className='flex items-center gap-2'>
            <Select value={tahunAnggaran} onValueChange={setTahunAnggaran}>
                <SelectTrigger
                    className={cn(
                        'h-8 w-[5.5rem] min-w-0 rounded-full border-secondary-foreground/10 bg-secondary/30 px-2 text-xs font-medium focus:ring-1 sm:w-[100px] sm:px-3',
                    )}
                >
                    <div className='flex min-w-0 items-center gap-1.5'>
                        <CalendarDays className='size-3.5 shrink-0 text-muted-foreground' />
                        <SelectValue placeholder='Tahun' />
                    </div>
                </SelectTrigger>
                <SelectContent align='end'>
                    {years.map((year) => (
                        <SelectItem key={year} value={year} className='text-xs'>
                            TA {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
