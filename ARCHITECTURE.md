# Architecture Diagrams - Shop-Floor Resource Allocation System

## System Architecture Overview

```mermaid
graph TB
    subgraph "User Interface Layer"
        Browser[Web Browser]
        App[App.tsx<br/>React + DnD Provider]
    end

    subgraph "Feature Layer"
        Dashboard[Dashboard.tsx<br/>Main Container]
    end

    subgraph "Component Layer"
        MetricsCards[MetricsCards<br/>KPI Display]
        WorkOrderPanel[WorkOrderPanel<br/>Work Order List]
        ResourcePanel[ResourcePanel<br/>Operators & Machines]
        AlertBanner[AlertBanner<br/>Notifications]
        AllocationInterface[AllocationInterface<br/>Drag & Drop UI]
    end

    subgraph "State Management"
        Store[Zustand Store<br/>Global State]
    end

    subgraph "Business Logic"
        Validation[Allocation Validation<br/>Rules & Scoring]
        MockData[Mock Data<br/>Development Data]
    end

    subgraph "Type System"
        Types[TypeScript Types<br/>Domain Models]
    end

    Browser --> App
    App --> Dashboard
    Dashboard --> MetricsCards
    Dashboard --> WorkOrderPanel
    Dashboard --> ResourcePanel
    Dashboard --> AlertBanner
    Dashboard --> AllocationInterface
    
    MetricsCards --> Store
    WorkOrderPanel --> Store
    ResourcePanel --> Store
    AlertBanner --> Store
    AllocationInterface --> Store
    AllocationInterface --> Validation
    
    Store --> Types
    Validation --> Types
    MockData --> Store
    
    style App fill:#667eea,color:#fff
    style Dashboard fill:#764ba2,color:#fff
    style Store fill:#10b981,color:#fff
    style Validation fill:#f59e0b,color:#000
```

## Component Hierarchy

```mermaid
graph TD
    App[App.tsx<br/>DnD Provider Wrapper]
    Dashboard[Dashboard<br/>Main Container]
    
    MetricsCards[MetricsCards<br/>4 Metric Cards]
    UtilCard[Utilization Card]
    IdleCard[Idle Resources Card]
    ProdCard[Production Card]
    CompCard[Completion Card]
    
    WorkOrderPanel[WorkOrderPanel<br/>Left Panel]
    WOList[Work Order List]
    WOCard[Work Order Card]
    
    ResourcePanel[ResourcePanel<br/>Right Panel]
    OpTab[Operators Tab]
    MachTab[Machines Tab]
    OpCard[Operator Card]
    MachCard[Machine Card]
    
    AlertBanner[AlertBanner<br/>Top Banner]
    Alert[Alert Item]
    
    AllocationInterface[AllocationInterface<br/>Modal Overlay]
    DragOp[Draggable Operator]
    DragMach[Draggable Machine]
    DropOp[Operator Drop Zone]
    DropMach[Machine Drop Zone]
    
    App --> Dashboard
    Dashboard --> MetricsCards
    Dashboard --> WorkOrderPanel
    Dashboard --> ResourcePanel
    Dashboard --> AlertBanner
    Dashboard --> AllocationInterface
    
    MetricsCards --> UtilCard
    MetricsCards --> IdleCard
    MetricsCards --> ProdCard
    MetricsCards --> CompCard
    
    WorkOrderPanel --> WOList
    WOList --> WOCard
    
    ResourcePanel --> OpTab
    ResourcePanel --> MachTab
    OpTab --> OpCard
    MachTab --> MachCard
    
    AlertBanner --> Alert
    
    AllocationInterface --> DragOp
    AllocationInterface --> DragMach
    AllocationInterface --> DropOp
    AllocationInterface --> DropMach
    
    style App fill:#667eea,color:#fff
    style Dashboard fill:#764ba2,color:#fff
    style AllocationInterface fill:#f59e0b,color:#000
```

## Data Flow Architecture

```mermaid
flowchart LR
    subgraph "User Actions"
        Click[Click Work Order]
        Drag[Drag Resource]
        Drop[Drop on Zone]
        Allocate[Confirm Allocation]
    end
    
    subgraph "UI Components"
        WO[Work Order Panel]
        Res[Resource Panel]
        Modal[Allocation Interface]
    end
    
    subgraph "State Management"
        Store[Zustand Store]
        State[Application State]
    end
    
    subgraph "Business Logic"
        Validate[Validation Engine]
        Match[Resource Matching]
    end
    
    subgraph "Data Updates"
        UpdateWO[Update Work Order]
        UpdateRes[Update Resources]
        UpdateAlloc[Create Allocation]
    end
    
    Click --> WO
    WO --> Store
    Store --> Modal
    
    Drag --> Res
    Res --> Modal
    Drop --> Validate
    
    Validate --> Match
    Match --> State
    
    Allocate --> UpdateWO
    Allocate --> UpdateRes
    Allocate --> UpdateAlloc
    
    UpdateWO --> Store
    UpdateRes --> Store
    UpdateAlloc --> Store
    
    Store --> State
    State --> WO
    State --> Res
    
    style Store fill:#10b981,color:#fff
    style Validate fill:#f59e0b,color:#000
    style Modal fill:#667eea,color:#fff
```

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Initialized: App Start
    
    Initialized --> LoadingData: Load Mock Data
    LoadingData --> Ready: Data Loaded
    
    Ready --> WorkOrderSelected: User Selects WO
    WorkOrderSelected --> AllocationMode: Open Modal
    
    AllocationMode --> DraggingResource: Drag Operator/Machine
    DraggingResource --> Validating: Drop on Zone
    
    Validating --> Invalid: Validation Fails
    Validating --> Valid: Validation Passes
    
    Invalid --> AllocationMode: Show Errors
    Valid --> AllocationMode: Show Success
    
    AllocationMode --> Allocating: User Confirms
    Allocating --> UpdatingState: Create Allocations
    
    UpdatingState --> Ready: Update Store
    Ready --> [*]: Complete
    
    note right of Validating
        Check:
        - Resource count
        - Skills match
        - Capabilities match
        - Availability
    end note
```

## Resource Allocation Process

```mermaid
sequenceDiagram
    actor User
    participant Dashboard
    participant WorkOrderPanel
    participant Store
    participant AllocationInterface
    participant ValidationEngine
    participant DndSystem
    
    User->>WorkOrderPanel: Click Work Order
    WorkOrderPanel->>Store: selectWorkOrder(wo)
    Store->>Dashboard: Update selectedWorkOrder
    Dashboard->>AllocationInterface: Open Modal
    
    AllocationInterface->>Store: Get available operators/machines
    Store-->>AllocationInterface: Return resources
    
    User->>DndSystem: Drag Operator
    DndSystem->>AllocationInterface: onDrop(operator)
    AllocationInterface->>AllocationInterface: Add to assigned
    AllocationInterface->>ValidationEngine: validate(assignments)
    
    ValidationEngine-->>AllocationInterface: Validation result
    
    alt Validation Passed
        AllocationInterface->>User: Show success message
        User->>AllocationInterface: Click Allocate
        AllocationInterface->>Store: createAllocation()
        Store->>Store: Update work order
        Store->>Store: Update operator status
        Store-->>Dashboard: Notify changes
        Dashboard->>User: Refresh UI
    else Validation Failed
        AllocationInterface->>User: Show errors
    end
```

## Type System Relationships

```mermaid
classDiagram
    class WorkOrder {
        +string id
        +string orderNumber
        +WorkOrderStatus status
        +WorkOrderPriority priority
        +WorkOrderRequirements requirements
        +AssignedResources assignedResources
        +Date scheduledStart
        +number progress
    }
    
    class Operator {
        +string id
        +string name
        +ResourceStatus status
        +Skill[] skills
        +string currentWorkOrder
        +number utilizationRate
        +string location
    }
    
    class Machine {
        +string id
        +string name
        +ResourceStatus status
        +MachineCapability[] capabilities
        +string currentWorkOrder
        +number utilizationRate
        +Performance performance
    }
    
    class Allocation {
        +string id
        +string workOrderId
        +string operatorId
        +string machineId
        +AllocationStatus status
        +Date allocatedAt
        +AllocationValidation validation
    }
    
    class AllocationValidation {
        +boolean isValid
        +string[] conflicts
        +string[] warnings
        +string[] suggestions
    }
    
    class DashboardMetrics {
        +UtilizationMetrics utilization
        +IdleTimeMetrics idle
        +ProductionMetrics production
    }
    
    class Alert {
        +string id
        +AlertType type
        +AlertSeverity severity
        +string message
        +Date timestamp
        +boolean acknowledged
    }
    
    WorkOrder "1" --> "*" Allocation: has
    Operator "1" --> "*" Allocation: assigned to
    Machine "1" --> "*" Allocation: assigned to
    Allocation "1" --> "1" AllocationValidation: validates
    
    class AppStore {
        +Operator[] operators
        +Machine[] machines
        +WorkOrder[] workOrders
        +Allocation[] allocations
        +Alert[] alerts
        +DashboardMetrics metrics
        +createAllocation()
        +updateAllocation()
        +removeAllocation()
    }
    
    AppStore --> WorkOrder: manages
    AppStore --> Operator: manages
    AppStore --> Machine: manages
    AppStore --> Allocation: manages
    AppStore --> Alert: manages
    AppStore --> DashboardMetrics: manages
```

## Validation Logic Flow

```mermaid
flowchart TD
    Start[Start Validation] --> CheckOpCount{Operator Count<br/>Sufficient?}
    
    CheckOpCount -->|No| AddConflict1[Add: Insufficient Operators]
    CheckOpCount -->|Yes| CheckSkills{Required Skills<br/>Present?}
    
    CheckSkills -->|No| AddConflict2[Add: Missing Skills]
    CheckSkills -->|Yes| CheckMachCount{Machine Count<br/>Sufficient?}
    
    CheckMachCount -->|No| AddConflict3[Add: Insufficient Machines]
    CheckMachCount -->|Yes| CheckCap{Required Capabilities<br/>Present?}
    
    CheckCap -->|No| AddConflict4[Add: Missing Capabilities]
    CheckCap -->|Yes| CheckAvail{Resources<br/>Available?}
    
    CheckAvail -->|No| AddConflict5[Add: Unavailable Resources]
    CheckAvail -->|Yes| CheckPerf{Performance<br/>Acceptable?}
    
    CheckPerf -->|Low| AddWarning1[Add: Low Performance Warning]
    CheckPerf -->|Good| CheckLocation{Same<br/>Location?}
    
    CheckLocation -->|No| AddWarning2[Add: Different Zones Warning]
    CheckLocation -->|Yes| CheckUtil{Optimize<br/>Utilization?}
    
    CheckUtil -->|Yes| AddSuggestion[Add: Utilization Suggestions]
    CheckUtil -->|No| Complete
    
    AddConflict1 --> Evaluate
    AddConflict2 --> Evaluate
    AddConflict3 --> Evaluate
    AddConflict4 --> Evaluate
    AddConflict5 --> Evaluate
    AddWarning1 --> CheckLocation
    AddWarning2 --> CheckUtil
    AddSuggestion --> Complete
    
    Evaluate{Any<br/>Conflicts?}
    Evaluate -->|Yes| Invalid[Return Invalid]
    Evaluate -->|No| Valid[Return Valid]
    
    Invalid --> End[End]
    Valid --> End
    Complete --> Evaluate
    
    style Start fill:#10b981,color:#fff
    style Invalid fill:#ef4444,color:#fff
    style Valid fill:#10b981,color:#fff
    style End fill:#667eea,color:#fff
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev[Local Dev Server<br/>Vite + HMR<br/>Port 3000]
        DevFiles[Source Files<br/>TypeScript + React]
    end
    
    subgraph "Build Process"
        Build[npm run build<br/>TypeScript Compiler<br/>Vite Bundler]
        Dist[dist/ folder<br/>Optimized JS/CSS/HTML]
    end
    
    subgraph "Production Hosting"
        CDN[CDN<br/>Static Assets]
        Server[Web Server<br/>Nginx/Apache]
        Browser2[User Browser]
    end
    
    subgraph "Backend Integration"
        API[REST API<br/>Work Orders, Resources]
        WS[WebSocket<br/>Real-time Updates]
        DB[(Database<br/>Operators, Machines, WO)]
    end
    
    DevFiles --> Dev
    Dev --> Build
    Build --> Dist
    
    Dist --> CDN
    Dist --> Server
    
    CDN --> Browser2
    Server --> Browser2
    
    Browser2 --> API
    Browser2 --> WS
    
    API --> DB
    WS --> DB
    
    style Dev fill:#f59e0b,color:#000
    style Dist fill:#10b981,color:#fff
    style Browser2 fill:#667eea,color:#fff
    style DB fill:#764ba2,color:#fff
```

## Technology Stack

```mermaid
mindmap
  root((Shop-Floor<br/>Resource<br/>Allocation))
    Frontend
      React 18
        JSX Components
        Hooks
        Context
      TypeScript
        Type Safety
        Interfaces
        Generics
      Vite
        Fast Builds
        HMR
        Dev Server
    State Management
      Zustand
        Simple API
        No Boilerplate
        Reactive
    UI Libraries
      React DnD
        Drag & Drop
        HTML5 Backend
      Lucide React
        Icons
      date-fns
        Date Formatting
    Styling
      CSS Modules
        Scoped Styles
      CSS Variables
        Theme System
        Responsive
    Development
      ESLint
        Code Quality
      TypeScript Compiler
        Type Checking
      npm Scripts
        Automation
```

---

## Testing Strategy

```mermaid
graph TB
    subgraph "Testing Pyramid"
        E2E[End-to-End Tests<br/>Playwright/Cypress<br/>Critical User Flows]
        Integration[Integration Tests<br/>React Testing Library<br/>Component Integration]
        Unit[Unit Tests<br/>Vitest/Jest<br/>Business Logic]
    end
    
    subgraph "Test Coverage"
        Components[Component Tests<br/>UI Interactions]
        Store[State Tests<br/>Store Actions]
        Utils[Utility Tests<br/>Validation Logic]
    end
    
    subgraph "Quality Gates"
        Coverage[Code Coverage<br/>85% Target]
        Lint[ESLint<br/>Code Quality]
        Type[TypeScript<br/>Type Safety]
    end
    
    Unit --> Integration
    Integration --> E2E
    
    Components --> Coverage
    Store --> Coverage
    Utils --> Coverage
    
    Coverage --> Lint
    Lint --> Type
    
    style E2E fill:#ef4444,color:#fff
    style Integration fill:#f59e0b,color:#000
    style Unit fill:#10b981,color:#fff
```

**Testing Tools:**
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing
- **Playwright/Cypress** - E2E testing
- **MSW (Mock Service Worker)** - API mocking
- **@testing-library/user-event** - User interaction simulation

**Test Commands:**
```bash
npm run test              # Run unit tests
npm run test:coverage     # Generate coverage report
npm run test:e2e          # Run end-to-end tests
npm run test:watch        # Watch mode for development
```

---

## Performance Optimization

```mermaid
flowchart LR
    subgraph "Build Optimization"
        CodeSplit[Code Splitting<br/>Route-based]
        TreeShake[Tree Shaking<br/>Remove Unused]
        Minify[Minification<br/>Terser]
    end
    
    subgraph "Runtime Optimization"
        Memo[React.memo<br/>Prevent Re-renders]
        Lazy[Lazy Loading<br/>Dynamic Imports]
        Virtual[Virtual Scrolling<br/>Large Lists]
    end
    
    subgraph "Asset Optimization"
        ImageOpt[Image Optimization<br/>WebP, Lazy Load]
        CSSMin[CSS Minification<br/>PostCSS]
        FontOpt[Font Optimization<br/>WOFF2]
    end
    
    subgraph "Monitoring"
        Metrics[Web Vitals<br/>LCP, FID, CLS]
        Bundle[Bundle Analysis<br/>Size Tracking]
        Perf[Performance API<br/>Timing Metrics]
    end
    
    CodeSplit --> Memo
    TreeShake --> Lazy
    Minify --> Virtual
    
    ImageOpt --> Metrics
    CSSMin --> Bundle
    FontOpt --> Perf
    
    style Metrics fill:#10b981,color:#fff
    style Bundle fill:#f59e0b,color:#000
```

**Performance Targets:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Total Bundle Size: < 300KB (gzipped)
- Resource Utilization Update: < 100ms

---

## Security Best Practices

```mermaid
mindmap
  root((Security))
    Authentication
      JWT Tokens
      Session Management
      Role-Based Access
      Multi-Factor Auth
    Data Protection
      Input Validation
      XSS Prevention
      CSRF Protection
      Content Security Policy
    API Security
      HTTPS Only
      Rate Limiting
      CORS Configuration
      API Key Management
    Code Security
      Dependency Scanning
      npm audit
      Secrets Management
      Environment Variables
```

**Security Checklist:**
- ✅ Validate all user inputs
- ✅ Sanitize data before rendering
- ✅ Use HTTPS in production
- ✅ Implement CSP headers
- ✅ Regular dependency updates
- ✅ Secure credential storage
- ✅ Rate limiting on API calls
- ✅ Audit logging for critical actions

**Security Commands:**
```bash
npm audit                 # Check for vulnerabilities
npm audit fix             # Auto-fix security issues
npm audit fix --force     # Force fix breaking changes
```

---

## Accessibility Standards (WCAG 2.1 AA)

```mermaid
graph LR
    subgraph "Perceivable"
        Alt[Alternative Text<br/>Images & Icons]
        Color[Color Contrast<br/>4.5:1 Ratio]
        Text[Text Scaling<br/>Up to 200%]
    end
    
    subgraph "Operable"
        Keyboard[Keyboard Navigation<br/>Tab, Arrow Keys]
        Focus[Focus Management<br/>Visible Indicators]
        Time[Time Adjustable<br/>No Auto-timeouts]
    end
    
    subgraph "Understandable"
        Labels[Clear Labels<br/>Form Inputs]
        Error[Error Messages<br/>Descriptive]
        Consistent[Consistent UI<br/>Predictable]
    end
    
    subgraph "Robust"
        Semantic[Semantic HTML<br/>Proper Tags]
        ARIA[ARIA Attributes<br/>Screen Readers]
        Valid[Valid Markup<br/>No Errors]
    end
    
    style Keyboard fill:#667eea,color:#fff
    style ARIA fill:#10b981,color:#fff
```

**Accessibility Features:**
- Semantic HTML elements
- ARIA labels for screen readers
- Keyboard navigation support
- Focus trap in modals
- Color contrast compliance
- Text alternatives for visual content
- Skip navigation links

---

## Required Skills & Tools

### Developer Skills

**Frontend Development:**
- ✅ React 18 (Hooks, Context, Performance)
- ✅ TypeScript (Advanced types, Generics, Interfaces)
- ✅ Modern CSS (Flexbox, Grid, Variables, Animations)
- ✅ Responsive Design (Mobile-first, Media queries)
- ✅ HTML5 (Semantic markup, Accessibility)

**State Management:**
- ✅ Zustand (Store creation, Actions, Selectors)
- ✅ React Hooks (useState, useEffect, useMemo, useCallback)
- ✅ State patterns (Global vs Local state)

**Development Tools:**
- ✅ Git (Version control, Branching, Pull requests)
- ✅ VS Code (Extensions, Debugging, IntelliSense)
- ✅ npm/yarn (Package management, Scripts)
- ✅ Chrome DevTools (Debugging, Performance profiling)

**Testing:**
- ✅ Unit testing (Jest/Vitest)
- ✅ Component testing (React Testing Library)
- ✅ E2E testing (Playwright/Cypress)

**Design Patterns:**
- ✅ Component composition
- ✅ Custom hooks
- ✅ HOC (Higher-Order Components)
- ✅ Render props
- ✅ Container/Presentational pattern

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "streetsidesoftware.code-spell-checker",
    "eamodio.gitlens",
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets",
    "bierner.markdown-mermaid",
    "yzhang.markdown-all-in-one",
    "christian-kohler.path-intellisense",
    "wix.vscode-import-cost",
    "pflannery.vscode-versionlens",
    "usernamehw.errorlens"
  ]
}
```

---

## CI/CD Pipeline

```mermaid
flowchart LR
    subgraph "Development"
        Commit[Git Commit]
        Push[Push to Branch]
    end
    
    subgraph "CI Pipeline"
        Lint[ESLint Check]
        Type[Type Check]
        Test[Run Tests]
        Build[Build Project]
    end
    
    subgraph "Quality Gates"
        Coverage[Coverage > 85%]
        Audit[Security Audit]
        Bundle[Bundle Size Check]
    end
    
    subgraph "Deployment"
        Preview[Preview Deploy]
        Production[Production Deploy]
        CDN[CDN Upload]
    end
    
    Commit --> Push
    Push --> Lint
    Lint --> Type
    Type --> Test
    Test --> Build
    
    Build --> Coverage
    Coverage --> Audit
    Audit --> Bundle
    
    Bundle --> Preview
    Preview --> Production
    Production --> CDN
    
    style Test fill:#10b981,color:#fff
    style Production fill:#667eea,color:#fff
```

**GitHub Actions Workflow:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

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
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - uses: actions/deploy-pages@v2
```

---

## Error Handling Strategy

```mermaid
stateDiagram-v2
    [*] --> Normal: App Running
    
    Normal --> Error: Exception Thrown
    
    Error --> UserError: User Input Error
    Error --> NetworkError: API Failure
    Error --> SystemError: System Failure
    
    UserError --> ShowMessage: Display Friendly Message
    NetworkError --> Retry: Retry Logic
    SystemError --> ErrorBoundary: Catch & Report
    
    ShowMessage --> Normal: User Corrects
    Retry --> Normal: Success
    Retry --> ShowFallback: Max Retries
    ErrorBoundary --> ShowFallback: Render Fallback UI
    
    ShowFallback --> [*]: Manual Recovery
```

**Error Handling Patterns:**

1. **User Input Errors** - Inline validation with helpful messages
2. **Network Errors** - Retry with exponential backoff
3. **System Errors** - Error boundaries with fallback UI
4. **Async Errors** - Try-catch with user notifications
5. **State Errors** - State validation and recovery

Example Error Boundary:
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log to monitoring service
    console.error('Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## Browser & Device Support

```mermaid
graph TB
    subgraph "Desktop Browsers"
        Chrome[Chrome 90+<br/>✅ Full Support]
        Firefox[Firefox 88+<br/>✅ Full Support]
        Safari[Safari 14+<br/>✅ Full Support]
        Edge[Edge 90+<br/>✅ Full Support]
    end
    
    subgraph "Mobile/Tablet"
        iOS[iOS Safari 14+<br/>✅ Optimized]
        Android[Android Chrome 90+<br/>✅ Optimized]
        iPad[iPad Safari<br/>✅ Touch Optimized]
    end
    
    subgraph "Features"
        Touch[Touch Events<br/>Drag & Drop]
        Responsive[Responsive Design<br/>Breakpoints]
        PWA[PWA Ready<br/>Offline Capable]
    end
    
    Chrome --> Touch
    iOS --> Touch
    Android --> Touch
    
    Safari --> Responsive
    iPad --> Responsive
    
    Edge --> PWA
    Firefox --> PWA
    
    style Chrome fill:#10b981,color:#fff
    style iOS fill:#667eea,color:#fff
```

**Supported Resolutions:**
- Desktop: 1920x1080, 1366x768, 1440x900
- Tablet: 1024x768 (iPad), 800x600
- Mobile: 375x667 (iPhone), 360x640 (Android)

**Touch Optimization:**
- Minimum touch target: 44x44px
- Swipe gestures supported
- Touch-friendly drag and drop
- Optimized tap delays

---

## API Integration Patterns

```mermaid
sequenceDiagram
    participant UI as UI Component
    participant Store as Zustand Store
    participant API as API Client
    participant Cache as Local Cache
    participant Backend as Backend API
    
    UI->>Store: Request Data
    Store->>Cache: Check Cache
    
    alt Cache Hit
        Cache-->>Store: Return Cached Data
        Store-->>UI: Display Data
    else Cache Miss
        Store->>API: Fetch from API
        API->>Backend: HTTP Request
        Backend-->>API: Response
        API->>Cache: Update Cache
        API-->>Store: Return Data
        Store-->>UI: Display Data
    end
    
    Note over Store,Backend: Error Handling & Retry Logic
```

**API Client Template:**
```typescript
// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Monitoring & Observability

```mermaid
graph TB
    subgraph "Frontend Monitoring"
        Analytics[Google Analytics<br/>User Behavior]
        Sentry[Sentry<br/>Error Tracking]
        Vitals[Web Vitals<br/>Performance]
    end
    
    subgraph "Application Logs"
        Console[Console Logs<br/>Development]
        Remote[Remote Logging<br/>Production]
        Metrics[Custom Metrics<br/>Business KPIs]
    end
    
    subgraph "Alerting"
        Error[Error Alerts<br/>Slack/Email]
        Perf[Performance Alerts<br/>Degradation]
        Business[Business Alerts<br/>Critical Events]
    end
    
    Analytics --> Remote
    Sentry --> Error
    Vitals --> Perf
    Metrics --> Business
    
    style Sentry fill:#ef4444,color:#fff
    style Vitals fill:#10b981,color:#fff
```

**Monitoring Tools:**
- **Sentry** - Error tracking and reporting
- **Google Analytics** - User behavior analytics
- **Lighthouse** - Performance auditing
- **Web Vitals** - Core performance metrics
- **Custom Metrics** - Business-specific tracking

**Key Metrics to Track:**
- User session duration
- Allocation success rate
- Resource utilization trends
- Error frequency and types
- Page load times
- API response times

---

## Setup & Prerequisites

### System Requirements

**Required:**
- Node.js 18.x or higher
- npm 9.x or higher
- Git 2.x or higher
- 4GB RAM minimum
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)

**Optional:**
- VS Code with recommended extensions
- Docker for containerization
- Postman for API testing

### Environment Setup

1. **Install Node.js:**
```bash
# Windows (using Chocolatey)
choco install nodejs

# macOS (using Homebrew)
brew install node

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Clone Repository:**
```bash
git clone <repository-url>
cd Shop-Floor-Resource-Allocation
```

3. **Install Dependencies:**
```bash
npm install
```

4. **Configure Environment:**
```bash
# Create .env file
cp .env.example .env

# Edit .env with your configuration
VITE_API_URL=https://api.example.com
VITE_WS_URL=wss://api.example.com
VITE_REFRESH_INTERVAL=5000
```

5. **Start Development:**
```bash
npm run dev
```

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and test
npm run dev
npm run test
npm run lint

# Commit changes
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature
```

---

## Code Quality Tools

```mermaid
graph LR
    subgraph "Linting"
        ESLint[ESLint<br/>Code Quality]
        StyleLint[StyleLint<br/>CSS Linting]
    end
    
    subgraph "Formatting"
        Prettier[Prettier<br/>Code Formatting]
        EditorConfig[EditorConfig<br/>Editor Settings]
    end
    
    subgraph "Git Hooks"
        Husky[Husky<br/>Git Hook Manager]
        LintStaged[lint-staged<br/>Pre-commit Checks]
    end
    
    subgraph "Type Checking"
        TSC[TypeScript Compiler<br/>Type Validation]
    end
    
    ESLint --> Husky
    Prettier --> LintStaged
    TSC --> LintStaged
    
    style ESLint fill:#667eea,color:#fff
    style Prettier fill:#10b981,color:#fff
```

**Pre-commit Hook Configuration:**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ]
  }
}
```

---

## Legend

- **Purple** - Main application components
- **Green** - State management and validation
- **Orange** - User interaction points
- **Blue** - Data flow and processes
- **Red** - Error states and critical paths

## Quick Reference

### Essential Commands
```bash
npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript check
npm test                 # Run tests
npm run test:coverage    # Test with coverage
npm audit                # Check security
```

### Useful Links
- 📚 [React Documentation](https://react.dev/)
- 📘 [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- 🐻 [Zustand Docs](https://github.com/pmndrs/zustand)
- 🎯 [React DnD](https://react-dnd.github.io/react-dnd/)
- ⚡ [Vite Guide](https://vitejs.dev/guide/)

## Rendering Diagrams

These diagrams can be rendered in:
- **GitHub** - Native mermaid support
- **VS Code** - With Mermaid extension
- **Documentation sites** - GitBook, Docusaurus
- **Online tools** - [mermaid.live](https://mermaid.live)

### To render in VS Code:
1. Install "Markdown Preview Mermaid Support" extension
2. Open this file
3. Press `Ctrl+Shift+V` (Windows/Linux) or `Cmd+Shift+V` (macOS)
