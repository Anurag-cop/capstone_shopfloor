# Testing Guide

Comprehensive guide for testing the Shop Floor Resource Allocation System.

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Setup](#setup)
- [Unit Testing](#unit-testing)
- [Component Testing](#component-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)

---

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \
      / E2E \         Few, critical user flows
     /______\
    /        \
   /Integration\     Component interactions
  /____________\
 /              \
/  Unit Tests    \   Many, fast, isolated
/________________\
```

**Coverage Goals:**
- Unit Tests: 80%+
- Component Tests: 70%+
- Integration Tests: Key workflows
- E2E Tests: Critical paths

---

## Setup

### Install Testing Dependencies

```bash
npm install --save-dev vitest @vitest/ui
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev @types/jest
npm install --save-dev jsdom
npm install --save-dev msw  # Mock Service Worker for API mocking
npm install --save-dev @playwright/test  # For E2E testing
```

### Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup File

Create `src/test/setup.ts`:

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {},
};
global.localStorage = localStorageMock as Storage;
```

### Update package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Unit Testing

### Testing Utilities

#### Example: Validation Functions

```typescript
// src/utils/__tests__/allocationValidation.test.ts
import { describe, it, expect } from 'vitest';
import { validateAllocation, findOptimalResources } from '../allocationValidation';
import type { Allocation, WorkOrder, Operator, Machine } from '@/types';

describe('validateAllocation', () => {
  it('should validate successful allocation with matching skills', () => {
    const allocation: Allocation = {
      id: 'alloc-1',
      workOrderId: 'wo-1',
      operators: [
        {
          id: 'op-1',
          name: 'John Doe',
          skills: ['welding', 'assembly'],
          availability: 'available',
        },
      ],
      machines: [],
      startTime: new Date(),
      status: 'active',
    };

    const workOrder: WorkOrder = {
      id: 'wo-1',
      productName: 'Product A',
      priority: 'high',
      status: 'pending',
      requiredSkills: ['welding'],
      requiredMachines: [],
      estimatedDuration: 120,
      deadline: new Date(),
    };

    const result = validateAllocation(allocation, workOrder);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail validation when operator lacks required skills', () => {
    const allocation: Allocation = {
      id: 'alloc-1',
      workOrderId: 'wo-1',
      operators: [
        {
          id: 'op-1',
          name: 'John Doe',
          skills: ['assembly'],
          availability: 'available',
        },
      ],
      machines: [],
      startTime: new Date(),
      status: 'active',
    };

    const workOrder: WorkOrder = {
      id: 'wo-1',
      productName: 'Product A',
      priority: 'high',
      status: 'pending',
      requiredSkills: ['welding'],
      requiredMachines: [],
      estimatedDuration: 120,
      deadline: new Date(),
    };

    const result = validateAllocation(allocation, workOrder);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Missing required skill: welding');
  });

  it('should warn about insufficient operators', () => {
    const allocation: Allocation = {
      id: 'alloc-1',
      workOrderId: 'wo-1',
      operators: [
        {
          id: 'op-1',
          name: 'John Doe',
          skills: ['welding'],
          availability: 'available',
        },
      ],
      machines: [],
      startTime: new Date(),
      status: 'active',
    };

    const workOrder: WorkOrder = {
      id: 'wo-1',
      productName: 'Product A',
      priority: 'high',
      status: 'pending',
      requiredSkills: ['welding'],
      requiredMachines: [],
      requiredOperatorCount: 2,
      estimatedDuration: 120,
      deadline: new Date(),
    };

    const result = validateAllocation(allocation, workOrder);

    expect(result.warnings).toContain('May need more operators (1/2)');
  });
});

describe('findOptimalResources', () => {
  const operators: Operator[] = [
    {
      id: 'op-1',
      name: 'Expert Welder',
      skills: ['welding', 'assembly', 'inspection'],
      availability: 'available',
    },
    {
      id: 'op-2',
      name: 'Junior Welder',
      skills: ['welding'],
      availability: 'available',
    },
  ];

  it('should prioritize operators with more matching skills', () => {
    const workOrder: WorkOrder = {
      id: 'wo-1',
      productName: 'Product A',
      priority: 'high',
      status: 'pending',
      requiredSkills: ['welding', 'assembly'],
      requiredMachines: [],
      estimatedDuration: 120,
      deadline: new Date(),
    };

    const result = findOptimalResources(operators, [], workOrder);

    expect(result.operators[0].id).toBe('op-1'); // Expert has more skills
  });
});
```

---

## Component Testing

### Testing React Components

#### Example: MetricsCards Component

```typescript
// src/components/__tests__/MetricsCards.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MetricsCards } from '../MetricsCards';
import type { DashboardMetrics } from '@/types';

describe('MetricsCards', () => {
  const mockMetrics: DashboardMetrics = {
    activeOperators: 5,
    totalOperators: 10,
    activeMachines: 3,
    totalMachines: 8,
    activeWorkOrders: 12,
    totalWorkOrders: 20,
    utilizationRate: 75.5,
  };

  it('renders all metrics correctly', () => {
    render(<MetricsCards metrics={mockMetrics} />);

    expect(screen.getByText('Active Operators')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('/ 10')).toBeInTheDocument();

    expect(screen.getByText('Active Machines')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    expect(screen.getByText('Active Work Orders')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    expect(screen.getByText('Utilization')).toBeInTheDocument();
    expect(screen.getByText('75.5%')).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    const onRefresh = vi.fn();
    render(<MetricsCards metrics={mockMetrics} onRefresh={onRefresh} />);

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    render(<MetricsCards metrics={mockMetrics} loading={true} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

#### Example: WorkOrderPanel Component

```typescript
// src/components/__tests__/WorkOrderPanel.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkOrderPanel } from '../WorkOrderPanel';
import type { WorkOrder } from '@/types';

describe('WorkOrderPanel', () => {
  const mockWorkOrders: WorkOrder[] = [
    {
      id: 'wo-1',
      productName: 'Product A',
      priority: 'high',
      status: 'pending',
      requiredSkills: ['welding', 'assembly'],
      requiredMachines: ['lathe'],
      estimatedDuration: 120,
      deadline: new Date('2024-02-01'),
    },
    {
      id: 'wo-2',
      productName: 'Product B',
      priority: 'medium',
      status: 'in-progress',
      requiredSkills: ['assembly'],
      requiredMachines: [],
      estimatedDuration: 60,
      deadline: new Date('2024-02-05'),
    },
  ];

  it('renders all work orders', () => {
    render(<WorkOrderPanel workOrders={mockWorkOrders} />);

    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
  });

  it('displays priority badges correctly', () => {
    render(<WorkOrderPanel workOrders={mockWorkOrders} />);

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('calls onSelectWorkOrder when work order is clicked', () => {
    const onSelect = vi.fn();
    render(<WorkOrderPanel workOrders={mockWorkOrders} onSelectWorkOrder={onSelect} />);

    const workOrderCard = screen.getByText('Product A').closest('.work-order-card');
    fireEvent.click(workOrderCard!);

    expect(onSelect).toHaveBeenCalledWith(mockWorkOrders[0]);
  });

  it('filters work orders by status', () => {
    render(<WorkOrderPanel workOrders={mockWorkOrders} filter="pending" />);

    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.queryByText('Product B')).not.toBeInTheDocument();
  });
});
```

#### Example: Drag and Drop Component

```typescript
// src/components/__tests__/AllocationInterface.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AllocationInterface } from '../AllocationInterface';
import userEvent from '@testing-library/user-event';

// Helper to wrap component with DnD provider
const renderWithDnd = (component: React.ReactElement) => {
  return render(<DndProvider backend={HTML5Backend}>{component}</DndProvider>);
};

describe('AllocationInterface', () => {
  const mockWorkOrder = {
    id: 'wo-1',
    productName: 'Product A',
    priority: 'high' as const,
    status: 'pending' as const,
    requiredSkills: ['welding'],
    requiredMachines: ['lathe'],
    estimatedDuration: 120,
    deadline: new Date(),
  };

  it('renders allocation interface for work order', () => {
    renderWithDnd(<AllocationInterface workOrder={mockWorkOrder} onClose={() => {}} />);

    expect(screen.getByText('Allocate Resources')).toBeInTheDocument();
    expect(screen.getByText('Product A')).toBeInTheDocument();
  });

  it('displays validation errors', () => {
    renderWithDnd(
      <AllocationInterface
        workOrder={mockWorkOrder}
        validationErrors={['Missing required skill: welding']}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Missing required skill: welding')).toBeInTheDocument();
  });

  it('calls onSave with allocation data', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    renderWithDnd(<AllocationInterface workOrder={mockWorkOrder} onSave={onSave} onClose={() => {}} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(onSave).toHaveBeenCalled();
  });
});
```

---

## Integration Testing

### Testing Store Integration

```typescript
// src/store/__tests__/store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../index';
import type { Operator } from '@/types';

describe('Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.setState({
      operators: [],
      machines: [],
      workOrders: [],
      allocations: [],
    });
  });

  it('adds operator to store', () => {
    const newOperator: Operator = {
      id: 'op-1',
      name: 'John Doe',
      skills: ['welding'],
      availability: 'available',
    };

    useStore.getState().addOperator(newOperator);

    const operators = useStore.getState().operators;
    expect(operators).toHaveLength(1);
    expect(operators[0]).toEqual(newOperator);
  });

  it('updates operator status', () => {
    const operator: Operator = {
      id: 'op-1',
      name: 'John Doe',
      skills: ['welding'],
      availability: 'available',
    };

    useStore.getState().addOperator(operator);
    useStore.getState().updateOperatorStatus('op-1', 'busy');

    const updated = useStore.getState().operators[0];
    expect(updated.availability).toBe('busy');
  });

  it('creates allocation and updates resource availability', () => {
    const operator: Operator = {
      id: 'op-1',
      name: 'John Doe',
      skills: ['welding'],
      availability: 'available',
    };

    useStore.getState().addOperator(operator);

    useStore.getState().createAllocation({
      workOrderId: 'wo-1',
      operators: [operator],
      machines: [],
    });

    const allocations = useStore.getState().allocations;
    expect(allocations).toHaveLength(1);

    const updatedOperator = useStore.getState().operators[0];
    expect(updatedOperator.availability).toBe('busy');
  });
});
```

### Testing API Integration

```typescript
// src/api/__tests__/integration.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { operatorsApi } from '../resources';

const server = setupServer(
  rest.get('http://localhost:3001/api/operators', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 'op-1', name: 'John Doe', skills: ['welding'] },
        { id: 'op-2', name: 'Jane Smith', skills: ['assembly'] },
      ])
    );
  }),

  rest.post('http://localhost:3001/api/operators', async (req, res, ctx) => {
    const newOperator = await req.json();
    return res(ctx.json({ ...newOperator, id: 'op-3' }));
  }),

  rest.patch('http://localhost:3001/api/operators/:id', async (req, res, ctx) => {
    const updates = await req.json();
    return res(ctx.json({ id: req.params.id, ...updates }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Operators API Integration', () => {
  it('fetches all operators', async () => {
    const operators = await operatorsApi.getAll();

    expect(operators).toHaveLength(2);
    expect(operators[0].name).toBe('John Doe');
  });

  it('creates new operator', async () => {
    const newOperator = {
      name: 'Bob Johnson',
      skills: ['machining'],
      availability: 'available' as const,
    };

    const created = await operatorsApi.create(newOperator);

    expect(created.id).toBe('op-3');
    expect(created.name).toBe('Bob Johnson');
  });

  it('updates operator', async () => {
    const updated = await operatorsApi.update('op-1', { availability: 'busy' });

    expect(updated.availability).toBe('busy');
  });
});
```

---

## End-to-End Testing

### Setup Playwright

```bash
npm init playwright@latest
```

### E2E Test Example

```typescript
// tests/e2e/allocation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Resource Allocation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should create allocation by drag and drop', async ({ page }) => {
    // Wait for dashboard to load
    await expect(page.locator('.dashboard')).toBeVisible();

    // Click on work order to open allocation interface
    await page.click('[data-testid="work-order-wo-1"]');

    // Wait for allocation modal
    await expect(page.locator('.allocation-interface')).toBeVisible();

    // Drag operator to drop zone
    const operator = page.locator('[data-testid="operator-op-1"]');
    const dropZone = page.locator('[data-testid="operator-drop-zone"]');

    await operator.dragTo(dropZone);

    // Verify operator was added
    await expect(page.locator('.selected-operator')).toContainText('John Doe');

    // Save allocation
    await page.click('button:has-text("Save Allocation")');

    // Verify success message
    await expect(page.locator('.alert-success')).toContainText('Allocation created');

    // Verify metrics updated
    await expect(page.locator('[data-testid="active-operators"]')).toContainText('4');
  });

  test('should show validation errors', async ({ page }) => {
    await page.click('[data-testid="work-order-wo-1"]');

    // Try to save without selecting resources
    await page.click('button:has-text("Save Allocation")');

    // Check for validation errors
    await expect(page.locator('.validation-error')).toContainText('No operators selected');
  });

  test('should filter work orders by status', async ({ page }) => {
    // Click status filter
    await page.click('[data-testid="filter-pending"]');

    // Verify only pending orders are shown
    const workOrders = page.locator('.work-order-card');
    await expect(workOrders).toHaveCount(3);

    for (const order of await workOrders.all()) {
      await expect(order).toContainText('Pending');
    }
  });
});
```

### Visual Regression Testing

```typescript
// tests/e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('dashboard should match snapshot', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('dashboard.png');
  });

  test('allocation modal should match snapshot', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="work-order-wo-1"]');
    await page.waitForSelector('.allocation-interface');

    await expect(page).toHaveScreenshot('allocation-modal.png');
  });
});
```

---

## Test Coverage

### Generate Coverage Report

```bash
npm run test:coverage
```

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        '**/index.ts',
      ],
    },
  },
});
```

### View Coverage Report

```bash
npm run test:coverage
# Open coverage/index.html in browser
```

---

## Best Practices

### 1. AAA Pattern

```typescript
it('should do something', () => {
  // Arrange - Setup test data
  const operator = createMockOperator();

  // Act - Perform action
  const result = validateOperator(operator);

  // Assert - Verify result
  expect(result.isValid).toBe(true);
});
```

### 2. Test Isolation

```typescript
// ✅ Good: Reset state before each test
beforeEach(() => {
  useStore.setState(initialState);
});

// ❌ Bad: Tests depend on each other
```

### 3. Descriptive Test Names

```typescript
// ✅ Good: Clear description
it('should show validation error when operator lacks required skills', () => {});

// ❌ Bad: Unclear
it('test 1', () => {});
```

### 4. Test One Thing

```typescript
// ✅ Good: Single assertion
it('should mark operator as busy after allocation', () => {
  const operator = createOperator();
  allocateToWorkOrder(operator, workOrder);
  expect(operator.availability).toBe('busy');
});

// ❌ Bad: Multiple unrelated assertions
it('should work', () => {
  expect(operators).toHaveLength(5);
  expect(workOrders).toHaveLength(10);
  expect(allocations).toHaveLength(3);
});
```

### 5. Use Test Data Builders

```typescript
// Test helpers
const createMockOperator = (overrides?: Partial<Operator>): Operator => ({
  id: 'op-1',
  name: 'John Doe',
  skills: ['welding'],
  availability: 'available',
  ...overrides,
});

// Usage
const busyOperator = createMockOperator({ availability: 'busy' });
```

### 6. Avoid Testing Implementation Details

```typescript
// ✅ Good: Test behavior
it('should display operator name', () => {
  render(<OperatorCard operator={operator} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});

// ❌ Bad: Test implementation
it('should call setState with correct value', () => {
  expect(setState).toHaveBeenCalledWith(...);
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [MSW (Mock Service Worker)](https://mswjs.io/)

---

**Last Updated**: 2024
