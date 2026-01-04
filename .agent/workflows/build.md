---
description: Build the Arumanis project for production
---

# Build for Production

// turbo-all

## Build Command

```bash
bun run build
```

This will:
1. Run TypeScript compiler (`tsc -b`)
2. Build with Vite to `dist/` directory

## Preview Production Build

```bash
bun run preview
```

## Build Output

The production build will be in `dist/` directory with:
- Optimized and minified JavaScript/CSS
- Code splitting with manual chunks:
  - `vendor-react` - React core
  - `vendor-tanstack` - TanStack Router & Query
  - `vendor-radix` - Radix UI components
  - `vendor-handsontable` - Spreadsheet library
  - `vendor-pdf` - PDF generation
  - `vendor-xlsx` - Excel export
  - `vendor-charts` - Recharts
  - `vendor-maps` - Leaflet maps

## Deployment

The `dist/` folder can be deployed to:
- Static hosting (Netlify, Vercel, Cloudflare Pages)
- Nginx
- Apache (`.htaccess` included)
- Docker (Dockerfile included)

## Docker Build

```bash
docker build -t arumanis .
docker run -p 80:80 arumanis
```

## Notes

- Make sure environment variables are set correctly for production
- Update `VITE_API_BASE_URL` to production API endpoint
