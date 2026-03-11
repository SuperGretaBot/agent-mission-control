// ============================================
// AGENT TYPES
// ============================================

export type AgentStatus = 'online' | 'offline' | 'running' | 'idle' | 'error';
export type TaskStatus = 'pending' | 'running' | 'success' | 'error';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Agent {
  id: string;
  name: string;
  host: string;
  version: string;
  avatar?: string;
  status: AgentStatus;
  currentTask?: string;
  lastTask?: string;
  cpu?: number;
  ram?: number;
  uptime?: number;
  tasksCompleted: number;
  registeredAt: string;
  lastSeenAt: string;
}

export interface AgentLog {
  id: string;
  agentId: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface Task {
  id: string;
  agentId: string;
  name: string;
  status: TaskStatus;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  error?: string;
}

export interface SystemStats {
  totalAgents: number;
  onlineAgents: number;
  runningTasks: number;
  totalTasksCompleted: number;
  totalErrors: number;
  wsClients: number;
}

// ============================================
// WEBSOCKET EVENTS
// ============================================

export type WSEventType =
  | 'connected'
  | 'agent:registered'
  | 'agent:updated'
  | 'agent:log'
  | 'agent:offline'
  | 'task:started'
  | 'task:completed'
  | 'task:error'
  | 'pong';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload?: T;
  message?: string;
  timestamp: string;
}
