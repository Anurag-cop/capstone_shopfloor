# API Integration Guide

Guide for integrating the Shop Floor Resource Allocation System with a backend API.

## Table of Contents

- [Overview](#overview)
- [API Client Setup](#api-client-setup)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Real-time Updates](#real-time-updates)
- [Migration from Mock Data](#migration-from-mock-data)
- [Testing](#testing)

---

## Overview

Currently, the application uses mock data for development. This guide explains how to integrate with a real backend API.

### Architecture

```
Frontend (React)
    ↓
API Client (Axios)
    ↓
Backend API (RESTful)
    ↓
Database
```

### Prerequisites

- Backend API URL
- Authentication method (JWT, OAuth, API Key)
- API documentation
- CORS configuration on backend

---

## API Client Setup

### 1. Install Dependencies

```bash
npm install axios
npm install @tanstack/react-query  # For data fetching and caching
```

### 2. Create API Client

Create `src/api/client.ts`:

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          window.location.href = '/login';
        }
        if (error.response?.status === 403) {
          // Handle forbidden
          console.error('Access forbidden');
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic methods
  async get<T>(url: string, params?: any): Promise<T> {
    return this.client.get(url, { params });
  }

  async post<T>(url: string, data: any): Promise<T> {
    return this.client.post(url, data);
  }

  async put<T>(url: string, data: any): Promise<T> {
    return this.client.put(url, data);
  }

  async patch<T>(url: string, data: any): Promise<T> {
    return this.client.patch(url, data);
  }

  async delete<T>(url: string): Promise<T> {
    return this.client.delete(url);
  }
}

export const apiClient = new ApiClient();
```

---

## Authentication

### JWT Authentication Flow

```typescript
// src/api/auth.ts
import { apiClient } from './client';

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Store token
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', {});
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  async refreshToken(): Promise<string> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh', {});
    localStorage.setItem('authToken', response.token);
    return response.token;
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },
};
```

---

## API Endpoints

### Resource Endpoints

Create `src/api/resources.ts`:

```typescript
import { apiClient } from './client';
import type { Operator, Machine, Material, WorkOrder, Allocation } from '@/types';

// Operators
export const operatorsApi = {
  getAll: () => apiClient.get<Operator[]>('/operators'),
  
  getById: (id: string) => apiClient.get<Operator>(`/operators/${id}`),
  
  create: (operator: Omit<Operator, 'id'>) =>
    apiClient.post<Operator>('/operators', operator),
  
  update: (id: string, updates: Partial<Operator>) =>
    apiClient.patch<Operator>(`/operators/${id}`, updates),
  
  delete: (id: string) => apiClient.delete(`/operators/${id}`),
};

// Machines
export const machinesApi = {
  getAll: () => apiClient.get<Machine[]>('/machines'),
  
  getById: (id: string) => apiClient.get<Machine>(`/machines/${id}`),
  
  create: (machine: Omit<Machine, 'id'>) =>
    apiClient.post<Machine>('/machines', machine),
  
  update: (id: string, updates: Partial<Machine>) =>
    apiClient.patch<Machine>(`/machines/${id}`, updates),
  
  delete: (id: string) => apiClient.delete(`/machines/${id}`),
};

// Work Orders
export const workOrdersApi = {
  getAll: (params?: { status?: string; priority?: string }) =>
    apiClient.get<WorkOrder[]>('/work-orders', params),
  
  getById: (id: string) => apiClient.get<WorkOrder>(`/work-orders/${id}`),
  
  create: (workOrder: Omit<WorkOrder, 'id'>) =>
    apiClient.post<WorkOrder>('/work-orders', workOrder),
  
  update: (id: string, updates: Partial<WorkOrder>) =>
    apiClient.patch<WorkOrder>(`/work-orders/${id}`, updates),
  
  delete: (id: string) => apiClient.delete(`/work-orders/${id}`),
};

// Allocations
export const allocationsApi = {
  getAll: () => apiClient.get<Allocation[]>('/allocations'),
  
  getById: (id: string) => apiClient.get<Allocation>(`/allocations/${id}`),
  
  create: (allocation: Omit<Allocation, 'id'>) =>
    apiClient.post<Allocation>('/allocations', allocation),
  
  update: (id: string, updates: Partial<Allocation>) =>
    apiClient.patch<Allocation>(`/allocations/${id}`, updates),
  
  delete: (id: string) => apiClient.delete(`/allocations/${id}`),
  
  validate: (allocation: Omit<Allocation, 'id'>) =>
    apiClient.post<{ isValid: boolean; errors: string[] }>(
      '/allocations/validate',
      allocation
    ),
};

// Metrics
export const metricsApi = {
  getDashboard: () =>
    apiClient.get<{
      activeOperators: number;
      activeMachines: number;
      activeWorkOrders: number;
      utilization: number;
    }>('/metrics/dashboard'),
};
```

---

## Data Models

### Request/Response Types

```typescript
// src/api/types.ts

// List response with pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// API error response
export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Success response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Query parameters
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}
```

---

## Error Handling

### Custom Error Handler

```typescript
// src/api/errorHandler.ts
import { AxiosError } from 'axios';
import type { ApiError } from './types';

export class ApiException extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    
    throw new ApiException(
      apiError?.statusCode || error.response?.status || 500,
      apiError?.message || error.message || 'An error occurred',
      apiError?.errors
    );
  }
  
  throw new Error('An unexpected error occurred');
}

// Usage in component
try {
  await operatorsApi.create(newOperator);
} catch (error) {
  handleApiError(error);
}
```

### User-Friendly Error Messages

```typescript
// src/utils/errorMessages.ts
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiException) {
    switch (error.statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Please log in to continue.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message;
    }
  }
  return 'An unexpected error occurred.';
};
```

---

## Real-time Updates

### WebSocket Integration

```typescript
// src/api/websocket.ts
import { useEffect } from 'react';
import { useStore } from '@/store';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  connect(token: string) {
    this.ws = new WebSocket(`${WS_URL}?token=${token}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(token);
    };
  }

  private handleMessage(message: any) {
    const { type, data } = message;

    switch (type) {
      case 'OPERATOR_UPDATED':
        useStore.getState().updateOperator(data.id, data);
        break;
      case 'WORK_ORDER_UPDATED':
        useStore.getState().updateWorkOrder(data.id, data);
        break;
      case 'ALLOCATION_CREATED':
        useStore.getState().addAllocation(data);
        break;
      case 'METRICS_UPDATED':
        useStore.getState().updateMetrics(data);
        break;
      default:
        console.warn('Unknown message type:', type);
    }
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(token), this.reconnectDelay);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

export const wsClient = new WebSocketClient();

// React hook for WebSocket
export function useWebSocket() {
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      wsClient.connect(token);
    }

    return () => {
      wsClient.disconnect();
    };
  }, []);
}
```

---

## Migration from Mock Data

### Step-by-Step Migration

#### 1. Update Environment Variables

```bash
# .env.development
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_ENABLE_MOCK_DATA=false

# .env.production
VITE_API_URL=https://api.production.com/v1
VITE_WS_URL=wss://api.production.com
VITE_ENABLE_MOCK_DATA=false
```

#### 2. Update Store with API Calls

```typescript
// src/store/index.ts
import { operatorsApi, machinesApi, workOrdersApi } from '@/api/resources';

export const useStore = create<StoreState>((set, get) => ({
  // ... existing state

  // Update action to use API
  fetchOperators: async () => {
    try {
      const operators = await operatorsApi.getAll();
      set({ operators });
    } catch (error) {
      console.error('Failed to fetch operators:', error);
    }
  },

  addOperator: async (operator: Omit<Operator, 'id'>) => {
    try {
      const newOperator = await operatorsApi.create(operator);
      set((state) => ({
        operators: [...state.operators, newOperator],
      }));
    } catch (error) {
      console.error('Failed to add operator:', error);
      throw error;
    }
  },

  updateOperator: async (id: string, updates: Partial<Operator>) => {
    try {
      const updatedOperator = await operatorsApi.update(id, updates);
      set((state) => ({
        operators: state.operators.map((op) =>
          op.id === id ? updatedOperator : op
        ),
      }));
    } catch (error) {
      console.error('Failed to update operator:', error);
      throw error;
    }
  },

  // ... more actions
}));
```

#### 3. Update Components

```typescript
// src/features/dashboard/Dashboard.tsx
import { useEffect } from 'react';
import { useStore } from '@/store';
import { useWebSocket } from '@/api/websocket';

export const Dashboard: React.FC = () => {
  const fetchOperators = useStore((state) => state.fetchOperators);
  const fetchMachines = useStore((state) => state.fetchMachines);
  const fetchWorkOrders = useStore((state) => state.fetchWorkOrders);
  
  // Connect to WebSocket for real-time updates
  useWebSocket();

  useEffect(() => {
    // Fetch initial data
    fetchOperators();
    fetchMachines();
    fetchWorkOrders();
  }, []);

  // ... rest of component
};
```

#### 4. Add Loading States

```typescript
interface StoreState {
  // ... existing state
  loading: {
    operators: boolean;
    machines: boolean;
    workOrders: boolean;
  };
  
  fetchOperators: async () => {
    set((state) => ({
      loading: { ...state.loading, operators: true },
    }));
    
    try {
      const operators = await operatorsApi.getAll();
      set({ operators });
    } finally {
      set((state) => ({
        loading: { ...state.loading, operators: false },
      }));
    }
  };
}
```

#### 5. Gradual Migration Strategy

```typescript
// src/config/featureFlags.ts
export const FEATURE_FLAGS = {
  USE_MOCK_OPERATORS: import.meta.env.VITE_MOCK_OPERATORS === 'true',
  USE_MOCK_MACHINES: import.meta.env.VITE_MOCK_MACHINES === 'true',
  USE_MOCK_WORK_ORDERS: import.meta.env.VITE_MOCK_WORK_ORDERS === 'true',
};

// In store
fetchOperators: async () => {
  if (FEATURE_FLAGS.USE_MOCK_OPERATORS) {
    set({ operators: mockOperators });
    return;
  }
  
  const operators = await operatorsApi.getAll();
  set({ operators });
};
```

---

## Testing

### Mock API Responses

```typescript
// src/api/__mocks__/resources.ts
import { vi } from 'vitest';
import { mockOperators } from '@/utils/mockData';

export const operatorsApi = {
  getAll: vi.fn().mockResolvedValue(mockOperators),
  getById: vi.fn().mockResolvedValue(mockOperators[0]),
  create: vi.fn().mockResolvedValue({ ...mockOperators[0], id: 'new-id' }),
  update: vi.fn().mockResolvedValue(mockOperators[0]),
  delete: vi.fn().mockResolvedValue(undefined),
};
```

### Integration Tests

```typescript
// src/api/__tests__/operators.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { operatorsApi } from '../resources';

const server = setupServer(
  rest.get('/api/operators', (req, res, ctx) => {
    return res(ctx.json([{ id: '1', name: 'John Doe' }]));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('operatorsApi', () => {
  it('fetches operators successfully', async () => {
    const operators = await operatorsApi.getAll();
    expect(operators).toHaveLength(1);
    expect(operators[0].name).toBe('John Doe');
  });
});
```

---

## Example: Complete Flow

### Creating an Allocation

```typescript
// In component
const handleCreateAllocation = async (data: AllocationFormData) => {
  try {
    // 1. Validate allocation locally
    const validation = validateAllocation(data);
    if (!validation.isValid) {
      showErrors(validation.errors);
      return;
    }

    // 2. Validate with backend
    const serverValidation = await allocationsApi.validate(data);
    if (!serverValidation.isValid) {
      showErrors(serverValidation.errors);
      return;
    }

    // 3. Create allocation
    const allocation = await allocationsApi.create(data);

    // 4. Update local state
    useStore.getState().addAllocation(allocation);

    // 5. Show success message
    showSuccess('Allocation created successfully');

    // 6. Refresh metrics
    const metrics = await metricsApi.getDashboard();
    useStore.getState().updateMetrics(metrics);

  } catch (error) {
    const message = getErrorMessage(error);
    showError(message);
  }
};
```

---

## Best Practices

1. **Use React Query** for better caching and synchronization
2. **Implement retry logic** for failed requests
3. **Add request cancellation** for pending requests
4. **Use optimistic updates** for better UX
5. **Implement proper error boundaries**
6. **Add request/response logging** in development
7. **Set appropriate timeout values**
8. **Handle offline scenarios**
9. **Implement request deduplication**
10. **Use TypeScript** for type-safe API calls

---

## Resources

- [Axios Documentation](https://axios-http.com/)
- [React Query](https://tanstack.com/query/latest)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [MSW (Mock Service Worker)](https://mswjs.io/)

---

**Last Updated**: 2024
