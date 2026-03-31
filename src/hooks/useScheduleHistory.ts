import { useState, useCallback, useEffect } from 'react';
import type { FullSchedule } from '../types';
import { saveSchedule } from '../storage';

const MAX_HISTORY = 30;

export function useScheduleHistory(initialSchedule: FullSchedule) {
  const [schedule, setScheduleInternal] = useState<FullSchedule>(initialSchedule);
  const [history, setHistory] = useState<FullSchedule[]>([]);

  // Normal update: saves current schedule to history, then applies new
  const updateSchedule = useCallback((newSchedule: FullSchedule) => {
    setScheduleInternal(prev => {
      // Push previous state to history (deep copy)
      setHistory(h => {
        const copy = JSON.parse(JSON.stringify(prev)) as FullSchedule;
        const updated = [...h, copy];
        return updated.slice(-MAX_HISTORY);
      });
      return newSchedule;
    });
    saveSchedule(newSchedule);
  }, []);

  // Undo: pops from history, does NOT push to history
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      const remaining = prev.slice(0, -1);
      setScheduleInternal(previous);
      saveSchedule(previous);
      return remaining;
    });
  }, []);

  // Set schedule directly without history (for variant loading, reset, etc.)
  const setScheduleDirectly = useCallback((newSchedule: FullSchedule) => {
    setScheduleInternal(newSchedule);
    saveSchedule(newSchedule);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const undoCount = history.length;

  // Keyboard shortcut: Ctrl+Z / Cmd+Z
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('schedule-undo'));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { schedule, updateSchedule, undo, setScheduleDirectly, undoCount, clearHistory };
}
