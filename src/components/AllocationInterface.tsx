import { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import type { WorkOrder, Operator, Machine } from '@/types';
import { useAppStore } from '@/store';
import './AllocationInterface.css';

interface AllocationInterfaceProps {
  workOrder: WorkOrder;
  operators: Operator[];
  machines: Machine[];
  onClose: () => void;
}

const DraggableOperator: React.FC<{ operator: Operator }> = ({ operator }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'operator',
    item: { operator },
    canDrag: operator.status === 'available',
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`draggable-resource ${isDragging ? 'dragging' : ''} ${
        operator.status !== 'available' ? 'disabled' : ''
      }`}
    >
      <div className="resource-name">{operator.name}</div>
      <div className="resource-skills">
        {operator.skills.slice(0, 2).map((s) => (
          <span key={s.id} className="skill-tag">
            {s.name}
          </span>
        ))}
      </div>
      <div className="resource-status">
        <span className={`status-dot status-${operator.status}`}></span>
        {operator.status}
      </div>
    </div>
  );
};

const DraggableMachine: React.FC<{ machine: Machine }> = ({ machine }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'machine',
    item: { machine },
    canDrag: machine.status === 'available',
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`draggable-resource ${isDragging ? 'dragging' : ''} ${
        machine.status !== 'available' ? 'disabled' : ''
      }`}
    >
      <div className="resource-name">{machine.name}</div>
      <div className="resource-type">{machine.type}</div>
      <div className="resource-status">
        <span className={`status-dot status-${machine.status}`}></span>
        {machine.status}
      </div>
    </div>
  );
};

const AllocationInterface: React.FC<AllocationInterfaceProps> = ({
  workOrder,
  operators,
  machines,
  onClose,
}) => {
  const { createAllocation } = useAppStore();
  const [assignedOperators, setAssignedOperators] = useState<Operator[]>([]);
  const [assignedMachines, setAssignedMachines] = useState<Machine[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const [{ isOverOperator }, dropOperator] = useDrop(() => ({
    accept: 'operator',
    drop: (item: { operator: Operator }) => {
      if (!assignedOperators.find((op) => op.id === item.operator.id)) {
        setAssignedOperators([...assignedOperators, item.operator]);
        validateAllocation([...assignedOperators, item.operator], assignedMachines);
      }
    },
    collect: (monitor) => ({
      isOverOperator: monitor.isOver(),
    }),
  }), [assignedOperators, assignedMachines]);

  const [{ isOverMachine }, dropMachine] = useDrop(() => ({
    accept: 'machine',
    drop: (item: { machine: Machine }) => {
      if (!assignedMachines.find((m) => m.id === item.machine.id)) {
        setAssignedMachines([...assignedMachines, item.machine]);
        validateAllocation(assignedOperators, [...assignedMachines, item.machine]);
      }
    },
    collect: (monitor) => ({
      isOverMachine: monitor.isOver(),
    }),
  }), [assignedOperators, assignedMachines]);

  const validateAllocation = (ops: Operator[], machs: Machine[]) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check operator count - CRITICAL
    if (ops.length === 0 && workOrder.requirements.operators.count > 0) {
      errors.push('At least one operator must be assigned');
    } else if (ops.length < workOrder.requirements.operators.count) {
      warnings.push(
        `Recommended: ${workOrder.requirements.operators.count} operator(s), currently assigned ${ops.length}`
      );
    }

    // Check operator skills - WARNING if not all skills are covered
    const requiredSkills = workOrder.requirements.operators.requiredSkills;
    const assignedSkills = ops.flatMap((op) => op.skills.map((s) => s.id));
    const missingSkills = requiredSkills.filter((skill) => !assignedSkills.includes(skill));
    
    if (missingSkills.length > 0 && ops.length > 0) {
      // Map skill IDs to names for better error messages
      const allSkills = operators.flatMap((op) => op.skills);
      const missingSkillNames = missingSkills.map((skillId) => {
        const skill = allSkills.find((s) => s.id === skillId);
        return skill ? skill.name : skillId;
      });
      warnings.push(`Missing some required skills: ${missingSkillNames.join(', ')}`);
    }

    // Check machine count - WARNING (not critical since some tasks may not need all machines)
    if (machs.length === 0 && workOrder.requirements.machines.count > 0) {
      warnings.push('No machines assigned - at least one machine is recommended');
    } else if (machs.length < workOrder.requirements.machines.count) {
      warnings.push(
        `Recommended: ${workOrder.requirements.machines.count} machine(s), currently assigned ${machs.length}`
      );
    }

    // Check machine capabilities - WARNING
    const requiredCapabilities = workOrder.requirements.machines.requiredCapabilities;
    const assignedCapabilities = machs.flatMap((m) => m.capabilities.map((c) => c.id));
    const missingCapabilities = requiredCapabilities.filter(
      (cap) => !assignedCapabilities.includes(cap)
    );
    
    if (missingCapabilities.length > 0 && machs.length > 0) {
      // Map capability IDs to names for better error messages
      const allCapabilities = machines.flatMap((m) => m.capabilities);
      const missingCapabilityNames = missingCapabilities.map((capId) => {
        const capability = allCapabilities.find((c) => c.id === capId);
        return capability ? capability.name : capId;
      });
      warnings.push(`Missing some required capabilities: ${missingCapabilityNames.join(', ')}`);
    }

    setValidationErrors(errors);
    setValidationWarnings(warnings);
  };

  const handleRemoveOperator = (operatorId: string) => {
    const updated = assignedOperators.filter((op) => op.id !== operatorId);
    setAssignedOperators(updated);
    validateAllocation(updated, assignedMachines);
  };

  const handleRemoveMachine = (machineId: string) => {
    const updated = assignedMachines.filter((m) => m.id !== machineId);
    setAssignedMachines(updated);
    validateAllocation(assignedOperators, updated);
  };

  const handleAllocate = () => {
    if (validationErrors.length > 0) {
      alert('Please resolve critical errors before allocating resources.');
      return;
    }

    // Show warning confirmation if warnings exist
    if (validationWarnings.length > 0) {
      const proceed = confirm(
        'There are warnings about this allocation:\n\n' +
        validationWarnings.join('\n') +
        '\n\nDo you want to proceed anyway?'
      );
      if (!proceed) return;
    }

    // Create allocations
    assignedOperators.forEach((operator) => {
      createAllocation({
        workOrderId: workOrder.id,
        operatorId: operator.id,
        status: 'active',
        allocatedBy: 'current-user-id',
        startTime: workOrder.scheduledStart,
      });
    });

    assignedMachines.forEach((machine) => {
      createAllocation({
        workOrderId: workOrder.id,
        machineId: machine.id,
        status: 'active',
        allocatedBy: 'current-user-id',
        startTime: workOrder.scheduledStart,
      });
    });

    alert('Resources allocated successfully!');
    onClose();
  };

  const availableOperators = operators.filter(
    (op) =>
      op.status === 'available' && !assignedOperators.find((assigned) => assigned.id === op.id)
  );

  const availableMachines = machines.filter(
    (m) =>
      m.status === 'available' && !assignedMachines.find((assigned) => assigned.id === m.id)
  );

  // Allow allocation if no critical errors (warnings are okay)
  const canAllocate = validationErrors.length === 0 && 
                      (assignedOperators.length > 0 || assignedMachines.length > 0);
  
  const isFullyValid = validationErrors.length === 0 && validationWarnings.length === 0;

  return (
    <div className="allocation-interface">
      <div className="allocation-interface-container">
        <div className="allocation-header">
          <div>
            <h2>Allocate Resources</h2>
            <p>
              {workOrder.orderNumber} - {workOrder.productName}
            </p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="allocation-content">
        {/* Requirements Summary */}
        <div className="requirements-panel">
          <h3>Requirements</h3>
          <div className="requirement-list">
            <div className="requirement-item">
              <strong>Operators:</strong> {workOrder.requirements.operators.count}
              <div className="requirement-details">
                Skills: {workOrder.requirements.operators.requiredSkills.join(', ')}
              </div>
            </div>
            <div className="requirement-item">
              <strong>Machines:</strong> {workOrder.requirements.machines.count}
              <div className="requirement-details">
                Capabilities: {workOrder.requirements.machines.requiredCapabilities.join(', ')}
              </div>
            </div>
          </div>
        </div>

        {/* Available Resources */}
        <div className="resources-section">
          <div className="resource-column">
            <h3>Available Operators ({availableOperators.length})</h3>
            <div className="draggable-list">
              {availableOperators.map((operator) => (
                <DraggableOperator key={operator.id} operator={operator} />
              ))}
            </div>
          </div>

          <div className="resource-column">
            <h3>Available Machines ({availableMachines.length})</h3>
            <div className="draggable-list">
              {availableMachines.map((machine) => (
                <DraggableMachine key={machine.id} machine={machine} />
              ))}
            </div>
          </div>
        </div>

        {/* Drop Zones */}
        <div className="drop-zones">
          <div
            ref={dropOperator}
            className={`drop-zone ${isOverOperator ? 'drop-active' : ''}`}
          >
            <div className="drop-zone-header">
              <h3>Assigned Operators</h3>
              <span className="count-badge">
                {assignedOperators.length} / {workOrder.requirements.operators.count}
              </span>
            </div>
            {assignedOperators.length === 0 ? (
              <div className="drop-zone-empty">
                <Plus size={32} />
                <p>Drag operators here to assign</p>
              </div>
            ) : (
              <div className="assigned-list">
                {assignedOperators.map((operator) => (
                  <div key={operator.id} className="assigned-resource">
                    <div className="assigned-info">
                      <div className="assigned-name">{operator.name}</div>
                      <div className="assigned-details">
                        {operator.skills.map((s) => s.name).join(', ')}
                      </div>
                    </div>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveOperator(operator.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            ref={dropMachine}
            className={`drop-zone ${isOverMachine ? 'drop-active' : ''}`}
          >
            <div className="drop-zone-header">
              <h3>Assigned Machines</h3>
              <span className="count-badge">
                {assignedMachines.length} / {workOrder.requirements.machines.count}
              </span>
            </div>
            {assignedMachines.length === 0 ? (
              <div className="drop-zone-empty">
                <Plus size={32} />
                <p>Drag machines here to assign</p>
              </div>
            ) : (
              <div className="assigned-list">
                {assignedMachines.map((machine) => (
                  <div key={machine.id} className="assigned-resource">
                    <div className="assigned-info">
                      <div className="assigned-name">{machine.name}</div>
                      <div className="assigned-details">{machine.type}</div>
                    </div>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveMachine(machine.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Validation Messages */}
        {validationErrors.length > 0 && (
          <div className="validation-panel error">
            <AlertCircle size={20} />
            <div>
              <strong>Critical Errors:</strong>
              <ul>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {validationWarnings.length > 0 && validationErrors.length === 0 && (
          <div className="validation-panel warning">
            <AlertCircle size={20} />
            <div>
              <strong>Warnings:</strong>
              <ul>
                {validationWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>
                You can proceed with allocation, but optimal requirements are not met.
              </p>
            </div>
          </div>
        )}

        {isFullyValid && (
          <div className="validation-panel success">
            <CheckCircle size={20} />
            <span>All requirements met! Ready to allocate.</span>
          </div>
        )}
      </div>

        {/* Actions */}
        <div className="allocation-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAllocate}
            disabled={!canAllocate}
          >
            {validationWarnings.length > 0 && validationErrors.length === 0
              ? 'Allocate with Warnings'
              : 'Allocate Resources'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllocationInterface;
