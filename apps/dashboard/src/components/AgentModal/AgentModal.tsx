'use client';

import { useEffect, useState } from 'react';
import { X, Clock, Cpu, HardDrive, Activity } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import type { Agent, AgentLog } from '@/types/agent.types';
import { apiService } from '@/services/api.service';

// ============================================
// TYPES
// ============================================

interface AgentModalProps {
  agent: Agent;
  onClose: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function AgentModal({ agent, onClose }: AgentModalProps) {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await apiService.getLogs(100);
        // Filter logs for this agent and only today
        const agentLogs = response.logs.filter(
          (log) => log.agentId === agent.id && isToday(parseISO(log.timestamp))
        );
        setLogs(agentLogs);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [agent.id]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const levelColors = {
    debug: 'text-mission-text-muted',
    info: 'text-mission-accent',
    warn: 'text-mission-warning',
    error: 'text-mission-error',
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-mission-card border border-mission-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-mission-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-mission-surface border border-mission-border overflow-hidden">
              {agent.avatar ? (
                <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-mission-accent">
                  <Activity className="w-6 h-6" />
                </div>
              )}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-mission-text-primary">
                {agent.name}
              </h2>
              <p className="text-sm text-mission-text-muted">{agent.host}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-mission-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-mission-text-muted" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-mission-border">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-mission-accent">
              {agent.status === 'running' ? '🔵' : agent.status === 'idle' ? '🟢' : '⚪'}
            </p>
            <p className="text-xs text-mission-text-muted uppercase">{agent.status}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Cpu className="w-4 h-4 text-mission-text-muted" />
              <p className="text-lg font-bold text-mission-text-primary">{agent.cpu ?? '--'}%</p>
            </div>
            <p className="text-xs text-mission-text-muted">CPU</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <HardDrive className="w-4 h-4 text-mission-text-muted" />
              <p className="text-lg font-bold text-mission-text-primary">{agent.ram ?? '--'}%</p>
            </div>
            <p className="text-xs text-mission-text-muted">RAM</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-mission-success">{agent.tasksCompleted}</p>
            <p className="text-xs text-mission-text-muted">Tasks</p>
          </div>
        </div>

        {/* Current Task */}
        {agent.currentTask && (
          <div className="p-4 border-b border-mission-border bg-mission-accent/5">
            <p className="text-xs text-mission-text-muted mb-1">CURRENT TASK</p>
            <p className="text-sm text-mission-accent">{agent.currentTask}</p>
          </div>
        )}

        {/* Logs */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-mission-border">
            <h3 className="text-sm font-display text-mission-text-muted uppercase tracking-wider">
              Today's Logs ({logs.length})
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <p className="text-center text-mission-text-muted py-8">Loading logs...</p>
            ) : logs.length === 0 ? (
              <p className="text-center text-mission-text-muted py-8">No logs today</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-2 rounded bg-mission-surface/50 hover:bg-mission-surface transition-colors"
                  >
                    <span className="flex-shrink-0 text-xs text-mission-text-muted font-mono">
                      {format(parseISO(log.timestamp), 'HH:mm:ss')}
                    </span>
                    <span className={`flex-shrink-0 text-xs font-medium uppercase w-12 ${levelColors[log.level]}`}>
                      {log.level}
                    </span>
                    <span className="text-sm text-mission-text-primary flex-1">
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-mission-border text-center">
          <p className="text-xs text-mission-text-muted">
            Last seen: {format(parseISO(agent.lastSeenAt), 'HH:mm:ss')}
          </p>
        </div>
      </div>
    </div>
  );
}
