import { create } from 'zustand';
import type { Agent, AgentLog, Task, SystemStats } from '@/types/agent.types';

// ============================================
// STORE INTERFACE
// ============================================

interface AgentStore {
  // State
  agents: Agent[];
  logs: AgentLog[];
  tasks: Task[];
  stats: SystemStats | null;
  isConnected: boolean;
  lastUpdate: string | null;

  // Actions
  setAgents: (agents: Agent[]) => void;
  updateAgent: (agent: Agent) => void;
  addLog: (log: AgentLog) => void;
  setLogs: (logs: AgentLog[]) => void;
  addTask: (task: Task) => void;
  setTasks: (tasks: Task[]) => void;
  setStats: (stats: SystemStats) => void;
  setConnected: (connected: boolean) => void;
}

// ============================================
// STORE
// ============================================

export const useAgentStore = create<AgentStore>((set) => ({
  // Initial state
  agents: [],
  logs: [],
  tasks: [],
  stats: null,
  isConnected: false,
  lastUpdate: null,

  // Actions
  setAgents: (agents) =>
    set({
      agents,
      lastUpdate: new Date().toISOString(),
    }),

  updateAgent: (updatedAgent) =>
    set((state) => {
      const existingIndex = state.agents.findIndex((a) => a.id === updatedAgent.id);
      
      if (existingIndex >= 0) {
        const newAgents = [...state.agents];
        newAgents[existingIndex] = updatedAgent;
        return { agents: newAgents, lastUpdate: new Date().toISOString() };
      }
      
      return {
        agents: [...state.agents, updatedAgent],
        lastUpdate: new Date().toISOString(),
      };
    }),

  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs].slice(0, 100),
      lastUpdate: new Date().toISOString(),
    })),

  setLogs: (logs) =>
    set({
      logs,
      lastUpdate: new Date().toISOString(),
    }),

  addTask: (task) =>
    set((state) => {
      const existingIndex = state.tasks.findIndex((t) => t.id === task.id);
      
      if (existingIndex >= 0) {
        const newTasks = [...state.tasks];
        newTasks[existingIndex] = task;
        return { tasks: newTasks, lastUpdate: new Date().toISOString() };
      }
      
      return {
        tasks: [task, ...state.tasks].slice(0, 50),
        lastUpdate: new Date().toISOString(),
      };
    }),

  setTasks: (tasks) =>
    set({
      tasks,
      lastUpdate: new Date().toISOString(),
    }),

  setStats: (stats) =>
    set({
      stats,
      lastUpdate: new Date().toISOString(),
    }),

  setConnected: (isConnected) => set({ isConnected }),
}));
