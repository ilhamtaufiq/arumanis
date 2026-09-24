import { createContext, useContext, useEffect, useState } from 'react'
import { getCookie, setCookie } from '@/lib/cookies'

export type Collapsible = 'offcanvas' | 'icon' | 'none'
export type Variant = 'inset' | 'sidebar' | 'floating'

/** Dashboard-v2 foundation: page width + navbar behavior, mirrors temp-apps layout prefs. */
export type ContentLayout = 'centered' | 'full-width'
export type NavbarStyle = 'sticky' | 'scroll'

// Cookie constants following the pattern from sidebar.tsx
const LAYOUT_COLLAPSIBLE_COOKIE_NAME = 'layout_collapsible'
const LAYOUT_VARIANT_COOKIE_NAME = 'layout_variant'
const LAYOUT_CONTENT_COOKIE_NAME = 'layout_content'
const LAYOUT_NAVBAR_COOKIE_NAME = 'layout_navbar'
const LAYOUT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// Default values
const DEFAULT_VARIANT = 'inset'
const DEFAULT_COLLAPSIBLE = 'icon'
const DEFAULT_CONTENT_LAYOUT: ContentLayout = 'full-width'
const DEFAULT_NAVBAR_STYLE: NavbarStyle = 'sticky'

type LayoutContextType = {
    resetLayout: () => void

    defaultCollapsible: Collapsible
    collapsible: Collapsible
    setCollapsible: (collapsible: Collapsible) => void

    defaultVariant: Variant
    variant: Variant
    setVariant: (variant: Variant) => void

    defaultContentLayout: ContentLayout
    contentLayout: ContentLayout
    setContentLayout: (layout: ContentLayout) => void

    defaultNavbarStyle: NavbarStyle
    navbarStyle: NavbarStyle
    setNavbarStyle: (style: NavbarStyle) => void
}

const LayoutContext = createContext<LayoutContextType | null>(null)

type LayoutProviderProps = {
    children: React.ReactNode
}

export function LayoutProvider({ children }: LayoutProviderProps) {
    const [collapsible, _setCollapsible] = useState<Collapsible>(() => {
        const saved = getCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME)
        return (saved as Collapsible) || DEFAULT_COLLAPSIBLE
    })

    const [variant, _setVariant] = useState<Variant>(() => {
        const saved = getCookie(LAYOUT_VARIANT_COOKIE_NAME)
        return (saved as Variant) || DEFAULT_VARIANT
    })

    const [contentLayout, _setContentLayout] = useState<ContentLayout>(() => {
        const saved = getCookie(LAYOUT_CONTENT_COOKIE_NAME)
        return saved === 'centered' || saved === 'full-width' ? saved : DEFAULT_CONTENT_LAYOUT
    })

    const [navbarStyle, _setNavbarStyle] = useState<NavbarStyle>(() => {
        const saved = getCookie(LAYOUT_NAVBAR_COOKIE_NAME)
        return saved === 'sticky' || saved === 'scroll' ? saved : DEFAULT_NAVBAR_STYLE
    })

    useEffect(() => {
        const root = window.document.documentElement
        root.setAttribute('data-content-layout', contentLayout)
        root.setAttribute('data-navbar-style', navbarStyle)
    }, [contentLayout, navbarStyle])

    const setCollapsible = (newCollapsible: Collapsible) => {
        _setCollapsible(newCollapsible)
        setCookie(
            LAYOUT_COLLAPSIBLE_COOKIE_NAME,
            newCollapsible,
            LAYOUT_COOKIE_MAX_AGE
        )
    }

    const setVariant = (newVariant: Variant) => {
        _setVariant(newVariant)
        setCookie(LAYOUT_VARIANT_COOKIE_NAME, newVariant, LAYOUT_COOKIE_MAX_AGE)
    }

    const setContentLayout = (newLayout: ContentLayout) => {
        _setContentLayout(newLayout)
        setCookie(LAYOUT_CONTENT_COOKIE_NAME, newLayout, LAYOUT_COOKIE_MAX_AGE)
    }

    const setNavbarStyle = (newStyle: NavbarStyle) => {
        _setNavbarStyle(newStyle)
        setCookie(LAYOUT_NAVBAR_COOKIE_NAME, newStyle, LAYOUT_COOKIE_MAX_AGE)
    }

    const resetLayout = () => {
        setCollapsible(DEFAULT_COLLAPSIBLE)
        setVariant(DEFAULT_VARIANT)
        setContentLayout(DEFAULT_CONTENT_LAYOUT)
        setNavbarStyle(DEFAULT_NAVBAR_STYLE)
    }

    const contextValue: LayoutContextType = {
        resetLayout,
        defaultCollapsible: DEFAULT_COLLAPSIBLE,
        collapsible,
        setCollapsible,
        defaultVariant: DEFAULT_VARIANT,
        variant,
        setVariant,
        defaultContentLayout: DEFAULT_CONTENT_LAYOUT,
        contentLayout,
        setContentLayout,
        defaultNavbarStyle: DEFAULT_NAVBAR_STYLE,
        navbarStyle,
        setNavbarStyle,
    }

    return <LayoutContext value={contextValue}>{children}</LayoutContext>
}

// Define the hook for the provider
// eslint-disable-next-line react-refresh/only-export-components
export function useLayout() {
    const context = useContext(LayoutContext)
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider')
    }
    return context
}
