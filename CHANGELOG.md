# Changelog

All notable changes to the ARUMANIS frontend project will be documented in this file.

## [2025-12-27]

### Added
- **Assign Pekerjaan Enhancements**:
  - Year filter integration using global `tahunAnggaran` from header
  - Grouped assignment table by user with summary (count & total pagu)
  - Search functionality for filtering assignments by user or pekerjaan
  - Pagination for grouped assignments (5 users per page)
  - Limited pekerjaan list to 10 items with server-side search (debounced)

### Improved
- **Performance Optimizations**:
  - Lazy load `FotoTabContent` and `BeritaAcaraTabContent` in `PekerjaanDetail`
  - Increased global `staleTime` from 10s to 5 minutes for better API caching
  - Added `loading="lazy"` to images in `FotoTabContent`

## [2025-12-26]

### Added
- **Excel Import Feature**: Added `ImportPekerjaanDialog` to allow users to upload Excel files and download templates.
- **Detailed Import Error Reporting**: Enhanced the import dialog to display specific validation errors returned by the backend (e.g., "Baris 5: Nama paket wajib diisi").
- **User Impersonation**: Added ability for admins to impersonate other users with a global sticky banner indicator.
- **Notification System**: Implemented a comprehensive Notification Center feature, including a notification bell in the navbar and a dedicated history page.
- **Authentication Store**: Implemented a new Zustand-based authentication store with user, token, and impersonation management, including cookie persistence.
- **Supervisor Dashboard**: Introduced a specialized dashboard for supervisors to track assigned jobs and manage field tickets.
- **Shadcn Calendar Refactor**: Replaced TUI Calendar with a custom, native implementation using Shadcn UI.
  - Custom grid-based Month, Week, and Day views.
  - Integrated `EventDialog` for native event creation and management.
- **Header Redesign**: Consolidated header controls and restricted search/fiscal year editing to admins.
- **Docker Optimizations**: Optimized Dockerfiles for better build performance and smaller image sizes.

## [2025-12-25]

### Added
- **Ticket Management**: Implemented a comprehensive ticketing system for reporting issues and tracking resolutions in the field.
- **Testing Framework**: Integrated Vitest for unit and component testing.
- **UI Components**: Added `Alert` component and improved `Select` component with async search capabilities.
- **Dashboard Enhancements**: Added statistics charts for administrative overview.

### Fixed
- **Improved Notification Polling**: Reduced polling interval from 60s to 15s for a more "real-time" feel.
- **Role-Based Access Control**: Restricted sensitive `Pekerjaan` management actions (Add, Edit, Delete, Import) to admin-only roles in the `PekerjaanList`.
- **Notification Badge Accuracy**: Fixed an issue where the notification badge count was not updating correctly after reading notifications.
- **Notification List UI**: Improved the layout and styling of the notification center to be more consistent with the rest of the app.
- **Edit Pekerjaan Routing**: Restructured the route folder from `$id.tsx` to `$id/index.tsx` to resolve the issue where clicking "Edit" was redirected to the Detail page.
- **PekerjaanForm Data Population**: Refactored `PekerjaanForm.tsx` to ensure `Kecamatan`, `Desa`, and `Kegiatan` are correctly loaded and selected when editing.
- **Select Component Loading States**: Added visual indicators for asynchronous data loading in select dropdowns.
- **API Client Blob Support**: Updated `api-client.ts` to support `blob` response types for file downloads.

### Removed
- **EditPekerjaanDialog**: Removed the experimental modal-based edit flow in favor of the full-page form for better UX and consistency.
