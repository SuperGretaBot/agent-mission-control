import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  AgentRegisterSchema,
  AgentUpdateSchema,
  AgentLogSchema,
  WSEventType,
} from '../types/agent.types.js';
import { agentStore } from '../services/agent.store.js';
import { wsService } from '../services/websocket.service.js';

// ============================================
// AGENT ROUTES
// ============================================

export async function agentRoutes(fastify: FastifyInstance): Promise<void> {
  // ----------------------------------------
  // POST /agent/register
  // ----------------------------------------
  fastify.post('/agent/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = AgentRegisterSchema.parse(request.body);
      
      // Check if agent already exists
      const existing = agentStore.getAgent(input.id);
      if (existing) {
        // Re-register: update status to online
        const updated = agentStore.updateAgent({
          agentId: input.id,
          status: 'online',
        });
        
        wsService.broadcast(WSEventType.AGENT_REGISTERED, updated);
        
        return reply.send({
          success: true,
          message: 'Agent re-registered',
          agent: updated,
        });
      }

      const agent = agentStore.registerAgent(input);
      
      wsService.broadcast(WSEventType.AGENT_REGISTERED, agent);

      return reply.code(201).send({
        success: true,
        message: 'Agent registered',
        agent,
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid input',
      });
    }
  });

  // ----------------------------------------
  // POST /agent/update
  // ----------------------------------------
  fastify.post('/agent/update', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = AgentUpdateSchema.parse(request.body);
      
      const agent = agentStore.updateAgent(input);
      
      if (!agent) {
        return reply.code(404).send({
          success: false,
          error: 'Agent not found',
        });
      }

      wsService.broadcast(WSEventType.AGENT_UPDATED, agent);

      // Si hay tarea nueva, emitir evento de tarea
      if (input.task && input.status === 'running') {
        wsService.broadcast(WSEventType.TASK_STARTED, {
          agentId: agent.id,
          task: input.task,
        });
      }

      return reply.send({
        success: true,
        agent,
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid input',
      });
    }
  });

  // ----------------------------------------
  // POST /agent/log
  // ----------------------------------------
  fastify.post('/agent/log', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = AgentLogSchema.parse(request.body);
      
      const log = agentStore.addLog(input);
      
      if (!log) {
        return reply.code(404).send({
          success: false,
          error: 'Agent not found',
        });
      }

      wsService.broadcast(WSEventType.AGENT_LOG, log);

      return reply.send({
        success: true,
        log,
      });
    } catch (error) {
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid input',
      });
    }
  });

  // ----------------------------------------
  // GET /agents
  // ----------------------------------------
  fastify.get('/agents', async (_request: FastifyRequest, reply: FastifyReply) => {
    const agents = agentStore.getAllAgents();
    const stats = agentStore.getStats();

    return reply.send({
      success: true,
      stats,
      agents,
    });
  });

  // ----------------------------------------
  // GET /agents/:agentId
  // ----------------------------------------
  fastify.get('/agents/:agentId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { agentId } = request.params as { agentId: string };
    
    const agent = agentStore.getAgent(agentId);
    
    if (!agent) {
      return reply.code(404).send({
        success: false,
        error: 'Agent not found',
      });
    }

    const logs = agentStore.getLogs(agentId, 50);
    const tasks = agentStore.getTasks(agentId, 10);

    return reply.send({
      success: true,
      agent,
      logs,
      tasks,
    });
  });

  // ----------------------------------------
  // GET /logs
  // ----------------------------------------
  fastify.get('/logs', async (request: FastifyRequest, reply: FastifyReply) => {
    const { limit = 50 } = request.query as { limit?: number };
    
    const logs = agentStore.getAllLogs(Number(limit));

    return reply.send({
      success: true,
      logs,
    });
  });

  // ----------------------------------------
  // GET /errors
  // ----------------------------------------
  fastify.get('/errors', async (request: FastifyRequest, reply: FastifyReply) => {
    const { limit = 20 } = request.query as { limit?: number };
    
    const errors = agentStore.getErrors(Number(limit));

    return reply.send({
      success: true,
      errors,
    });
  });

  // ----------------------------------------
  // GET /tasks
  // ----------------------------------------
  fastify.get('/tasks', async (request: FastifyRequest, reply: FastifyReply) => {
    const { limit = 30 } = request.query as { limit?: number };
    
    const tasks = agentStore.getAllTasks(Number(limit));

    return reply.send({
      success: true,
      tasks,
    });
  });

  // ----------------------------------------
  // GET /stats
  // ----------------------------------------
  fastify.get('/stats', async (_request: FastifyRequest, reply: FastifyReply) => {
    const stats = agentStore.getStats();
    const wsClients = wsService.getClientsCount();

    return reply.send({
      success: true,
      stats: {
        ...stats,
        wsClients,
      },
    });
  });
}
