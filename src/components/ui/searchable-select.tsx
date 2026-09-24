"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface SearchableSelectOption {
    value: string
    label: string
    /** Extra text included in combobox search matching (not shown in label). */
    keywords?: string
    /** Secondary line rendered under the label. */
    sub?: string
    disabled?: boolean
}

interface SearchableSelectProps {
    options: SearchableSelectOption[]
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    disabled?: boolean
    className?: string
    /** Saat tanpa pencarian, hanya N item pertama yang tampil; sisanya muncul saat search. */
    defaultVisibleCount?: number
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = "Pilih...",
    searchPlaceholder = "Cari...",
    emptyMessage = "Tidak ada data.",
    disabled = false,
    className,
    defaultVisibleCount,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")

    const visibleOptions =
        defaultVisibleCount && !query ? options.slice(0, defaultVisibleCount) : options

    const selectedOption = options.find((option) => option.value === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command
                    filter={(value, search) => {
                        if (value.toLowerCase().includes(search.toLowerCase())) return 1
                        return 0
                    }}
                >
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList className="max-h-[300px]">
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {visibleOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.keywords ? `${option.label} ${option.keywords}` : option.label}
                                    disabled={option.disabled}
                                    onSelect={() => {
                                        onValueChange?.(option.value)
                                        setOpen(false)
                                        setQuery("")
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 shrink-0 self-start",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="flex min-w-0 flex-col">
                                        <span className="truncate">{option.label}</span>
                                        {option.sub ? (
                                            <span className="truncate text-xs text-muted-foreground">
                                                {option.sub}
                                            </span>
                                        ) : null}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
