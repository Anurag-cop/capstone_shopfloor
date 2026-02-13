# Implementation Guide

## Shop-Floor Resource Allocation System

This guide will help you get the system up and running.

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Modern web browser (Chrome, Firefox, Edge, Safari)

## Installation

1. **Install Dependencies**

```bash
npm install
```

2. **Start Development Server**

```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

3. **Build for Production**

```bash
npm run build
```

4. **Preview Production Build**

```bash
npm run preview
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── AlertBanner.tsx   # Alert notifications display
│   ├── MetricsCards.tsx  # Key performance metrics
│   ├── WorkOrderPanel.tsx # Work order list and details
│   ├── ResourcePanel.tsx  # Operator and machine lists
│   └── AllocationInterface.tsx # Drag-and-drop allocation UI
│
├── features/            # Feature modules
│   └── dashboard/       # Main dashboard feature
│       ├── Dashboard.tsx
│       └── Dashboard.css
│
├── store/              # State management (Zustand)
│   └── index.ts        # Central application state
│
├── types/              # TypeScript type definitions
│   └── index.ts        # All domain types
│
├── utils/              # Utility functions
│   ├── mockData.ts     # Mock data for development
│   └── allocationValidation.ts # Validation logic
│
├── styles/             # Global styles
│   └── global.css      # CSS variables and utilities
│
├── App.tsx             # Root component
└── main.tsx            # Application entry point
```

## Key Features Implemented

### 1. Dashboard Overview
- Real-time metrics display (utilization, idle time, production throughput)
- Status summary cards with trend indicators
- Color-coded visual feedback

### 2. Work Order Management
- Sortable work order list by priority and status
- Progress tracking for active orders
- Resource requirement display
- Quick status filtering

### 3. Resource Management
- Tabbed interface for operators and machines
- Status filtering (available, busy, maintenance, offline)
- Utilization rate indicators
- Skill and capability display
- Location and shift information

### 4. Allocation Interface
- Drag-and-drop resource assignment
- Real-time validation feedback
- Requirement matching
- Conflict detection
- Optimization suggestions

### 5. Alert System
- Priority-based alert notifications
- Action-required filtering
- Acknowledgement and dismissal
- Severity indicators (critical, error, warning, info)

## Core Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **React DnD** - Drag and drop functionality
- **Lucide React** - Icon library
- **date-fns** - Date formatting

## State Management

The application uses Zustand for centralized state management:

```typescript
// Access state and actions
const { 
  operators, 
  machines, 
  workOrders,
  createAllocation,
  updateOperatorStatus 
} = useAppStore();
```

### Key State Actions:

- `createAllocation()` - Assign resources to work orders
- `updateAllocation()` - Modify existing allocations
- `removeAllocation()` - Unassign resources
- `updateOperatorStatus()` - Change operator availability
- `updateMachineStatus()` - Change machine availability
- `acknowledgeAlert()` - Mark alerts as seen
- `dismissAlert()` - Remove alerts

## Validation System

The allocation validation system checks:

1. **Resource Count** - Sufficient operators and machines
2. **Skill Matching** - Required skills are available
3. **Capability Matching** - Required machine capabilities
4. **Availability** - Resources are not already assigned
5. **Performance** - Machine efficiency and uptime
6. **Location** - Zone compatibility
7. **Maintenance** - Upcoming maintenance schedules

## Customization

### Adding New Resource Types

1. Define type in `src/types/index.ts`
2. Add to store in `src/store/index.ts`
3. Create component in `src/components/`
4. Add mock data in `src/utils/mockData.ts`

### Modifying Metrics

Update `DashboardMetrics` type and `MetricsCards` component to add/remove metrics.

### Changing Validation Rules

Modify `src/utils/allocationValidation.ts` to adjust validation logic.

## API Integration

To connect to a real backend:

1. **Create API Client**

```typescript
// src/api/client.ts
export const apiClient = {
  getOperators: () => fetch('/api/operators').then(r => r.json()),
  getWorkOrders: () => fetch('/api/work-orders').then(r => r.json()),
  createAllocation: (data) => fetch('/api/allocations', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};
```

2. **Update Store Actions**

Replace mock data usage with API calls in `src/store/index.ts`

3. **Add Real-time Updates**

Use WebSocket or Server-Sent Events for live data:

```typescript
useEffect(() => {
  const ws = new WebSocket('ws://api.example.com/updates');
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    // Update store with real-time data
  };
  return () => ws.close();
}, []);
```

## Performance Optimization

- Components use React.memo for expensive renders
- Virtual scrolling for large resource lists (can be added)
- Debounced search and filter operations
- Lazy loading for modal components

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Color contrast meets WCAG AA standards
- Focus management in modals

## Testing

### Unit Tests (to be added)

```bash
npm run test
```

### E2E Tests (to be added)

```bash
npm run test:e2e
```

## Deployment

### Build Production Bundle

```bash
npm run build
```

Output will be in `/dist` folder.

### Deploy to Hosting

**Vercel:**
```bash
vercel deploy
```

**Netlify:**
```bash
netlify deploy --prod
```

**Docker:**
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
EXPOSE 3000
```

## Environment Variables

Create `.env` file for configuration:

```env
VITE_API_URL=https://api.example.com
VITE_WS_URL=wss://api.example.com
VITE_REFRESH_INTERVAL=5000
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Troubleshooting

### Application Won't Start

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Drag and Drop Not Working

- Ensure React DnD provider is wrapping the app
- Check browser console for errors
- Verify HTML5Backend is imported correctly

### Type Errors

- Run type check: `npm run type-check`
- Ensure all imports use correct paths with `@/` alias

## Next Steps

### Recommended Enhancements

1. **Advanced Scheduling** - Gantt chart view for multi-day planning
2. **Mobile App** - React Native version for shop-floor tablets
3. **AI Suggestions** - ML-based resource optimization
4. **Reporting** - Advanced analytics and custom reports
5. **Integration** - ERP/MES system connectors
6. **Notifications** - Email/SMS alerts for critical events
7. **User Management** - Role-based access control
8. **Audit Log** - Track all allocation changes
9. **Performance Analytics** - Historical trend analysis
10. **Offline Mode** - Progressive Web App capabilities

## Support

For questions or issues:
- Check the [Requirements](./requirements.md) document
- Review component documentation in source files
- Contact the development team

## License

Proprietary - All rights reserved © 2026
