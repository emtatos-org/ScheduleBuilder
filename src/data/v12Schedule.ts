import type { FullSchedule, SchedulePass, DayKey } from '../types';
import { timeToMinutes } from '../utils';
import { createDefaultSchedule } from './defaultSchedule';

let idCounter = 0;
function nextId(): string {
  return `v12-${++idCounter}`;
}

function pass(
  type: SchedulePass['type'],
  startH: number,
  startM: number,
  duration: number,
  label: string,
  guaranteed: boolean,
): SchedulePass {
  return {
    id: nextId(),
    type,
    start: timeToMinutes(startH, startM),
    duration,
    label,
    guaranteed,
  };
}

/* ══════════════════════════════════════════════════════════════════
   Åk 6A — 1290 min/v, lärartid 21.5 h (ingen ph-tid)
   Lunchrotation: Mån A, Tis B, Ons C, Tor D, Fre A
   ══════════════════════════════════════════════════════════════════ */

function build6A_v12(): Record<DayKey, SchedulePass[]> {
  // Mån (Slot A): 60+60+45+60+45 = 270 min
  const mon: SchedulePass[] = [
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('lunch',  11, 55, 15, 'Lunch', false),
    pass('rast',   12, 10, 30, 'Rast', false),
    pass('lektion',12, 40, 60, 'Pass 4', true),
    pass('rast',   13, 40,  5, 'Rast', false),
    pass('lektion',13, 45, 45, 'Pass 5', true),
  ];

  // Tis (Slot B): 60+60+45+60+35 = 260 min
  const tue: SchedulePass[] = [
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('rast',   11, 55, 15, 'Rast', false),
    pass('lunch',  12, 10, 15, 'Lunch', false),
    pass('rast',   12, 25, 30, 'Rast', false),
    pass('lektion',12, 55, 60, 'Pass 4', true),
    pass('rast',   13, 55,  5, 'Rast', false),
    pass('lektion',14,  0, 35, 'Pass 5', true),
  ];

  // Ons (Slot C): 60+60+45+30+45+30 = 270 min
  const wed: SchedulePass[] = [
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('bro',    11, 55, 30, 'Bro-pass', true),
    pass('lunch',  12, 25, 15, 'Lunch', false),
    pass('rast',   12, 40, 30, 'Rast', false),
    pass('lektion',13, 10, 45, 'Pass 4', true),
    pass('rast',   13, 55,  5, 'Rast', false),
    pass('lektion',14,  0, 30, 'Pass 5', true),
  ];

  // Tor (Slot D): 60+60+45+35+60 = 260 min
  const thu: SchedulePass[] = [
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('bro',    11, 55, 35, 'Bro-pass', true),
    pass('rast',   12, 30, 10, 'Rast', false),
    pass('lunch',  12, 40, 15, 'Lunch', false),
    pass('rast',   12, 55, 30, 'Rast', false),
    pass('lektion',13, 25, 60, 'Pass 4', true),
  ];

  // Fre (Slot A): 60+60+45+45+20 = 230 min
  const fri: SchedulePass[] = [
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('lunch',  11, 55, 15, 'Lunch', false),
    pass('rast',   12, 10, 30, 'Rast', false),
    pass('lektion',12, 40, 45, 'Pass 4', true),
    pass('rast',   13, 25,  5, 'Rast', false),
    pass('lektion',13, 30, 20, 'Pass 5', true),
  ];

  return { mon, tue, wed, thu, fri };
}

/* ══════════════════════════════════════════════════════════════════
   Åk 7A — 1375 min/v, lärartid 22.9 h (med ph-tid)
   Lunchrotation: Mån B, Tis C, Ons D, Tor A, Fre D
   ══════════════════════════════════════════════════════════════════ */

function build7A_v12(): Record<DayKey, SchedulePass[]> {
  // Mån (Slot B): 45+60+60+45+60 = 270 min
  const mon: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('rast',   11, 55, 15, 'Rast', false),
    pass('lunch',  12, 10, 15, 'Lunch', false),
    pass('rast',   12, 25, 30, 'Rast', false),
    pass('lektion',12, 55, 60, 'Pass 4', true),
  ];

  // Tis (Slot C): 45+60+60+45+30+45 = 285 min
  const tue: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('bro',    11, 55, 30, 'Bro-pass', true),
    pass('lunch',  12, 25, 15, 'Lunch', false),
    pass('rast',   12, 40, 30, 'Rast', false),
    pass('lektion',13, 10, 45, 'Pass 4', true),
  ];

  // Ons (Slot D): 45+60+60+45+35+30 = 275 min
  const wed: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('bro',    11, 55, 35, 'Bro-pass', true),
    pass('rast',   12, 30, 10, 'Rast', false),
    pass('lunch',  12, 40, 15, 'Lunch', false),
    pass('rast',   12, 55, 30, 'Rast', false),
    pass('lektion',13, 25, 30, 'Pass 4', true),
  ];

  // Tor (Slot A): 45+60+60+45+60 = 270 min
  const thu: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('lunch',  11, 55, 15, 'Lunch', false),
    pass('rast',   12, 10, 30, 'Rast', false),
    pass('lektion',12, 40, 60, 'Pass 4', true),
  ];

  // Fre (Slot D): 45+60+60+45+35+30 = 275 min
  const fri: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('bro',    11, 55, 35, 'Bro-pass', true),
    pass('rast',   12, 30, 10, 'Rast', false),
    pass('lunch',  12, 40, 15, 'Lunch', false),
    pass('rast',   12, 55, 30, 'Rast', false),
    pass('lektion',13, 25, 30, 'Pass 4', true),
  ];

  return { mon, tue, wed, thu, fri };
}

/* ══════════════════════════════════════════════════════════════════
   Åk 8A — 1380 min/v, lärartid 23.0 h (med ph-tid)
   Lunchrotation: Mån C, Tis D, Ons A, Tor B, Fre B
   ══════════════════════════════════════════════════════════════════ */

function build8A_v12(): Record<DayKey, SchedulePass[]> {
  // Mån (Slot C): 45+60+60+45+30+55 = 295 min
  const mon: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('bro',    11, 55, 30, 'Bro-pass', true),
    pass('lunch',  12, 25, 15, 'Lunch', false),
    pass('rast',   12, 40, 30, 'Rast', false),
    pass('lektion',13, 10, 55, 'Pass 4', true),
  ];

  // Tis (Slot D): 45+60+60+45+35+45 = 290 min
  const tue: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('bro',    11, 55, 35, 'Bro-pass', true),
    pass('rast',   12, 30, 10, 'Rast', false),
    pass('lunch',  12, 40, 15, 'Lunch', false),
    pass('rast',   12, 55, 30, 'Rast', false),
    pass('lektion',13, 25, 45, 'Pass 4', true),
  ];

  // Ons (Slot A): 45+60+60+45+60+20 = 290 min
  const wed: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('lunch',  11, 55, 15, 'Lunch', false),
    pass('rast',   12, 10, 30, 'Rast', false),
    pass('lektion',12, 40, 60, 'Pass 4', true),
    pass('rast',   13, 40,  5, 'Rast', false),
    pass('lektion',13, 45, 20, 'Pass 5', true),
  ];

  // Tor (Slot B): 45+60+60+45+60 = 270 min
  const thu: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('rast',   11, 55, 15, 'Rast', false),
    pass('lunch',  12, 10, 15, 'Lunch', false),
    pass('rast',   12, 25, 30, 'Rast', false),
    pass('lektion',12, 55, 60, 'Pass 4', true),
  ];

  // Fre (Slot B): 45+60+60+45+25 = 235 min
  const fri: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('rast',   11, 55, 15, 'Rast', false),
    pass('lunch',  12, 10, 15, 'Lunch', false),
    pass('rast',   12, 25, 30, 'Rast', false),
    pass('lektion',12, 55, 25, 'Pass 4', true),
  ];

  return { mon, tue, wed, thu, fri };
}

/* ══════════════════════════════════════════════════════════════════
   Åk 9A — 1410 min/v, lärartid 23.5 h (med ph-tid)
   Lunchrotation: Mån D, Tis A, Ons B, Tor C, Fre C
   ══════════════════════════════════════════════════════════════════ */

function build9A_v12(): Record<DayKey, SchedulePass[]> {
  // Mån (Slot D): 45+60+60+45+35+55 = 300 min
  const mon: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('bro',    11, 55, 35, 'Bro-pass', true),
    pass('rast',   12, 30, 10, 'Rast', false),
    pass('lunch',  12, 40, 15, 'Lunch', false),
    pass('rast',   12, 55, 30, 'Rast', false),
    pass('lektion',13, 25, 55, 'Pass 4', true),
  ];

  // Tis (Slot A): 45+60+60+45+45+25 = 280 min
  const tue: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('lunch',  11, 55, 15, 'Lunch', false),
    pass('rast',   12, 10, 30, 'Rast', false),
    pass('lektion',12, 40, 45, 'Pass 4', true),
    pass('rast',   13, 25,  5, 'Rast', false),
    pass('lektion',13, 30, 25, 'Pass 5', true),
  ];

  // Ons (Slot B): 45+60+60+45+55 = 265 min
  const wed: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('rast',   11, 55, 15, 'Rast', false),
    pass('lunch',  12, 10, 15, 'Lunch', false),
    pass('rast',   12, 25, 30, 'Rast', false),
    pass('lektion',12, 55, 55, 'Pass 4', true),
  ];

  // Tor (Slot C): 45+60+60+45+30+50 = 290 min
  const thu: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('bro',    11, 55, 30, 'Bro-pass', true),
    pass('lunch',  12, 25, 15, 'Lunch', false),
    pass('rast',   12, 40, 30, 'Rast', false),
    pass('lektion',13, 10, 50, 'Pass 4', true),
  ];

  // Fre (Slot C): 45+60+60+45+30+35 = 275 min
  const fri: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('bro',    11, 55, 30, 'Bro-pass', true),
    pass('lunch',  12, 25, 15, 'Lunch', false),
    pass('rast',   12, 40, 30, 'Rast', false),
    pass('lektion',13, 10, 35, 'Pass 4', true),
  ];

  return { mon, tue, wed, thu, fri };
}

/* ══════════════════════════════════════════════════════════════════
   createV12Schedule — Åk 4+5 from v11, Åk 6–9 with rotating lunch
   ══════════════════════════════════════════════════════════════════ */

export function createV12Schedule(): FullSchedule {
  idCounter = 0;
  const v11 = createDefaultSchedule();
  return {
    '4A': v11['4A'],
    '5A': v11['5A'],
    '6A': build6A_v12(),
    '7A': build7A_v12(),
    '8A': build8A_v12(),
    '9A': build9A_v12(),
  };
}
