---
description: Run tests for the Arumanis project
---

# Testing Workflow

// turbo-all

## Run All Tests

```bash
bun run test
```

## Run Tests with Watch Mode

```bash
bun run test
```
(Vitest runs in watch mode by default)

## Run Tests with UI

```bash
bun run test:ui
```

## Run Tests with Coverage

```bash
bun run test:coverage
```

## Run Specific Test File

```bash
bun run test src/lib/__tests__/utils.test.ts
```

## Test File Location

Tests should be placed in:
- `src/lib/__tests__/` - for utility tests
- `src/test/` - for component/integration tests
- `src/features/[feature]/__tests__/` - for feature-specific tests

## Writing Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle click', async () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```
