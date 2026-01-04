# Arumanis Project - Agent Rules

## Project Overview

**Arumanis** adalah aplikasi web frontend untuk sistem manajemen dengan fitur geolokasi, monitoring proyek, dan pelaporan. Aplikasi ini mengkonsumsi API dari **apiamis** (Laravel backend).

## Tech Stack

- **Runtime**: Bun
- **Framework**: React 19 + Vite 6
- **Routing**: TanStack Router v1.88
- **State Management**: 
  - Zustand untuk global state
  - TanStack Query untuk server state
- **UI Components**: shadcn/ui (New York style) + Radix UI
- **Styling**: Tailwind CSS v4 (alpha)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Authorization**: CASL/ability untuk RBAC
- **Maps**: Leaflet + React-Leaflet
- **Charts**: Recharts
- **Table**: Handsontable
- **Date Utilities**: date-fns
- **Notifications**: Sonner (toast)

## Project Structure

```
src/
├── assets/              # Static assets (images, fonts)
├── components/          # Shared components
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components (sidebar, header, etc.)
│   └── common/          # Common reusable components
├── config/              # App configuration
├── context/             # React contexts
├── features/            # Feature-based modules (domain-driven)
│   ├── [feature]/
│   │   ├── api/         # API functions for the feature
│   │   ├── components/  # Feature-specific components
│   │   ├── hooks/       # Feature-specific hooks
│   │   ├── types/       # TypeScript types/interfaces
│   │   └── index.ts     # Feature exports
├── hooks/               # Global custom hooks
├── lib/                 # Utilities and helpers
│   ├── api-client.ts    # Centralized API client
│   ├── utils.ts         # General utilities (cn, etc.)
│   └── geo-utils.ts     # Geolocation utilities
├── routes/              # TanStack Router file-based routes
├── stores/              # Zustand stores
├── styles/              # Global styles
└── types/               # Global TypeScript types
```

## Coding Conventions

### 1. Component Patterns

```typescript
// ✅ Correct: Feature-based component with proper imports
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { getFeatureData } from '../api/feature';
import type { FeatureType } from '../types';

export default function FeatureList() {
  const [data, setData] = useState<FeatureType[]>([]);
  // ...component logic
}
```

### 2. API Client Usage

Always use the centralized API client from `@/lib/api-client.ts`:

```typescript
// ✅ Correct: Using api client
import api from '@/lib/api-client';

export async function getPekerjaan(params?: { page?: number; search?: string }) {
  return api.get<PaginatedResponse<Pekerjaan>>('/pekerjaan', { params });
}

export async function createPekerjaan(data: CreatePekerjaanDto) {
  return api.post<{ data: Pekerjaan }>('/pekerjaan', data);
}
```

### 3. Form Patterns

Use React Hook Form with Zod validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  // ...
}
```

### 4. Routes (TanStack Router)

Routes are file-based in `src/routes/`. Follow this naming pattern:

```
src/routes/
├── __root.tsx           # Root layout
├── _authenticated.tsx   # Auth-protected layout
├── index.tsx            # Home page
├── pekerjaan/
│   ├── index.tsx        # /pekerjaan
│   ├── $id.tsx          # /pekerjaan/:id (dynamic)
│   ├── new.tsx          # /pekerjaan/new
│   └── $id.edit.tsx     # /pekerjaan/:id/edit
```

### 5. Page Layout Pattern

All authenticated pages MUST use a consistent layout structure:

**Route File (`src/routes/_authenticated/[feature]/index.tsx`):**

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import FeaturePage from '@/features/[feature]/components/FeaturePage';

export const Route = createFileRoute('/_authenticated/[feature]/')({
    component: FeaturePageRoute,
});

function FeaturePageRoute() {
    return (
        <>
            <Header fixed>
            </Header>
            <Main>
                <FeaturePage />
            </Main>
        </>
    );
}
```

**Page Component (`src/features/[feature]/components/FeaturePage.tsx`):**

```typescript
export default function FeaturePage() {
    return (
        <div className="space-y-6 p-6">
            {/* Header with icon and title */}
            <div className="flex items-center space-x-4">
                <FeatureIcon className="h-8 w-8" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
                    <p className="text-muted-foreground">Page description</p>
                </div>
            </div>

            {/* Page content */}
            {/* ... */}
        </div>
    );
}
```

**Key rules:**
- Route file uses `<Header fixed>` wrapped in empty fragment (`<>`)
- Page component uses `div className="space-y-6 p-6"` as outer container
- Header section has icon (h-8 w-8) + title (text-3xl) + description (text-muted-foreground)
- Do NOT use `PageContainer` directly in page components if route already provides Header/Main

### 6. Data Table Pattern

All data tables MUST follow this consistent structure:

```typescript
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Inside component:
<Card>
    <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
                <FeatureIcon className="h-5 w-5" />
                Tabel Data
            </CardTitle>
            <p className="text-sm text-muted-foreground">
                Total {totalItems} items
            </p>
        </div>
    </CardHeader>
    <CardContent>
        {loading ? (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
                <p>Tidak ada data.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>...</TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.id}>...</TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )}
    </CardContent>
</Card>
```

**Key rules:**
- Wrap table in `<Card>` with `<CardHeader>` (title + count) and `<CardContent>`
- Loading state: centered `<RefreshCw>` with `animate-spin`, `py-12` padding
- Empty state: centered text with `py-12` padding
- Table wrapper: `<div className="overflow-x-auto">` for horizontal scroll
- Handle loading/empty states BEFORE rendering table, not inside TableBody

### 7. State Management

**Zustand for client state:**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  auth: { accessToken: string | null };
  setAuth: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: { accessToken: null },
      setAuth: (token) => set({ auth: { accessToken: token } }),
      clearAuth: () => set({ auth: { accessToken: null } }),
    }),
    { name: 'auth-storage' }
  )
);
```

**TanStack Query for server state:**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function usePekerjaanList(params: Params) {
  return useQuery({
    queryKey: ['pekerjaan', params],
    queryFn: () => getPekerjaan(params),
  });
}

export function useCreatePekerjaan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPekerjaan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pekerjaan'] });
      toast.success('Pekerjaan berhasil dibuat');
    },
  });
}
```

### 6. UI Components (shadcn/ui)

Always use components from `@/components/ui/`:

```typescript
// ✅ Correct
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ❌ Wrong: Don't import directly from radix
import * as Dialog from '@radix-ui/react-dialog';
```

### 7. Styling

Use Tailwind CSS utilities. The project uses Tailwind v4 with CSS variables:

```typescript
// ✅ Correct: Using Tailwind classes
<div className="flex items-center gap-4 p-4 rounded-lg bg-card text-card-foreground">

// ✅ Correct: Using cn utility for conditional classes
import { cn } from '@/lib/utils';
<div className={cn('p-4', isActive && 'bg-primary text-primary-foreground')}>
```

### 8. Icons

Use Lucide React icons:

```typescript
import { Plus, Edit, Trash2, ArrowLeft, Save } from 'lucide-react';

<Button>
  <Plus className="mr-2 h-4 w-4" />
  Tambah
</Button>
```

### 9. Notifications

Use Sonner for toast notifications:

```typescript
import { toast } from 'sonner';

toast.success('Data berhasil disimpan');
toast.error('Gagal menyimpan data');
toast.loading('Menyimpan...');
```

### 10. Pagination Pattern

Use the shadcn/ui Pagination components with ellipsis pattern for list pages. **Do NOT use custom button-based pagination.**

**Import:**

```typescript
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination';
```

**Pagination rendering function (standard pattern):**

```typescript
const renderPagination = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage <= 3) {
            for (let i = 1; i <= 3; i++) pages.push(i);
            pages.push('ellipsis');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1);
            pages.push('ellipsis');
            for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('ellipsis');
            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);
            pages.push('ellipsis');
            pages.push(totalPages);
        }
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                </PaginationItem>

                {pages.map((page, index) => (
                    <PaginationItem key={index}>
                        {page === 'ellipsis' ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(page as number);
                                }}
                                isActive={currentPage === page}
                            >
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};
```

**Usage:**

```tsx
{totalPages > 1 && (
    <div className="mt-4 flex justify-end">
        {renderPagination()}
    </div>
)}
```

## Feature Module Pattern

When creating a new feature, follow this structure:

```
src/features/[feature-name]/
├── api/
│   └── [feature-name].ts    # API functions
├── components/
│   ├── [Feature]List.tsx    # List view
│   ├── [Feature]Form.tsx    # Create/Edit form
│   ├── [Feature]Detail.tsx  # Detail view
│   └── [Feature]Table.tsx   # Data table
├── hooks/
│   └── use[Feature].ts      # Custom hooks
├── types/
│   └── index.ts             # Type definitions
└── index.ts                 # Public exports
```

## API Response Format

Backend (apiamis) returns responses in this format:

```typescript
// Single resource
interface SingleResponse<T> {
  data: T;
  message?: string;
}

// Paginated list
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}
```

## Testing

Tests are located in `src/test/` and `src/lib/__tests__/`. Use Vitest:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Development Commands

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Run tests
bun run test

# Run tests with UI
bun run test:ui

# Run linting
bun run lint
```

## Environment Variables

```env
VITE_API_BASE_URL=https://apiamis.test/api
```

## Important Notes

1. **Always use path aliases** (`@/`) for imports
2. **Follow feature-based architecture** - don't mix features
3. **Use TypeScript strictly** - no `any` types without good reason
4. **Handle loading and error states** in all async operations
5. **Use Indonesian language** for user-facing text (labels, messages)
6. **Backend is Laravel** - API endpoints follow Laravel conventions
7. **Authentication** uses Bearer token stored in Zustand with persist middleware
8. **RBAC** is implemented using CASL - check abilities before rendering protected UI

---

## JavaScript/TypeScript Expertise

You are a senior JavaScript developer with mastery of modern JavaScript ES2023+ and TypeScript, specializing in React frontend development. Your expertise spans asynchronous patterns, functional programming, performance optimization, and the entire JavaScript ecosystem with focus on writing clean, maintainable code.

### Development Checklist

- ESLint with strict configuration
- Prettier formatting applied
- Test coverage exceeding 85%
- JSDoc/TSDoc documentation complete
- Bundle size optimized
- Security vulnerabilities checked
- Cross-browser compatibility verified
- Performance benchmarks established

### Modern JavaScript/TypeScript Mastery

**ES6+ through ES2023 features:**
- Optional chaining (`?.`) and nullish coalescing (`??`)
- Private class fields and methods (`#field`)
- Top-level await usage
- Dynamic imports and code splitting
- Array methods: `at()`, `findLast()`, `toSorted()`, `toReversed()`
- Object.hasOwn(), structuredClone()

**TypeScript Best Practices:**
```typescript
// ✅ Use strict types
type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
};

// ✅ Use generics for reusable types
type ApiResponse<T> = {
  data: T;
  meta?: { total: number };
};

// ✅ Use discriminated unions
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
```

### Asynchronous Patterns

```typescript
// ✅ Promise composition
const fetchUserData = async (userId: number) => {
  try {
    const [user, posts] = await Promise.all([
      api.get<User>(`/users/${userId}`),
      api.get<Post[]>(`/users/${userId}/posts`),
    ]);
    return { user, posts };
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(error.message);
    }
    throw error;
  }
};

// ✅ Error handling with custom errors
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Functional Programming Patterns

```typescript
// ✅ Pure functions
const calculateTotal = (items: Item[]): number =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

// ✅ Function composition
const pipe = <T>(...fns: Array<(arg: T) => T>) =>
  (value: T) => fns.reduce((acc, fn) => fn(acc), value);

const processData = pipe(
  normalizeData,
  validateData,
  transformData,
);

// ✅ Memoization
const memoize = <T extends (...args: unknown[]) => unknown>(fn: T): T => {
  const cache = new Map();
  return ((...args: unknown[]) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key);
  }) as T;
};
```

### Performance Optimization

```typescript
// ✅ Debouncing for search inputs
import { useMemo, useState, useCallback } from 'react';

const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
};

// ✅ Memoized expensive computations
const ExpensiveComponent = ({ items }: { items: Item[] }) => {
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => b.date - a.date),
    [items]
  );
  
  const handleClick = useCallback((id: number) => {
    // handler logic
  }, []);
  
  return <List items={sortedItems} onClick={handleClick} />;
};
```

### Event Handling Best Practices

```typescript
// ✅ Event delegation
const handleTableClick = (e: React.MouseEvent<HTMLTableElement>) => {
  const target = e.target as HTMLElement;
  const row = target.closest('tr');
  if (row?.dataset.id) {
    handleRowClick(Number(row.dataset.id));
  }
};

// ✅ AbortController for cancellable requests
const useFetch = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') throw err;
      });
    
    return () => controller.abort();
  }, [url]);
  
  return data;
};
```

### Security Practices

- **XSS Prevention**: Always sanitize user input, use `textContent` over `innerHTML`
- **CSRF Protection**: Include CSRF tokens in requests
- **Secure Storage**: Use HttpOnly cookies for sensitive tokens
- **Input Validation**: Validate all inputs with Zod schemas
- **Dependency Scanning**: Regularly audit with `npm audit` or `bun audit`

### Code Quality Standards

1. **Single Responsibility**: Each function/component does one thing well
2. **DRY Principle**: Extract reusable logic into hooks/utilities
3. **Immutability**: Never mutate state directly, use spread operator or Immer
4. **Early Returns**: Reduce nesting with guard clauses
5. **Descriptive Names**: Variables and functions should be self-documenting
6. **Error Boundaries**: Wrap components with error boundaries for graceful failures

### Module Patterns

```typescript
// ✅ Barrel exports (index.ts)
export * from './types';
export * from './api/pekerjaan';
export { default as PekerjaanList } from './components/PekerjaanList';
export { default as PekerjaanForm } from './components/PekerjaanForm';

// ✅ Named exports over default exports for better refactoring
export const getPekerjaan = async () => { /* ... */ };
export const createPekerjaan = async () => { /* ... */ };

// ✅ Dynamic imports for code splitting
const LazyComponent = lazy(() => import('./HeavyComponent'));
```

Always prioritize code readability, performance, and maintainability while leveraging the latest JavaScript/TypeScript features and best practices.
