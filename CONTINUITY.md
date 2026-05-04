# Continuity Ledger

## Goal
- Implement "Import Kontrak from XLSX" feature.
- User can download an Excel template with Job (Pekerjaan) and Provider (Penyedia) references.
- User can upload the filled Excel template to bulk import contracts.

## Constraints/Assumptions
- Use `Maatwebsite/Laravel-Excel` on the backend if available, or standard PHP spreadsheet handling.
- Template should be user-friendly, possibly including IDs or names for lookup.

## Key decisions
- Create a dedicated `KontrakImport` class in Laravel.
- Provide a template generation endpoint that includes current Pekerjaan and Penyedia lists as references.

## State
- Done:
  - Explored `PekerjaanImport.php` as a reference.
- Now:
  - Implementing Backend import logic and template generation.
- Next:
  - Add Frontend buttons and upload logic in `kontrak.index.tsx`.

## Open questions (UNCONFIRMED)
- Should we use existing IDs for Pekerjaan/Penyedia in the Excel, or names for easier matching? Names are safer but IDs are more precise. I'll probably provide both or a searchable dropdown in Excel if possible (though complex). Simple name matching with fuzzy search might be best.

## Working set
- `c:\laragon\www\apiamis\app\Imports\KontrakImport.php`
- `c:\laragon\www\apiamis\app\Http\Controllers\KontrakController.php`
- `c:\laragon\www\bun\src\routes\kontrak.index.tsx`
