# Developer Quick Reference

Quick reference guide for common development tasks and code patterns.

## 🚀 Quick Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Check for linting errors
npm run lint:fix         # Auto-fix linting errors
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Testing (when implemented)
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Maintenance
npm run clean            # Clean build artifacts
npm run audit            # Check for vulnerabilities
npm run audit:fix        # Fix vulnerabilities
npm run validate         # Run all checks (lint + type + build)
```

## 📁 File Organization

```typescript
// Component structure
src/components/ComponentName/
  ├── ComponentName.tsx     // Component logic
  ├── ComponentName.css     // Component styles
  └── index.ts              // Re-export

// Feature structure
src/features/featureName/
  ├── components/           // Feature-specific components
  ├── hooks/               // Custom hooks
  ├── utils/               // Utilities
  └── featureName.tsx      // Main feature component
```

## 🎨 Common Patterns

### Creating a Component

```typescript
// src/components/MyComponent/MyComponent.tsx
import React from 'react';
import './MyComponent.css';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="my-component">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

### Using Store

```typescript
import { useStore } from '@/store';

// Read state
const operators = useStore((state) => state.operators);

// Call action
const addOperator = useStore((state) => state.addOperator);

// Example usage
const handleAdd = () => {
  addOperator({
    id: 'OP006',
    name: 'Jane Doe',
    skills: ['welding'],
    // ...
  });
};
```

### Custom Hook

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedSearch = useDebounce(searchTerm, 500);
```

### Drag and Drop

```typescript
import { useDrag } from 'react-dnd';

const [{ isDragging }, drag] = useDrag({
  type: 'OPERATOR',
  item: { id: operator.id, type: 'operator' },
  collect: (monitor) => ({
    isDragging: monitor.isDragging(),
  }),
});

return <div ref={drag}>Draggable Item</div>;
```

## 🔧 Configuration Files

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
});
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 🎯 Type Definitions

### Common Types

```typescript
// Operator
interface Operator {
  id: string;
  name: string;
  skills: string[];
  availability: 'available' | 'busy' | 'offline';
  currentWorkOrderId?: string;
}

// Work Order
interface WorkOrder {
  id: string;
  productName: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  requiredSkills: string[];
  estimatedDuration: number;
  deadline: Date;
}

// Allocation
interface Allocation {
  id: string;
  workOrderId: string;
  operators: Operator[];
  machines: Machine[];
  startTime: Date;
  status: 'active' | 'completed' | 'cancelled';
}
```

## 🎨 CSS Variables

```css
:root {
  /* Colors */
  --primary-color: #667eea;
  --primary-hover: #5568d3;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --info-color: #3b82f6;
  
  /* Text */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  
  /* Background */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-hover: #f3f4f6;
  
  /* Borders */
  --border-color: #e5e7eb;
  --border-radius: 8px;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

## 📊 State Structure

```typescript
interface StoreState {
  // Resources
  operators: Operator[];
  machines: Machine[];
  materials: Material[];
  workOrders: WorkOrder[];
  
  // Allocations
  allocations: Allocation[];
  
  // Metrics
  metrics: DashboardMetrics;
  
  // Alerts
  alerts: Alert[];
  
  // Actions
  addOperator: (operator: Operator) => void;
  updateOperator: (id: string, updates: Partial<Operator>) => void;
  removeOperator: (id: string) => void;
  // ... more actions
}
```

## 🔍 Debugging

### React DevTools
```bash
# Install extension
# Chrome: React Developer Tools
# Firefox: React Developer Tools
```

### Console Logging
```typescript
// Development only
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}

// With grouping
console.group('Allocation Process');
console.log('Work Order:', workOrder);
console.log('Selected Operators:', operators);
console.groupEnd();
```

### Network Debugging
```typescript
// Axios interceptor example
apiClient.interceptors.request.use((config) => {
  console.log('API Request:', config);
  return config;
});
```

## 🧪 Testing Patterns

### Component Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title correctly', () => {
    render(<MyComponent title="Test" onAction={() => {}} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('calls onAction when button clicked', () => {
    const onAction = jest.fn();
    render(<MyComponent title="Test" onAction={onAction} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
```

## 🚨 Error Handling

### Try-Catch Pattern
```typescript
const handleAction = async () => {
  try {
    const result = await apiCall();
    // Handle success
  } catch (error) {
    console.error('Error:', error);
    // Show error to user
    showAlert({
      type: 'error',
      message: error.message || 'Something went wrong',
    });
  }
};
```

### Error Boundary
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## 📝 Code Style

### Naming Conventions
- Components: `PascalCase` (e.g., `MetricsCards`)
- Functions: `camelCase` (e.g., `handleSubmit`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_OPERATORS`)
- Files: `PascalCase` for components, `camelCase` for utilities

### Import Order
```typescript
// 1. External dependencies
import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';

// 2. Internal dependencies
import { useStore } from '@/store';
import { validateAllocation } from '@/utils/validation';

// 3. Components
import { MetricsCards } from '@/components/MetricsCards';

// 4. Types
import type { Operator, WorkOrder } from '@/types';

// 5. Styles
import './Component.css';
```

## 🔗 Useful Links

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [React DnD](https://react-dnd.github.io/react-dnd/)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Quick Tip**: Bookmark this page for quick reference during development!
