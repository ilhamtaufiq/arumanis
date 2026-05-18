# Form Style Guidelines

To maintain consistency across the Arumanis dashboard, all new or redesigned forms MUST follow these design patterns:

## 1. Layout Structure
- **Container**: Use `PageContainer` as the main wrapper.
- **Width**: Use `w-full` to ensure the form takes up the entire available content area.
- **Grid System**: 
  - Use a 1-column layout on mobile.
  - Use a 2-column or 3-column (main-left, sidebar-right) layout on desktop using `grid-cols-1 lg:grid-cols-3 gap-8`.
  - Use `lg:col-span-2` for the main content and the remaining column for submission/summary.

## 2. Semantic Colors & Dark Mode
- **Backgrounds**: NEVER use hardcoded colors like `bg-white`, `bg-slate-50`, or `bg-gray-100`.
- **Dynamic Classes**:
  - Use `bg-card` for card backgrounds or loading state containers.
  - Use `bg-muted/30` or `bg-secondary` for subtle section backgrounds.
  - Use `border-muted` or `border-border` for borders.
- **Input Fields**: Let inputs use their default styling. Do not force `bg-white` inside inputs.
- **Section Highlighting**: 
  - Use `bg-primary/5 border-primary/20` for primary highlights.
  - Use `bg-orange-500/5 border-orange-500/20` for warning/target highlights.

## 3. Component Grouping (Cards)
- Group related fields into `Card` components.
- Each `Card` should have:
  - `CardHeader` with an icon (from `lucide-react`) and `CardTitle`.
  - `CardDescription` to provide context.
  - `CardContent` with consistent spacing (`space-y-6`).
- Use `Separator` between logical subgroups within a card.

## 4. Form Elements Styling
- **Labels**: Use uppercase, small, tracking-wider, and muted-foreground for labels: 
  `className="text-xs uppercase tracking-wider text-muted-foreground"`
- **Required Fields**: Mark with a red asterisk `<span className="text-red-500">*</span>`.
- **Selects**: 
  - For edit modes, use the `getSelectValue` helper or ensure `Number()` conversion for IDs.
  - Handle "Optional" or "None" states gracefully with an italic "Belum ditentukan" option.

## 5. Section Archetypes
- **Identitas/Koneksi**: Primary relations (e.g., Pekerjaan, Penyedia, Kegiatan).
- **Lokasi/Detail**: Technical details or geographical info.
- **Anggaran/Financials**: Use `CurrencyInput` and highlight with a top-border color (`border-t-primary`).
- **Timeline/Dates**: Group date inputs using semantic highlights (`bg-muted/30`).

## 6. Submission & Navigation
- **Header**: Include a back button (rounded-full) and a clear H1 with a descriptive subtext.
- **Sticky Sidebar**: For complex forms, place the submit button in a sticky sidebar along with data validation hints.
- **Loading States**: Use `bg-card border-muted border-dashed` for loading container placeholders.

## 7. Icons Usage
- Use semantic icons from `lucide-react`:
  - `Briefcase` for General/Package info.
  - `MapPin` for Location.
  - `Users` for Personnel.
  - `Wallet` for Financials.
  - `Calendar` for Dates.
  - `FileText` for Documents/Legal.
  - `Save` for Submission.
