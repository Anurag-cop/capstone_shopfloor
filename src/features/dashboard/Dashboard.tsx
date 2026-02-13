import { useEffect, useState } from 'react';
import { Factory, RefreshCw } from 'lucide-react';
import MetricsCards from '@/components/MetricsCards';
import WorkOrderPanel from '@/components/WorkOrderPanel';
import ResourcePanel from '@/components/ResourcePanel';
import AlertBanner from '@/components/AlertBanner';
import AllocationInterface from '@/components/AllocationInterface';
import { useAppStore } from '@/store';
import {
  mockOperators,
  mockMachines,
  mockMaterials,
  mockWorkOrders,
  mockAlerts,
  mockMetrics,
} from '@/utils/mockData';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [showAllocationInterface, setShowAllocationInterface] = useState(false);
  
  const {
    operators,
    machines,
    workOrders,
    alerts,
    metrics,
    selectedWorkOrder,
    setOperators,
    setMachines,
    setMaterials,
    setWorkOrders,
    setAlerts,
    setMetrics,
    selectWorkOrder,
    selectOperator,
    selectMachine,
    acknowledgeAlert,
    dismissAlert,
    refreshData,
    isLoading,
  } = useAppStore();

  // Initialize with mock data
  useEffect(() => {
    setOperators(mockOperators);
    setMachines(mockMachines);
    setMaterials(mockMaterials);
    setWorkOrders(mockWorkOrders);
    setAlerts(mockAlerts);
    setMetrics(mockMetrics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        ...mockMetrics,
        lastUpdated: new Date(),
      });
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    await refreshData();
  };

  const handleSelectWorkOrder = (workOrder: typeof selectedWorkOrder) => {
    selectWorkOrder(workOrder);
    if (workOrder) {
      setShowAllocationInterface(true);
    }
  };

  const handleCloseAllocation = () => {
    setShowAllocationInterface(false);
    selectWorkOrder(null);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <Factory size={32} />
            </div>
            <div className="header-title">
              <h1>Shop-Floor Resource Allocation</h1>
              <p className="header-subtitle">Manufacturing Operations Dashboard</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="user-info">
              <div className="user-avatar">JD</div>
              <div className="user-details">
                <div className="user-name">Jane Doe</div>
                <div className="user-role">Supervisor</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="container">
          {/* Alerts */}
          {alerts.length > 0 && (
            <AlertBanner
              alerts={alerts}
              onAcknowledge={acknowledgeAlert}
              onDismiss={dismissAlert}
            />
          )}

          {/* Metrics */}
          {metrics && <MetricsCards metrics={metrics} />}

          {/* Work Orders and Resources Grid */}
          <div className="dashboard-grid">
            <div className="grid-column">
              <WorkOrderPanel
                workOrders={workOrders}
                onSelectWorkOrder={handleSelectWorkOrder}
                selectedWorkOrder={selectedWorkOrder}
              />
            </div>
            <div className="grid-column">
              <ResourcePanel
                operators={operators}
                machines={machines}
                onSelectOperator={selectOperator}
                onSelectMachine={selectMachine}
              />
            </div>
          </div>

          {/* Allocation Zone - Placeholder for drag-and-drop */}
          <div className="allocation-zone">
            <div className="allocation-header">
              <h3>Quick Allocation</h3>
              <p>Select a work order and assign resources by clicking on available operators and machines</p>
            </div>
            {selectedWorkOrder ? (
              <div className="selected-order-info">
                <div className="selected-order-header">
                  <h4>Selected: {selectedWorkOrder.orderNumber}</h4>
                  <span className={`badge priority-${selectedWorkOrder.priority}`}>
                    {selectedWorkOrder.priority}
                  </span>
                </div>
                <div className="selected-order-details">
                  <p><strong>Product:</strong> {selectedWorkOrder.productName}</p>
                  <p><strong>Quantity:</strong> {selectedWorkOrder.quantity}</p>
                  <p><strong>Requirements:</strong></p>
                  <ul>
                    <li>
                      Operators: {selectedWorkOrder.requirements.operators.count} with skills:{' '}
                      {selectedWorkOrder.requirements.operators.requiredSkills.join(', ')}
                    </li>
                    <li>
                      Machines: {selectedWorkOrder.requirements.machines.count} with capabilities:{' '}
                      {selectedWorkOrder.requirements.machines.requiredCapabilities.join(', ')}
                    </li>
                    <li>
                      Materials: {selectedWorkOrder.requirements.materials.length} items
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="empty-selection">
                <p>No work order selected. Click on a work order above to start allocating resources.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="container">
          <p>© 2026 Manufacturing Operations System | Last updated: {metrics?.lastUpdated.toLocaleTimeString()}</p>
        </div>
      </footer>

      {/* Allocation Interface Modal */}
      {showAllocationInterface && selectedWorkOrder && (
        <AllocationInterface
          workOrder={selectedWorkOrder}
          operators={operators}
          machines={machines}
          onClose={handleCloseAllocation}
        />
      )}
    </div>
  );
};

export default Dashboard;
