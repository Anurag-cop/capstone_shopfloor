/**
 * Core domain types for Shop-Floor Resource Allocation System
 */

// ============================================================================
// Base Types
// ============================================================================

export type ResourceStatus = 'available' | 'busy' | 'maintenance' | 'offline';
export type WorkOrderStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AllocationStatus = 'proposed' | 'active' | 'completed' | 'cancelled';

// ============================================================================
// Operator Types
// ============================================================================

export interface Skill {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5; // 1=Beginner, 5=Expert
  certificationRequired: boolean;
  certificationExpiry?: Date;
}

export interface Operator {
  id: string;
  name: string;
  employeeId: string;
  status: ResourceStatus;
  skills: Skill[];
  currentWorkOrder?: string; // Work order ID if assigned
  shift: 'morning' | 'afternoon' | 'night';
  location: string; // Shop floor zone
  availability: {
    start: Date;
    end: Date;
  };
  utilizationRate: number; // 0-100%
}

// ============================================================================
// Machine Types
// ============================================================================

export interface MachineCapability {
  id: string;
  name: string;
  specifications: Record<string, string | number>;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: ResourceStatus;
  capabilities: MachineCapability[];
  currentWorkOrder?: string;
  location: string;
  maintenanceSchedule?: {
    nextMaintenance: Date;
    lastMaintenance: Date;
  };
  utilizationRate: number;
  performance: {
    efficiency: number; // 0-100%
    uptime: number; // 0-100%
  };
}

// ============================================================================
// Material Types
// ============================================================================

export interface Material {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  location: string;
  reservedQuantity: number;
  reorderPoint: number;
  specifications?: Record<string, string | number>;
}

// ============================================================================
// Work Order Types
// ============================================================================

export interface WorkOrderRequirements {
  operators: {
    count: number;
    requiredSkills: string[]; // Skill IDs
    preferredSkillLevel?: number;
  };
  machines: {
    count: number;
    requiredCapabilities: string[]; // Capability IDs
    machineTypes?: string[];
  };
  materials: {
    materialId: string;
    requiredQuantity: number;
  }[];
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  requirements: WorkOrderRequirements;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  estimatedDuration: number; // minutes
  progress: number; // 0-100%
  assignedResources: {
    operators: string[]; // Operator IDs
    machines: string[]; // Machine IDs
    materials: string[]; // Material IDs
  };
}

// ============================================================================
// Allocation Types
// ============================================================================

export interface AllocationValidation {
  isValid: boolean;
  conflicts: string[];
  warnings: string[];
  suggestions: string[];
}

export interface Allocation {
  id: string;
  workOrderId: string;
  operatorId?: string;
  machineId?: string;
  materialId?: string;
  status: AllocationStatus;
  allocatedAt: Date;
  allocatedBy: string; // Supervisor ID
  startTime: Date;
  endTime?: Date;
  validation?: AllocationValidation;
}

// ============================================================================
// Dashboard & Metrics Types
// ============================================================================

export interface UtilizationMetrics {
  overall: number;
  operators: number;
  machines: number;
  trend: 'up' | 'down' | 'stable';
}

export interface IdleTimeMetrics {
  totalIdle: number; // minutes
  idleOperators: number;
  idleMachines: number;
  costImpact: number; // currency
}

export interface ProductionMetrics {
  throughput: number; // units per hour
  completedOrders: number;
  activeOrders: number;
  blockedOrders: number;
  onTimeCompletionRate: number; // 0-100%
}

export interface DashboardMetrics {
  utilization: UtilizationMetrics;
  idle: IdleTimeMetrics;
  production: ProductionMetrics;
  lastUpdated: Date;
}

// ============================================================================
// Alert Types
// ============================================================================

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AlertType = 
  | 'resource-conflict' 
  | 'idle-resource' 
  | 'blocked-order' 
  | 'low-material'
  | 'maintenance-due'
  | 'skill-mismatch';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  resourceId?: string;
  workOrderId?: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired: boolean;
}

// ============================================================================
// Suggestion Types
// ============================================================================

export interface AllocationSuggestion {
  workOrderId: string;
  suggestedOperators: Array<{
    operatorId: string;
    matchScore: number; // 0-100
    reason: string;
  }>;
  suggestedMachines: Array<{
    machineId: string;
    matchScore: number;
    reason: string;
  }>;
  estimatedIdleTimeReduction: number; // minutes
  confidence: number; // 0-100
}

// ============================================================================
// Filter & Search Types
// ============================================================================

export interface ResourceFilters {
  status?: ResourceStatus[];
  location?: string[];
  shift?: string[];
  utilizationRange?: {
    min: number;
    max: number;
  };
}

export interface WorkOrderFilters {
  status?: WorkOrderStatus[];
  priority?: WorkOrderPriority[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// User & Permission Types
// ============================================================================

export interface User {
  id: string;
  name: string;
  role: 'supervisor' | 'manager' | 'admin';
  email: string;
  permissions: string[];
}
