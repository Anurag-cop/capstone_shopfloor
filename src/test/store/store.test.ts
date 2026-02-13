import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/store';
import type { WorkOrder, Operator, Machine, Alert, Allocation, DashboardMetrics } from '@/types';

describe('App Store (Zustand)', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      operators: [],
      machines: [],
      materials: [],
      workOrders: [],
      allocations: [],
      alerts: [],
      metrics: {
        utilization: { overall: 0, operators: 0, machines: 0, trend: 'stable' },
        idle: { totalIdle: 0, idleOperators: 0, idleMachines: 0, costImpact: 0 },
        production: { throughput: 0, completedOrders: 0, activeOrders: 0, blockedOrders: 0, onTimeCompletionRate: 0 },
        lastUpdated: new Date(),
      },
    });
  });

  describe('State Initialization', () => {
    it('should initialize with empty state', () => {
      const state = useAppStore.getState();
      expect(state.operators).toEqual([]);
      expect(state.machines).toEqual([]);
      expect(state.workOrders).toEqual([]);
      expect(state.allocations).toEqual([]);
    });

    it('should initialize with default metrics', () => {
      const state = useAppStore.getState();
      expect(state.metrics).toBeDefined();
      expect(state.metrics?.utilization).toBeDefined();
      expect(state.metrics?.production).toBeDefined();
    });
  });

  describe('Allocation Creation', () => {
    it('should create allocation with unique ID', () => {
      const store = useAppStore.getState();
      
      const allocation: Omit<Allocation, 'id' | 'allocatedAt'> = {
        workOrderId: 'wo-001',
        operatorId: 'op-001',
        machineId: 'mach-001',
        status: 'active' as const,
        allocatedBy: 'test-user',
        startTime: new Date(),
      };

      store.createAllocation(allocation);

      const state = useAppStore.getState();
      expect(state.allocations).toHaveLength(1);
      expect(state.allocations[0].id).toBeDefined();
      expect(state.allocations[0].id).toMatch(/^alloc-/);
    });

    it('should update work order status to in-progress when allocation created', () => {
      const store = useAppStore.getState();

      const workOrder: WorkOrder = {
        id: 'wo-001',
        orderNumber: 'WO-2026-0001',
        productName: 'Test',
        quantity: 10,
        priority: 'high',
        status: 'pending',
        requirements: {
          operators: { count: 1, requiredSkills: [] },
          machines: { count: 1, requiredCapabilities: [] },
          materials: [],
        },
        scheduledStart: new Date(),
        scheduledEnd: new Date(),
        estimatedDuration: 480,
        progress: 0,
        assignedResources: { operators: [], machines: [], materials: [] },
      };

      // Set initial work order
      useAppStore.setState({ workOrders: [workOrder] });

      const allocation: Omit<Allocation, 'id' | 'allocatedAt'> = {
        workOrderId: 'wo-001',
        operatorId: 'op-001',
        machineId: 'mach-001',
        status: 'active' as const,
        allocatedBy: 'test-user',
        startTime: new Date(),
      };

      store.createAllocation(allocation);

      const state = useAppStore.getState();
      const updatedWorkOrder = state.workOrders.find((wo) => wo.id === 'wo-001');
      expect(updatedWorkOrder?.status).toBe('in-progress');
    });

    it('should generate unique allocation IDs for multiple allocations', () => {
      const store = useAppStore.getState();

      const allocation1: Omit<Allocation, 'id' | 'allocatedAt'> = {
        workOrderId: 'wo-001',
        operatorId: 'op-001',
        machineId: 'mach-001',
        status: 'active' as const,
        allocatedBy: 'test-user',
        startTime: new Date(),
      };

      const allocation2: Omit<Allocation, 'id' | 'allocatedAt'> = {
        workOrderId: 'wo-002',
        operatorId: 'op-002',
        machineId: 'mach-002',
        status: 'active' as const,
        allocatedBy: 'test-user',
        startTime: new Date(),
      };

      store.createAllocation(allocation1);
      store.createAllocation(allocation2);

      const state = useAppStore.getState();
      expect(state.allocations).toHaveLength(2);
      expect(state.allocations[0].id).not.toBe(state.allocations[1].id);
    });
  });

  describe('Allocation Updates', () => {
    it('should update existing allocation', () => {
      const store = useAppStore.getState();

      const allocation: Allocation = {
        id: 'alloc-001',
        workOrderId: 'wo-001',
        operatorId: 'op-001',
        machineId: 'mach-001',
        status: 'active' as const,
        startTime: new Date(),
        allocatedAt: new Date(),
        allocatedBy: 'test-user',
      };

      useAppStore.setState({ allocations: [allocation] });

      store.updateAllocation('alloc-001', { status: 'completed' });

      const state = useAppStore.getState();
      expect(state.allocations[0].status).toBe('completed');
    });

    it('should not affect other allocations when updating one', () => {
      const store = useAppStore.getState();

      const allocation1: Allocation = {
        id: 'alloc-001',
        workOrderId: 'wo-001',
        operatorId: 'op-001',
        machineId: 'mach-001',
        status: 'active' as const,
        startTime: new Date(),
        allocatedAt: new Date(),
        allocatedBy: 'test-user',
      };

      const allocation2: Allocation = {
        id: 'alloc-002',
        workOrderId: 'wo-002',
        operatorId: 'op-002',
        machineId: 'mach-002',
        status: 'active' as const,
        startTime: new Date(),
        allocatedAt: new Date(),
        allocatedBy: 'test-user',
      };

      useAppStore.setState({ allocations: [allocation1, allocation2] });

      store.updateAllocation('alloc-001', { status: 'completed' });

      const state = useAppStore.getState();
      expect(state.allocations[0].status).toBe('completed');
      expect(state.allocations[1].status).toBe('active');
    });
  });

  describe('Allocation Removal', () => {
    it('should remove allocation', () => {
      const store = useAppStore.getState();

      const allocation: Allocation = {
        id: 'alloc-001',
        workOrderId: 'wo-001',
        operatorId: 'op-001',
        machineId: 'mach-001',
        status: 'active' as const,
        startTime: new Date(),
        allocatedAt: new Date(),
        allocatedBy: 'test-user',
      };

      useAppStore.setState({ allocations: [allocation] });

      store.removeAllocation('alloc-001');

      const state = useAppStore.getState();
      expect(state.allocations).toHaveLength(0);
    });

    it('should maintain other allocations after removal', () => {
      const store = useAppStore.getState();

      const allocation1: Allocation = {
        id: 'alloc-001',
        workOrderId: 'wo-001',
        operatorId: 'op-001',
        machineId: 'mach-001',
        status: 'active' as const,
        startTime: new Date(),
        allocatedAt: new Date(),
        allocatedBy: 'test-user',
      };

      const allocation2: Allocation = {
        id: 'alloc-002',
        workOrderId: 'wo-002',
        operatorId: 'op-002',
        machineId: 'mach-002',
        status: 'active' as const,
        startTime: new Date(),
        allocatedAt: new Date(),
        allocatedBy: 'test-user',
      };

      useAppStore.setState({ allocations: [allocation1, allocation2] });

      store.removeAllocation('alloc-001');

      const state = useAppStore.getState();
      expect(state.allocations).toHaveLength(1);
      expect(state.allocations[0].id).toBe('alloc-002');
    });
  });

  describe('Resource Status Updates', () => {
    it('should update operator status', () => {
      const store = useAppStore.getState();

      const operator: Operator = {
        id: 'op-001',
        name: 'John',
        employeeId: 'EMP-001',
        status: 'available',
        skills: [],
        shift: 'morning',
        location: 'Zone A',
        availability: { start: new Date(), end: new Date() },
        utilizationRate: 50,
      };

      useAppStore.setState({ operators: [operator] });

      store.updateOperatorStatus('op-001', 'busy');

      const state = useAppStore.getState();
      expect(state.operators[0].status).toBe('busy');
    });

    it('should update machine status', () => {
      const store = useAppStore.getState();

      const machine: Machine = {
        id: 'mach-001',
        name: 'Machine',
        type: 'CNC',
        status: 'available',
        capabilities: [],
        location: 'Zone A',
        utilizationRate: 60,
        performance: { efficiency: 95, uptime: 98 },
      };

      useAppStore.setState({ machines: [machine] });

      store.updateMachineStatus('mach-001', 'maintenance');

      const state = useAppStore.getState();
      expect(state.machines[0].status).toBe('maintenance');
    });
  });

  describe('Alert Management', () => {
    it('should set alerts', () => {
      const store = useAppStore.getState();

      const alerts: Alert[] = [
        {
          id: 'alert-001',
          type: 'idle-resource',
          severity: 'warning',
          message: 'Resource idle',
          timestamp: new Date(),
          acknowledged: false,
          actionRequired: true,
        },
      ];

      store.setAlerts(alerts);

      const state = useAppStore.getState();
      expect(state.alerts).toHaveLength(1);
      expect(state.alerts[0].id).toBe('alert-001');
    });

    it('should acknowledge alert', () => {
      const store = useAppStore.getState();

      const alert: Alert = {
        id: 'alert-001',
        type: 'idle-resource',
        severity: 'warning',
        message: 'Resource idle',
        timestamp: new Date(),
        acknowledged: false,
        actionRequired: true,
      };

      useAppStore.setState({ alerts: [alert] });

      store.acknowledgeAlert('alert-001');

      const state = useAppStore.getState();
      expect(state.alerts[0].acknowledged).toBe(true);
    });

    it('should dismiss alert', () => {
      const store = useAppStore.getState();

      const alert: Alert = {
        id: 'alert-001',
        type: 'idle-resource',
        severity: 'warning',
        message: 'Resource idle',
        timestamp: new Date(),
        acknowledged: false,
        actionRequired: true,
      };

      useAppStore.setState({ alerts: [alert] });

      store.dismissAlert('alert-001');

      const state = useAppStore.getState();
      expect(state.alerts).toHaveLength(0);
    });
  });

  describe('Metrics Updates', () => {
    it('should set metrics', () => {
      const store = useAppStore.getState();

      const newMetrics: DashboardMetrics = {
        utilization: { overall: 85, operators: 80, machines: 90, trend: 'up' },
        idle: { totalIdle: 50, idleOperators: 1, idleMachines: 1, costImpact: 500 },
        production: {
          throughput: 25.5,
          completedOrders: 15,
          activeOrders: 3,
          blockedOrders: 1,
          onTimeCompletionRate: 92,
        },
        lastUpdated: new Date(),
      };

      store.setMetrics(newMetrics);

      const state = useAppStore.getState();
      expect(state.metrics?.utilization.overall).toBe(85);
      expect(state.metrics?.production.throughput).toBe(25.5);
    });
  });
});
