import { useState } from 'react';
import { Users, Cpu, Filter, X } from 'lucide-react';
import type { Operator, Machine, ResourceStatus } from '@/types';
import './ResourcePanel.css';

interface ResourcePanelProps {
  operators: Operator[];
  machines: Machine[];
  onSelectOperator: (operator: Operator) => void;
  onSelectMachine: (machine: Machine) => void;
}

type ResourceType = 'operators' | 'machines';

const ResourcePanel: React.FC<ResourcePanelProps> = ({
  operators,
  machines,
  onSelectOperator,
  onSelectMachine,
}) => {
  const [activeTab, setActiveTab] = useState<ResourceType>('operators');
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const getStatusBadgeClass = (status: ResourceStatus) => {
    switch (status) {
      case 'available':
        return 'badge badge-success';
      case 'busy':
        return 'badge badge-warning';
      case 'maintenance':
        return 'badge badge-neutral';
      case 'offline':
        return 'badge badge-error';
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate < 50) return 'util-low';
    if (rate < 75) return 'util-medium';
    return 'util-high';
  };

  const filterResources = <T extends { status: ResourceStatus }>(resources: T[]) => {
    if (statusFilter === 'all') return resources;
    return resources.filter((r) => r.status === statusFilter);
  };

  const filteredOperators = filterResources(operators);
  const filteredMachines = filterResources(machines);

  const getStatusCounts = (resources: Array<{ status: ResourceStatus }>) => {
    return {
      available: resources.filter((r) => r.status === 'available').length,
      busy: resources.filter((r) => r.status === 'busy').length,
      maintenance: resources.filter((r) => r.status === 'maintenance').length,
      offline: resources.filter((r) => r.status === 'offline').length,
    };
  };

  const operatorCounts = getStatusCounts(operators);
  const machineCounts = getStatusCounts(machines);

  return (
    <div className="resource-panel">
      <div className="panel-header">
        <h2>Resources</h2>
        <button
          className="btn-icon"
          onClick={() => setShowFilters(!showFilters)}
          title="Toggle filters"
        >
          {showFilters ? <X size={20} /> : <Filter size={20} />}
        </button>
      </div>

      <div className="resource-tabs">
        <button
          className={`tab-button ${activeTab === 'operators' ? 'active' : ''}`}
          onClick={() => setActiveTab('operators')}
        >
          <Users size={18} />
          <span>Operators ({operators.length})</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'machines' ? 'active' : ''}`}
          onClick={() => setActiveTab('machines')}
        >
          <Cpu size={18} />
          <span>Machines ({machines.length})</span>
        </button>
      </div>

      {showFilters && (
        <div className="filter-bar">
          <span className="filter-label">Status:</span>
          <button
            className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-chip ${statusFilter === 'available' ? 'active' : ''}`}
            onClick={() => setStatusFilter('available')}
          >
            Available
          </button>
          <button
            className={`filter-chip ${statusFilter === 'busy' ? 'active' : ''}`}
            onClick={() => setStatusFilter('busy')}
          >
            Busy
          </button>
          <button
            className={`filter-chip ${statusFilter === 'maintenance' ? 'active' : ''}`}
            onClick={() => setStatusFilter('maintenance')}
          >
            Maintenance
          </button>
          <button
            className={`filter-chip ${statusFilter === 'offline' ? 'active' : ''}`}
            onClick={() => setStatusFilter('offline')}
          >
            Offline
          </button>
        </div>
      )}

      <div className="status-summary">
        {activeTab === 'operators' ? (
          <>
            <div className="summary-stat success">{operatorCounts.available} Available</div>
            <div className="summary-stat warning">{operatorCounts.busy} Busy</div>
            <div className="summary-stat neutral">{operatorCounts.maintenance} Off</div>
          </>
        ) : (
          <>
            <div className="summary-stat success">{machineCounts.available} Available</div>
            <div className="summary-stat warning">{machineCounts.busy} Busy</div>
            <div className="summary-stat neutral">{machineCounts.maintenance} Maintenance</div>
          </>
        )}
      </div>

      <div className="resource-list">
        {activeTab === 'operators' ? (
          filteredOperators.length > 0 ? (
            filteredOperators.map((operator) => (
              <div
                key={operator.id}
                className="resource-card"
                onClick={() => onSelectOperator(operator)}
                draggable={operator.status === 'available'}
              >
                <div className="resource-header">
                  <div className="resource-avatar">{operator.name.charAt(0)}</div>
                  <div className="resource-info">
                    <div className="resource-name">{operator.name}</div>
                    <div className="resource-id">{operator.employeeId}</div>
                  </div>
                  <span className={getStatusBadgeClass(operator.status)}>
                    {operator.status}
                  </span>
                </div>

                <div className="resource-details">
                  <div className="detail-item">
                    <span className="detail-label">Skills:</span>
                    <span className="detail-value">
                      {operator.skills.map((s) => s.name).join(', ')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{operator.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Shift:</span>
                    <span className="detail-value">{operator.shift}</span>
                  </div>
                </div>

                <div className="utilization-bar">
                  <div className="utilization-header">
                    <span className="utilization-label">Utilization</span>
                    <span className={`utilization-value ${getUtilizationColor(operator.utilizationRate)}`}>
                      {operator.utilizationRate}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${getUtilizationColor(operator.utilizationRate)}`}
                      style={{ width: `${operator.utilizationRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No operators match the selected filters</div>
          )
        ) : filteredMachines.length > 0 ? (
          filteredMachines.map((machine) => (
            <div
              key={machine.id}
              className="resource-card"
              onClick={() => onSelectMachine(machine)}
              draggable={machine.status === 'available'}
            >
              <div className="resource-header">
                <div className="resource-avatar machine">
                  <Cpu size={20} />
                </div>
                <div className="resource-info">
                  <div className="resource-name">{machine.name}</div>
                  <div className="resource-id">{machine.type}</div>
                </div>
                <span className={getStatusBadgeClass(machine.status)}>
                  {machine.status}
                </span>
              </div>

              <div className="resource-details">
                <div className="detail-item">
                  <span className="detail-label">Capabilities:</span>
                  <span className="detail-value">
                    {machine.capabilities.map((c) => c.name).join(', ')}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{machine.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Performance:</span>
                  <span className="detail-value">
                    {machine.performance.efficiency}% efficiency
                  </span>
                </div>
              </div>

              <div className="utilization-bar">
                <div className="utilization-header">
                  <span className="utilization-label">Utilization</span>
                  <span className={`utilization-value ${getUtilizationColor(machine.utilizationRate)}`}>
                    {machine.utilizationRate}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${getUtilizationColor(machine.utilizationRate)}`}
                    style={{ width: `${machine.utilizationRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No machines match the selected filters</div>
        )}
      </div>
    </div>
  );
};

export default ResourcePanel;
