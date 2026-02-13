import { AlertCircle, AlertTriangle, Info, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import type { Alert } from '@/types';
import './AlertBanner.css';

interface AlertBannerProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onAcknowledge, onDismiss }) => {
  const getAlertIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return <AlertCircle size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  const getAlertClass = (severity: Alert['severity']) => {
    return `alert-item alert-${severity}`;
  };

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged && a.actionRequired);
  const otherAlerts = alerts.filter((a) => a.acknowledged || !a.actionRequired);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="alert-banner">
      <div className="alert-header">
        <h3>Alerts & Notifications</h3>
        {unacknowledgedAlerts.length > 0 && (
          <span className="alert-count">{unacknowledgedAlerts.length} requiring action</span>
        )}
      </div>

      <div className="alert-list">
        {unacknowledgedAlerts.length > 0 && (
          <div className="alert-section">
            <div className="section-title">Action Required</div>
            {unacknowledgedAlerts.map((alert) => (
              <div key={alert.id} className={getAlertClass(alert.severity)}>
                <div className="alert-icon">{getAlertIcon(alert.severity)}</div>
                <div className="alert-content">
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-time">
                    {format(alert.timestamp, 'HH:mm:ss')}
                  </div>
                </div>
                <div className="alert-actions">
                  <button
                    className="btn-action acknowledge"
                    onClick={() => onAcknowledge(alert.id)}
                    title="Acknowledge"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    className="btn-action dismiss"
                    onClick={() => onDismiss(alert.id)}
                    title="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {otherAlerts.length > 0 && (
          <div className="alert-section">
            <div className="section-title">Recent Activity</div>
            {otherAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className={`${getAlertClass(alert.severity)} acknowledged`}>
                <div className="alert-icon">{getAlertIcon(alert.severity)}</div>
                <div className="alert-content">
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-time">
                    {format(alert.timestamp, 'HH:mm:ss')}
                  </div>
                </div>
                <div className="alert-actions">
                  <button
                    className="btn-action dismiss"
                    onClick={() => onDismiss(alert.id)}
                    title="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertBanner;
