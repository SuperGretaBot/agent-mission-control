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
    <header className="bg-mission-surface border-b border-mission-border px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-mission-card flex items-center justify-center border border-mission-accent shadow-glow">
            <Satellite className="w-5 h-5 md:w-7 md:h-7 text-mission-accent" />
          </div>
          <div>
            <h1 className="font-display text-lg md:text-2xl font-bold tracking-wider text-mission-text-primary glow-text">
              <span className="hidden sm:inline">AGENT </span>MISSION CONTROL
            </h1>
            <p className="text-[10px] md:text-xs text-mission-text-muted tracking-widest hidden sm:block">
              REAL-TIME MONITORING SYSTEM
            </p>
          </div>
        </div>

        {/* Stats - Hidden on mobile, visible on md+ */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {/* Agents */}
          <div className="text-center">
            <p className="text-xl lg:text-2xl font-display font-bold text-mission-accent">
              {stats?.onlineAgents ?? 0}
              <span className="text-mission-text-muted">/{stats?.totalAgents ?? 0}</span>
            </p>
            <p className="text-[10px] lg:text-xs text-mission-text-muted uppercase tracking-wider">Agents</p>
          </div>

          {/* Running Tasks */}
          <div className="text-center">
            <p className="text-xl lg:text-2xl font-display font-bold text-mission-success">
              {stats?.runningTasks ?? 0}
            </p>
            <p className="text-[10px] lg:text-xs text-mission-text-muted uppercase tracking-wider">Running</p>
          </div>

          {/* Completed */}
          <div className="text-center hidden lg:block">
            <p className="text-2xl font-display font-bold text-mission-text-primary">
              {stats?.totalTasksCompleted ?? 0}
            </p>
            <p className="text-xs text-mission-text-muted uppercase tracking-wider">Completed</p>
          </div>

          {/* Errors */}
          <div className="text-center">
            <p className="text-xl lg:text-2xl font-display font-bold text-mission-error">
              {stats?.totalErrors ?? 0}
            </p>
            <p className="text-[10px] lg:text-xs text-mission-text-muted uppercase tracking-wider">Errors</p>
          </div>
        </div>

        {/* Right side - Connection + Activity */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-mission-card rounded-lg border border-mission-border">
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 md:w-4 md:h-4 text-mission-success" />
                <span className="text-[10px] md:text-xs text-mission-success uppercase tracking-wider hidden sm:inline">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 md:w-4 md:h-4 text-mission-error" />
                <span className="text-[10px] md:text-xs text-mission-error uppercase tracking-wider hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          {/* Live Indicator - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2">
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

      {/* Mobile Stats Bar */}
      <div className="flex md:hidden items-center justify-around mt-3 pt-3 border-t border-mission-border">
        <div className="text-center">
          <p className="text-lg font-display font-bold text-mission-accent">
            {stats?.onlineAgents ?? 0}/{stats?.totalAgents ?? 0}
          </p>
          <p className="text-[10px] text-mission-text-muted uppercase">Agents</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-display font-bold text-mission-success">
            {stats?.runningTasks ?? 0}
          </p>
          <p className="text-[10px] text-mission-text-muted uppercase">Running</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-display font-bold text-mission-text-primary">
            {stats?.totalTasksCompleted ?? 0}
          </p>
          <p className="text-[10px] text-mission-text-muted uppercase">Done</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-display font-bold text-mission-error">
            {stats?.totalErrors ?? 0}
          </p>
          <p className="text-[10px] text-mission-text-muted uppercase">Errors</p>
        </div>
      </div>
    </header>
  );
}
