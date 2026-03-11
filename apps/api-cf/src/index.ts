import { Hono } from 'hono';
import { cors } from 'hono/cors';

// ============================================
// TYPES
// ============================================

type AgentStatus = 'online' | 'offline' | 'running' | 'idle' | 'error';
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Agent {
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

interface AgentLog {
  id: string;
  agentId: string;
  level: LogLevel;
  message: string;
  timestamp: string;
}

interface Env {
  AGENTS_KV: KVNamespace;
}

// ============================================
// APP
// ============================================

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));

// ============================================
// HELPERS
// ============================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

async function getAgents(kv: KVNamespace): Promise<Agent[]> {
  const data = await kv.get('agents', 'json');
  return (data as Agent[]) || [];
}

async function saveAgents(kv: KVNamespace, agents: Agent[]): Promise<void> {
  await kv.put('agents', JSON.stringify(agents));
}

async function getLogs(kv: KVNamespace): Promise<AgentLog[]> {
  const data = await kv.get('logs', 'json');
  return (data as AgentLog[]) || [];
}

async function saveLogs(kv: KVNamespace, logs: AgentLog[]): Promise<void> {
  await kv.put('logs', JSON.stringify(logs.slice(0, 100)));
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    runtime: 'cloudflare-workers',
  });
});

// Register agent
app.post('/agent/register', async (c) => {
  try {
    const body = await c.req.json();
    const { id, name, host, version = '1.0.0', avatar } = body;

    if (!id || !name || !host) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    const agents = await getAgents(c.env.AGENTS_KV);
    const now = new Date().toISOString();

    const existingIndex = agents.findIndex(a => a.id === id);
    
    const agent: Agent = {
      id,
      name,
      host,
      version,
      avatar,
      status: 'online',
      tasksCompleted: existingIndex >= 0 ? agents[existingIndex].tasksCompleted : 0,
      registeredAt: existingIndex >= 0 ? agents[existingIndex].registeredAt : now,
      lastSeenAt: now,
    };

    if (existingIndex >= 0) {
      agents[existingIndex] = agent;
    } else {
      agents.push(agent);
    }

    await saveAgents(c.env.AGENTS_KV, agents);

    return c.json({ success: true, agent }, 201);
  } catch (error) {
    return c.json({ success: false, error: 'Invalid request' }, 400);
  }
});

// Update agent status
app.post('/agent/update', async (c) => {
  try {
    const body = await c.req.json();
    const { agentId, status, task, cpu, ram, uptime } = body;

    if (!agentId || !status) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    const agents = await getAgents(c.env.AGENTS_KV);
    const agentIndex = agents.findIndex(a => a.id === agentId);

    if (agentIndex < 0) {
      return c.json({ success: false, error: 'Agent not found' }, 404);
    }

    const agent = agents[agentIndex];
    const now = new Date().toISOString();

    // Update task completion
    if (agent.currentTask && status !== 'running') {
      agent.tasksCompleted++;
      agent.lastTask = agent.currentTask;
    }

    agent.status = status;
    agent.currentTask = status === 'running' ? task : undefined;
    agent.cpu = cpu ?? agent.cpu;
    agent.ram = ram ?? agent.ram;
    agent.uptime = uptime ?? agent.uptime;
    agent.lastSeenAt = now;

    agents[agentIndex] = agent;
    await saveAgents(c.env.AGENTS_KV, agents);

    return c.json({ success: true, agent });
  } catch (error) {
    return c.json({ success: false, error: 'Invalid request' }, 400);
  }
});

// Add log
app.post('/agent/log', async (c) => {
  try {
    const body = await c.req.json();
    const { agentId, level, message } = body;

    if (!agentId || !level || !message) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    const logs = await getLogs(c.env.AGENTS_KV);

    const log: AgentLog = {
      id: generateId(),
      agentId,
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    logs.unshift(log);
    await saveLogs(c.env.AGENTS_KV, logs);

    return c.json({ success: true, log });
  } catch (error) {
    return c.json({ success: false, error: 'Invalid request' }, 400);
  }
});

// Get all agents
app.get('/agents', async (c) => {
  const agents = await getAgents(c.env.AGENTS_KV);
  
  const stats = {
    totalAgents: agents.length,
    onlineAgents: agents.filter(a => a.status !== 'offline').length,
    runningTasks: agents.filter(a => a.status === 'running').length,
    totalTasksCompleted: agents.reduce((sum, a) => sum + a.tasksCompleted, 0),
  };

  return c.json({ success: true, stats, agents });
});

// Get single agent
app.get('/agents/:agentId', async (c) => {
  const agentId = c.req.param('agentId');
  const agents = await getAgents(c.env.AGENTS_KV);
  const agent = agents.find(a => a.id === agentId);

  if (!agent) {
    return c.json({ success: false, error: 'Agent not found' }, 404);
  }

  const allLogs = await getLogs(c.env.AGENTS_KV);
  const logs = allLogs.filter(l => l.agentId === agentId).slice(0, 50);

  return c.json({ success: true, agent, logs });
});

// Get logs
app.get('/logs', async (c) => {
  const logs = await getLogs(c.env.AGENTS_KV);
  return c.json({ success: true, logs: logs.slice(0, 50) });
});

// Get errors
app.get('/errors', async (c) => {
  const logs = await getLogs(c.env.AGENTS_KV);
  const errors = logs.filter(l => l.level === 'error').slice(0, 20);
  return c.json({ success: true, errors });
});

// Get stats
app.get('/stats', async (c) => {
  const agents = await getAgents(c.env.AGENTS_KV);
  const logs = await getLogs(c.env.AGENTS_KV);

  const stats = {
    totalAgents: agents.length,
    onlineAgents: agents.filter(a => a.status !== 'offline').length,
    runningTasks: agents.filter(a => a.status === 'running').length,
    totalTasksCompleted: agents.reduce((sum, a) => sum + a.tasksCompleted, 0),
    totalErrors: logs.filter(l => l.level === 'error').length,
  };

  return c.json({ success: true, stats });
});

// SSE endpoint for real-time updates
app.get('/events', async (c) => {
  const agents = await getAgents(c.env.AGENTS_KV);
  const logs = await getLogs(c.env.AGENTS_KV);

  // Return current state (polling fallback)
  return c.json({
    success: true,
    agents,
    logs: logs.slice(0, 20),
    timestamp: new Date().toISOString(),
  });
});

export default app;
