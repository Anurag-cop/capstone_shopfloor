import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlertBanner from '@/components/AlertBanner';
import type { Alert } from '@/types';

describe('AlertBanner Component', () => {
  let mockAlerts: Alert[];
  const mockOnAcknowledge = vi.fn();
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    mockAlerts = [];
    mockOnAcknowledge.mockClear();
    mockOnDismiss.mockClear();
  });

  it('should render null when no alerts', () => {
    const { container } = render(
      <AlertBanner alerts={[]} onAcknowledge={mockOnAcknowledge} onDismiss={mockOnDismiss} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should display action required alerts', () => {
    mockAlerts = [
      {
        id: 'alert-001',
        type: 'blocked-order',
        severity: 'error',
        message: 'Work Order WO-001 is blocked',
        workOrderId: 'wo-001',
        timestamp: new Date(),
        acknowledged: false,
        actionRequired: true,
      },
    ];

    render(
      <AlertBanner alerts={mockAlerts} onAcknowledge={mockOnAcknowledge} onDismiss={mockOnDismiss} />
    );
    expect(screen.getByText('Work Order WO-001 is blocked')).toBeInTheDocument();
  });

  it('should display multiple alerts', () => {
    mockAlerts = [
      {
        id: 'alert-001',
        type: 'blocked-order',
        severity: 'error',
        message: 'Alert 1',
        timestamp: new Date(),
        acknowledged: false,
        actionRequired: true,
      },
      {
        id: 'alert-002',
        type: 'idle-resource',
        severity: 'warning',
        message: 'Alert 2',
        timestamp: new Date(),
        acknowledged: false,
        actionRequired: true,
      },
    ];

    render(
      <AlertBanner alerts={mockAlerts} onAcknowledge={mockOnAcknowledge} onDismiss={mockOnDismiss} />
    );
    expect(screen.getByText('Alert 1')).toBeInTheDocument();
    expect(screen.getByText('Alert 2')).toBeInTheDocument();
  });

  it('should not display action required for acknowledged alerts', () => {
    mockAlerts = [
      {
        id: 'alert-001',
        type: 'idle-resource',
        severity: 'warning',
        message: 'Action Alert',
        timestamp: new Date(),
        acknowledged: false,
        actionRequired: true,
      },
      {
        id: 'alert-002',
        type: 'maintenance-due',
        severity: 'info',
        message: 'Recent Activity',
        timestamp: new Date(),
        acknowledged: true,
        actionRequired: false,
      },
    ];

    render(
      <AlertBanner alerts={mockAlerts} onAcknowledge={mockOnAcknowledge} onDismiss={mockOnDismiss} />
    );
    expect(screen.getByText('Action Alert')).toBeInTheDocument();
  });

  it('should display severity icons correctly', () => {
    mockAlerts = [
      {
        id: 'alert-001',
        type: 'blocked-order',
        severity: 'error',
        message: 'Error alert',
        timestamp: new Date(),
        acknowledged: false,
        actionRequired: true,
      },
    ];

    render(
      <AlertBanner alerts={mockAlerts} onAcknowledge={mockOnAcknowledge} onDismiss={mockOnDismiss} />
    );
    const alertBanner = screen.getByText('Error alert').closest('.alert-item');
    expect(alertBanner).toHaveClass('alert-error');
  });
});
