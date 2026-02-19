# Continuity Ledger
2: 
3: ## Goal (incl. success criteria)
4: - Fix messy layout and filtering in `FotoTabContent.tsx`.
5: - Success: Table rows are correctly aligned, filtering works as expected, and photos are grouped correctly by recipient/unit.
6: 
7: ## Constraints/Assumptions
8: - Outputs can be communal (penerima_is_optional: true) or per-recipient.
9: - Communal outputs have a volume which determines the number of "Units".
10: - Individual units in communal outputs should be represented as separate rows.
11: 
12: ## Key decisions
13: - Remove dynamic column hiding (`showPenerimaColumns`) to maintain stable table layout.
14: - Always show "Nama Penerima" and "NIK" columns.
15: - Refactor grouping logic to aggregate "orphan" photos by component/recipient into single rows instead of multiple rows.
16: 
17: ## State
18: ### Done
19: - Initial diagnosis from screenshots: Orphan photos creating multiple rows and dynamic columns causing misalignment.
20: 
21: ### Now
22: - Refactoring `groupedFotos` logic in `FotoTabContent.tsx`.
23: 
24: ### Next
25: - Update Table JSX to always show all columns.
26: - Verify filtering behavior.
27: 
28: ## Open questions (UNCONFIRMED if needed)
29: - None for now.
30: 
31: ## Working set
32: - `src/features/pekerjaan/components/FotoTabContent.tsx`
33: 
