import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricsCards from '@/components/MetricsCards';
import type { DashboardMetrics } from '@/types';

describe('MetricsCards Component', () => {
  const mockMetrics: DashboardMetrics = {
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

  it('should render all metric categories', () => {
    render(<MetricsCards metrics={mockMetrics} />);

    // Check that the component renders with metrics data
    const container = screen.getByText(/Overall Utilization/i).closest('.metric-card');
    expect(container).toBeInTheDocument();
  });

  it('should display utilization percentages', () => {
    render(<MetricsCards metrics={mockMetrics} />);

    const container = screen.getByText(/Overall Utilization/i).closest('.metric-card');
    expect(container?.textContent).toContain('75');
    expect(container?.textContent).toContain('72');
    expect(container?.textContent).toContain('78');
  });

  it('should display idle resource costs', () => {
    render(<MetricsCards metrics={mockMetrics} />);

    const container = screen.getByText(/Idle Resources/i).closest('.metric-card');
    expect(container?.textContent).toContain('142');
    expect(container?.textContent).toContain('Operators');
    expect(container?.textContent).toContain('1,850');
  });

  it('should display production throughput metrics', () => {
    render(<MetricsCards metrics={mockMetrics} />);

    const container = screen.getByText(/Production/i).closest('.metric-card');
    expect(container?.textContent).toContain('18.5');
    expect(container?.textContent).toContain('Active');
    expect(container?.textContent).toContain('Completed');
  });

  it('should display on-time completion rate', () => {
    render(<MetricsCards metrics={mockMetrics} />);

    const container = screen.getByText(/On-Time Completion/i).closest('.metric-card');
    expect(container?.textContent).toContain('87');
  });

  it('should handle zero values gracefully', () => {
    const zeroMetrics: DashboardMetrics = {
      utilization: { overall: 0, operators: 0, machines: 0, trend: 'down' },
      idle: { totalIdle: 0, idleOperators: 0, idleMachines: 0, costImpact: 0 },
      production: { throughput: 0, completedOrders: 0, activeOrders: 0, blockedOrders: 0, onTimeCompletionRate: 0 },
      lastUpdated: new Date(),
    };

    render(<MetricsCards metrics={zeroMetrics} />);

    // Should render without errors with zero values
    expect(screen.getByText(/Overall Utilization/i)).toBeInTheDocument();
  });

  it('should handle high utilization values', () => {
    const highMetrics: DashboardMetrics = {
      utilization: { overall: 99, operators: 98, machines: 100, trend: 'stable' },
      idle: { totalIdle: 10, idleOperators: 1, idleMachines: 0, costImpact: 100 },
      production: { throughput: 50.5, completedOrders: 50, activeOrders: 5, blockedOrders: 0, onTimeCompletionRate: 100 },
      lastUpdated: new Date(),
    };

    render(<MetricsCards metrics={highMetrics} />);

    const container = screen.getByText(/Overall Utilization/i).closest('.metric-card');
    expect(container?.textContent).toContain('99');
    expect(container?.textContent).toContain('98');
  });
});
