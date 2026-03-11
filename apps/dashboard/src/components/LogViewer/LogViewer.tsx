'use client';

import { clsx } from 'clsx';
import { format } from 'date-fns';
import type { AgentLog } from '@/types/agent.types';

// ============================================
// TYPES
// ============================================

interface LogViewerProps {
  logs: AgentLog[];
  title?: string;
  maxHeight?: string;
  showAgent?: boolean;
}

// ============================================
// HELPERS
// ============================================

// Agent colors
const agentColors: Record<string, string> = {
  tonybot: 'text-blue-400',
  gretabot: 'text-orange-400',
  romabot: 'text-purple-400',
};

const getAgentColor = (agentId: string): string => {
  return agentColors[agentId.toLowerCase()] || 'text-mission-accent';
};

const levelIcons = {
  debug: '○',
  info: '●',
  warn: '▲',
  error: '✕',
};

// ============================================
// COMPONENT
// ============================================

export function LogViewer({
  logs,
  title = 'SYSTEM LOGS',
  maxHeight = '400px',
  showAgent = true,
}: LogViewerProps) {
  return (
    <div className="card">
      <h2 className="card-header">{title}</h2>
      
      <div
        className="space-y-1 overflow-y-auto font-mono text-xs"
        style={{ maxHeight }}
      >
        {logs.length === 0 ? (
          <p className="text-mission-text-muted text-center py-4">No logs yet</p>
        ) : (
          logs.map((log) => {
            const isError = log.level === 'error';
            const colorClass = isError ? 'text-mission-error' : getAgentColor(log.agentId);
            
            return (
              <div
                key={log.id}
                className={clsx(
                  'flex items-start gap-2 py-1 px-2 rounded hover:bg-mission-surface transition-colors',
                  colorClass
                )}
              >
                <span className={clsx('flex-shrink-0 w-4 text-center', colorClass)}>
                  {levelIcons[log.level]}
                </span>
                
                <span className="flex-shrink-0 text-mission-text-muted w-16">
                  {format(new Date(log.timestamp), 'HH:mm:ss')}
                </span>
                
                {showAgent && (
                  <span className={clsx('flex-shrink-0 w-20 truncate font-medium', colorClass)}>
                    [{log.agentId}]
                  </span>
                )}
                
                <span className={clsx('flex-1 break-words', colorClass)}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
