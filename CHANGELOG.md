# Changelog

All notable changes to the ARUMANIS frontend project will be documented in this file.

## [2025-12-26]

### Added
- **Excel Import Feature**: Added `ImportPekerjaanDialog` to allow users to upload Excel files and download templates.
- **Detailed Import Error Reporting**: Enhanced the import dialog to display specific validation errors returned by the backend (e.g., "Baris 5: Nama paket wajib diisi").

### Fixed
- **Edit Pekerjaan Routing**: Restructured the route folder from `$id.tsx` to `$id/index.tsx` to resolve the issue where clicking "Edit" was redirected to the Detail page.
- **PekerjaanForm Data Population**: Refactored `PekerjaanForm.tsx` to ensure `Kecamatan`, `Desa`, and `Kegiatan` are correctly loaded and selected when editing.
- **Select Component Loading States**: Added visual indicators for asynchronous data loading in select dropdowns.
- **API Client Blob Support**: Updated `api-client.ts` to support `blob` response types for file downloads.

### Removed
- **EditPekerjaanDialog**: Removed the experimental modal-based edit flow in favor of the full-page form for better UX and consistency.
