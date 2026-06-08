# CONTINUITY.md

## Goal
Optimize Ami AI Dashboard Analytics and simplify Pekerjaan Progress reporting by replacing complex grid libraries with intuitive, native UI components.

## Constraints/Assumptions
- Framework: Next.js (frontend) + Laravel (backend) + Python (LangChain AI logic).
- Read-only data safety policy.
- ChromaDB storage at `storage/ai`.

## Key Decisions
- Integrated `recharts` for dynamic JSON-to-Chart rendering in `LoungeChat` and `ChatPage`.
- Implemented a PHP-Python bridge for LangChain reasoning.
- Enhanced system prompt for strict table formatting and deep-linking.
- Added model name display and error status (red color) indicators.
- Refactored `RabAnalyzer.tsx` to remove Handsontable dependency.

## State
- **Done**:
    - Integrated React Bits components (`Grainient`, `SplitText`, `ShinyText`) into the landing page for premium visual effects.
    - Automated Chart rendering in Dashboard & Chat Page.
    - Premium animations (fade-in, slide-in, bouncing dots).
    - Model info display in UI.
    - Error state handling (Red indicator).
    - Dynamic ticket links in AI responses.
    - Refactored `ProgressTabContent.tsx` to remove Handsontable and replace it with a native Shadcn-based input system.
    - Extracted PDF generation logic to `pdf-generator.ts` utility.
    - Added "Banner Notification" option to Broadcast Notification feature (backend & frontend).
    - Implemented popup banner logic on Dashboard for unread banner notifications.
    - Added "Manajemen Blog" to sidebar navigation.
    - Fully implemented Blog Management (CRUD, Slug routing, Featured UI, Backend API).
    - Refactored `RabAnalyzer.tsx` to use native Shadcn Table (Removed Handsontable).
    - Standardized typography (Google Sans/Open Sans), dynamic branding (Logo/AppName/Description), and integrated ThemeToggle in Publikasi module. Implemented Internal Post feature with guest access control and management UI.
    - Resolved `route-permissions` update failure: fixed standard `ApiError` mapping in `RoutePermissionForm.tsx` to print descriptive backend error messages, and assigned the missing Spatie `admin` role to `admin@apiamis.test` to permit update API requests.
    - Upgraded `RoutePermissionList.tsx` bulk manager with background auto-save flow. Checkboxes instantly trigger REST calls in the background with auto-revert fallbacks on errors and clean user status toasts, eliminating redundant bulk network loops.
    - Cleaned up unused features: deleted the `SpamTerbangunRawPage`, `SpmAirMinumPage`, and `SpamKelembagaanPage` components, their feature directories, routes, and sidebar navigation items in the frontend (`bun`).
    - Cleaned up unused backend features: deleted all models, controllers, commands, resources, services, migrations, and routes for `SpamTerbangunRaw`, `SpmAirMinum`, and `SpamKelembagaanRaw` in the backend (`apiamis`).
    - Implemented normalized SPAM & Capaian SPM feature in both frontend (`bun`) and backend (`apiamis`), including creation of `tbl_unit_spam`, `tbl_pengelola`, `tbl_unit_checklists`, and `tbl_spam_achievements` tables.
    - Created and executed a console consolidation script (`php artisan spam:consolidate`) to match existing districts and villages case-insensitively, populate target fields, and migrate all SQLite records to MySQL.
    - Built a premium dashboard and management UI in the frontend (`/spam-unit`).
    - Implemented cache-busting timestamp parameters and configured staleTime: 0 for all stats/units query hooks to bypass local IndexedDB persistent cache.
    - Updated dashboard statistics to premium 5-card layout displaying exact KK JP / BJP counts, contribution percentages, and target Goal Akhir coverage.
    - Fixed blank dropdown options in the Kecamatan and Desa filters/modals by fallback-mapping properties to handle both API Resource response fields (`nama_kecamatan`, `nama_desa`) and raw database columns (`n_kec`, `n_desa`).
    - Aligned SPAM Unit & SPM page layout exactly with the standard admin page styles (Pekerjaan, Kecamatan, Desa) by adopting standard design system components (Card, Table, Button) and resolving layout double padding.
    - Replaced all raw HTML `<select>` filter dropdowns with standard Shadcn `<Select>` UI components matching other pages, and added a "Tahun Capaian" history achievement filter linked to the index/stats endpoints.
    - Separated Kecamatan and Desa into separate distinct table columns in the main table layout on the SPAM & Capaian SPM page.
    - Added input fields for detailed technical and financial attributes (`iuran_nominal`, `tarif_dasar_hukum`, `biaya_operasional`, `biaya_pembangunan`) to the SPAM Unit form.
    - Implemented an interactive year-by-year achievement form within the Histori Achievements tab of the Detail Drawer, allowing inline additions and updates to achievements with reactive page state updates and automatic data pre-filling for selected years.
    - Handled Vite chunk load errors for lazy imported components (`ProgressTabContent`, etc.) by implementing a `lazyImport` wrapper with an auto-reload retry mechanism in `utils.ts`.
- **Now**:
    - Completed full-stack synchronization, added financial cost fields, separate geography columns, and achievement builder.
- **Next**:
    - Ready.

## Open Questions
- None.

## Working Set
- `c:/laragon/www/bun/src/features/spam-unit/components/SpamUnitPage.tsx`
- `c:/laragon/www/bun/src/features/spam-unit/api/index.ts`
- `c:/laragon\www\bun\CONTINUITY.md`

