# 🛰️ Agent Mission Control

Real-time monitoring dashboard for AI agents.

![Mission Control](https://img.shields.io/badge/status-active-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Fastify](https://img.shields.io/badge/Fastify-4-white)

## 🚀 Features

- **Real-time monitoring** via WebSockets
- **Agent status cards** with CPU/RAM metrics
- **Task tracking** with duration and status
- **System logs** with level filtering
- **Error alerts** panel
- **SciFi Mission Control UI**

## 📦 Structure

```
agent-mission-control/
├── apps/
│   ├── api/          # Backend (Fastify + WebSockets)
│   └── dashboard/    # Frontend (Next.js 14 + Tailwind)
└── packages/
    └── agent-sdk/    # SDK for agent reporting
```

## 🛠️ Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start development servers

```bash
npm run dev
```

- **Dashboard:** http://localhost:3000
- **API:** http://localhost:3001

### 3. Environment variables

Copy `.env.example` to `.env` and configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## 📡 API Endpoints

### Agent Registration

```http
POST /agent/register
Content-Type: application/json

{
  "id": "gretabot",
  "name": "GretaBot",
  "host": "vps-hostinger",
  "version": "1.0.0"
}
```

### Status Update

```http
POST /agent/update
Content-Type: application/json

{
  "agentId": "gretabot",
  "status": "running",
  "task": "generating linkedin post",
  "cpu": 30,
  "ram": 40,
  "uptime": 23000
}
```

### Log Entry

```http
POST /agent/log
Content-Type: application/json

{
  "agentId": "gretabot",
  "level": "info",
  "message": "Task completed successfully"
}
```

### Get All Agents

```http
GET /agents
```

### WebSocket

```
ws://localhost:3001/ws
```

Events:
- `agent:registered`
- `agent:updated`
- `agent:log`
- `task:started`
- `task:completed`

## 🤖 Using the SDK

### Installation

```bash
npm install @mission-control/agent-sdk
```

### Basic Usage

```typescript
import { createAgent } from '@mission-control/agent-sdk';

// Create agent
const agent = createAgent({
  id: 'gretabot',
  name: 'GretaBot',
  host: 'vps-hostinger',
  apiUrl: 'http://localhost:3001',
});

// Register with Mission Control
await agent.register();

// Start heartbeat (sends status every 30s)
agent.startHeartbeat();

// Report task start
await agent.startTask('generating linkedin post');

// Log messages
await agent.info('Processing data...');
await agent.warn('Rate limit approaching');

// Report metrics
await agent.reportMetrics({
  cpu: 45,
  ram: 60,
  uptime: 3600000,
});

// Complete task
await agent.completeTask();

// Report error
await agent.error('Failed to connect to API');
await agent.reportError();

// Disconnect gracefully
await agent.disconnect();
```

### Quick Functions

```typescript
import { reportAgentStatus } from '@mission-control/agent-sdk';

// After creating an agent, you can use quick functions
await reportAgentStatus({
  status: 'running',
  task: 'analyzing data',
});
```

## 🎨 Current Agents

| Agent | Host | Status |
|-------|------|--------|
| GretaBot | VPS Hostinger | 🟢 |
| RomaBot | MiniPC Local | 🟢 |
| TonyBot | Mac Studio | 🟢 |

## 📋 Future Agents

- DataBot
- SEOAgent
- CrawlerBot
- SecurityBot

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd apps/dashboard
vercel --prod
```

### Backend (Cloudflare Workers or Node)

```bash
cd apps/api
npm run build
# Deploy to your preferred platform
```

## 📄 License

MIT © Yero Tech Lab 🧪
