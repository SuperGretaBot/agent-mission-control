import type { WebSocket } from 'ws';
import type { WSEvent, WSEventTypeKey } from '../types/agent.types.js';

// ============================================
// WEBSOCKET SERVICE
// ============================================

class WebSocketService {
  private clients: Set<WebSocket> = new Set();

  addClient(socket: WebSocket): void {
    this.clients.add(socket);
    console.log(`[WS] Client connected. Total: ${this.clients.size}`);
  }

  removeClient(socket: WebSocket): void {
    this.clients.delete(socket);
    console.log(`[WS] Client disconnected. Total: ${this.clients.size}`);
  }

  broadcast<T>(type: WSEventTypeKey, payload: T): void {
    const event: WSEvent<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    const message = JSON.stringify(event);
    let delivered = 0;

    for (const client of this.clients) {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
        delivered++;
      }
    }

    console.log(`[WS] Broadcast ${type} to ${delivered}/${this.clients.size} clients`);
  }

  getClientsCount(): number {
    return this.clients.size;
  }
}

// Singleton
export const wsService = new WebSocketService();
