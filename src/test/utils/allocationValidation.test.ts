import { describe, it, expect, beforeEach } from 'vitest';
import { validateAllocation, findOptimalResources } from '@/utils/allocationValidation';
import type { WorkOrder, Operator, Machine } from '@/types';

describe('Allocation Validation', () => {
  let mockWorkOrder: WorkOrder;
  let mockOperators: Operator[];
  let mockMachines: Machine[];

  beforeEach(() => {
    mockWorkOrder = {
      id: 'wo-001',
      orderNumber: 'WO-2026-0001',
      productName: 'Test Product',
      quantity: 10,
      priority: 'high',
      status: 'pending',
      requirements: {
        operators: {
          count: 1,
          requiredSkills: ['skill-weld'],
          preferredSkillLevel: 3,
        },
        machines: {
          count: 1,
          requiredCapabilities: ['cap-mig'],
          machineTypes: ['Welding'],
        },
        materials: [],
      },
      scheduledStart: new Date('2026-02-13T08:00:00'),
      scheduledEnd: new Date('2026-02-13T16:00:00'),
      estimatedDuration: 480,
      progress: 0,
      assignedResources: {
        operators: [],
        machines: [],
        materials: [],
      },
    };

    mockOperators = [
      {
        id: 'op-001',
        name: 'John Welder',
        employeeId: 'EMP-001',
        status: 'available',
        skills: [
          {
            id: 'skill-weld',
            name: 'Welding',
            level: 5,
            certificationRequired: true,
            certificationExpiry: new Date('2027-02-13'),
          },
        ],
        shift: 'morning',
        location: 'Zone A',
        availability: {
          start: new Date('2026-02-13T06:00:00'),
          end: new Date('2026-02-13T14:00:00'),
        },
        utilizationRate: 50,
      },
    ];

    mockMachines = [
      {
        id: 'mach-001',
        name: 'Welding Station #1',
        type: 'Welding',
        status: 'available',
        capabilities: [
          {
            id: 'cap-mig',
            name: 'MIG Welding',
            specifications: { voltage: '240V' },
          },
        ],
        location: 'Zone A',
        utilizationRate: 60,
        performance: {
          efficiency: 95,
          uptime: 98,
        },
      },
    ];
  });

  describe('validateAllocation', () => {
    it('should validate successful allocation with all requirements met', () => {
      const result = validateAllocation(mockWorkOrder, mockOperators, mockMachines);
      expect(result.isValid).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should detect insufficient operators', () => {
      mockWorkOrder.requirements.operators.count = 2;
      const result = validateAllocation(mockWorkOrder, mockOperators, mockMachines);
      expect(result.isValid).toBe(false);
      expect(result.conflicts.some((c) => c.includes('Insufficient operators'))).toBe(true);
    });

    it('should detect missing required skills', () => {
      mockWorkOrder.requirements.operators.requiredSkills = ['skill-cnc', 'skill-weld'];
      const result = validateAllocation(mockWorkOrder, mockOperators, mockMachines);
      expect(result.isValid).toBe(false);
      expect(result.conflicts.some((c) => c.includes('Missing required skills'))).toBe(true);
    });

    it('should detect unavailable operator status', () => {
      mockOperators[0].status = 'busy';
      const result = validateAllocation(mockWorkOrder, mockOperators, mockMachines);
      expect(result.isValid).toBe(false);
      expect(result.conflicts.some((c) => c.includes('not available'))).toBe(true);
    });

    it('should detect operator already assigned to work order', () => {
      mockOperators[0].currentWorkOrder = 'wo-999';
      const result = validateAllocation(mockWorkOrder, mockOperators, mockMachines);
      expect(result.isValid).toBe(false);
      expect(result.conflicts.some((c) => c.includes('already assigned'))).toBe(true);
    });

    it('should detect insufficient machines', () => {
      mockWorkOrder.requirements.machines.count = 2;
      const result = validateAllocation(mockWorkOrder, mockOperators, mockMachines);
      expect(result.isValid).toBe(false);
      expect(result.conflicts.some((c) => c.includes('Insufficient machines'))).toBe(true);
    });

    it('should detect missing required capabilities', () => {
      mockWorkOrder.requirements.machines.requiredCapabilities = ['cap-mig', 'cap-tig'];
      const result = validateAllocation(mockWorkOrder, mockOperators, mockMachines);
      expect(result.isValid).toBe(false);
      expect(result.conflicts.some((c) => c.includes('Missing required capabilities'))).toBe(true);
    });

    it('should detect unavailable machine status', () => {
      mockMachines[0].status = 'maintenance';
      const result = validateAllocation(mockWorkOrder, mockOperators, mockMachines);
      expect(result.isValid).toBe(false);
      expect(result.conflicts.some((c) => c.includes('not available'))).toBe(true);
    });

    it('should detect machine already assigned to work order', () => {
      mockMachines[0].currentWorkOrder = 'wo-888';
      const result = validateAllocation(mockWorkOrder, mockOperators, mockMachines);
      expect(result.isValid).toBe(false);
      expect(result.conflicts.some((c) => c.includes('already assigned'))).toBe(true);
    });

    it('should warn about over-allocated operators', () => {
      mockWorkOrder.requirements.operators.count = 1;
      const extraOperator = { ...mockOperators[0], id: 'op-002' };
      const result = validateAllocation(mockWorkOrder, [mockOperators[0], extraOperator], mockMachines);
      expect(result.warnings.some((w) => w.includes('Over-allocated operators'))).toBe(true);
    });

    it('should warn about low operator skill levels', () => {
      mockWorkOrder.requirements.operators.preferredSkillLevel = 5;
      mockOperators[0].skills[0].level = 3;
      const result = validateAllocation(mockWorkOrder, mockOperators, mockMachines);
      expect(result.warnings.some((w) => w.includes('skill levels below preferred'))).toBe(true);
    });

    it('should warn about low machine efficiency', () => {
      mockMachines[0].performance.efficiency = 70;
      const result = validateAllocation(mockWorkOrder, mockOperators, mockMachines);
      expect(result.warnings.some((w) => w.includes('low efficiency'))).toBe(true);
    });

    it('should warn about different zones warning', () => {
      // The warning is only triggered when multiple resources are in different zones
      const secondOperator = {
        ...mockOperators[0],
        id: 'op-002',
        location: 'Zone B',
      };
      mockWorkOrder.requirements.operators.count = 2;
      const result = validateAllocation(mockWorkOrder, [mockOperators[0], secondOperator], mockMachines);
      expect(result.warnings.some((w) => w.includes('different zones'))).toBe(true);
    });

    it('should provide suggestions for optimal allocation', () => {
      const result = validateAllocation(mockWorkOrder, mockOperators, mockMachines);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should detect different shifts warning', () => {
      mockOperators[0].shift = 'morning' as const;
      const secondOp = {
        ...mockOperators[0],
        id: 'op-002',
        shift: 'afternoon' as const,
      };
      mockWorkOrder.requirements.operators.count = 2;
      const result = validateAllocation(mockWorkOrder, [mockOperators[0], secondOp], mockMachines);
      expect(result.warnings.some((w) => w.includes('different shifts'))).toBe(true);
    });
  });

  describe('findOptimalResources', () => {
    it('should find optimal resources matching work order requirements', () => {
      const result = findOptimalResources(mockWorkOrder, mockOperators, mockMachines);
      expect(result.suggestedOperators).toHaveLength(1);
      expect(result.suggestedMachines).toHaveLength(1);
      expect(result.matchScore).toBeGreaterThanOrEqual(0);
    });

    it('should filter out unavailable operators', () => {
      const busyOperator = { ...mockOperators[0], id: 'op-busy', status: 'busy' as const };
      const result = findOptimalResources(mockWorkOrder, [busyOperator], mockMachines);
      expect(result.suggestedOperators).toHaveLength(0);
    });

    it('should filter out unavailable machines', () => {
      const maintenanceMachine = { ...mockMachines[0], id: 'mach-maint', status: 'maintenance' as const };
      const result = findOptimalResources(mockWorkOrder, mockOperators, [maintenanceMachine]);
      expect(result.suggestedMachines).toHaveLength(0);
    });

    it('should score operators based on skill match', () => {
      const noSkillOperator = {
        ...mockOperators[0],
        id: 'op-002',
        skills: [{ id: 'skill-other', name: 'Other', level: 5 as const, certificationRequired: false }],
      };
      const result = findOptimalResources(mockWorkOrder, [mockOperators[0], noSkillOperator], mockMachines);
      expect(result.suggestedOperators[0].id).toBe('op-001');
    });

    it('should score machines based on capability match', () => {
      const noCapabilityMachine = {
        ...mockMachines[0],
        id: 'mach-002',
        capabilities: [{ id: 'cap-other', name: 'Other', specifications: {} }],
      };
      const result = findOptimalResources(mockWorkOrder, mockOperators, [mockMachines[0], noCapabilityMachine]);
      expect(result.suggestedMachines[0].id).toBe('mach-001');
    });

    it('should prioritize low utilization resources', () => {
      const highUtilOperator = { ...mockOperators[0], id: 'op-001', utilizationRate: 90 };
      const lowUtilOperator = {
        ...mockOperators[0],
        id: 'op-002',
        utilizationRate: 20,
        skills: mockOperators[0].skills,
      };
      const result = findOptimalResources(mockWorkOrder, [highUtilOperator, lowUtilOperator], mockMachines);
      if (result.suggestedOperators.length > 0) {
        expect(result.suggestedOperators[0].id).toBe('op-002');
      }
    });

    it('should calculate match score between 0 and 100', () => {
      const result = findOptimalResources(mockWorkOrder, mockOperators, mockMachines);
      expect(result.matchScore).toBeGreaterThanOrEqual(0);
      expect(result.matchScore).toBeLessThanOrEqual(100);
    });
  });
});
