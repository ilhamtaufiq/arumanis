import { useEffect, useState } from "react"

/**
 * Custom hook to detect if the current device is mobile based on screen width
 * @param breakpoint - The width threshold in pixels (default: 768px)
 * @returns boolean - true if the screen width is less than the breakpoint
 */
export function useIsMobile(breakpoint: number = 768): boolean {
    const [isMobile, setIsMobile] = useState<boolean>(false)

    useEffect(() => {
        // Check if window is defined (for SSR compatibility)
        if (typeof window === "undefined") return

        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < breakpoint)
        }

        // Check on mount
        checkIsMobile()

        // Add event listener for window resize
        window.addEventListener("resize", checkIsMobile)

        // Cleanup
        return () => window.removeEventListener("resize", checkIsMobile)
    }, [breakpoint])

    return isMobile
}
