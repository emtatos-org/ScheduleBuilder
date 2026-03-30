import { useState, useCallback, useEffect } from 'react';
import type { FullSchedule } from '../types';

const MAX_HISTORY = 30;

interface UseScheduleHistoryReturn {
  pushState: (prev: FullSchedule) => void;
  undo: () => FullSchedule | null;
  undoCount: number;
  clearHistory: () => void;
}

export function useScheduleHistory(): UseScheduleHistoryReturn {
  const [history, setHistory] = useState<FullSchedule[]>([]);

  const pushState = useCallback((prev: FullSchedule) => {
    setHistory(h => {
      const next = [...h, prev];
      if (next.length > MAX_HISTORY) {
        return next.slice(next.length - MAX_HISTORY);
      }
      return next;
    });
  }, []);

  const undo = useCallback((): FullSchedule | null => {
    let result: FullSchedule | null = null;
    setHistory(h => {
      if (h.length === 0) return h;
      result = h[h.length - 1];
      return h.slice(0, -1);
    });
    return result;
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Keyboard shortcut: Ctrl+Z / Cmd+Z
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        // Dispatch a custom event that App.tsx listens to
        window.dispatchEvent(new CustomEvent('schedule-undo'));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { pushState, undo, undoCount: history.length, clearHistory };
}
