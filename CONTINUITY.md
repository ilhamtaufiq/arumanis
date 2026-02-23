# Continuity Ledger

## Goal
- Implement Draft Pekerjaan flow: show all Pekerjaan and allow users to fill in Pelaksana and choose Penyedia from a list.
- Establish relationship between Draft Pekerjaan and Penyedia model.

## Constraints/Assumptions
- Outputs can be communal (penerima_is_optional: true) or per-recipient.
- Communal outputs have a volume which determines the number of "Units".
- Individual units in communal outputs should be represented as separate rows.

## Key decisions
- Driving Draft Pekerjaan list from the `Pekerjaan` table instead of `DraftPekerjaan`.
- Use `updateOrCreate` in the controller to handle both initial creation and subsequent updates of drafts.
- Use `penyedia_id` foreign key for better data integrity.
- Standardize API responses using Laravel Resources (`DraftPekerjaanResource`).

## State
### Done
- Added `penyedia_id` to `tbl_draft_pekerjaan`.
- Updated `Pekerjaan` and `DraftPekerjaan` models with relationships.
- Standardized API with `DraftPekerjaanResource`.
- Updated `DraftPekerjaanController` to fetch all jobs with drafts.
- Redesigned `DraftPekerjaanList.tsx` UI for the new flow.
- Created `penyedia.ts` API helper.

### Now
- Ready for final testing.

### Next
- Verify performance with large datasets.

## Open questions (UNCONFIRMED)
- None.

## Working set
- `src/features/pekerjaan/components/DraftPekerjaanList.tsx`
- `app/Http/Controllers/DraftPekerjaanController.php`
- `app/Models/DraftPekerjaan.php`
- `app/Models/Pekerjaan.php`
