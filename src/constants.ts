import type { PassTypeConfig, DayKey } from './types';

export const DAYS: { key: DayKey; label: string }[] = [
  { key: 'mon', label: 'Måndag' },
  { key: 'tue', label: 'Tisdag' },
  { key: 'wed', label: 'Onsdag' },
  { key: 'thu', label: 'Torsdag' },
  { key: 'fri', label: 'Fredag' },
];

export const CLASSES = ['4A', '5A', '6A', '7A', '8A', '9A'];

export const PASS_TYPES: PassTypeConfig[] = [
  { value: 'lektion',  label: 'Lektion',       color: '#2563EB' },
  { value: 'ph-tid',   label: 'ph-tid morgon',  color: '#60A5FA' },
  { value: 'basgrupp', label: 'Basgrupp',       color: '#16A34A' },
  { value: 'lunch',    label: 'Lunch',          color: '#EA580C' },
  { value: 'rast',     label: 'Rast',           color: '#F87171' },
  { value: 'em-bg',    label: 'em-bg',          color: '#15803D' },
  { value: 'bro',      label: 'Bro-pass',       color: '#7C3AED' },
  { value: 'ovrigt',   label: 'Övrigt',         color: '#94A3B8' },
];

export const START_HOUR = 8;
export const END_HOUR = 16;
export const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

export const LGR22_TARGETS: Record<number, number> = {
  4: 1200, 5: 1200, 6: 1285, 7: 1383, 8: 1383, 9: 1383,
};

export const MAX_TEACHER_HOURS = 27.5;
