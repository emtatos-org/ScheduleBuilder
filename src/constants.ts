import type { PassTypeConfig, DayKey, GradeTargets, PassColors, ValidationRules } from './types';

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

export const DEFAULT_LGR22_TARGETS: GradeTargets = {
  4: 1200, 5: 1200, 6: 1285, 7: 1383, 8: 1383, 9: 1383,
};

export const MAX_TEACHER_HOURS = 27.5;

export const DEFAULT_RULES: ValidationRules = {
  minPassDuration: { enabled: true, value: 20 },
  maxEndTime: { enabled: true, value: 900 },       // 15:00
  lunchWindow: { enabled: true, start: 630, end: 785 }, // 10:30-13:05
  maxTeacherHours: { enabled: true, value: 27.5 },
  minBreakBetween: { enabled: true, value: 5 },
};

export const DEFAULT_PASS_COLORS: PassColors = {
  'lektion': '#2563EB',
  'ph-tid': '#60A5FA',
  'basgrupp': '#16A34A',
  'lunch': '#EA580C',
  'rast': '#F87171',
  'em-bg': '#15803D',
  'bro': '#7C3AED',
  'ovrigt': '#94A3B8',
};
