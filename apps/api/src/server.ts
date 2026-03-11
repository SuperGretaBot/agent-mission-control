import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { agentRoutes } from './routes/agent.routes.js';
import { wsService } from './services/websocket.service.js';

// ============================================
// SERVER CONFIG
// ============================================

const PORT = Number(process.env.PORT) || Number(process.env.API_PORT) || 3001;
const HOST = process.env.API_HOST || '0.0.0.0';

// ============================================
// CREATE SERVER
// ============================================

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  },
});

// ============================================
// PLUGINS
// ============================================

await fastify.register(cors, {
  origin: true,
  credentials: true,
});

await fastify.register(websocket);

// ============================================
// WEBSOCKET HANDLER
// ============================================

fastify.get('/ws', { websocket: true }, (socket, _request) => {
  wsService.addClient(socket);

  socket.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('[WS] Received:', data);
      
      // Ping/pong para mantener conexión
      if (data.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }
    } catch {
      // Ignore invalid messages
    }
  });

  socket.on('close', () => {
    wsService.removeClient(socket);
  });

  socket.on('error', (error) => {
    console.error('[WS] Error:', error);
    wsService.removeClient(socket);
  });

  // Send welcome message
  socket.send(JSON.stringify({
    type: 'connected',
    message: 'Welcome to Agent Mission Control',
    timestamp: new Date().toISOString(),
  }));
});

// ============================================
// ROUTES
// ============================================

// Health check
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});

// API routes
await fastify.register(agentRoutes, { prefix: '/' });

// ============================================
// START SERVER
// ============================================

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    
    console.log(`
╔══════════════════════════════════════════════╗
║     🚀 AGENT MISSION CONTROL - API           ║
╠══════════════════════════════════════════════╣
║  REST API:  http://${HOST}:${PORT}              ║
║  WebSocket: ws://${HOST}:${PORT}/ws             ║
╚══════════════════════════════════════════════╝
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
