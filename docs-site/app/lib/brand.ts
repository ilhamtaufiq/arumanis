/**
 * Brand tokens aligned with Arumanis app defaults:
 * - logo fallback: /arumanis.svg
 * - brand_primary_color setting default: #674bb5
 * - landing/logo palette: purple, pink, yellow
 * - auth neo-brutal accents: #FB8500, #8ECAE6, #111111
 */
export const brand = {
  appName: 'Arumanis',
  appNameFull: 'Arumanis — Portal Air Minum & Sanitasi Kabupaten Cianjur',
  docsTitle: 'Arumanis Docs',
  description:
    'Panduan pengguna Arumanis: sistem informasi air minum dan sanitasi Kabupaten Cianjur — pekerjaan, SPSE, OnlyOffice, panel pengawas, dan Puspen.',
  siteUrl: 'https://arumanis.cianjur.space',
  docsUrl: 'https://arumanis.cianjur.space/docs',
  /** Default from app settings `brand_primary_color` */
  primary: '#674bb5',
  primaryDark: '#523a8f',
  primarySoft: '#9575cd',
  /** From logo / landing accents */
  yellow: '#ffde59',
  pink: '#f9bbd1',
  pinkHot: '#f58fb1',
  sky: '#8ECAE6',
  orange: '#FB8500',
  ink: '#111111',
  inkMuted: '#292827',
  cream: '#FFF7E8',
  /**
   * Logo/favicon: same absolute paths as main app (`public/arumanis.svg`).
   * Works on arumanis host; docs-site also ships a copy under public/.
   */
  logoPath: '/arumanis.svg',
  logoPublicPath: '/arumanis.svg',
  faviconSvg: '/arumanis.svg',
  ogImage: 'https://arumanis.cianjur.space/arumanis.svg',
} as const;

export function docsPageTitle(page?: string) {
  if (!page) return `${brand.docsTitle} | ${brand.appName}`;
  return `${page} | ${brand.docsTitle}`;
}
