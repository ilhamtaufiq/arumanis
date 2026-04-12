import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CommandMenu } from '@/components/command-menu'

type SearchContextType = {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SearchContext = createContext<SearchContextType | null>(null)

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
                // setOpen((open) => !open) if we still want to open modal
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [navigate])

    return (
        <SearchContext.Provider value={{ open, setOpen }}>
            {children}
            <CommandMenu />
        </SearchContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSearch = () => {
    const searchContext = useContext(SearchContext)

    if (!searchContext) {
        throw new Error('useSearch has to be used within SearchProvider')
    }

    return searchContext
}