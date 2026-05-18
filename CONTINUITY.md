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
    - Fixed the inline "Pendamping" dropdown saving issue in `PekerjaanList.tsx` by correcting the incorrect field binding from `pengawas_id2` to `pendamping_id`.
- **Now**:
    - Finalizing author attribution refinements and post filtering by author.
- **Next**:
    - Expand knowledge base indexing.
    - Refine anomaly detection accuracy.

## Open Questions
- None currently.

## Working Set
- `c:/laragon/www/bun/src/features/pekerjaan/components/PekerjaanList.tsx`
- `c:/laragon/www/bun/src/features/blog/components/BlogList.tsx`
- `c:/laragon/www/bun/src/features/blog/components/BlogCard.tsx`
- `c:/laragon/www/bun/src/features/blog/api/index.ts`
- `c:/laragon/www/apiamis/app/Http/Controllers/BlogController.php`
- `c:/laragon/www/bun/src/features/rab-analyzer/components/RabAnalyzer.tsx`
