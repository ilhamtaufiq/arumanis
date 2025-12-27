# Changelog

# 0.3.0 (2025-12-27)


### Bug Fixes

* Delete bun.lock before bun install to prevent integrity issues. ([52dbb47](https://github.com/ilhamtaufiq/arumanis/commit/52dbb473298fef942e6c5a479d4ee6a2638400bf))


### Features

* Add .htaccess to configure URL rewriting to index.html for client-side routing. ([13f8f17](https://github.com/ilhamtaufiq/arumanis/commit/13f8f173fa1ad9fa043520e1278110fafffe76d8))
* Add `.htaccess` to enable URL rewriting to `index.html` for single-page application routing. ([27e59bd](https://github.com/ilhamtaufiq/arumanis/commit/27e59bd72142bee93b90f9d4e348a0742fbe0eff))
* Add `FotoTabContent` component and integrate `html2canvas` and `jspdf` for photo export functionality. ([71c762a](https://github.com/ilhamtaufiq/arumanis/commit/71c762a9bc174ef2ea51ca19603505604b29062f))
* add `ProgressTabContent` component for interactive progress report management with spreadsheet functionality and data export. ([0d0e12b](https://github.com/ilhamtaufiq/arumanis/commit/0d0e12baa8208054c685c407a2eee85356f0718a))
* Add `ProgressTabContent` component for managing pekerjaan progress reports using Handsontable and HyperFormula. ([99ab81f](https://github.com/ilhamtaufiq/arumanis/commit/99ab81f0aa40e172598f7cfd2bb59bf48d662a4d))
* Add application sidebar, user navigation dropdown, and base CSS styling. ([e54c7cf](https://github.com/ilhamtaufiq/arumanis/commit/e54c7cfa33e0d059cb5e3d0f602d05fd92db2003))
* add Axios API client with base URL configuration and auth token interceptor ([e37cefc](https://github.com/ilhamtaufiq/arumanis/commit/e37cefc5b54fcf522d4bb88121e0c6d2e5a33c30))
* add changelog entries for Assign Pekerjaan enhancements and performance optimizations ([f5fcbd3](https://github.com/ilhamtaufiq/arumanis/commit/f5fcbd3c1455f524105d5fb5445639afeb34a26c))
* Add client-side route permission system with `ProtectedRoute` component, dynamic access rules, and comprehensive documentation. ([7dadd3e](https://github.com/ilhamtaufiq/arumanis/commit/7dadd3ee37fded0df61aafa36765e3c6ca790c35))
* add core application features, UI components, and API integrations for various modules including authentication, documents, contracts, jobs, and photos ([ea0765a](https://github.com/ilhamtaufiq/arumanis/commit/ea0765a96f6385f4870c156155b2461d32203260))
* Add core modules for roles, contracts, jobs, users, and permissions, including dynamic sidebar navigation and protected routes. ([a2e257a](https://github.com/ilhamtaufiq/arumanis/commit/a2e257a60a51a57fa817fd1a7670ba737229d709))
* Add DesaForm component for creating and editing village data. ([d6830cd](https://github.com/ilhamtaufiq/arumanis/commit/d6830cd68c2b63e39714598f3c7df5c07238c797))
* Add Docker configuration for Bun frontend application with Nginx. ([12449ae](https://github.com/ilhamtaufiq/arumanis/commit/12449aecdde6d923f4027766e4a10182bdcb0347))
* add Dockerization with Nginx configuration and update production API base URL. ([3750b9d](https://github.com/ilhamtaufiq/arumanis/commit/3750b9d47ce3aa1f2ebfc32b008464e1d5c7e9af))
* Add Dockerization with Nginx, update API base URL, and adjust Nixpacks serve port. ([ebaea10](https://github.com/ilhamtaufiq/arumanis/commit/ebaea10cce47211525479692985833a6b6fcbc0f))
* add embedded form component for creating and updating job photos with associated details and geolocation. ([8a856cb](https://github.com/ilhamtaufiq/arumanis/commit/8a856cb50c9eceede2e48f76373fd0d627e95de5))
* Add embedded forms and tab content for Berkas, Penerima, Output, create Pengawas Dashboard, and implement search context. ([81eca48](https://github.com/ilhamtaufiq/arumanis/commit/81eca48d7d90dbd9d157cf42897ef07999f7df22))
* Add forms and API services for document, photo, output, recipient, and contract management, including a new searchable select UI component. ([28b7945](https://github.com/ilhamtaufiq/arumanis/commit/28b79452a8ead476565b1d83cc3074e6d587c0d7))
* Add global theming CSS with dark mode, Handsontable dark styles, and a `FotoTabContent` component for managing job-related photos. ([2da4e8e](https://github.com/ilhamtaufiq/arumanis/commit/2da4e8e024bbed7f74803d8998dc55aa0d819b89))
* Add initial API clients, components, and routing for multiple modules, including comprehensive progress reporting. ([00507ab](https://github.com/ilhamtaufiq/arumanis/commit/00507ab6e7a755adb61cdc7f5bc92085fe48e16c))
* Add initial Docsify documentation for the Pengawas Lapangan role. ([0e64845](https://github.com/ilhamtaufiq/arumanis/commit/0e64845802d020d03f0d18aab0c69f7146df63b9))
* add interactive progress report table component using Handsontable, HyperFormula, and data management for project progress tracking and export. ([c0d4d34](https://github.com/ilhamtaufiq/arumanis/commit/c0d4d34530953ac8eb8a633c26c305b95af6f7af))
* Add new routes for editing permissions and creating roles, restricted to admin users. ([0e8cfd9](https://github.com/ilhamtaufiq/arumanis/commit/0e8cfd9afc3fc61f6486a15bb1ee596a8176f233))
* add NotificationBell component for displaying and managing user notifications. ([f6eff96](https://github.com/ilhamtaufiq/arumanis/commit/f6eff96863cc7ec07521f5c1522886d1621ddb7e))
* add OAuth callback route to handle authentication and user redirection ([3b667cd](https://github.com/ilhamtaufiq/arumanis/commit/3b667cd05bfa0854577d5333ef89a1cb46ee4344))
* Add OAuth callback route to handle external authentication responses and define related authentication types. ([eca291a](https://github.com/ilhamtaufiq/arumanis/commit/eca291a8b3af72fbe66e8e5f432787bbf4c3356a))
* Add Pekerjaan detail page, map page, and authentication layout with routing and dependency updates. ([d3c058b](https://github.com/ilhamtaufiq/arumanis/commit/d3c058ba7210a837203594c3f2c26158154ad738))
* add Pekerjaan detail view, photo management with CRUD, filtering, and pagination, and assignment manager components. ([dab7a21](https://github.com/ilhamtaufiq/arumanis/commit/dab7a215fb0eac1e027b66cbb24a7a22249467ef))
* add photo types and a component to display and manage photos for a job. ([31a7fd9](https://github.com/ilhamtaufiq/arumanis/commit/31a7fd9efef7f243a189f02a066671b092a9cfd6))
* Add progress report management component with Handsontable, HyperFormula, PDF export, and charting capabilities. ([21d2265](https://github.com/ilhamtaufiq/arumanis/commit/21d22653c86d67b70ca9120b69a70f8d352969c2))
* Add progress report management component with spreadsheet editing, calculations, and export functionalities. ([ae11c46](https://github.com/ilhamtaufiq/arumanis/commit/ae11c4638bc3ddfcd5d5c0070e794a12bcac0950))
* add progress report tab content with Handsontable, HyperFormula, and export capabilities ([9888672](https://github.com/ilhamtaufiq/arumanis/commit/988867207cb49e0bf323010e6bf38ba489ae598a))
* add progress report tab content with interactive Handsontable, HyperFormula integration, data visualization, and export capabilities. ([143727f](https://github.com/ilhamtaufiq/arumanis/commit/143727f6c56fff6d0a824a2b57d108bed5461798))
* Add progress report types and a Handsontable-based UI component for managing progress data. ([4c31c95](https://github.com/ilhamtaufiq/arumanis/commit/4c31c9513f00af4ffea3269b9efd96ab48e51fad))
* add ProgressTabContent component for managing and displaying progress reports with Handsontable and HyperFormula. ([485565f](https://github.com/ilhamtaufiq/arumanis/commit/485565fc3234a120864b3e6f0ef9909cd69dde22))
* add sign-in page with authentication form and layout. ([ff5c699](https://github.com/ilhamtaufiq/arumanis/commit/ff5c6990ce9352b66b789929290b577da4ee7fb3))
* Add supervisor dashboard component to display assigned jobs and enable ticket management. ([88d0702](https://github.com/ilhamtaufiq/arumanis/commit/88d07020e9ed26f669a45a7882565225e6dc6699))
* Add ticket management, a comprehensive notification system with broadcast capabilities, and a job import dialog, complemented by new documentation. ([be00c50](https://github.com/ilhamtaufiq/arumanis/commit/be00c50f541a1354f5d8acbf5a8ab63df742c3cc))
* add user authentication form, update project dependencies, and refine TypeScript configurations ([012349d](https://github.com/ilhamtaufiq/arumanis/commit/012349d6898158e627e285dfcf0651aeca84de94))
* bump version to 0.2.0 ([be0a199](https://github.com/ilhamtaufiq/arumanis/commit/be0a199741b53a65ca0124344f697850d24a97b1))
* Enhance .htaccess with compression, caching, security headers, and HTTPS redirection for improved performance and security. ([cc85649](https://github.com/ilhamtaufiq/arumanis/commit/cc8564975d6e54565ee7e2791da2ba02146473dc))
* Establish initial application structure, authenticated routing, and core feature modules. ([81da879](https://github.com/ilhamtaufiq/arumanis/commit/81da87918f351d70fd70495e43ef2285dfd953fa))
* implement a new calendar view component with month, week, and day views, event management, and navigation. ([2c6cb36](https://github.com/ilhamtaufiq/arumanis/commit/2c6cb36e9462c099eb962865b71848ce4fcfda12))
* Implement a new progress report tab with interactive spreadsheet, calculations, and export capabilities. ([ae80204](https://github.com/ilhamtaufiq/arumanis/commit/ae80204d92849574e2944c53c1390144641c7ea0))
* implement chat functionality with OpenRouter integration and API tools, and add a route permission list component. ([0c818c4](https://github.com/ilhamtaufiq/arumanis/commit/0c818c42ee76458444d4aaa42ae737f4342e50b3))
* implement comprehensive progress report management with Handsontable, dynamic weekly columns, and export/import features. ([4c4b16f](https://github.com/ilhamtaufiq/arumanis/commit/4c4b16f15142556ead59a4f5675373e40aef5697))
* Implement core application features, UI components, and layout structure across multiple modules. ([468fb40](https://github.com/ilhamtaufiq/arumanis/commit/468fb40a25507a1a7bf892263d5db9829674699c))
* Implement core application structure and CRUD for multiple administrative modules ([6b98062](https://github.com/ilhamtaufiq/arumanis/commit/6b980625afb6e846d7639403bf775259f0543bcf))
* implement dashboard with statistics and charts, and add pekerjaan and progress features. ([a8dcf6f](https://github.com/ilhamtaufiq/arumanis/commit/a8dcf6fb9480cff6f1207ffd51097e5811fc179e))
* Implement Docker containerization and new 'pekerjaan' features including 'Berita Acara' and 'Foto' tabs. ([c889ad1](https://github.com/ilhamtaufiq/arumanis/commit/c889ad103faa2b493327a736588e496fce876ccf))
* Implement interactive progress report management for 'pekerjaan' using Handsontable and HyperFormula, including API integration and routing. ([4b2975e](https://github.com/ilhamtaufiq/arumanis/commit/4b2975e1fd893cf4f3701d787ff551caba149a5f))
* Implement new `kegiatan-role` feature including dedicated components, API, types, and routes. ([04f51d7](https://github.com/ilhamtaufiq/arumanis/commit/04f51d767e31ef1df78cef358095d6824a81345d))
* Implement new progress report feature with interactive data grid, formula support, charting, and export capabilities. ([8169eb4](https://github.com/ilhamtaufiq/arumanis/commit/8169eb467838c573841879bf99754ecb6d2fe670))
* Implement new Zustand authentication store with user, token, and impersonation management, persisting state to cookies. ([4655411](https://github.com/ilhamtaufiq/arumanis/commit/4655411d7a4862b0c9a6e94a581f169c6f830f00))
* Implement OAuth callback, authentication store, and dynamic sidebar with permission-based menu rendering. ([81b7fe1](https://github.com/ilhamtaufiq/arumanis/commit/81b7fe16e93c03815360056c60ad63e5bc3060aa))
* implement Pekerjaan (Work/Job) management with CRUD, import, and progress tracking capabilities. ([f4c4f37](https://github.com/ilhamtaufiq/arumanis/commit/f4c4f379273bc771cb24c861ee962028e56a1197))
* Implement PekerjaanList component with list, search, filter, pagination, and delete functionality. ([bd3c178](https://github.com/ilhamtaufiq/arumanis/commit/bd3c178c6e642d8ea3206f2972321259837b4077))
* Implement photo management list with search, pagination, and CRUD operations. ([b798dd3](https://github.com/ilhamtaufiq/arumanis/commit/b798dd32e8e24290daa75d2d469ebfe53700f433))
* implement progress report management with an interactive spreadsheet, formula support, and export functionalities. ([61eb3bf](https://github.com/ilhamtaufiq/arumanis/commit/61eb3bf33699ef26008eeeba178b85b5084e8cf2))
* Implement progress report management with an interactive table, charting, and Excel export capabilities, along with new types and utilities. ([ef39df0](https://github.com/ilhamtaufiq/arumanis/commit/ef39df012ce1fc6e131844f571bb10d95e985825))
* Implement progress report management with interactive table, formula engine, and export capabilities, and add API clients for multiple features. ([1210328](https://github.com/ilhamtaufiq/arumanis/commit/1210328ec453498e8df6786d03a1d2cbbe1652ab))
* Implement progress report management with spreadsheet UI and Excel import/export capabilities. ([449a5c9](https://github.com/ilhamtaufiq/arumanis/commit/449a5c9f872eebb5657651010fcf0bfa0519253c))
* Implement progress report tab with interactive Handsontable, HyperFormula calculations, and PDF/Excel export. ([08dc049](https://github.com/ilhamtaufiq/arumanis/commit/08dc04977a7afa99bf4a74165ff7d1e7d1d73c8c))
* Implement role-based dashboard visibility, displaying detailed statistics and charts for admins and a personalized greeting for non-admin users, and add a new changelog file. ([337b965](https://github.com/ilhamtaufiq/arumanis/commit/337b9655e643ff93939440ef913f80b914ac61ed))
* Implement ticket management feature and various data entry forms with supporting UI components. ([ae243dc](https://github.com/ilhamtaufiq/arumanis/commit/ae243dcbb80f08597a8832d11e9d0864d54c7052))
* Implement user sign-in with email/password and Google OAuth functionality ([d66f1b1](https://github.com/ilhamtaufiq/arumanis/commit/d66f1b1a4871c0157ed9645f853755560a334956))
* Implement user-pekerjaan assignment management and supervisor dashboard. ([a4b4d79](https://github.com/ilhamtaufiq/arumanis/commit/a4b4d798cf756f36ea57bd53e74566a8a82b0b96))
* Initialize application with core features, UI components, and integrate CASL for comprehensive permission management. ([09bd2c7](https://github.com/ilhamtaufiq/arumanis/commit/09bd2c79cc4620042b9bfd4df91059b91f5a7a66))
* Introduce comprehensive user management with listing, search, delete, and impersonation capabilities, alongside related API, store, and layout components. ([8c18025](https://github.com/ilhamtaufiq/arumanis/commit/8c18025ed192f548ce45627c60cc69104c0087b7))
* Introduce contract and village forms, alongside a new async searchable select component. ([3c67f41](https://github.com/ilhamtaufiq/arumanis/commit/3c67f41e9f0bef3ca9280c6172c1eb48f2f94c1d))
* Introduce core application structure, routing, layout, and initial feature modules for output, roles, users, permissions, and data management. ([85b58da](https://github.com/ilhamtaufiq/arumanis/commit/85b58da9c8027a1da6eb21a4c18a002c7d20b10e))
* Introduce FotoList component for photo management, along with global styling, theme variables, and Plus Jakarta Sans font. ([3965a8c](https://github.com/ilhamtaufiq/arumanis/commit/3965a8c840c2adcab3b794b4886818778145db65))
* Introduce new UI components for various entities, add global app settings, and implement a consolidated header with fiscal year selection and theme toggle. ([437c611](https://github.com/ilhamtaufiq/arumanis/commit/437c611007a5e2aeba0af8e900f7acc8cdc153d4))
* introduce progress report management component and update `@radix-ui/react-slot` dependency. ([2d1598b](https://github.com/ilhamtaufiq/arumanis/commit/2d1598b5051ec05ce289e5650c408b9935fd844d))
* Introduce Vitest for testing, add documentation, Alert UI component, and auth sign-in feature. ([f6bd2e8](https://github.com/ilhamtaufiq/arumanis/commit/f6bd2e82d8557f880ca2324ff82885dd79d9927c))
* Migrate Docker build to Bun base image, installing git and using `bun install` instead of `npm install`. ([fea9d53](https://github.com/ilhamtaufiq/arumanis/commit/fea9d53d7e5d3f282e216dfb47c52b2f020cbfc7))
* Update site title, meta tags, and Open Graph/Twitter properties to reflect 'arumanis' branding. ([ccabd60](https://github.com/ilhamtaufiq/arumanis/commit/ccabd600d6873c785085ca37db503da3d4430986))


### Performance Improvements

* optimize Bun Docker build with Alpine base, frozen lockfile, and production environment. ([239e1d0](https://github.com/ilhamtaufiq/arumanis/commit/239e1d0b710fbb91ce53efa99b2ee5e1cddea2da))

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
