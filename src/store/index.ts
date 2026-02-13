/**
 * Central state management store using Zustand
 */

import { create } from 'zustand';
import type {
  Operator,
  Machine,
  Material,
  WorkOrder,
  Allocation,
  Alert,
  DashboardMetrics,
  AllocationSuggestion,
  ResourceFilters,
  WorkOrderFilters,
} from '@/types';

interface AppState {
  // Resources
  operators: Operator[];
  machines: Machine[];
  materials: Material[];
  
  // Work Orders
  workOrders: WorkOrder[];
  
  // Allocations
  allocations: Allocation[];
  
  // Alerts & Suggestions
  alerts: Alert[];
  suggestions: AllocationSuggestion[];
  
  // Metrics
  metrics: DashboardMetrics | null;
  
  // Filters
  resourceFilters: ResourceFilters;
  workOrderFilters: WorkOrderFilters;
  
  // UI State
  selectedWorkOrder: WorkOrder | null;
  selectedOperator: Operator | null;
  selectedMachine: Machine | null;
  isLoading: boolean;
  
  // Actions
  setOperators: (operators: Operator[]) => void;
  setMachines: (machines: Machine[]) => void;
  setMaterials: (materials: Material[]) => void;
  setWorkOrders: (workOrders: WorkOrder[]) => void;
  setAllocations: (allocations: Allocation[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setSuggestions: (suggestions: AllocationSuggestion[]) => void;
  setMetrics: (metrics: DashboardMetrics) => void;
  
  // Selection actions
  selectWorkOrder: (workOrder: WorkOrder | null) => void;
  selectOperator: (operator: Operator | null) => void;
  selectMachine: (machine: Machine | null) => void;
  
  // Filter actions
  setResourceFilters: (filters: ResourceFilters) => void;
  setWorkOrderFilters: (filters: WorkOrderFilters) => void;
  
  // Allocation actions
  createAllocation: (allocation: Omit<Allocation, 'id' | 'allocatedAt'>) => void;
  updateAllocation: (id: string, updates: Partial<Allocation>) => void;
  removeAllocation: (id: string) => void;
  
  // Alert actions
  acknowledgeAlert: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  
  // Resource update actions
  updateOperatorStatus: (operatorId: string, status: Operator['status']) => void;
  updateMachineStatus: (machineId: string, status: Machine['status']) => void;
  
  // Utility actions
  setLoading: (isLoading: boolean) => void;
  refreshData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  operators: [],
  machines: [],
  materials: [],
  workOrders: [],
  allocations: [],
  alerts: [],
  suggestions: [],
  metrics: null,
  resourceFilters: {},
  workOrderFilters: {},
  selectedWorkOrder: null,
  selectedOperator: null,
  selectedMachine: null,
  isLoading: false,

  // Data setters
  setOperators: (operators) => set({ operators }),
  setMachines: (machines) => set({ machines }),
  setMaterials: (materials) => set({ materials }),
  setWorkOrders: (workOrders) => set({ workOrders }),
  setAllocations: (allocations) => set({ allocations }),
  setAlerts: (alerts) => set({ alerts }),
  setSuggestions: (suggestions) => set({ suggestions }),
  setMetrics: (metrics) => set({ metrics }),

  // Selection actions
  selectWorkOrder: (workOrder) => set({ selectedWorkOrder: workOrder }),
  selectOperator: (operator) => set({ selectedOperator: operator }),
  selectMachine: (machine) => set({ selectedMachine: machine }),

  // Filter actions
  setResourceFilters: (filters) => set({ resourceFilters: filters }),
  setWorkOrderFilters: (filters) => set({ workOrderFilters: filters }),

  // Allocation actions
  createAllocation: (allocationData) => {
    const allocation: Allocation = {
      ...allocationData,
      id: `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      allocatedAt: new Date(),
    };
    
    set((state) => ({
      allocations: [...state.allocations, allocation],
    }));

    // Update work order assigned resources
    if (allocation.workOrderId) {
      set((state) => ({
        workOrders: state.workOrders.map((wo) => {
          if (wo.id === allocation.workOrderId) {
            const assignedResources = { ...wo.assignedResources };
            if (allocation.operatorId) {
              assignedResources.operators = [...assignedResources.operators, allocation.operatorId];
            }
            if (allocation.machineId) {
              assignedResources.machines = [...assignedResources.machines, allocation.machineId];
            }
            if (allocation.materialId) {
              assignedResources.materials = [...assignedResources.materials, allocation.materialId];
            }
            return { ...wo, assignedResources, status: 'in-progress' as const };
          }
          return wo;
        }),
      }));
    }

    // Update resource status to busy
    if (allocation.operatorId) {
      get().updateOperatorStatus(allocation.operatorId, 'busy');
    }
    if (allocation.machineId) {
      get().updateMachineStatus(allocation.machineId, 'busy');
    }
  },

  updateAllocation: (id, updates) => {
    set((state) => ({
      allocations: state.allocations.map((allocation) =>
        allocation.id === id ? { ...allocation, ...updates } : allocation
      ),
    }));
  },

  removeAllocation: (id) => {
    const allocation = get().allocations.find((a) => a.id === id);
    
    if (allocation) {
      // Free up resources
      if (allocation.operatorId) {
        get().updateOperatorStatus(allocation.operatorId, 'available');
      }
      if (allocation.machineId) {
        get().updateMachineStatus(allocation.machineId, 'available');
      }

      // Update work order
      if (allocation.workOrderId) {
        set((state) => ({
          workOrders: state.workOrders.map((wo) => {
            if (wo.id === allocation.workOrderId) {
              const assignedResources = { ...wo.assignedResources };
              if (allocation.operatorId) {
                assignedResources.operators = assignedResources.operators.filter(
                  (id) => id !== allocation.operatorId
                );
              }
              if (allocation.machineId) {
                assignedResources.machines = assignedResources.machines.filter(
                  (id) => id !== allocation.machineId
                );
              }
              if (allocation.materialId) {
                assignedResources.materials = assignedResources.materials.filter(
                  (id) => id !== allocation.materialId
                );
              }
              return { ...wo, assignedResources };
            }
            return wo;
          }),
        }));
      }
    }

    set((state) => ({
      allocations: state.allocations.filter((allocation) => allocation.id !== id),
    }));
  },

  // Alert actions
  acknowledgeAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ),
    }));
  },

  dismissAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== alertId),
    }));
  },

  // Resource status updates
  updateOperatorStatus: (operatorId, status) => {
    set((state) => ({
      operators: state.operators.map((op) =>
        op.id === operatorId ? { ...op, status } : op
      ),
    }));
  },

  updateMachineStatus: (machineId, status) => {
    set((state) => ({
      machines: state.machines.map((machine) =>
        machine.id === machineId ? { ...machine, status } : machine
      ),
    }));
  },

  // Utility actions
  setLoading: (isLoading) => set({ isLoading }),

  refreshData: async () => {
    set({ isLoading: true });
    try {
      // In a real application, this would fetch data from an API
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Data would be fetched and set here
      // e.g., const data = await fetchDashboardData();
      // set({ ...data });
      
    } finally {
      set({ isLoading: false });
    }
  },
}));
