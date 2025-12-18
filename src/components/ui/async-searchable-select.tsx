"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

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

export interface AsyncSearchableSelectOption {
    value: string
    label: string
    disabled?: boolean
}

interface AsyncSearchableSelectProps {
    // Initial options to display before search
    initialOptions?: AsyncSearchableSelectOption[]
    // Async function to search for options
    onSearch: (query: string) => Promise<AsyncSearchableSelectOption[]>
    // Currently selected value
    value?: string
    // Selected option label (for display when value is set but not in options)
    selectedLabel?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    loadingMessage?: string
    disabled?: boolean
    className?: string
    // Debounce delay in ms
    debounceMs?: number
}

export function AsyncSearchableSelect({
    initialOptions = [],
    onSearch,
    value,
    selectedLabel,
    onValueChange,
    placeholder = "Pilih...",
    searchPlaceholder = "Cari...",
    emptyMessage = "Tidak ada data.",
    loadingMessage = "Mencari...",
    disabled = false,
    className,
    debounceMs = 300,
}: AsyncSearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [options, setOptions] = React.useState<AsyncSearchableSelectOption[]>(initialOptions)
    const [isLoading, setIsLoading] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const debounceTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    // Update options when initialOptions change
    React.useEffect(() => {
        if (!searchQuery) {
            setOptions(initialOptions)
        }
    }, [initialOptions, searchQuery])

    // Handle search with debounce
    const handleSearch = React.useCallback((query: string) => {
        setSearchQuery(query)

        // Clear previous timeout
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
        }

        // If empty query, show initial options
        if (!query.trim()) {
            setOptions(initialOptions)
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        // Debounce the search
        debounceTimeout.current = setTimeout(async () => {
            try {
                const results = await onSearch(query)
                setOptions(results)
            } catch (error) {
                console.error('Search error:', error)
                setOptions([])
            } finally {
                setIsLoading(false)
            }
        }, debounceMs)
    }, [initialOptions, onSearch, debounceMs])

    // Cleanup timeout on unmount
    React.useEffect(() => {
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current)
            }
        }
    }, [])

    // Find selected option from current options or use selectedLabel
    const selectedOption = options.find((option) => option.value === value)
    const displayLabel = selectedOption?.label || selectedLabel || placeholder

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
                        {value ? displayLabel : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        onValueChange={handleSearch}
                    />
                    <CommandList className="max-h-[300px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {loadingMessage}
                            </div>
                        ) : options.length === 0 ? (
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        disabled={option.disabled}
                                        onSelect={() => {
                                            onValueChange?.(option.value)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="truncate">{option.label}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
