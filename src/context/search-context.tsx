import { createContext, useContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { useNavigate } from '@tanstack/react-router'

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
    const navigate = useNavigate()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                if (window.location.pathname !== '/search') {
                    navigate({ to: '/search', replace: false })
                }
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [navigate])

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