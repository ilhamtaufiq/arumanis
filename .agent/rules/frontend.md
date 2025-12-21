---
trigger: always_on
---

# Frontend Rules - ARUMANIS

## 📋 Project Overview
ARUMANIS (Aplikasi Satu Data Air Minum dan Sanitasi) adalah aplikasi frontend React untuk manajemen proyek infrastruktur Air Minum dan Sanitasi yang terhubung dengan backend Laravel (apiamis).

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: TanStack Router
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **UI Components**: Radix UI + shadcn/ui
- **Authorization**: CASL (role-based)
- **Data Fetching**: TanStack Query
- **PDF Export**: jsPDF + html2canvas
- **Charts**: Recharts

## 📁 Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Sidebar, nav, header components
│   └── ui/             # Base UI components (shadcn/ui)
├── config/             # App configuration
├── context/            # React contexts
├── features/           # Feature modules
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── routes/             # TanStack Router definitions
└── stores/             # Zustand stores
```

## 🎯 Coding Conventions

### Component Guidelines
1. **File Naming**: Use PascalCase for components (e.g., `ProgressTabContent.tsx`)
2. **Feature-based Organization**: Place feature-specific components in `src/features/{feature}/components/`
3. **Shared Components**: Place reusable components in `src/components/ui/`
4. **Layout Components**: Place layout-specific components in `src/components/layout/`

### TypeScript
1. **Strict Mode**: Always use strict TypeScript
2. **Type Definitions**: Define interfaces/types for all props and data structures
3. **Avoid `any`**: Never use `any` type, use `unknown` if type is uncertain
4. **Export Types**: Export types from feature modules for reusability

### Styling
1. **Tailwind CSS**: Use Tailwind CSS 4 for styling
2. **shadcn/ui**: Use existing shadcn/ui components from `src/components/ui/`
3. **Dark Mode**: Ensure dark mode support using Tailwind's dark: prefix
4. **Responsive**: Design mobile-first with responsive breakpoints

### State Management
1. **Local State**: Use `useState` for component-local state
2. **Form State**: Use React Hook Form for forms with Zod validation
3. **Global State**: Use Zustand stores in `src/stores/`
4. **Server State**: Use TanStack Query for API data

### Data Fetching
1. **TanStack Query**: Use for all API calls
2. **Query Keys**: Use consistent query key patterns
3. **Error Handling**: Handle loading and error states gracefully
4. **Caching**: Leverage TanStack Query's caching capabilities

### Forms
1. **React Hook Form**: Use for all form handling
2. **Zod Validation**: Define Zod schemas for form validation
3. **Error Messages**: Display user-friendly error messages
4. **Controlled Inputs**: Prefer controlled components

### Routing
1. **TanStack Router**: Define routes in `src/routes/`
2. **Type-safe**: Use type-safe route definitions
3. **Protected Routes**: Implement auth guards for protected routes

### Authorization
1. **CASL**: Use CASL for role-based access control
2. **Permission Checks**: Check permissions before rendering sensitive UI
3. **Route Guards**: Protect routes based on user permissions

## 🚀 Development Commands
```bash
bun run dev      # Start development server (port 5173)
bun run build    # Production build
bun run preview  # Preview production build
bun run lint     # ESLint checking
```

## ⚠️ Important Notes
1. **API Base URL**: Development uses `apiamis.test`, production uses `apiamis.ilham.wtf`
2. **Authentication**: Uses Laravel Sanctum for authentication
3. **PDF Export**: Use jsPDF + html2canvas for generating PDF reports
4. **Feature Modules**: Keep related code within feature folders
5. **Code Splitting**: Leverage Vite's automatic code splitting

## 📝 Best Practices
1. Always handle loading and error states in components
2. Use meaningful variable and function names
3. Document complex logic with comments
4. Write reusable utility functions in `src/lib/`
5. Keep components focused and single-responsibility
6. Test edge cases and error scenarios
7. Optimize for performance (memoization, lazy loading)
