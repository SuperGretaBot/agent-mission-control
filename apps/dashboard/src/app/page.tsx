'use client';

import { useState } from 'react';
import { Header, AgentCard, AgentModal, LogViewer, TaskList } from '@/components';
import { useAgentStore } from '@/store/agent.store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AlertTriangle } from 'lucide-react';
import type { Agent } from '@/types/agent.types';

// ============================================
// MAIN DASHBOARD
// ============================================

export default function Dashboard() {
  const { agents, logs, tasks } = useAgentStore();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Load data once on mount (no polling)
  useWebSocket();

  // Separate agents by status for kanban-style view
  const runningAgents = agents.filter((a) => a.status === 'running');
  const idleAgents = agents.filter((a) => a.status === 'idle' || a.status === 'online');
  const offlineAgents = agents.filter((a) => a.status === 'offline');
  const errorAgents = agents.filter((a) => a.status === 'error');

  // Get errors only
  const errors = logs.filter((log) => log.level === 'error');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Left Column - Agents Kanban */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Running */}
              <div>
                <h2 className="card-header flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-mission-accent animate-pulse" />
                  RUNNING ({runningAgents.length})
                </h2>
                <div className="space-y-4">
                  {runningAgents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} />
                  ))}
                  {runningAgents.length === 0 && (
                    <div className="card text-center text-mission-text-muted text-sm py-8">
                      No running tasks
                    </div>
                  )}
                </div>
              </div>

              {/* Online / Idle */}
              <div>
                <h2 className="card-header flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-mission-success" />
                  ONLINE ({idleAgents.length})
                </h2>
                <div className="space-y-4">
                  {idleAgents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} />
                  ))}
                  {idleAgents.length === 0 && (
                    <div className="card text-center text-mission-text-muted text-sm py-8">
                      No idle agents
                    </div>
                  )}
                </div>
              </div>

              {/* Offline / Error */}
              <div>
                <h2 className="card-header flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-mission-text-muted" />
                  OFFLINE ({offlineAgents.length + errorAgents.length})
                </h2>
                <div className="space-y-4">
                  {errorAgents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} />
                  ))}
                  {offlineAgents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} />
                  ))}
                  {offlineAgents.length + errorAgents.length === 0 && (
                    <div className="card text-center text-mission-success text-sm py-8">
                      All agents online ✓
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="mt-6">
              <TaskList tasks={tasks} title="RECENT TASKS" maxHeight="250px" />
            </div>
          </div>

          {/* Right Column - Logs */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            {/* Errors */}
            {errors.length > 0 && (
              <div className="card border-mission-error">
                <h2 className="card-header flex items-center gap-2 text-mission-error">
                  <AlertTriangle className="w-4 h-4" />
                  ERRORS ({errors.length})
                </h2>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {errors.slice(0, 10).map((log) => (
                    <div
                      key={log.id}
                      className="p-2 bg-mission-error/10 rounded text-xs text-mission-error"
                    >
                      <span className="text-mission-text-muted">[{log.agentId}]</span>{' '}
                      {log.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Logs */}
            <LogViewer logs={logs} title="SYSTEM LOGS" maxHeight="500px" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-mission-border px-4 md:px-6 py-2 md:py-3 text-center">
        <p className="text-[10px] md:text-xs text-mission-text-muted">
          AGENT MISSION CONTROL v1.0 • YERO TECH LAB 🧪
        </p>
      </footer>

      {/* Agent Modal */}
      {selectedAgent && (
        <AgentModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  );
}
