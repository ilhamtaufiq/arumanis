import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { getBerkasJenisDokumen } from '../api'
import {
    findJenisDokumenMatch,
    mergeJenisDokumenOptions,
    normalizeJenisDokumenLabel,
} from '../lib/jenis-dokumen'

type JenisDokumenSelectProps = {
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    id?: string
    className?: string
    placeholder?: string
}

export function JenisDokumenSelect({
    value,
    onChange,
    disabled,
    id,
    className,
    placeholder = 'Pilih jenis dokumen…',
}: JenisDokumenSelectProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [localExtras, setLocalExtras] = useState<string[]>([])

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['berkas-jenis-dokumen'],
        queryFn: getBerkasJenisDokumen,
        staleTime: 60_000,
    })

    const options = useMemo(
        () => mergeJenisDokumenOptions(data?.data ?? [], localExtras, value),
        [data?.data, localExtras, value],
    )

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return options
        return options.filter((item) => item.toLowerCase().includes(q))
    }, [options, search])

    const normalizedSearch = normalizeJenisDokumenLabel(search)
    const exactMatch = findJenisDokumenMatch(options, normalizedSearch)
    const showCreate =
        normalizedSearch.length > 0 && !exactMatch

    const handleSelect = (next: string) => {
        onChange(next)
        setSearch('')
        setOpen(false)
    }

    const handleCreate = () => {
        const label = normalizedSearch
        if (!label) return

        const existing = findJenisDokumenMatch(options, label)
        if (existing) {
            handleSelect(existing)
            return
        }

        setLocalExtras((prev) => {
            if (findJenisDokumenMatch(prev, label)) return prev
            return [...prev, label]
        })
        handleSelect(label)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'w-full justify-between font-normal',
                        !value && 'text-muted-foreground',
                        className,
                    )}
                >
                    <span className="truncate">{value || placeholder}</span>
                    <span className="ml-2 flex shrink-0 items-center gap-1">
                        {(isLoading || isFetching) && open ? (
                            <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                        ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        )}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Cari atau ketik untuk menambah…"
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList className="max-h-[280px]">
                        {isLoading && options.length === 0 ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>
                                    {showCreate
                                        ? 'Pilih opsi “Tambah” di bawah untuk membuat jenis baru'
                                        : 'Tidak ada jenis dokumen'}
                                </CommandEmpty>
                                <CommandGroup heading="Jenis dokumen">
                                    {filtered.map((item) => (
                                        <CommandItem
                                            key={item}
                                            value={item}
                                            onSelect={() => handleSelect(item)}
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4',
                                                    value.toLowerCase() === item.toLowerCase()
                                                        ? 'opacity-100'
                                                        : 'opacity-0',
                                                )}
                                            />
                                            <span className="flex-1">{item}</span>
                                        </CommandItem>
                                    ))}
                                    {showCreate ? (
                                        <CommandItem
                                            value={`create-${normalizedSearch}`}
                                            onSelect={handleCreate}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            <span>
                                                Tambah &quot;{normalizedSearch}&quot;
                                            </span>
                                        </CommandItem>
                                    ) : null}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
