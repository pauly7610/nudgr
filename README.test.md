# Testing Guide

This project uses Vitest and React Testing Library for testing.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Open Vitest UI
npm run test:ui
```

## Test Structure

Tests are located next to the files they test in `__tests__` directories:
- Component tests: `src/components/__tests__/`
- Hook tests: `src/hooks/__tests__/`
- Utility tests: `src/lib/__tests__/`

## Writing Tests

### Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { YourComponent } from '../YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Hook Tests

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useYourHook } from '../useYourHook';

describe('useYourHook', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => useYourHook());
    expect(result.current).toBeDefined();
  });
});
```

## Test Coverage

Current coverage for critical components:
- ✅ StatsCard component
- ✅ DashboardHeader component
- ✅ useSubscription hook
- ✅ utils (cn function)

Target coverage: 80% for critical paths

## Mocking

### Supabase Client
```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));
```

### React Query
Use the provided wrapper in `test-utils.tsx` which includes QueryClientProvider.

## Best Practices

1. **Test user behavior, not implementation**
2. **Use data-testid sparingly** - prefer accessible queries
3. **Mock external dependencies** - API calls, Supabase, etc.
4. **Keep tests focused** - one assertion per test when possible
5. **Use descriptive test names** - clearly state what is being tested
