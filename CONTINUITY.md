# Continuity Ledger - ARUMANIS

## Goal (incl. success criteria)
Optimize PageSpeed for arumanis.ilham.wtf based on PageSpeed Insights waterfall analysis. Success criteria: LCP initiated from HTML (not JS), non-blocking fonts, lazy-loaded heavy bundles.

## Constraints/Assumptions
- Standard React 19 + Vite 7 architecture with Bun
- Shadcn UI for components
- TanStack Router for routing
- Heavy libraries: Handsontable (~1.7MB), Leaflet (~150KB), jsPDF/XLSX (~855KB)

## Key decisions
- Preload LCP image (`arumanis.svg`) directly from `index.html`
- Convert Google Fonts to non-blocking loading pattern (`media="print" onload`)
- Add API preconnect to reduce connection setup time
- Lazy load `ProgressTabContent` (contains Handsontable, jsPDF, XLSX)
- Lazy load `MapPage` route (contains Leaflet)
- Keep `recharts` in main bundle since Dashboard is primary admin page

## State
### Done
- LCP image preload with `fetchpriority="high"`
- Non-blocking Google Fonts loading
- API preconnect (`apiamis.ilham.wtf`)
- Image priority attributes on LCP image
- Lazy loading for ProgressTabContent (~2.5MB total deferred)
- Lazy loading for MapPage route (~150KB deferred)
- Build verification passed (31-33s)

### Now
PageSpeed optimization complete. Awaiting deployment and re-testing.

### Next
- Deploy to production
- Re-run PageSpeed Insights to verify improvements
- (Optional) Server-side optimizations for TTFB

## Open questions
None

## Working set
- `c:\laragon\www\bun\index.html` - LCP preload, fonts optimization
- `c:\laragon\www\bun\src\features\auth\auth-layout.tsx` - LCP image attributes
- `c:\laragon\www\bun\src\features\pekerjaan\components\PekerjaanDetail.tsx` - Lazy load Progress
- `c:\laragon\www\bun\src\features\pekerjaan\components\ProgressFullscreen.tsx` - Lazy load Progress
- `c:\laragon\www\bun\src\routes\_authenticated\map\index.tsx` - Lazy load Map
