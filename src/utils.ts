import { PASS_TYPES } from './constants';
import type { CustomPassType } from './types';

export function timeToMinutes(h: number, m: number): number {
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getPassColor(type: string, passColors: Record<string, string>, customTypes: CustomPassType[]): string {
  // First: check passColors (user-customized colors for builtin types)
  if (passColors[type]) return passColors[type];
  // Then: check custom types
  const custom = customTypes.find(ct => ct.value === type);
  if (custom) return custom.color;
  // Fallback
  return '#94A3B8';
}

export function getPassLabel(type: string, customTypes: CustomPassType[]): string {
  const builtin = PASS_TYPES.find(p => p.value === type);
  if (builtin) return builtin.label;
  const custom = customTypes.find(ct => ct.value === type);
  return custom?.label || type;
}

export function getGrade(cls: string): number {
  return parseInt(cls.replace(/\D/g, ''));
}

export function generateTimeOptions(): { value: number; label: string }[] {
  const opts: { value: number; label: string }[] = [];
  for (let h = 8; h < 16; h++) {
    for (let m = 0; m < 60; m += 5) {
      const val = timeToMinutes(h, m);
      opts.push({ value: val, label: minutesToTime(val) });
    }
  }
  return opts;
}
