import { nanoid } from 'nanoid';
import type {
  Agent,
  AgentLog,
  Task,
  AgentRegisterInput,
  AgentUpdateInput,
  AgentLogInput,
  AgentStatusType,
  TaskStatusType,
} from '../types/agent.types.js';

// ============================================
// IN-MEMORY STORE
// ============================================

class AgentStore {
  private agents: Map<string, Agent> = new Map();
  private logs: Map<string, AgentLog[]> = new Map();
  private tasks: Map<string, Task[]> = new Map();

  // ----------------------------------------
  // AGENTS
  // ----------------------------------------

  registerAgent(input: AgentRegisterInput): Agent {
    const now = new Date().toISOString();
    
    const agent: Agent = {
      id: input.id,
      name: input.name,
      host: input.host,
      version: input.version,
      avatar: input.avatar,
      status: 'online',
      tasksCompleted: 0,
      registeredAt: now,
      lastSeenAt: now,
    };

    this.agents.set(input.id, agent);
    this.logs.set(input.id, []);
    this.tasks.set(input.id, []);

    return agent;
  }

  updateAgent(input: AgentUpdateInput): Agent | null {
    const agent = this.agents.get(input.agentId);
    if (!agent) return null;

    const now = new Date().toISOString();

    // Si había una tarea corriendo y ahora está idle/success, completar la tarea
    if (agent.currentTask && input.status !== 'running') {
      this.completeTask(input.agentId, input.status === 'error' ? 'error' : 'success');
    }

    // Si inicia una nueva tarea
    if (input.task && input.status === 'running' && input.task !== agent.currentTask) {
      this.startTask(input.agentId, input.task);
    }

    const updatedAgent: Agent = {
      ...agent,
      status: input.status as AgentStatusType,
      currentTask: input.status === 'running' ? input.task : undefined,
      lastTask: agent.currentTask || agent.lastTask,
      cpu: input.cpu ?? agent.cpu,
      ram: input.ram ?? agent.ram,
      uptime: input.uptime ?? agent.uptime,
      lastSeenAt: now,
    };

    this.agents.set(input.agentId, updatedAgent);
    return updatedAgent;
  }

  getAgent(agentId: string): Agent | null {
    return this.agents.get(agentId) ?? null;
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  setAgentOffline(agentId: string): Agent | null {
    const agent = this.agents.get(agentId);
    if (!agent) return null;

    const updatedAgent: Agent = {
      ...agent,
      status: 'offline',
      currentTask: undefined,
    };

    this.agents.set(agentId, updatedAgent);
    return updatedAgent;
  }

  // ----------------------------------------
  // LOGS
  // ----------------------------------------

  addLog(input: AgentLogInput): AgentLog | null {
    const agentLogs = this.logs.get(input.agentId);
    if (!agentLogs) return null;

    const log: AgentLog = {
      id: nanoid(),
      agentId: input.agentId,
      level: input.level,
      message: input.message,
      metadata: input.metadata,
      timestamp: new Date().toISOString(),
    };

    agentLogs.unshift(log);

    // Mantener solo los últimos 100 logs por agente
    if (agentLogs.length > 100) {
      agentLogs.pop();
    }

    return log;
  }

  getLogs(agentId: string, limit = 50): AgentLog[] {
    const agentLogs = this.logs.get(agentId);
    if (!agentLogs) return [];
    return agentLogs.slice(0, limit);
  }

  getAllLogs(limit = 50): AgentLog[] {
    const allLogs: AgentLog[] = [];
    
    for (const logs of this.logs.values()) {
      allLogs.push(...logs);
    }

    return allLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  getErrors(limit = 20): AgentLog[] {
    return this.getAllLogs(100)
      .filter(log => log.level === 'error')
      .slice(0, limit);
  }

  // ----------------------------------------
  // TASKS
  // ----------------------------------------

  private startTask(agentId: string, taskName: string): Task | null {
    const agentTasks = this.tasks.get(agentId);
    if (!agentTasks) return null;

    const task: Task = {
      id: nanoid(),
      agentId,
      name: taskName,
      status: 'running',
      startedAt: new Date().toISOString(),
    };

    agentTasks.unshift(task);

    // Mantener solo las últimas 50 tareas por agente
    if (agentTasks.length > 50) {
      agentTasks.pop();
    }

    return task;
  }

  private completeTask(agentId: string, status: TaskStatusType): Task | null {
    const agentTasks = this.tasks.get(agentId);
    if (!agentTasks || agentTasks.length === 0) return null;

    const runningTask = agentTasks.find(t => t.status === 'running');
    if (!runningTask) return null;

    const now = new Date();
    const completedAt = now.toISOString();
    const duration = now.getTime() - new Date(runningTask.startedAt).getTime();

    runningTask.status = status;
    runningTask.completedAt = completedAt;
    runningTask.duration = duration;

    // Incrementar contador de tareas completadas del agente
    if (status === 'success') {
      const agent = this.agents.get(agentId);
      if (agent) {
        agent.tasksCompleted++;
      }
    }

    return runningTask;
  }

  getTasks(agentId: string, limit = 10): Task[] {
    const agentTasks = this.tasks.get(agentId);
    if (!agentTasks) return [];
    return agentTasks.slice(0, limit);
  }

  getAllTasks(limit = 30): Task[] {
    const allTasks: Task[] = [];
    
    for (const tasks of this.tasks.values()) {
      allTasks.push(...tasks);
    }

    return allTasks
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }

  // ----------------------------------------
  // STATS
  // ----------------------------------------

  getStats() {
    const agents = this.getAllAgents();
    
    return {
      totalAgents: agents.length,
      onlineAgents: agents.filter(a => a.status !== 'offline').length,
      runningTasks: agents.filter(a => a.status === 'running').length,
      totalTasksCompleted: agents.reduce((sum, a) => sum + a.tasksCompleted, 0),
      totalErrors: this.getErrors(100).length,
    };
  }
}

// Singleton
export const agentStore = new AgentStore();
