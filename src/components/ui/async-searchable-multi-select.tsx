"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

export interface AsyncSearchableMultiSelectOption {
    value: string
    label: string
    disabled?: boolean
}

interface AsyncSearchableMultiSelectProps {
    initialOptions?: AsyncSearchableMultiSelectOption[]
    onSearch: (query: string) => Promise<AsyncSearchableMultiSelectOption[]>
    values?: string[]
    selectedOptions?: AsyncSearchableMultiSelectOption[]
    onValuesChange?: (values: string[], options: AsyncSearchableMultiSelectOption[]) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    loadingMessage?: string
    disabled?: boolean
    className?: string
    debounceMs?: number
}

export function AsyncSearchableMultiSelect({
    initialOptions = [],
    onSearch,
    values = [],
    selectedOptions = [],
    onValuesChange,
    placeholder = "Pilih...",
    searchPlaceholder = "Cari...",
    emptyMessage = "Tidak ada data.",
    loadingMessage = "Mencari...",
    disabled = false,
    className,
    debounceMs = 300,
}: AsyncSearchableMultiSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [options, setOptions] = React.useState<AsyncSearchableMultiSelectOption[]>(initialOptions)
    const [isLoading, setIsLoading] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const debounceTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    React.useEffect(() => {
        if (!searchQuery) {
            setOptions(initialOptions)
        }
    }, [initialOptions, searchQuery])

    const handleSearch = React.useCallback((query: string) => {
        setSearchQuery(query)

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
        }

        if (!query.trim()) {
            setOptions(initialOptions)
            setIsLoading(false)
            return
        }

        setIsLoading(true)

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

    React.useEffect(() => {
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current)
            }
        }
    }, [])

    const toggleOption = (optionValue: string, optionLabel: string) => {
        const newValues = values.includes(optionValue)
            ? values.filter((v) => v !== optionValue)
            : [...values, optionValue]
            
        let newSelectedOptions = [...selectedOptions];
        if (values.includes(optionValue)) {
            newSelectedOptions = newSelectedOptions.filter(o => o.value !== optionValue);
        } else {
            if (!newSelectedOptions.find(o => o.value === optionValue)) {
                newSelectedOptions.push({ value: optionValue, label: optionLabel });
            }
        }

        onValuesChange?.(newValues, newSelectedOptions)
    }

    const removeOption = (e: React.MouseEvent, optionValue: string) => {
        e.stopPropagation()
        const newValues = values.filter((v) => v !== optionValue)
        const newSelectedOptions = selectedOptions.filter((o) => o.value !== optionValue)
        onValuesChange?.(newValues, newSelectedOptions)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between h-auto min-h-10 px-3 py-2",
                        values.length === 0 && "text-muted-foreground",
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1 text-left items-center w-full max-w-full overflow-hidden">
                        {values.length > 0 ? (
                            selectedOptions.map((opt) => (
                                <Badge variant="secondary" key={opt.value} className="mr-1 mb-1 font-normal flex items-center pr-1">
                                    {opt.label}
                                    <div
                                        role="button"
                                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 cursor-pointer"
                                        onClick={(e) => removeOption(e, opt.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                removeOption(e as any, opt.value);
                                            }
                                        }}
                                        tabIndex={0}
                                    >
                                        <X className="h-3 w-3" />
                                    </div>
                                </Badge>
                            ))
                        ) : (
                            <span className="truncate">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 flex-none" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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
                                {options.map((option) => {
                                    const isSelected = values.includes(option.value);
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            value={option.value}
                                            disabled={option.disabled}
                                            onSelect={() => {
                                                toggleOption(option.value, option.label)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span className="truncate">{option.label}</span>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
