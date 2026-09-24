import { createContext, useContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react'

type SearchContextType = {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}

export const SearchContext = createContext<SearchContextType | null>(null)

type SearchProviderProps = {
    children: React.ReactNode
}

export function SearchProvider({ children }: SearchProviderProps) {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            // Alt+A: buka command dialog cari paket pekerjaan & menu (tanpa menu).
            if (e.key === 'a' && e.altKey) {
                e.preventDefault()
                setOpen(true)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [setOpen])

    return (
        <SearchContext.Provider value={{ open, setOpen }}>
            {children}
        </SearchContext.Provider>
    )
}

export function useSearch() {
    const searchContext = useContext(SearchContext)

    if (!searchContext) {
        throw new Error('useSearch has to be used within SearchProvider')
    }

    return searchContext
}

export function useSearchOptional() {
    return useContext(SearchContext)
}