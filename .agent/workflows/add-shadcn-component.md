---
description: Add a new shadcn/ui component to the project
---

# Add shadcn/ui Component

// turbo-all

## Using npx (Recommended)

1. Add a component:
   ```bash
   npx shadcn@latest add [component-name]
   ```

   Examples:
   ```bash
   npx shadcn@latest add button
   npx shadcn@latest add dialog
   npx shadcn@latest add form
   npx shadcn@latest add table
   ```

2. Add multiple components at once:
   ```bash
   npx shadcn@latest add button card dialog form input label
   ```

## Available Components

Common components you might need:
- `accordion`
- `alert`
- `alert-dialog`
- `avatar`
- `badge`
- `button`
- `calendar`
- `card`
- `checkbox`
- `command`
- `dialog`
- `dropdown-menu`
- `form`
- `input`
- `label`
- `popover`
- `select`
- `separator`
- `sheet`
- `skeleton`
- `switch`
- `table`
- `tabs`
- `textarea`
- `toast`
- `tooltip`

## Usage After Installation

```typescript
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
```

## Notes

- Components are installed to `src/components/ui/`
- Project uses "new-york" style
- CSS variables are enabled
- Icon library is Lucide React
