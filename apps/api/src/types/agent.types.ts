import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const AgentStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  RUNNING: 'running',
  IDLE: 'idle',
  ERROR: 'error',
} as const;

export type AgentStatusType = (typeof AgentStatus)[keyof typeof AgentStatus];

export const TaskStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];

export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export type LogLevelType = (typeof LogLevel)[keyof typeof LogLevel];

// ============================================
// SCHEMAS
// ============================================

export const AgentRegisterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  host: z.string().min(1),
  version: z.string().default('1.0.0'),
  avatar: z.string().url().optional(),
});

export const AgentUpdateSchema = z.object({
  agentId: z.string().min(1),
  status: z.enum(['online', 'offline', 'running', 'idle', 'error']),
  task: z.string().optional(),
  cpu: z.number().min(0).max(100).optional(),
  ram: z.number().min(0).max(100).optional(),
  uptime: z.number().min(0).optional(),
});

export const AgentLogSchema = z.object({
  agentId: z.string().min(1),
  level: z.enum(['debug', 'info', 'warn', 'error']),
  message: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

export const TaskSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  name: z.string(),
  status: z.enum(['pending', 'running', 'success', 'error']),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  duration: z.number().optional(),
  error: z.string().optional(),
});

// ============================================
// TYPES
// ============================================

export type AgentRegisterInput = z.infer<typeof AgentRegisterSchema>;
export type AgentUpdateInput = z.infer<typeof AgentUpdateSchema>;
export type AgentLogInput = z.infer<typeof AgentLogSchema>;
export type Task = z.infer<typeof TaskSchema>;

export interface Agent {
  id: string;
  name: string;
  host: string;
  version: string;
  avatar?: string;
  status: AgentStatusType;
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
  level: LogLevelType;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface SystemMetrics {
  cpu: number;
  ram: number;
  uptime: number;
}

// ============================================
// WEBSOCKET EVENTS
// ============================================

export const WSEventType = {
  AGENT_REGISTERED: 'agent:registered',
  AGENT_UPDATED: 'agent:updated',
  AGENT_LOG: 'agent:log',
  AGENT_OFFLINE: 'agent:offline',
  TASK_STARTED: 'task:started',
  TASK_COMPLETED: 'task:completed',
  TASK_ERROR: 'task:error',
} as const;

export type WSEventTypeKey = (typeof WSEventType)[keyof typeof WSEventType];

export interface WSEvent<T = unknown> {
  type: WSEventTypeKey;
  payload: T;
  timestamp: string;
}
