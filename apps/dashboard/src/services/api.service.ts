import type { Agent, AgentLog, Task, SystemStats } from '@/types/agent.types';

// ============================================
// API CONFIG
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============================================
// API RESPONSES
// ============================================

interface AgentsResponse {
  success: boolean;
  stats: SystemStats;
  agents: Agent[];
}

interface LogsResponse {
  success: boolean;
  logs: AgentLog[];
}

interface TasksResponse {
  success: boolean;
  tasks: Task[];
}

interface StatsResponse {
  success: boolean;
  stats: SystemStats;
}

// ============================================
// API SERVICE
// ============================================

export const apiService = {
  async getAgents(): Promise<AgentsResponse> {
    const response = await fetch(`${API_URL}/agents`);
    if (!response.ok) throw new Error('Failed to fetch agents');
    return response.json();
  },

  async getAgent(agentId: string): Promise<{ agent: Agent; logs: AgentLog[]; tasks: Task[] }> {
    const response = await fetch(`${API_URL}/agents/${agentId}`);
    if (!response.ok) throw new Error('Failed to fetch agent');
    return response.json();
  },

  async getLogs(limit = 50): Promise<LogsResponse> {
    const response = await fetch(`${API_URL}/logs?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
  },

  async getErrors(limit = 20): Promise<LogsResponse> {
    const response = await fetch(`${API_URL}/errors?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch errors');
    return response.json();
  },

  async getTasks(limit = 30): Promise<TasksResponse> {
    const response = await fetch(`${API_URL}/tasks?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  async getStats(): Promise<StatsResponse> {
    const response = await fetch(`${API_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },
};
