import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import { id } from 'react-day-picker/locale'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

import 'react-day-picker/style.css'

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = 'label',
    components,
    ...props
}: React.ComponentProps<typeof DayPicker>) {
    const defaultClassNames = getDefaultClassNames()

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            locale={id}
            captionLayout={captionLayout}
            className={cn(
                'group/calendar bg-background p-3 [--cell-size:2.25rem]',
                className,
            )}
            classNames={{
                root: cn('w-fit', defaultClassNames.root),
                months: cn(
                    'relative flex flex-col gap-4 md:flex-row',
                    defaultClassNames.months,
                ),
                month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
                // Full-width top bar so prev/next remain clickable
                nav: cn(
                    'absolute inset-x-0 top-0 z-10 flex w-full items-center justify-between gap-1',
                    defaultClassNames.nav,
                ),
                button_previous: cn(
                    buttonVariants({ variant: 'outline' }),
                    'size-8 shrink-0 bg-transparent p-0 opacity-70 hover:opacity-100 select-none z-20',
                    'aria-disabled:pointer-events-none aria-disabled:opacity-40',
                    defaultClassNames.button_previous,
                ),
                button_next: cn(
                    buttonVariants({ variant: 'outline' }),
                    'size-8 shrink-0 bg-transparent p-0 opacity-70 hover:opacity-100 select-none z-20',
                    'aria-disabled:pointer-events-none aria-disabled:opacity-40',
                    defaultClassNames.button_next,
                ),
                month_caption: cn(
                    'flex h-8 w-full items-center justify-center px-9',
                    defaultClassNames.month_caption,
                ),
                caption_label: cn(
                    'text-sm font-medium select-none',
                    captionLayout !== 'label' &&
                        'flex h-8 items-center gap-1 rounded-md pl-2 pr-1 [&>svg]:size-3.5 [&>svg]:text-muted-foreground',
                    defaultClassNames.caption_label,
                ),
                dropdowns: cn(
                    'flex h-8 w-full items-center justify-center gap-1.5 text-sm font-medium',
                    defaultClassNames.dropdowns,
                ),
                dropdown_root: cn(
                    'relative rounded-md border border-input shadow-xs',
                    defaultClassNames.dropdown_root,
                ),
                dropdown: cn(
                    'absolute inset-0 z-[1] cursor-pointer opacity-0',
                    defaultClassNames.dropdown,
                ),
                month_grid: cn('w-full border-collapse', defaultClassNames.month_grid),
                weekdays: cn('flex', defaultClassNames.weekdays),
                weekday: cn(
                    'flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none',
                    defaultClassNames.weekday,
                ),
                week: cn('mt-2 flex w-full', defaultClassNames.week),
                day: cn(
                    'relative aspect-square h-full w-full p-0 text-center select-none',
                    defaultClassNames.day,
                ),
                day_button: cn(
                    buttonVariants({ variant: 'ghost' }),
                    'size-9 p-0 font-normal aria-selected:opacity-100',
                    defaultClassNames.day_button,
                ),
                selected: cn(
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-md',
                    defaultClassNames.selected,
                ),
                today: cn(
                    'bg-accent text-accent-foreground rounded-md',
                    defaultClassNames.today,
                ),
                outside: cn(
                    'text-muted-foreground opacity-50',
                    defaultClassNames.outside,
                ),
                disabled: cn(
                    'text-muted-foreground opacity-50',
                    defaultClassNames.disabled,
                ),
                hidden: cn('invisible', defaultClassNames.hidden),
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation, className, ...chevronProps }) => {
                    const Icon = orientation === 'left' ? ChevronLeft : ChevronRight
                    return (
                        <Icon
                            className={cn('size-4 pointer-events-none', className)}
                            {...chevronProps}
                        />
                    )
                },
                ...components,
            }}
            {...props}
        />
    )
}

export { Calendar }
