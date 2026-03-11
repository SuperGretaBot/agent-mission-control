'use client';

import { Satellite, Wifi, WifiOff, Activity } from 'lucide-react';
import { useAgentStore } from '@/store/agent.store';
import { format } from 'date-fns';

// ============================================
// COMPONENT
// ============================================

export function Header() {
  const { isConnected, stats, lastUpdate } = useAgentStore();

  return (
    <header className="bg-mission-surface border-b border-mission-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-mission-card flex items-center justify-center border border-mission-accent shadow-glow">
            <Satellite className="w-7 h-7 text-mission-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wider text-mission-text-primary glow-text">
              AGENT MISSION CONTROL
            </h1>
            <p className="text-xs text-mission-text-muted tracking-widest">
              REAL-TIME MONITORING SYSTEM
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8">
          {/* Agents */}
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-mission-accent">
              {stats?.onlineAgents ?? 0}
              <span className="text-mission-text-muted">/{stats?.totalAgents ?? 0}</span>
            </p>
            <p className="text-xs text-mission-text-muted uppercase tracking-wider">Agents Online</p>
          </div>

          {/* Running Tasks */}
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-mission-success">
              {stats?.runningTasks ?? 0}
            </p>
            <p className="text-xs text-mission-text-muted uppercase tracking-wider">Running</p>
          </div>

          {/* Completed */}
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-mission-text-primary">
              {stats?.totalTasksCompleted ?? 0}
            </p>
            <p className="text-xs text-mission-text-muted uppercase tracking-wider">Completed</p>
          </div>

          {/* Errors */}
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-mission-error">
              {stats?.totalErrors ?? 0}
            </p>
            <p className="text-xs text-mission-text-muted uppercase tracking-wider">Errors</p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2 px-4 py-2 bg-mission-card rounded-lg border border-mission-border">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-mission-success" />
                <span className="text-xs text-mission-success uppercase tracking-wider">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-mission-error" />
                <span className="text-xs text-mission-error uppercase tracking-wider">Disconnected</span>
              </>
            )}
          </div>

          {/* Live Indicator */}
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-mission-accent animate-pulse" />
            <div className="text-right">
              <p className="text-xs text-mission-text-muted">LAST UPDATE</p>
              <p className="text-xs text-mission-text-secondary font-mono">
                {lastUpdate ? format(new Date(lastUpdate), 'HH:mm:ss') : '--:--:--'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
