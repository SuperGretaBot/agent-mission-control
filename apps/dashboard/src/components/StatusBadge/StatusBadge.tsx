import { clsx } from 'clsx';
import type { AgentStatus } from '@/types/agent.types';

// ============================================
// TYPES
// ============================================

interface StatusBadgeProps {
  status: AgentStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// ============================================
// STATUS CONFIG
// ============================================

const statusConfig: Record<AgentStatus, { label: string; className: string }> = {
  online: {
    label: 'ONLINE',
    className: 'status-online',
  },
  offline: {
    label: 'OFFLINE',
    className: 'status-offline',
  },
  running: {
    label: 'RUNNING',
    className: 'status-running',
  },
  idle: {
    label: 'IDLE',
    className: 'status-idle',
  },
  error: {
    label: 'ERROR',
    className: 'status-error',
  },
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

// ============================================
// COMPONENT
// ============================================

export function StatusBadge({ status, size = 'md', showLabel = false }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div
        className={clsx(
          'rounded-full',
          sizeClasses[size],
          config.className
        )}
      />
      {showLabel && (
        <span className="text-xs font-medium tracking-wider text-mission-text-secondary">
          {config.label}
        </span>
      )}
    </div>
  );
}
