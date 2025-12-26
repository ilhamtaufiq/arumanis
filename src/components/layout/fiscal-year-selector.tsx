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

export function FiscalYearSelector() {
    const { auth } = useAuthStore()
    const { tahunAnggaran, setTahunAnggaran } = useAppSettingsStore()
    const isAdmin = auth.user?.roles?.includes('admin') || false

    // Generate a list of years, e.g., 2020 to current year + 2
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 10 }, (_, i) => (currentYear - 5 + i).toString())

    if (!isAdmin) {
        return (
            <Badge variant='outline' className='flex items-center gap-1.5 h-8 px-3 rounded-full bg-secondary/30 border-secondary-foreground/10 text-xs font-medium translate-y-[1px]'>
                <CalendarDays className='size-3.5 text-muted-foreground' />
                <span>TA {tahunAnggaran}</span>
            </Badge>
        )
    }

    return (
        <div className='flex items-center gap-2'>
            <Select value={tahunAnggaran} onValueChange={setTahunAnggaran}>
                <SelectTrigger className='h-8 w-[100px] rounded-full bg-secondary/30 border-secondary-foreground/10 text-xs font-medium focus:ring-1'>
                    <div className='flex items-center gap-1.5'>
                        <CalendarDays className='size-3.5 text-muted-foreground' />
                        <SelectValue placeholder='Pilih Tahun' />
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
