'use client';

import { clsx } from 'clsx';
import { format } from 'date-fns';
import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Task, TaskStatus } from '@/types/agent.types';

// ============================================
// TYPES
// ============================================

interface TaskListProps {
  tasks: Task[];
  title?: string;
  maxHeight?: string;
}

// ============================================
// HELPERS
// ============================================

const statusConfig: Record<TaskStatus, { icon: typeof Play; className: string }> = {
  pending: { icon: Clock, className: 'text-mission-text-muted' },
  running: { icon: Play, className: 'text-mission-accent animate-pulse' },
  success: { icon: CheckCircle, className: 'text-mission-success' },
  error: { icon: XCircle, className: 'text-mission-error' },
};

function formatDuration(ms?: number): string {
  if (!ms) return '--';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

// ============================================
// COMPONENT
// ============================================

export function TaskList({ tasks, title = 'RECENT TASKS', maxHeight = '300px' }: TaskListProps) {
  return (
    <div className="card">
      <h2 className="card-header">{title}</h2>
      
      <div className="space-y-2 overflow-y-auto" style={{ maxHeight }}>
        {tasks.length === 0 ? (
          <p className="text-mission-text-muted text-center py-4 text-sm">No tasks yet</p>
        ) : (
          tasks.map((task) => {
            const config = statusConfig[task.status];
            const Icon = config.icon;

            return (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2 bg-mission-surface rounded hover:bg-mission-border/30 transition-colors"
              >
                <Icon className={clsx('w-4 h-4 flex-shrink-0', config.className)} />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-mission-text-primary truncate">{task.name}</p>
                  <p className="text-xs text-mission-text-muted">
                    {task.agentId} • {format(new Date(task.startedAt), 'HH:mm:ss')}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={clsx('text-xs font-medium uppercase', config.className)}>
                    {task.status}
                  </p>
                  {task.duration && (
                    <p className="text-xs text-mission-text-muted">
                      {formatDuration(task.duration)}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
