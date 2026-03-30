import { useState, useCallback, useEffect, useRef } from 'react';
import type { FullSchedule } from '../types';
import { saveSchedule } from '../storage';

const MAX_HISTORY = 30;

function deepCopy(schedule: FullSchedule): FullSchedule {
  return JSON.parse(JSON.stringify(schedule));
}

interface UseScheduleHistoryReturn {
  schedule: FullSchedule;
  updateSchedule: (newSchedule: FullSchedule) => void;
  setScheduleDirect: (newSchedule: FullSchedule) => void;
  undo: () => void;
  undoCount: number;
  clearHistory: () => void;
}

export function useScheduleHistory(initialSchedule: FullSchedule): UseScheduleHistoryReturn {
  const [schedule, setScheduleInternal] = useState<FullSchedule>(initialSchedule);
  const [history, setHistory] = useState<FullSchedule[]>([]);
  const undoRef = useRef<() => void>(() => {});

  // Normal update: saves current state to history, then applies new state
  const updateSchedule = useCallback((newSchedule: FullSchedule) => {
    setScheduleInternal(prev => {
      // Deep copy the CURRENT state and push to history
      setHistory(h => {
        const copy = deepCopy(prev);
        const updated = [...h, copy];
        return updated.slice(-MAX_HISTORY);
      });
      return newSchedule;
    });
    saveSchedule(newSchedule);
  }, []);

  // Direct set without pushing to history (used by undo and variant loading)
  const setScheduleDirect = useCallback((newSchedule: FullSchedule) => {
    setScheduleInternal(newSchedule);
    saveSchedule(newSchedule);
  }, []);

  // Undo: pops from history, does NOT push current state to history
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

  // Keep ref up to date for keyboard handler
  undoRef.current = undo;

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const undoCount = history.length;

  // Keyboard shortcut: Ctrl+Z / Cmd+Z
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoRef.current();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { schedule, updateSchedule, setScheduleDirect, undo, undoCount, clearHistory };
}
