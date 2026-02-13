import { AlertCircle, Clock, Package, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type { WorkOrder } from '@/types';
import './WorkOrderPanel.css';

interface WorkOrderPanelProps {
  workOrders: WorkOrder[];
  onSelectWorkOrder: (workOrder: WorkOrder) => void;
  selectedWorkOrder: WorkOrder | null;
}

const WorkOrderPanel: React.FC<WorkOrderPanelProps> = ({
  workOrders,
  onSelectWorkOrder,
  selectedWorkOrder,
}) => {
  const getPriorityBadgeClass = (priority: WorkOrder['priority']) => {
    return `badge priority-${priority}`;
  };

  const getStatusBadgeClass = (status: WorkOrder['status']) => {
    switch (status) {
      case 'in-progress':
        return 'badge badge-info';
      case 'completed':
        return 'badge badge-success';
      case 'blocked':
        return 'badge badge-error';
      default:
        return 'badge badge-neutral';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'progress-low';
    if (progress < 70) return 'progress-medium';
    return 'progress-high';
  };

  const sortedWorkOrders = [...workOrders].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const statusOrder = { blocked: 0, pending: 1, 'in-progress': 2, completed: 3 };
    
    if (a.status !== b.status) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="work-order-panel">
      <div className="panel-header">
        <h2>Work Orders</h2>
        <div className="status-summary">
          <span className="summary-item">
            <span className="status-dot status-info"></span>
            {workOrders.filter((wo) => wo.status === 'in-progress').length} Active
          </span>
          <span className="summary-item">
            <span className="status-dot status-neutral"></span>
            {workOrders.filter((wo) => wo.status === 'pending').length} Pending
          </span>
          <span className="summary-item">
            <span className="status-dot status-error"></span>
            {workOrders.filter((wo) => wo.status === 'blocked').length} Blocked
          </span>
        </div>
      </div>

      <div className="work-order-list">
        {sortedWorkOrders.map((workOrder) => (
          <div
            key={workOrder.id}
            className={`work-order-card ${selectedWorkOrder?.id === workOrder.id ? 'selected' : ''}`}
            onClick={() => onSelectWorkOrder(workOrder)}
          >
            <div className="work-order-header">
              <div className="work-order-title">
                <Package size={16} />
                <span className="order-number">{workOrder.orderNumber}</span>
              </div>
              <ChevronRight size={16} className="chevron-icon" />
            </div>

            <div className="work-order-product">{workOrder.productName}</div>

            <div className="work-order-badges">
              <span className={getPriorityBadgeClass(workOrder.priority)}>
                {workOrder.priority}
              </span>
              <span className={getStatusBadgeClass(workOrder.status)}>
                {workOrder.status.replace('-', ' ')}
              </span>
            </div>

            <div className="work-order-info">
              <div className="info-item">
                <Clock size={14} />
                <span>
                  {format(workOrder.scheduledStart, 'HH:mm')} -{' '}
                  {format(workOrder.scheduledEnd, 'HH:mm')}
                </span>
              </div>
              <div className="info-item">
                <Package size={14} />
                <span>Qty: {workOrder.quantity}</span>
              </div>
            </div>

            {workOrder.status === 'in-progress' && (
              <div className="work-order-progress">
                <div className="progress-header">
                  <span className="progress-label">Progress</span>
                  <span className="progress-value">{workOrder.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${getProgressColor(workOrder.progress)}`}
                    style={{ width: `${workOrder.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {workOrder.status === 'blocked' && (
              <div className="work-order-alert">
                <AlertCircle size={14} />
                <span>Action required</span>
              </div>
            )}

            <div className="work-order-resources">
              <span className="resource-count">
                👤 {workOrder.assignedResources.operators.length}/{workOrder.requirements.operators.count}
              </span>
              <span className="resource-count">
                🔧 {workOrder.assignedResources.machines.length}/{workOrder.requirements.machines.count}
              </span>
              <span className="resource-count">
                📦 {workOrder.assignedResources.materials.length}/{workOrder.requirements.materials.length}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkOrderPanel;
