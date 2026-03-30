import type { FullSchedule } from './types';

const STORAGE_KEY = 'schedulebuilder-v11';

export function saveSchedule(schedule: FullSchedule): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
}

export function loadSchedule(): FullSchedule | null {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try { return JSON.parse(data); } 
  catch { return null; }
}

export function clearSchedule(): void {
  localStorage.removeItem(STORAGE_KEY);
}
