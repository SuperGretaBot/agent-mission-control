'use client';

import { Bot, Clock, Cpu, HardDrive, CheckCircle } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { Agent } from '@/types/agent.types';
import { formatDistanceToNow } from 'date-fns';

// ============================================
// TYPES
// ============================================

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
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
  return agentColors[agentId.toLowerCase()] || 'text-mission-text-muted';
};

function formatUptime(ms?: number): string {
  if (!ms) return '--';
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

// ============================================
// COMPONENT
// ============================================

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const lastSeen = formatDistanceToNow(new Date(agent.lastSeenAt), { addSuffix: true });

  return (
    <div 
      className="card border-glow hover:border-mission-accent transition-colors duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-mission-surface flex items-center justify-center border border-mission-border overflow-hidden">
            {agent.avatar ? (
              <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
            ) : (
              <Bot className="w-6 h-6 text-mission-accent" />
            )}
          </div>
          <div>
            <h3 className="font-display font-bold text-mission-text-primary">
              {agent.name}
            </h3>
            <p className={`text-xs font-medium ${getAgentColor(agent.id)}`}>{agent.host}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} size="lg" />
      </div>

      {/* Current Task */}
      {agent.currentTask && (
        <div className="mb-4 p-2 bg-mission-surface rounded border-l-2 border-mission-accent">
          <p className="text-xs text-mission-text-muted mb-1">CURRENT TASK</p>
          <p className="text-sm text-mission-accent truncate">{agent.currentTask}</p>
        </div>
      )}

      {/* Last Task */}
      {agent.lastTask && !agent.currentTask && (
        <div className="mb-4 p-2 bg-mission-surface rounded border-l-2 border-mission-text-muted">
          <p className="text-xs text-mission-text-muted mb-1">LAST TASK</p>
          <p className="text-sm text-mission-text-secondary truncate">{agent.lastTask}</p>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* CPU */}
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-mission-text-muted" />
          <div className="flex-1">
            <div className="h-1.5 bg-mission-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-mission-accent transition-all duration-500"
                style={{ width: `${agent.cpu || 0}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-mission-text-secondary w-10 text-right">
            {agent.cpu ?? '--'}%
          </span>
        </div>

        {/* RAM */}
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-mission-text-muted" />
          <div className="flex-1">
            <div className="h-1.5 bg-mission-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-mission-success transition-all duration-500"
                style={{ width: `${agent.ram || 0}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-mission-text-secondary w-10 text-right">
            {agent.ram ?? '--'}%
          </span>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-mission-border">
        <div className="flex items-center gap-1 text-xs text-mission-text-muted">
          <Clock className="w-3 h-3" />
          <span>{formatUptime(agent.uptime)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-mission-success">
          <CheckCircle className="w-3 h-3" />
          <span>{agent.tasksCompleted} tasks</span>
        </div>
        <div className="text-xs text-mission-text-muted">
          {lastSeen}
        </div>
      </div>
    </div>
  );
}
