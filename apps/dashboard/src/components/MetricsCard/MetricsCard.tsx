'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';

// ============================================
// TYPES
// ============================================

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error';
}

// ============================================
// COMPONENT
// ============================================

const variantClasses = {
  default: 'text-mission-text-primary',
  accent: 'text-mission-accent',
  success: 'text-mission-success',
  warning: 'text-mission-warning',
  error: 'text-mission-error',
};

export function MetricsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = 'default',
}: MetricsCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-2">
        <h3 className="card-header !mb-0">{title}</h3>
        {icon && <div className="text-mission-text-muted">{icon}</div>}
      </div>

      <div className="flex items-end gap-2">
        <p className={clsx('text-3xl font-display font-bold', variantClasses[variant])}>
          {value}
        </p>
        
        {trend && trendValue && (
          <span
            className={clsx(
              'text-xs font-medium mb-1',
              trend === 'up' && 'text-mission-success',
              trend === 'down' && 'text-mission-error',
              trend === 'neutral' && 'text-mission-text-muted'
            )}
          >
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trendValue}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-mission-text-muted mt-1">{subtitle}</p>
      )}
    </div>
  );
}
