# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.4-beta] - 2025-12-25

### Changed
- **Documentation Migration**: Moved public documentation from React components to **Docsify**.
- **Public Documentation Path**: Documentation is now hosted at `/docs/` using a standard, easily maintainable Markdown-based system.
- **Improved Performance**: Documentation is now served as static files, reducing the main application bundle size.

## [0.1.3-beta] - 2025-12-25

### Added
- **Google OAuth Integration**: Users can now sign in using their Google accounts.
- **Admin Role Management**: Added missing route for adding new roles (`/roles/new`) and editing permissions (`/permissions/$id/edit`).
- **Resilient Role Assignment**: Backend now safely handles role assignment during OAuth, preventing crashes if the default role is missing.

### Fixed
- **OAuth Callback Infinite Loop**: Resolved a critical React error #185 caused by an infinite update loop in the OAuth callback page.
- **GitHub Standard Changelog**: Restructured `CHANGELOG.md` to follow industry standards for better readability and integration.
- **OAuth Data Unwrapping**: Fixed "hello undefined" issue by implementing robust data unwrapping and disabling standard Laravel API Resource wrapping for user data.
- **Profile Data Persistence**: Added `avatar` field to user session and sidebar to correctly show Google profile pictures.
- **OAuth Redirection**: Fixed incorrect `.test` redirects in production by correcting `FRONTEND_URL` fallback and `redirect_uri` configuration.

## [0.1.2-beta] - 2025-12-25

### Added
- **Persistent Breadcrumbs**: Automated dynamic breadcrumb system integrated into the global Header.
- **Fluid Full-Width Layout**: Application now utilizes 100% of screen width, optimized for ultra-wide monitors.

### Changed
- **PageContainer Refactor**: Standardized page container to use global breadcrumbs and removed internal width constraints.
- **Form Layouts**: Updated all feature forms (Desa, Kecamatan, Pekerjaan, etc.) to expand to full width.

## [0.1.1-beta] - 2025-12-25

### Added
- **Ticket System**: Complete reporting and review system for Pengawas and Admin.
- **Dual Assignment System**: Support for both manual and role-based work assignments.
- **Unified CRUD Forms**: Inline editing for Output, Penerima, and Berkas tabs with auto-scroll features.

### Fixed
- **Search Context**: Resolved `SearchProvider` context errors.
- **CORS Policy**: Support for multiple origins (local & production).

## [0.1.0-beta] - 2025-12-24

### Added
- **Initial Beta Release**: Core functionality for Air Minum and Sanitasi management.
- **S-Curve Visualization**: Dynamic progress tracking and reporting.

[0.1.3-beta]: https://github.com/ilhamtaufiq/arumanis/compare/v0.1.2-beta...v0.1.3-beta
[0.1.2-beta]: https://github.com/ilhamtaufiq/arumanis/compare/v0.1.1-beta...v0.1.2-beta
[0.1.1-beta]: https://github.com/ilhamtaufiq/arumanis/compare/v0.1.0-beta...v0.1.1-beta
