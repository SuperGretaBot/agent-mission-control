'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAgentStore } from '@/store/agent.store';
import type { WSEvent, Agent, AgentLog } from '@/types/agent.types';

// ============================================
// WEBSOCKET HOOK
// ============================================

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { updateAgent, addLog, setConnected } = useAgentStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(`${WS_URL}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected to Mission Control');
        setConnected(true);

        // Clear any pending reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: WSEvent = JSON.parse(event.data);
          
          switch (data.type) {
            case 'connected':
              console.log('[WS] Welcome:', data.message);
              break;
            
            case 'agent:registered':
            case 'agent:updated':
              if (data.payload) {
                updateAgent(data.payload as Agent);
              }
              break;
            
            case 'agent:log':
              if (data.payload) {
                addLog(data.payload as AgentLog);
              }
              break;
            
            case 'pong':
              // Heartbeat response
              break;
            
            default:
              console.log('[WS] Event:', data.type, data.payload);
          }
        } catch (error) {
          console.error('[WS] Failed to parse message:', error);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected');
        setConnected(false);
        wsRef.current = null;

        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WS] Attempting reconnect...');
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('[WS] Error:', error);
      };
    } catch (error) {
      console.error('[WS] Failed to connect:', error);
      setConnected(false);

      // Retry after 5 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, [updateAgent, addLog, setConnected]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnected(false);
  }, [setConnected]);

  const sendPing = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping' }));
    }
  }, []);

  useEffect(() => {
    connect();

    // Heartbeat every 30 seconds
    const heartbeat = setInterval(sendPing, 30000);

    return () => {
      clearInterval(heartbeat);
      disconnect();
    };
  }, [connect, disconnect, sendPing]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnect: connect,
    disconnect,
  };
}
