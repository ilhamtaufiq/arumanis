import { useCallback, useEffect, useState } from 'react'
import { Grid } from '@giphy/react-components'
import type { IGif } from '@giphy/js-types'
import { ImageIcon, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getGiphyFetch, isGiphyConfigured } from '../../lib/giphy-client'

const GRID_WIDTH = 304
const GRID_COLUMNS = 2

type GiphyPickerProps = {
    disabled?: boolean
    onSelect: (markdown: string) => void
}

function getGifUrl(gif: IGif): string | null {
    return gif.images.original?.url ?? gif.images.downsized?.url ?? null
}

export function GiphyPicker({ disabled, onSelect }: GiphyPickerProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const giphyConfigured = isGiphyConfigured()
    const gf = getGiphyFetch()

    useEffect(() => {
        if (!open) return

        const timer = window.setTimeout(() => {
            setSearchTerm(query.trim())
        }, 350)

        return () => window.clearTimeout(timer)
    }, [open, query])

    const fetchGifs = useCallback(
        (offset: number) => {
            if (!gf) {
                return Promise.resolve({
                    data: [] as IGif[],
                    pagination: { count: 0, offset: 0, total_count: 0 },
                    meta: { status: 200, msg: 'OK', response_id: '' },
                })
            }

            const options = { offset, limit: 12, rating: 'g' as const, lang: 'id' }

            if (searchTerm) {
                return gf.search(searchTerm, options)
            }

            return gf.trending(options)
        },
        [gf, searchTerm],
    )

    const handleGifClick = (gif: IGif) => {
        const url = getGifUrl(gif)
        if (!url) return

        const alt = gif.title?.trim() || 'GIF'
        onSelect(`\n![${alt}](${url})\n`)
        setOpen(false)
        setQuery('')
        setSearchTerm('')
    }

    if (!giphyConfigured) {
        return (
            <Button type="button" variant="outline" size="sm" disabled title="Set VITE_GIPHY_API_KEY">
                <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                GIF
            </Button>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" disabled={disabled}>
                    <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                    GIF
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[328px] p-3">
                <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Cari GIF di Giphy..."
                        className="pl-8"
                    />
                </div>
                <div className="max-h-72 overflow-y-auto rounded-md border border-border/60 bg-muted/20 p-1">
                    <Grid
                        key={searchTerm || 'trending'}
                        width={GRID_WIDTH}
                        columns={GRID_COLUMNS}
                        gutter={6}
                        fetchGifs={fetchGifs}
                        onGifClick={handleGifClick}
                        noLink
                        hideAttribution
                        noResultsMessage={
                            <p className="py-8 text-center text-xs text-muted-foreground">
                                GIF tidak ditemukan
                            </p>
                        }
                    />
                </div>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">Powered by GIPHY</p>
            </PopoverContent>
        </Popover>
    )
}