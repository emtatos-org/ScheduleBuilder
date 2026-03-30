import type { FullSchedule } from './types';

const STORAGE_KEY = 'schedulebuilder-v11';
const VARIANTS_KEY = 'schedulebuilder-variants';

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

/* ── Variant storage ─────────────────────────────────────────── */

export interface ScheduleVariant {
  id: string;
  name: string;
  schedule: FullSchedule;
  createdAt: string;
  updatedAt: string;
}

export interface VariantStore {
  activeVariantId: string;
  variants: ScheduleVariant[];
}

export function saveVariants(store: VariantStore): void {
  localStorage.setItem(VARIANTS_KEY, JSON.stringify(store));
}

export function loadVariants(): VariantStore | null {
  const data = localStorage.getItem(VARIANTS_KEY);
  if (!data) return null;
  try { return JSON.parse(data); }
  catch { return null; }
}
