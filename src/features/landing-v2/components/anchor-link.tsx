import type { AnchorHTMLAttributes, MouseEvent } from 'react'

type AnchorLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
}

/**
 * In-page anchor that scrolls smoothly without triggering a router
 * navigation (which would re-run loaders and flash a blank page).
 */
export function AnchorLink({ href, onClick, ...rest }: AnchorLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth'
      if (href.length > 1) {
        document
          .querySelector(href)
          ?.scrollIntoView({ behavior, block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior })
      }
    }
    onClick?.(e)
  }

  return <a href={href} onClick={handleClick} {...rest} />
}
