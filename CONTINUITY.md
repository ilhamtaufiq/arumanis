# Continuity Ledger

## Goal
- Provide a global search interface mimicking Google Search Engine functionality.
- Allow users to search across multiple models (Pekerjaan, Kontrak, Penyedia, Kegiatan, Desa).
- Implement AI Chat (ChatGPT-like) feature using MiniMax AI with database awareness (RAG).

## Constraints/Assumptions
- The search page is standalone and intentionally bypasses the `AuthenticatedLayout` (sidebar/header) for a clean UI experience.
- Authentication checks are still performed via `beforeLoad` in `c:\laragon\www\bun\src\routes\search.tsx`.

## Key decisions
- Introduced `useDebounce` hook to limit API calls while typing.
- Connected the `SearchController` on the Laravel backend via `api.php`.
- Repurposed the Topbar Search button and `Cmd+K` shortcut to navigate directly to the `/search` page instead of opening the local `CommandMenu`.
- Customized the "AmiSearch" logo with exact Google branding colors (`#4285F4`, `#EA4335`, etc.).

## State
### Done
- Created `/api/search` route and wired up `SearchController` on Backend.
- Created `use-debounce` hook.
- Updated `SearchProvider` (`Cmd+K`) and Topbar `Search` component to navigate to `/search`.
- Built standalone `GoogleSearchPage` without the main layout, rendering a full-page Google-like UI.
- Enhanced RAB Analyzer to support "RAB MCK" Excel format through backend core updates.

### Now:
- Completed the UI for the standalone search page.
- Implementing AI Chat backend (MiniMaxService, ChatController) and frontend.
- Enhanced Chat AI with relational data awareness (eager loading kecamatan, desa, kontrak, penyedia).

### Next
- Complete AI Chat frontend implementation in `src/features/chat`.
- Verify MiniMax API connectivity and RAG relational accuracy.
- Verify with user if the standalone Search UI design meets their aesthetic requirement.

## Open questions (UNCONFIRMED)
- None.

## Working set
- `src/features/search/components/GoogleSearchPage.tsx`
- `src/routes/search.tsx`
- `src/context/search-provider.tsx`
- `routes/api.php`
