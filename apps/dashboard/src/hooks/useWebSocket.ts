'use client';

import { useEffect, useCallback } from 'react';
import { useAgentStore } from '@/store/agent.store';
import { apiService } from '@/services/api.service';

// ============================================
// DATA FETCH HOOK (load once on mount)
// ============================================

export function useWebSocket() {
  const { setAgents, setLogs, setStats, setConnected } = useAgentStore();

  const fetchData = useCallback(async () => {
    try {
      console.log('[Fetch] Loading data from API...');
      const [agentsRes, logsRes] = await Promise.all([
        apiService.getAgents(),
        apiService.getLogs(50),
      ]);

      console.log('[Fetch] Agents:', agentsRes.agents);
      setAgents(agentsRes.agents);
      setStats(agentsRes.stats);
      setLogs(logsRes.logs);
      setConnected(true);
    } catch (error) {
      console.error('[Fetch] Failed:', error);
      setConnected(false);
    }
  }, [setAgents, setLogs, setStats, setConnected]);

  useEffect(() => {
    // Fetch data once on mount
    fetchData();
  }, [fetchData]);

  return {
    isConnected: true,
    reconnect: fetchData,
    disconnect: () => {},
  };
}
