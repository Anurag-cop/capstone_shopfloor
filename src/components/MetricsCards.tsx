import { TrendingUp, TrendingDown, Minus, Users, Package, Activity, Clock } from 'lucide-react';
import type { DashboardMetrics } from '@/types';
import './MetricsCards.css';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="trend-icon trend-up" size={16} />;
      case 'down':
        return <TrendingDown className="trend-icon trend-down" size={16} />;
      default:
        return <Minus className="trend-icon trend-stable" size={16} />;
    }
  };

  return (
    <div className="metrics-cards">
      {/* Overall Utilization */}
      <div className="metric-card">
        <div className="metric-header">
          <div className="metric-icon utilization">
            <Activity size={20} />
          </div>
          <h3 className="metric-title">Overall Utilization</h3>
        </div>
        <div className="metric-content">
          <div className="metric-value">{metrics.utilization.overall}%</div>
          <div className="metric-breakdown">
            <span>Operators: {metrics.utilization.operators}%</span>
            <span>Machines: {metrics.utilization.machines}%</span>
          </div>
          <div className="metric-trend">
            {getTrendIcon(metrics.utilization.trend)}
            <span>Target: 85%</span>
          </div>
        </div>
      </div>

      {/* Idle Resources */}
      <div className="metric-card">
        <div className="metric-header">
          <div className="metric-icon idle">
            <Clock size={20} />
          </div>
          <h3 className="metric-title">Idle Resources</h3>
        </div>
        <div className="metric-content">
          <div className="metric-value">{metrics.idle.totalIdle} min</div>
          <div className="metric-breakdown">
            <span>{metrics.idle.idleOperators} Operators</span>
            <span>{metrics.idle.idleMachines} Machines</span>
          </div>
          <div className="metric-cost">
            Cost Impact: ${metrics.idle.costImpact.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Production Throughput */}
      <div className="metric-card">
        <div className="metric-header">
          <div className="metric-icon production">
            <Package size={20} />
          </div>
          <h3 className="metric-title">Production</h3>
        </div>
        <div className="metric-content">
          <div className="metric-value">{metrics.production.throughput}</div>
          <div className="metric-label">units/hour</div>
          <div className="metric-breakdown">
            <span>Active: {metrics.production.activeOrders}</span>
            <span>Completed: {metrics.production.completedOrders}</span>
            <span className="blocked">Blocked: {metrics.production.blockedOrders}</span>
          </div>
        </div>
      </div>

      {/* On-Time Completion */}
      <div className="metric-card">
        <div className="metric-header">
          <div className="metric-icon completion">
            <Users size={20} />
          </div>
          <h3 className="metric-title">On-Time Completion</h3>
        </div>
        <div className="metric-content">
          <div className="metric-value">{metrics.production.onTimeCompletionRate}%</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${metrics.production.onTimeCompletionRate}%` }}
            ></div>
          </div>
          <div className="metric-target">Target: 90%</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;
