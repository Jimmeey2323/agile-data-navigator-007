
import { useState, useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
  intervalMs?: number;
  onRefresh?: () => Promise<void>;
  enabled?: boolean;
}

/**
 * A hook that provides auto-refresh functionality
 * @param options Configuration options
 * @returns Control functions and state
 */
export function useAutoRefresh(options: UseAutoRefreshOptions = {}) {
  const {
    intervalMs = 15 * 60 * 1000, // Default: 15 minutes
    onRefresh,
    enabled = true
  } = options;
  
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<number | null>(null);
  
  // Function to perform the refresh
  const refresh = async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      await onRefresh();
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Auto-refresh failed:', err);
      setError(err instanceof Error ? err : new Error('Unknown error during refresh'));
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Set up the timer when the component mounts
  useEffect(() => {
    if (!enabled) return;
    
    // Initial refresh
    refresh();
    
    // Set up interval
    timerRef.current = window.setInterval(refresh, intervalMs);
    
    // Clean up on unmount
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, intervalMs, onRefresh]);
  
  // Time until next refresh in seconds
  const getTimeUntilNextRefresh = (): number => {
    if (!enabled || !timerRef.current) return 0;
    
    const nextRefreshTime = new Date(lastRefreshed.getTime() + intervalMs);
    const diffMs = nextRefreshTime.getTime() - new Date().getTime();
    return Math.max(0, Math.floor(diffMs / 1000));
  };
  
  return {
    lastRefreshed,
    isRefreshing,
    error,
    refresh,
    getTimeUntilNextRefresh,
  };
}
