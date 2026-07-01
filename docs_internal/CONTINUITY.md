# CONTINUITY.md

## Goal
Ship P2 quality improvements for Arumanis frontend: TanStack Query in embedded forms, TypeScript cleanup in pekerjaan/progress hotspots, and authenticated E2E coverage.

## Constraints/Assumptions
- Framework: **Vite + React 19 SPA** (frontend) → **BFF** (`server/`) → **Laravel APIAMIS** (backend).
- Auth: session cookie httpOnly via BFF — no tokens in localStorage.
- E2E authenticated tests mock `/bff/auth/me` + read-only API stubs — no live backend required in CI.

## Key Decisions
- `EmbeddedFotoForm` uses `useOutputList` / `usePenerimaList` instead of manual `useEffect` fetch.
- `EmbeddedBerkasForm` uses `useCreateBerkas` / `useUpdateBerkas` + `useMutation` for URL upload.
- `pdf-generator.ts` typed with `ProgressReportData` / `ProgressItemData` and local PDF table cell types.
- Playwright auth helper (`e2e/helpers/mock-api.ts`) stubs session + common GET endpoints.

## State
- **Done (P1)**:
    - Executive dashboard, pengawas resilient upload, route audit script, public E2E smoke, `KontrakList` cleanup.
- **Done (P2)**:
    - TanStack Query migration: `EmbeddedFotoForm`, `EmbeddedBerkasForm`.
    - `any` cleanup: `pdf-generator.ts`, `FotoTabContent.tsx`, `PekerjaanList.tsx`.
    - Authenticated E2E: redirect guard, dashboard lounge, executive-dashboard forbidden.
- **Next (P3 backlog)**:
    - Remaining embedded forms (`EmbeddedOutputForm`, `EmbeddedPenerimaForm`) if still manual fetch.
    - TanStack Query for chat, publikasi editor, admin forms.
    - E2E with real BFF session fixture against staging.

## Open Questions
- None blocking P2.

## Working Set
- `src/features/pekerjaan/components/EmbeddedFotoForm.tsx`
- `src/features/pekerjaan/components/EmbeddedBerkasForm.tsx`
- `src/features/progress/utils/pdf-generator.ts`
- `e2e/authenticated.spec.ts`
- `e2e/helpers/mock-api.ts`