# Continuity Ledger

- Goal (incl. success criteria):
  - Standardize granular unit-level photo documentation using `unit_index`.
  - Clean up image processing logic (remove watermark/timestamp).
  - Ensure offline-first reliability for new mapping.
  - Success: Precise unit photo distribution, clean code, reliable sync.

- Constraints/Assumptions:
  - Database schema updated with `unit_index`.
  - Offline store supports the new field.

- Key decisions:
  - Switched from string parsing (`|Unit X`) to explicit database column `unit_index`.
  - Removed client-side image manipulation (watermarking) to preserve original file integrity.
  - Maintained backward compatibility in UI grouping for legacy data.

- State:
  - Done:
    - Database migration and model update.
    - API Controller and Resource updates.
    - Frontend Types, Store, and Form updates.
    - Background sync logic update in `UploadQueueManager`.
    - Deletion of unused `image-utils.ts`.
  - Now:
    - Optimized `Dockerfile` performance by implementing BuildKit Cache Mounts for Bun dependencies (`/root/.bun/install/cache`). This ensures faster incremental updates by persisting the Bun package cache across builds.
  - Next:
    - User verification of build performance.

- Open questions (UNCONFIRMED if needed):
  - None.

- Working set (files/ids/commands):
  - [foto_migration_final.md](file:///C:/Users/asusg/.gemini/antigravity/brain/abb5ab4a-7f65-418f-bf0b-3febdc567dbc/foto_migration_final.md)
