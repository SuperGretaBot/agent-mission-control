// ============================================
// MISSION CONTROL AGENT SDK
// ============================================

export type AgentStatus = 'online' | 'offline' | 'running' | 'idle' | 'error';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// ============================================
// TYPES
// ============================================

export interface AgentConfig {
  id: string;
  name: string;
  host: string;
  version?: string;
  avatar?: string;
  apiUrl: string;
  apiKey?: string;
}

export interface AgentStatusUpdate {
  status: AgentStatus;
  task?: string;
  cpu?: number;
  ram?: number;
  uptime?: number;
}

export interface AgentLogEntry {
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// MISSION CONTROL CLIENT
// ============================================

export class MissionControlAgent {
  private config: AgentConfig;
  private registered = false;
  private heartbeatInterval?: ReturnType<typeof setInterval>;

  constructor(config: AgentConfig) {
    this.config = {
      ...config,
      version: config.version || '1.0.0',
    };
  }

  // ----------------------------------------
  // REGISTRATION
  // ----------------------------------------

  async register(): Promise<boolean> {
    try {
      const response = await this.fetch('/agent/register', {
        method: 'POST',
        body: JSON.stringify({
          id: this.config.id,
          name: this.config.name,
          host: this.config.host,
          version: this.config.version,
          avatar: this.config.avatar,
        }),
      });

      if (response.ok) {
        this.registered = true;
        console.log(`[MissionControl] Agent "${this.config.name}" registered`);
        return true;
      }

      console.error('[MissionControl] Registration failed:', await response.text());
      return false;
    } catch (error) {
      console.error('[MissionControl] Registration error:', error);
      return false;
    }
  }

  // ----------------------------------------
  // STATUS UPDATES
  // ----------------------------------------

  async updateStatus(update: AgentStatusUpdate): Promise<boolean> {
    try {
      const response = await this.fetch('/agent/update', {
        method: 'POST',
        body: JSON.stringify({
          agentId: this.config.id,
          ...update,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('[MissionControl] Update error:', error);
      return false;
    }
  }

  async startTask(taskName: string): Promise<boolean> {
    return this.updateStatus({
      status: 'running',
      task: taskName,
    });
  }

  async completeTask(): Promise<boolean> {
    return this.updateStatus({
      status: 'idle',
    });
  }

  async reportError(errorMessage?: string): Promise<boolean> {
    if (errorMessage) {
      await this.log('error', errorMessage);
    }
    return this.updateStatus({
      status: 'error',
    });
  }

  // ----------------------------------------
  // LOGGING
  // ----------------------------------------

  async log(level: LogLevel, message: string, metadata?: Record<string, unknown>): Promise<boolean> {
    try {
      const response = await this.fetch('/agent/log', {
        method: 'POST',
        body: JSON.stringify({
          agentId: this.config.id,
          level,
          message,
          metadata,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('[MissionControl] Log error:', error);
      return false;
    }
  }

  async debug(message: string, metadata?: Record<string, unknown>): Promise<boolean> {
    return this.log('debug', message, metadata);
  }

  async info(message: string, metadata?: Record<string, unknown>): Promise<boolean> {
    return this.log('info', message, metadata);
  }

  async warn(message: string, metadata?: Record<string, unknown>): Promise<boolean> {
    return this.log('warn', message, metadata);
  }

  async error(message: string, metadata?: Record<string, unknown>): Promise<boolean> {
    return this.log('error', message, metadata);
  }

  // ----------------------------------------
  // SYSTEM METRICS
  // ----------------------------------------

  async reportMetrics(metrics: { cpu?: number; ram?: number; uptime?: number }): Promise<boolean> {
    return this.updateStatus({
      status: 'online',
      ...metrics,
    });
  }

  // ----------------------------------------
  // HEARTBEAT
  // ----------------------------------------

  startHeartbeat(intervalMs = 30000): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      await this.updateStatus({ status: 'online' });
    }, intervalMs);
  }

  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  // ----------------------------------------
  // DISCONNECT
  // ----------------------------------------

  async disconnect(): Promise<void> {
    this.stopHeartbeat();
    await this.updateStatus({ status: 'offline' });
    this.registered = false;
  }

  // ----------------------------------------
  // HELPERS
  // ----------------------------------------

  private async fetch(path: string, options: RequestInit): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    return fetch(`${this.config.apiUrl}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
  }

  get isRegistered(): boolean {
    return this.registered;
  }

  get agentId(): string {
    return this.config.id;
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

let defaultAgent: MissionControlAgent | null = null;

export function createAgent(config: AgentConfig): MissionControlAgent {
  const agent = new MissionControlAgent(config);
  if (!defaultAgent) {
    defaultAgent = agent;
  }
  return agent;
}

export function getAgent(): MissionControlAgent | null {
  return defaultAgent;
}

// Quick report function
export async function reportAgentStatus(update: AgentStatusUpdate & { agentId?: string }): Promise<boolean> {
  if (!defaultAgent) {
    console.error('[MissionControl] No agent initialized. Call createAgent() first.');
    return false;
  }
  return defaultAgent.updateStatus(update);
}
