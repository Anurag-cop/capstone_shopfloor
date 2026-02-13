# Contributing Guide

Thank you for considering contributing to the Shop Floor Resource Allocation System! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

We expect all contributors to:
- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

Before you begin, ensure you have:
- Node.js 18.x or higher
- npm 9.x or higher
- Git installed
- VS Code (recommended) with suggested extensions

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork:**
```bash
git clone https://github.com/YOUR_USERNAME/Shop-Floor-Resource-Allocation.git
cd Shop-Floor-Resource-Allocation
```

3. **Add upstream remote:**
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/Shop-Floor-Resource-Allocation.git
```

4. **Install dependencies:**
```bash
npm install
```

5. **Create environment file:**
```bash
cp .env.example .env
```

6. **Start development server:**
```bash
npm run dev
```

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Add/update tests as needed
- Update documentation if required

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run type checker
npm run type-check

# Run tests (when implemented)
npm test

# Build the project
npm run build
```

### 4. Commit Your Changes

Follow the commit message format (see below):

```bash
git add .
git commit -m "feat: add operator availability dashboard"
```

### 5. Keep Your Branch Updated

Regularly sync with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

- Go to GitHub and create a Pull Request
- Fill out the PR template completely
- Link related issues
- Request review from maintainers

## Coding Standards

### TypeScript/JavaScript

**Naming Conventions:**
- **Components:** PascalCase (e.g., `MetricsCards`, `AllocationInterface`)
- **Files:** PascalCase for components, camelCase for utilities
- **Functions:** camelCase (e.g., `validateAllocation`, `handleSubmit`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_OPERATORS`)
- **Interfaces/Types:** PascalCase with descriptive names

**Code Style:**
- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at end of statements
- Maximum line length: 100 characters
- Use arrow functions for callbacks
- Prefer `const` over `let`, avoid `var`
- Use template literals for string concatenation

**React Patterns:**
```typescript
// ✅ Good: Functional component with TypeScript
interface Props {
  title: string;
  onClose: () => void;
}

const MyComponent: React.FC<Props> = ({ title, onClose }) => {
  const [state, setState] = useState<string>('');
  
  return <div>{title}</div>;
};

// ❌ Avoid: Class components (unless absolutely necessary)
class MyComponent extends React.Component { }
```

**State Management:**
```typescript
// ✅ Good: Use Zustand for global state
const useStore = create<StoreState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
}));

// ✅ Good: Use React hooks for local state
const [localState, setLocalState] = useState<string>('');
```

**Type Safety:**
```typescript
// ✅ Good: Explicit types
interface User {
  id: string;
  name: string;
  role: 'admin' | 'operator' | 'manager';
}

const getUser = (id: string): User | null => {
  // implementation
};

// ❌ Avoid: Using 'any'
const getData = (): any => { }; // Don't do this
```

### CSS

**Organization:**
- One CSS file per component
- Use CSS variables for theme values
- Follow BEM naming convention (optional but recommended)
- Mobile-first responsive design

**CSS Variables:**
```css
:root {
  --primary-color: #667eea;
  --text-color: #1f2937;
  --spacing-md: 16px;
}

.component {
  color: var(--text-color);
  padding: var(--spacing-md);
}
```

**Responsive Design:**
```css
/* Mobile first */
.container {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
  }
}
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes
- `build:` - Build system changes

**Examples:**

```bash
# Feature
feat(dashboard): add real-time metrics update

# Bug fix
fix(allocation): resolve validation error for multi-machine assignments

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(store): simplify state management logic

# Breaking change
feat(api)!: change allocation endpoint structure

BREAKING CHANGE: The allocation API now requires a 'priority' field
```

**Scope Options:**
- `dashboard` - Dashboard components
- `allocation` - Allocation features
- `store` - State management
- `types` - TypeScript types
- `api` - API integration
- `ui` - UI components
- `utils` - Utility functions

## Pull Request Process

### PR Checklist

Before submitting a PR, ensure:

- [ ] Code follows the project's coding standards
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Code builds successfully (`npm run build`)
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventional commits
- [ ] PR description is clear and complete
- [ ] Screenshots included for UI changes
- [ ] Related issues are linked

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks** - CI pipeline must pass
2. **Code Review** - At least one approval required
3. **Testing** - Reviewers will test your changes
4. **Feedback** - Address review comments
5. **Merge** - Maintainer will merge when approved

## Testing Guidelines

### Unit Tests

Test individual functions and components:

```typescript
import { validateAllocation } from './allocationValidation';

describe('validateAllocation', () => {
  it('should validate operator skills match work order requirements', () => {
    const allocation = createMockAllocation();
    const result = validateAllocation(allocation);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('should fail when operator lacks required skills', () => {
    const allocation = createInvalidAllocation();
    const result = validateAllocation(allocation);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Missing required skill');
  });
});
```

### Component Tests

Test React components with React Testing Library:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MetricsCards } from './MetricsCards';

describe('MetricsCards', () => {
  it('should display all metrics correctly', () => {
    const metrics = createMockMetrics();
    render(<MetricsCards metrics={metrics} />);
    
    expect(screen.getByText('Active Operators')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
  
  it('should call onRefresh when refresh button is clicked', () => {
    const onRefresh = jest.fn();
    render(<MetricsCards onRefresh={onRefresh} />);
    
    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

Test component interactions and data flow.

### E2E Tests

Test complete user workflows (to be implemented with Playwright/Cypress).

## Documentation

### Code Documentation

- Add JSDoc comments for functions and components
- Explain complex logic with inline comments
- Keep comments concise and up-to-date

```typescript
/**
 * Validates a resource allocation against business rules
 * @param allocation - The allocation to validate
 * @returns Validation result with errors and warnings
 */
export function validateAllocation(
  allocation: Allocation
): AllocationValidation {
  // Implementation
}
```

### Component Documentation

Document component props and usage:

```typescript
/**
 * MetricsCards - Displays key performance indicators
 * 
 * @example
 * ```tsx
 * <MetricsCards 
 *   metrics={dashboardMetrics} 
 *   onRefresh={handleRefresh}
 * />
 * ```
 */
interface MetricsCardsProps {
  /** Dashboard metrics to display */
  metrics: DashboardMetrics;
  /** Callback when refresh is requested */
  onRefresh?: () => void;
}
```

### README Updates

Update README.md when:
- Adding new features
- Changing setup process
- Modifying configuration
- Adding dependencies

## Questions?

If you have questions:
- Check existing documentation
- Search closed issues
- Ask in discussions
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

Thank you for contributing! 🎉
