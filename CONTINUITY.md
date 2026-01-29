# Continuity Ledger

## Goal (incl. success criteria)
- Fix TypeScript error: `'Pengawas' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.`
- Success: All identified files in the `pengawas` feature and related features use `import type` for type-only imports.

## Constraints/Assumptions
- Project uses `verbatimModuleSyntax`: true in `tsconfig.json`.
- Using Bun as the runtime/manager.

## Key decisions
- Use `import type` for all imports that are strictly types/interfaces to comply with `verbatimModuleSyntax`.

## State
### Done
- Identified the cause: `verbatimModuleSyntax` requires explicit `type` keyword for type-only imports.
- Fixed `src/features/pengawas/components/PengawasList.tsx`.

### Now
- Documenting the plan and task tracking.

### Next
- Fix `src/features/pengawas/api/pengawas.ts`.
- Fix `src/features/pengawas/components/PengawasForm.tsx`.
- Scan for other occurrences in the project.

## Open questions (UNCONFIRMED if needed)
- Are there other features with similar issues? (Likely, will scan).

## Working set
- `src/features/pengawas/components/PengawasList.tsx`
- `src/features/pengawas/api/pengawas.ts`
- `src/features/pengawas/components/PengawasForm.tsx`
