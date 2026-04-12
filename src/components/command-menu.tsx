import React, { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, ChevronRight, Laptop, Moon, Sun, Search as SearchIcon, Loader2 } from 'lucide-react'
import { useSearch } from '@/context/search-provider'
import { useTheme } from '@/context/theme-provider'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import { sidebarData } from './layout/data/sidebar-data'
import { ScrollArea } from './ui/scroll-area'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api-client'
import { useDebounce } from '@/hooks/use-debounce'

export function CommandMenu() {
    const navigate = useNavigate()
    const { setTheme } = useTheme()
    const { open, setOpen } = useSearch()
    const [searchQuery, setSearchQuery] = React.useState('')
    const debouncedQuery = useDebounce(searchQuery, 300)

    const { data: searchResults, isLoading } = useQuery({
        queryKey: ['global-search', debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery) return []
            const res = await api.get<{ success: boolean; data: any[] }>(`/search?q=${encodeURIComponent(debouncedQuery)}`)
            return res.data || []
        },
        enabled: debouncedQuery.length > 0,
    })

    const runCommand = React.useCallback(
        (command: () => unknown) => {
            setOpen(false)
            command()
            setSearchQuery('')
        },
        [setOpen]
    )

    // Group search results by type
    const groupedResults = useMemo(() => {
        if (!searchResults) return {}
        return searchResults.reduce((acc, item) => {
            if (!acc[item.type]) {
                acc[item.type] = []
            }
            acc[item.type].push(item)
            return acc
        }, {} as Record<string, any[]>)
    }, [searchResults])

    return (
        <CommandDialog modal open={open} onOpenChange={setOpen}>
            <CommandInput 
                placeholder='Type a command or search...' 
                value={searchQuery}
                onValueChange={setSearchQuery}
            />
            <CommandList>
                <ScrollArea type='hover' className='h-72 pe-1'>
                    <CommandEmpty>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Searching...</span>
                            </div>
                        ) : (
                            "No results found."
                        )}
                    </CommandEmpty>
                    
                    {!searchQuery && sidebarData.navGroups.map((group) => (
                        <CommandGroup key={group.title} heading={group.title}>
                            {group.items.map((navItem, i) => {
                                if (navItem.url)
                                    return (
                                        <CommandItem
                                            key={`${navItem.url}-${i}`}
                                            value={navItem.title}
                                            onSelect={() => {
                                                runCommand(() => navigate({ to: navItem.url }))
                                            }}
                                        >
                                            <div className='flex size-4 items-center justify-center mr-2'>
                                                <ArrowRight className='text-muted-foreground/80 size-2' />
                                            </div>
                                            {navItem.title}
                                        </CommandItem>
                                    )

                                return navItem.items?.map((subItem, i) => (
                                    <CommandItem
                                        key={`${navItem.title}-${subItem.url}-${i}`}
                                        value={`${navItem.title}-${subItem.url}`}
                                        onSelect={() => {
                                            runCommand(() => navigate({ to: subItem.url }))
                                        }}
                                    >
                                        <div className='flex size-4 items-center justify-center mr-2'>
                                            <ArrowRight className='text-muted-foreground/80 size-2' />
                                        </div>
                                        {navItem.title} <ChevronRight className="w-3 h-3 mx-1" /> {subItem.title}
                                    </CommandItem>
                                ))
                            })}
                        </CommandGroup>
                    ))}

                    {debouncedQuery.length > 0 && Object.entries(groupedResults).map(([type, items]) => (
                        <CommandGroup key={type} heading={type}>
                            {(items as any[]).map((item: any) => (
                                <CommandItem
                                    key={`${item.type}-${item.id}`}
                                    value={`${item.title} ${item.subtitle}`}
                                    onSelect={() => {
                                        if (item.url) {
                                            runCommand(() => navigate({ to: item.url }))
                                        }
                                    }}
                                >
                                    <div className='flex size-4 items-center justify-center mr-2 mt-0.5'>
                                        <SearchIcon className='text-muted-foreground/80 size-3' />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{item.title}</span>
                                        {item.subtitle && <span className="text-xs text-muted-foreground">{item.subtitle}</span>}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ))}

                    {!searchQuery && (
                        <>
                            <CommandSeparator />
                            <CommandGroup heading='Theme'>
                                <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
                                    <Sun className="w-4 h-4 mr-2" /> <span>Light</span>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
                                    <Moon className='w-4 h-4 scale-90 mr-2' />
                                    <span>Dark</span>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
                                    <Laptop className="w-4 h-4 mr-2" />
                                    <span>System</span>
                                </CommandItem>
                            </CommandGroup>
                        </>
                    )}
                </ScrollArea>
            </CommandList>
        </CommandDialog>
    )
}