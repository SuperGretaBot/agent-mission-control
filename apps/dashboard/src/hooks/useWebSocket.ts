'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAgentStore } from '@/store/agent.store';
import { apiService } from '@/services/api.service';

// ============================================
// POLLING HOOK (Cloudflare Workers compatible)
// ============================================

export function useWebSocket() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { setAgents, setLogs, setStats, setConnected } = useAgentStore();

  const poll = useCallback(async () => {
    try {
      const [agentsRes, logsRes] = await Promise.all([
        apiService.getAgents(),
        apiService.getLogs(50),
      ]);

      setAgents(agentsRes.agents);
      setStats(agentsRes.stats);
      setLogs(logsRes.logs);
      setConnected(true);
    } catch (error) {
      console.error('[Poll] Failed:', error);
      setConnected(false);
    }
  }, [setAgents, setLogs, setStats, setConnected]);

  useEffect(() => {
    // Initial fetch
    poll();

    // Poll every 5 seconds
    intervalRef.current = setInterval(poll, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [poll]);

  return {
    isConnected: true,
    reconnect: poll,
    disconnect: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    },
  };
}
