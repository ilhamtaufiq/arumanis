const PUBLIC_MARKETING_ROUTE_PREFIXES = [
  '/publikasi',
  '/terms',
  '/privacy-policy',
  '/changelog',
  '/tujuan-manfaat-hasil',
  '/rancang-bangun-inovasi',
  '/capaian-spm',
] as const

export function isPublicMarketingRoute(pathname: string) {
  if (pathname === '/') return true

  return PUBLIC_MARKETING_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function shouldDeferAppSettings(pathname: string) {
  return pathname.startsWith('/puspen') || isPublicMarketingRoute(pathname)
}