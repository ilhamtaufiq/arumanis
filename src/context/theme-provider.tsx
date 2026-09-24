import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { isThemePreset, type ThemePreset } from '@/lib/theme-presets'

type Theme = 'dark' | 'light' | 'system'
type ResolvedTheme = Exclude<Theme, 'system'>

const DEFAULT_THEME = 'system'
/** Preset bawaan untuk pengguna baru / yang belum memilih preset. */
const DEFAULT_THEME_PRESET: ThemePreset = 'tangerine'
/**
 * Preset base: gayanya didefinisikan di `:root` tanpa atribut, sehingga
 * `data-theme-preset` harus dihapus saat preset ini aktif (bukan saat default).
 */
const BASE_THEME_PRESET: ThemePreset = 'classic'
const THEME_COOKIE_NAME = 'vite-ui-theme'
const THEME_PRESET_COOKIE_NAME = 'vite-ui-theme-preset'
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    defaultTheme: Theme
    resolvedTheme: ResolvedTheme
    theme: Theme
    setTheme: (theme: Theme) => void
    resetTheme: () => void
    themePreset: ThemePreset
    setThemePreset: (preset: ThemePreset) => void
    resetThemePreset: () => void
}

const initialState: ThemeProviderState = {
    defaultTheme: DEFAULT_THEME,
    resolvedTheme: 'light',
    theme: DEFAULT_THEME,
    setTheme: () => null,
    resetTheme: () => null,
    themePreset: DEFAULT_THEME_PRESET,
    setThemePreset: () => null,
    resetThemePreset: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = DEFAULT_THEME,
    storageKey = THEME_COOKIE_NAME,
    ...props
}: ThemeProviderProps) {
    const [theme, _setTheme] = useState<Theme>(
        () => (getCookie(storageKey) as Theme) || defaultTheme
    )
    const [themePreset, _setThemePreset] = useState<ThemePreset>(() => {
        const saved = getCookie(THEME_PRESET_COOKIE_NAME)
        return isThemePreset(saved) ? saved : DEFAULT_THEME_PRESET
    })

    // Optimized: Memoize the resolved theme calculation to prevent unnecessary re-computations
    const resolvedTheme = useMemo((): ResolvedTheme => {
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
        }
        return theme as ResolvedTheme
    }, [theme])

    useEffect(() => {
        const root = window.document.documentElement
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const applyTheme = (currentResolvedTheme: ResolvedTheme) => {
            root.classList.remove('light', 'dark') // Remove existing theme classes
            root.classList.add(currentResolvedTheme) // Add the new theme class
        }

        const handleChange = () => {
            if (theme === 'system') {
                const systemTheme = mediaQuery.matches ? 'dark' : 'light'
                applyTheme(systemTheme)
            }
        }

        applyTheme(resolvedTheme)

        const rootPreset = window.document.documentElement
        if (themePreset === BASE_THEME_PRESET) {
            rootPreset.removeAttribute('data-theme-preset')
        } else {
            rootPreset.setAttribute('data-theme-preset', themePreset)
        }

        mediaQuery.addEventListener('change', handleChange)

        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme, resolvedTheme, themePreset])

    const setTheme = (theme: Theme) => {
        setCookie(storageKey, theme, THEME_COOKIE_MAX_AGE)
        _setTheme(theme)
    }

    const resetTheme = () => {
        removeCookie(storageKey)
        _setTheme(DEFAULT_THEME)
    }

    const setThemePreset = (preset: ThemePreset) => {
        // Simpan cookie hanya saat bukan default, supaya default selalu ikut rilis terbaru.
        if (preset === DEFAULT_THEME_PRESET) {
            removeCookie(THEME_PRESET_COOKIE_NAME)
        } else {
            setCookie(THEME_PRESET_COOKIE_NAME, preset, THEME_COOKIE_MAX_AGE)
        }
        _setThemePreset(preset)
    }

    const resetThemePreset = () => {
        removeCookie(THEME_PRESET_COOKIE_NAME)
        _setThemePreset(DEFAULT_THEME_PRESET)
    }

    const contextValue = {
        defaultTheme,
        resolvedTheme,
        resetTheme,
        theme,
        setTheme,
        themePreset,
        setThemePreset,
        resetThemePreset,
    }

    return (
        <ThemeContext value={contextValue} {...props}>
            {children}
        </ThemeContext>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext)

    if (!context) throw new Error('useTheme must be used within a ThemeProvider')

    return context
}
