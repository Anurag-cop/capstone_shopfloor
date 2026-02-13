/**
 * Allocation validation utilities
 */

import type {
  WorkOrder,
  Operator,
  Machine,
  AllocationValidation,
} from '@/types';

export function validateAllocation(
  workOrder: WorkOrder,
  operators: Operator[],
  machines: Machine[]
): AllocationValidation {
  const conflicts: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Validate operator count
  if (operators.length < workOrder.requirements.operators.count) {
    conflicts.push(
      `Insufficient operators: need ${workOrder.requirements.operators.count}, assigned ${operators.length}`
    );
  } else if (operators.length > workOrder.requirements.operators.count) {
    warnings.push(`Over-allocated operators: ${operators.length} assigned, only ${workOrder.requirements.operators.count} needed`);
  }

  // Validate operator skills
  const requiredSkills = workOrder.requirements.operators.requiredSkills;
  const assignedSkills = operators.flatMap((op) => op.skills.map((s) => s.id));
  const missingSkills = requiredSkills.filter((skill) => !assignedSkills.includes(skill));
  
  if (missingSkills.length > 0) {
    conflicts.push(`Missing required skills: ${missingSkills.join(', ')}`);
  }

  // Validate operator skill levels
  const preferredSkillLevel = workOrder.requirements.operators.preferredSkillLevel;
  if (preferredSkillLevel) {
    const lowSkillOperators = operators.filter((op) =>
      op.skills.some((s) => s.level < preferredSkillLevel)
    );
    if (lowSkillOperators.length > 0) {
      warnings.push(`Some operators have skill levels below preferred level (${preferredSkillLevel})`);
      suggestions.push('Consider assigning more experienced operators for better efficiency');
    }
  }

  // Validate operator availability
  operators.forEach((op) => {
    if (op.status !== 'available') {
      conflicts.push(`Operator ${op.name} is not available (status: ${op.status})`);
    }
    if (op.currentWorkOrder) {
      conflicts.push(`Operator ${op.name} is already assigned to work order ${op.currentWorkOrder}`);
    }
  });

  // Validate machine count
  if (machines.length < workOrder.requirements.machines.count) {
    conflicts.push(
      `Insufficient machines: need ${workOrder.requirements.machines.count}, assigned ${machines.length}`
    );
  } else if (machines.length > workOrder.requirements.machines.count) {
    warnings.push(`Over-allocated machines: ${machines.length} assigned, only ${workOrder.requirements.machines.count} needed`);
  }

  // Validate machine capabilities
  const requiredCapabilities = workOrder.requirements.machines.requiredCapabilities;
  const assignedCapabilities = machines.flatMap((m) => m.capabilities.map((c) => c.id));
  const missingCapabilities = requiredCapabilities.filter(
    (cap) => !assignedCapabilities.includes(cap)
  );
  
  if (missingCapabilities.length > 0) {
    conflicts.push(`Missing required capabilities: ${missingCapabilities.join(', ')}`);
  }

  // Validate machine types
  if (workOrder.requirements.machines.machineTypes) {
    const requiredTypes = workOrder.requirements.machines.machineTypes;
    const assignedTypes = machines.map((m) => m.type);
    const missingTypes = requiredTypes.filter((type) => !assignedTypes.includes(type));
    
    if (missingTypes.length > 0) {
      conflicts.push(`Missing required machine types: ${missingTypes.join(', ')}`);
    }
  }

  // Validate machine availability
  machines.forEach((machine) => {
    if (machine.status !== 'available') {
      conflicts.push(`Machine ${machine.name} is not available (status: ${machine.status})`);
    }
    if (machine.currentWorkOrder) {
      conflicts.push(`Machine ${machine.name} is already assigned to work order ${machine.currentWorkOrder}`);
    }
  });

  // Validate machine performance
  const lowPerformanceMachines = machines.filter((m) => m.performance.efficiency < 75);
  if (lowPerformanceMachines.length > 0) {
    warnings.push(
      `Some machines have low efficiency: ${lowPerformanceMachines.map((m) => m.name).join(', ')}`
    );
    suggestions.push('Consider using machines with higher efficiency for better throughput');
  }

  // Check for maintenance schedules
  machines.forEach((machine) => {
    if (machine.maintenanceSchedule) {
      const daysUntilMaintenance = Math.floor(
        (machine.maintenanceSchedule.nextMaintenance.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilMaintenance < 7) {
        warnings.push(
          `Machine ${machine.name} has scheduled maintenance in ${daysUntilMaintenance} days`
        );
      }
    }
  });

  // Check for location mismatches
  const operatorLocations = new Set(operators.map((op) => op.location));
  const machineLocations = new Set(machines.map((m) => m.location));
  
  if (operatorLocations.size > 1 || machineLocations.size > 1) {
    warnings.push('Resources are located in different zones, which may impact coordination');
    suggestions.push('Try to allocate resources from the same zone when possible');
  }

  // Check utilization rates
  const lowUtilizationOperators = operators.filter((op) => op.utilizationRate < 50);
  if (lowUtilizationOperators.length > 0) {
    suggestions.push(
      `Prioritizing low-utilization operators: ${lowUtilizationOperators.map((op) => op.name).join(', ')}`
    );
  }

  // Check shift compatibility
  const operatorShifts = new Set(operators.map((op) => op.shift));
  if (operatorShifts.size > 1) {
    warnings.push('Operators are from different shifts');
  }

  // Generate optimization suggestions
  if (conflicts.length === 0) {
    if (operators.length === workOrder.requirements.operators.count &&
        machines.length === workOrder.requirements.machines.count) {
      suggestions.push('Allocation is optimal - all requirements met exactly');
    }
  }

  return {
    isValid: conflicts.length === 0,
    conflicts,
    warnings,
    suggestions,
  };
}

export function findOptimalResources(
  workOrder: WorkOrder,
  allOperators: Operator[],
  allMachines: Machine[]
): {
  suggestedOperators: Operator[];
  suggestedMachines: Machine[];
  matchScore: number;
} {
  // Filter available resources
  const availableOperators = allOperators.filter((op) => op.status === 'available');
  const availableMachines = allMachines.filter((m) => m.status === 'available');

  // Score operators based on skills, utilization, and location
  const scoredOperators = availableOperators
    .map((operator) => {
      let score = 0;

      // Skill match (40 points max)
      const requiredSkills = workOrder.requirements.operators.requiredSkills;
      const operatorSkillIds = operator.skills.map((s) => s.id);
      const matchingSkills = requiredSkills.filter((skill) =>
        operatorSkillIds.includes(skill)
      ).length;
      score += (matchingSkills / requiredSkills.length) * 40;

      // Skill level (20 points max)
      const avgSkillLevel = operator.skills.reduce((sum, s) => sum + s.level, 0) / operator.skills.length;
      score += (avgSkillLevel / 5) * 20;

      // Low utilization bonus (20 points max)
      score += ((100 - operator.utilizationRate) / 100) * 20;

      // Certification compliance (20 points max)
      const certifiedSkills = operator.skills.filter(
        (s) => !s.certificationRequired || (s.certificationExpiry && s.certificationExpiry > new Date())
      );
      score += (certifiedSkills.length / operator.skills.length) * 20;

      return { operator, score };
    })
    .sort((a, b) => b.score - a.score);

  // Score machines based on capabilities, performance, and utilization
  const scoredMachines = availableMachines
    .map((machine) => {
      let score = 0;

      // Capability match (40 points max)
      const requiredCapabilities = workOrder.requirements.machines.requiredCapabilities;
      const machineCapabilityIds = machine.capabilities.map((c) => c.id);
      const matchingCapabilities = requiredCapabilities.filter((cap) =>
        machineCapabilityIds.includes(cap)
      ).length;
      score += (matchingCapabilities / requiredCapabilities.length) * 40;

      // Performance (30 points max)
      score += (machine.performance.efficiency / 100) * 15;
      score += (machine.performance.uptime / 100) * 15;

      // Low utilization bonus (20 points max)
      score += ((100 - machine.utilizationRate) / 100) * 20;

      // Maintenance schedule (10 points max)
      if (machine.maintenanceSchedule) {
        const daysUntilMaintenance = Math.floor(
          (machine.maintenanceSchedule.nextMaintenance.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilMaintenance > 30) {
          score += 10;
        } else if (daysUntilMaintenance > 7) {
          score += 5;
        }
      } else {
        score += 10;
      }

      return { machine, score };
    })
    .sort((a, b) => b.score - a.score);

  // Select top resources
  const suggestedOperators = scoredOperators
    .slice(0, workOrder.requirements.operators.count)
    .map((s) => s.operator);
    
  const suggestedMachines = scoredMachines
    .slice(0, workOrder.requirements.machines.count)
    .map((s) => s.machine);

  // Calculate overall match score
  const avgOperatorScore = scoredOperators
    .slice(0, workOrder.requirements.operators.count)
    .reduce((sum, s) => sum + s.score, 0) / workOrder.requirements.operators.count;
    
  const avgMachineScore = scoredMachines
    .slice(0, workOrder.requirements.machines.count)
    .reduce((sum, s) => sum + s.score, 0) / workOrder.requirements.machines.count;
    
  const matchScore = (avgOperatorScore + avgMachineScore) / 2;

  return {
    suggestedOperators,
    suggestedMachines,
    matchScore: Math.round(matchScore),
  };
}
