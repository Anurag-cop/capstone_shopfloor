/**
 * Mock data for development and testing
 */

import type {
  Operator,
  Machine,
  Material,
  WorkOrder,
  Alert,
  DashboardMetrics,
  AllocationSuggestion,
} from '@/types';

// Mock Operators
export const mockOperators: Operator[] = [
  {
    id: 'op-001',
    name: 'John Martinez',
    employeeId: 'EMP-1001',
    status: 'available',
    skills: [
      { id: 'skill-weld', name: 'Welding', level: 5, certificationRequired: true },
      { id: 'skill-mach', name: 'Machining', level: 4, certificationRequired: false },
    ],
    shift: 'morning',
    location: 'Zone A',
    availability: { start: new Date('2026-02-13T06:00:00'), end: new Date('2026-02-13T14:00:00') },
    utilizationRate: 72,
  },
  {
    id: 'op-002',
    name: 'Sarah Chen',
    employeeId: 'EMP-1002',
    status: 'busy',
    skills: [
      { id: 'skill-cnc', name: 'CNC Operation', level: 5, certificationRequired: true },
      { id: 'skill-qa', name: 'Quality Assurance', level: 4, certificationRequired: false },
    ],
    currentWorkOrder: 'wo-001',
    shift: 'morning',
    location: 'Zone B',
    availability: { start: new Date('2026-02-13T06:00:00'), end: new Date('2026-02-13T14:00:00') },
    utilizationRate: 95,
  },
  {
    id: 'op-003',
    name: 'Michael Johnson',
    employeeId: 'EMP-1003',
    status: 'available',
    skills: [
      { id: 'skill-assem', name: 'Assembly', level: 3, certificationRequired: false },
      { id: 'skill-paint', name: 'Painting', level: 4, certificationRequired: true },
    ],
    shift: 'morning',
    location: 'Zone C',
    availability: { start: new Date('2026-02-13T06:00:00'), end: new Date('2026-02-13T14:00:00') },
    utilizationRate: 45,
  },
  {
    id: 'op-004',
    name: 'Emily Rodriguez',
    employeeId: 'EMP-1004',
    status: 'busy',
    skills: [
      { id: 'skill-mach', name: 'Machining', level: 5, certificationRequired: false },
      { id: 'skill-prog', name: 'Programming', level: 4, certificationRequired: false },
    ],
    currentWorkOrder: 'wo-003',
    shift: 'morning',
    location: 'Zone A',
    availability: { start: new Date('2026-02-13T06:00:00'), end: new Date('2026-02-13T14:00:00') },
    utilizationRate: 88,
  },
  {
    id: 'op-005',
    name: 'David Kim',
    employeeId: 'EMP-1005',
    status: 'available',
    skills: [
      { id: 'skill-weld', name: 'Welding', level: 3, certificationRequired: true },
      { id: 'skill-assem', name: 'Assembly', level: 4, certificationRequired: false },
    ],
    shift: 'afternoon',
    location: 'Zone A',
    availability: { start: new Date('2026-02-13T14:00:00'), end: new Date('2026-02-13T22:00:00') },
    utilizationRate: 38,
  },
];

// Mock Machines
export const mockMachines: Machine[] = [
  {
    id: 'mach-001',
    name: 'CNC Mill #1',
    type: 'CNC Mill',
    status: 'busy',
    capabilities: [
      { id: 'cap-mill', name: 'Milling', specifications: { precision: '0.001mm' } },
      { id: 'cap-drill', name: 'Drilling', specifications: { maxDepth: '100mm' } },
    ],
    currentWorkOrder: 'wo-001',
    location: 'Zone B',
    maintenanceSchedule: {
      nextMaintenance: new Date('2026-02-20T08:00:00'),
      lastMaintenance: new Date('2026-01-20T08:00:00'),
    },
    utilizationRate: 92,
    performance: { efficiency: 96, uptime: 98 },
  },
  {
    id: 'mach-002',
    name: 'Welding Station #3',
    type: 'Welding',
    status: 'available',
    capabilities: [
      { id: 'cap-mig', name: 'MIG Welding', specifications: { voltage: '240V' } },
      { id: 'cap-tig', name: 'TIG Welding', specifications: { voltage: '240V' } },
    ],
    location: 'Zone A',
    maintenanceSchedule: {
      nextMaintenance: new Date('2026-03-15T08:00:00'),
      lastMaintenance: new Date('2026-02-01T08:00:00'),
    },
    utilizationRate: 68,
    performance: { efficiency: 89, uptime: 95 },
  },
  {
    id: 'mach-003',
    name: 'CNC Lathe #2',
    type: 'CNC Lathe',
    status: 'busy',
    capabilities: [
      { id: 'cap-turn', name: 'Turning', specifications: { maxDiameter: '300mm' } },
      { id: 'cap-thread', name: 'Threading', specifications: { pitch: '0.5-6mm' } },
    ],
    currentWorkOrder: 'wo-003',
    location: 'Zone B',
    utilizationRate: 85,
    performance: { efficiency: 91, uptime: 96 },
  },
  {
    id: 'mach-004',
    name: 'Paint Booth #1',
    type: 'Paint Booth',
    status: 'available',
    capabilities: [
      { id: 'cap-spray', name: 'Spray Painting', specifications: { capacity: '3m x 2m' } },
    ],
    location: 'Zone C',
    utilizationRate: 42,
    performance: { efficiency: 87, uptime: 94 },
  },
  {
    id: 'mach-005',
    name: 'Assembly Line #1',
    type: 'Assembly',
    status: 'maintenance',
    capabilities: [
      { id: 'cap-assem', name: 'Automated Assembly', specifications: { stations: '6' } },
    ],
    location: 'Zone C',
    maintenanceSchedule: {
      nextMaintenance: new Date('2026-02-13T16:00:00'),
      lastMaintenance: new Date('2026-02-13T09:00:00'),
    },
    utilizationRate: 0,
    performance: { efficiency: 0, uptime: 0 },
  },
];

// Mock Materials
export const mockMaterials: Material[] = [
  {
    id: 'mat-001',
    name: 'Steel Plate 10mm',
    sku: 'STL-PLT-10',
    quantity: 450,
    unit: 'kg',
    location: 'Warehouse A',
    reservedQuantity: 120,
    reorderPoint: 200,
  },
  {
    id: 'mat-002',
    name: 'Aluminum Rod 50mm',
    sku: 'ALU-ROD-50',
    quantity: 85,
    unit: 'pieces',
    location: 'Warehouse B',
    reservedQuantity: 30,
    reorderPoint: 50,
  },
  {
    id: 'mat-003',
    name: 'Welding Wire',
    sku: 'WLD-WIR-01',
    quantity: 25,
    unit: 'rolls',
    location: 'Zone A Storage',
    reservedQuantity: 8,
    reorderPoint: 15,
  },
];

// Mock Work Orders
export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo-001',
    orderNumber: 'WO-2026-0234',
    productName: 'Precision Gear Assembly',
    quantity: 50,
    priority: 'high',
    status: 'in-progress',
    requirements: {
      operators: { count: 1, requiredSkills: ['skill-cnc'] },
      machines: { count: 1, requiredCapabilities: ['cap-mill'], machineTypes: ['CNC Mill'] },
      materials: [{ materialId: 'mat-002', requiredQuantity: 15 }],
    },
    scheduledStart: new Date('2026-02-13T08:00:00'),
    scheduledEnd: new Date('2026-02-13T16:00:00'),
    actualStart: new Date('2026-02-13T08:15:00'),
    estimatedDuration: 480,
    progress: 35,
    assignedResources: {
      operators: ['op-002'],
      machines: ['mach-001'],
      materials: ['mat-002'],
    },
  },
  {
    id: 'wo-002',
    orderNumber: 'WO-2026-0235',
    productName: 'Structural Frame',
    quantity: 20,
    priority: 'urgent',
    status: 'pending',
    requirements: {
      operators: { count: 2, requiredSkills: ['skill-weld'] },
      machines: { count: 1, requiredCapabilities: ['cap-mig'], machineTypes: ['Welding'] },
      materials: [{ materialId: 'mat-001', requiredQuantity: 80 }],
    },
    scheduledStart: new Date('2026-02-13T09:00:00'),
    scheduledEnd: new Date('2026-02-13T17:00:00'),
    estimatedDuration: 480,
    progress: 0,
    assignedResources: {
      operators: [],
      machines: [],
      materials: [],
    },
  },
  {
    id: 'wo-003',
    orderNumber: 'WO-2026-0236',
    productName: 'Shaft Components',
    quantity: 100,
    priority: 'medium',
    status: 'in-progress',
    requirements: {
      operators: { count: 1, requiredSkills: ['skill-mach'] },
      machines: { count: 1, requiredCapabilities: ['cap-turn'], machineTypes: ['CNC Lathe'] },
      materials: [{ materialId: 'mat-002', requiredQuantity: 25 }],
    },
    scheduledStart: new Date('2026-02-13T07:30:00'),
    scheduledEnd: new Date('2026-02-13T15:30:00'),
    actualStart: new Date('2026-02-13T07:30:00'),
    estimatedDuration: 480,
    progress: 62,
    assignedResources: {
      operators: ['op-004'],
      machines: ['mach-003'],
      materials: ['mat-002'],
    },
  },
  {
    id: 'wo-004',
    orderNumber: 'WO-2026-0237',
    productName: 'Custom Brackets',
    quantity: 75,
    priority: 'medium',
    status: 'pending',
    requirements: {
      operators: { count: 1, requiredSkills: ['skill-assem', 'skill-paint'] },
      machines: { count: 2, requiredCapabilities: ['cap-assem', 'cap-spray'] },
      materials: [{ materialId: 'mat-001', requiredQuantity: 35 }],
    },
    scheduledStart: new Date('2026-02-13T10:00:00'),
    scheduledEnd: new Date('2026-02-13T18:00:00'),
    estimatedDuration: 480,
    progress: 0,
    assignedResources: {
      operators: [],
      machines: [],
      materials: [],
    },
  },
  {
    id: 'wo-005',
    orderNumber: 'WO-2026-0238',
    productName: 'Housing Units',
    quantity: 30,
    priority: 'low',
    status: 'blocked',
    requirements: {
      operators: { count: 2, requiredSkills: ['skill-assem'] },
      machines: { count: 1, requiredCapabilities: ['cap-assem'], machineTypes: ['Assembly'] },
      materials: [{ materialId: 'mat-003', requiredQuantity: 5 }],
    },
    scheduledStart: new Date('2026-02-13T11:00:00'),
    scheduledEnd: new Date('2026-02-13T19:00:00'),
    estimatedDuration: 480,
    progress: 0,
    assignedResources: {
      operators: [],
      machines: [],
      materials: [],
    },
  },
];

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    type: 'idle-resource',
    severity: 'warning',
    message: 'Michael Johnson (op-003) has been idle for 45 minutes',
    resourceId: 'op-003',
    timestamp: new Date('2026-02-13T10:45:00'),
    acknowledged: false,
    actionRequired: true,
  },
  {
    id: 'alert-002',
    type: 'blocked-order',
    severity: 'error',
    message: 'Work Order WO-2026-0238 blocked: Assembly Line #1 under maintenance',
    workOrderId: 'wo-005',
    resourceId: 'mach-005',
    timestamp: new Date('2026-02-13T09:00:00'),
    acknowledged: false,
    actionRequired: true,
  },
  {
    id: 'alert-003',
    type: 'low-material',
    severity: 'warning',
    message: 'Welding Wire stock below reorder point (25 vs 15)',
    resourceId: 'mat-003',
    timestamp: new Date('2026-02-13T08:30:00'),
    acknowledged: true,
    actionRequired: false,
  },
  {
    id: 'alert-004',
    type: 'maintenance-due',
    severity: 'info',
    message: 'CNC Mill #1 scheduled maintenance in 7 days',
    resourceId: 'mach-001',
    timestamp: new Date('2026-02-13T06:00:00'),
    acknowledged: true,
    actionRequired: false,
  },
];

// Mock Dashboard Metrics
export const mockMetrics: DashboardMetrics = {
  utilization: {
    overall: 75,
    operators: 72,
    machines: 78,
    trend: 'up',
  },
  idle: {
    totalIdle: 142,
    idleOperators: 2,
    idleMachines: 1,
    costImpact: 1850,
  },
  production: {
    throughput: 18.5,
    completedOrders: 12,
    activeOrders: 2,
    blockedOrders: 1,
    onTimeCompletionRate: 87,
  },
  lastUpdated: new Date(),
};

// Mock Allocation Suggestions
export const mockSuggestions: AllocationSuggestion[] = [
  {
    workOrderId: 'wo-002',
    suggestedOperators: [
      {
        operatorId: 'op-001',
        matchScore: 95,
        reason: 'Expert level welding certification, available, same zone',
      },
      {
        operatorId: 'op-005',
        matchScore: 78,
        reason: 'Certified welder, afternoon shift overlap',
      },
    ],
    suggestedMachines: [
      {
        machineId: 'mach-002',
        matchScore: 100,
        reason: 'Available welding station with MIG capability in Zone A',
      },
    ],
    estimatedIdleTimeReduction: 45,
    confidence: 92,
  },
];
