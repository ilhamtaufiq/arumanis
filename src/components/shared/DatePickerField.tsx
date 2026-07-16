import { useEffect, useMemo, useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

function parseIsoDate(value: string): Date | undefined {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (!match) return undefined

    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const date = new Date(year, month - 1, day)

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return undefined
    }

    return date
}

function toIsoDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function formatDisplayDate(date: Date): string {
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

type DatePickerFieldProps = {
    id?: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    /** Enable month/year dropdowns in the calendar caption */
    captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years'
}

export function DatePickerField({
    id,
    value,
    onChange,
    placeholder = 'Pilih tanggal',
    className,
    disabled = false,
    captionLayout = 'dropdown',
}: DatePickerFieldProps) {
    const [open, setOpen] = useState(false)
    const selectedDate = useMemo(() => parseIsoDate(value), [value])
    const [month, setMonth] = useState<Date>(() => selectedDate ?? new Date())

    // Keep calendar month in sync when value changes while closed/open
    useEffect(() => {
        if (selectedDate) {
            setMonth(selectedDate)
        }
    }, [selectedDate])

    return (
        <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'h-8 w-full justify-start text-left font-normal',
                        !value && 'text-muted-foreground',
                        className,
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-0"
                align="start"
                // Prevent focus trap from swallowing nav button clicks
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {open && (
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        month={month}
                        onMonthChange={setMonth}
                        captionLayout={captionLayout}
                        onSelect={(date) => {
                            onChange(date ? toIsoDate(date) : '')
                            if (date) setMonth(date)
                            setOpen(false)
                        }}
                        startMonth={new Date(2000, 0)}
                        endMonth={new Date(2100, 11)}
                    />
                )}
            </PopoverContent>
        </Popover>
    )
}
