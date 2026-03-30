import type { FullSchedule, SchedulePass, DayKey } from '../types';
import { timeToMinutes } from '../utils';

let idCounter = 0;
function nextId(): string {
  return `default-${++idCounter}`;
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

/* ── Åk 4 ─────────────────────────────────────────────────────────
   Start 08:30 | Lunch 10:45–11:00 | Rast 11:00–11:30
   Mål 1200 min/v, lärartid 20.0 h
   Sluttider: mån 14:40, tis–tor 13:35, fre 12:30
   Weekly: 300+245+245+245+165 = 1200                            */

function build4A(): Record<DayKey, SchedulePass[]> {
  // Mon: 300 min teaching
  const mon: SchedulePass[] = [
    pass('lektion', 8, 30, 60, 'Lektion', true),
    pass('rast', 9, 30, 5, 'Rast', false),
    pass('lektion', 9, 35, 45, 'Lektion', true),
    pass('bro', 10, 20, 15, 'Bro-pass', true),
    pass('rast', 10, 35, 10, 'Rast', false),
    pass('lunch', 10, 45, 15, 'Lunch', false),
    pass('rast', 11, 0, 30, 'Rast', false),
    pass('lektion', 11, 30, 60, 'Lektion', true),
    pass('rast', 12, 30, 5, 'Rast', false),
    pass('lektion', 12, 35, 60, 'Lektion', true),
    pass('rast', 13, 35, 5, 'Rast', false),
    pass('lektion', 13, 40, 60, 'Lektion', true),
  ];

  // Tue–Thu: 245 min teaching each
  const tueThu: SchedulePass[] = [
    pass('lektion', 8, 30, 60, 'Lektion', true),
    pass('rast', 9, 30, 5, 'Rast', false),
    pass('lektion', 9, 35, 45, 'Lektion', true),
    pass('bro', 10, 20, 20, 'Bro-pass', true),
    pass('rast', 10, 40, 5, 'Rast', false),
    pass('lunch', 10, 45, 15, 'Lunch', false),
    pass('rast', 11, 0, 30, 'Rast', false),
    pass('lektion', 11, 30, 60, 'Lektion', true),
    pass('rast', 12, 30, 5, 'Rast', false),
    pass('lektion', 12, 35, 60, 'Lektion', true),
  ];

  // Fri: 165 min teaching
  const fri: SchedulePass[] = [
    pass('lektion', 8, 30, 60, 'Lektion', true),
    pass('rast', 9, 30, 5, 'Rast', false),
    pass('lektion', 9, 35, 45, 'Lektion', true),
    pass('rast', 10, 20, 25, 'Rast', false),
    pass('lunch', 10, 45, 15, 'Lunch', false),
    pass('rast', 11, 0, 30, 'Rast', false),
    pass('lektion', 11, 30, 60, 'Lektion', true),
  ];

  return {
    mon,
    tue: tueThu.map(p => ({ ...p, id: nextId() })),
    wed: tueThu.map(p => ({ ...p, id: nextId() })),
    thu: tueThu.map(p => ({ ...p, id: nextId() })),
    fri,
  };
}

/* ── Åk 5 ─────────────────────────────────────────────────────────
   Start 08:30 | Lunch 11:00–11:15 | Rast 11:15–11:45
   Mål 1200 min/v, lärartid 20.0 h
   Sluttider: mån 14:55, tis–tor 13:50, fre 12:45
   Weekly: 300+245+245+245+165 = 1200                            */

function build5A(): Record<DayKey, SchedulePass[]> {
  const mon: SchedulePass[] = [
    pass('lektion', 8, 30, 60, 'Lektion', true),
    pass('rast', 9, 30, 5, 'Rast', false),
    pass('lektion', 9, 35, 45, 'Lektion', true),
    pass('bro', 10, 20, 15, 'Bro-pass', true),
    pass('rast', 10, 35, 25, 'Rast', false),
    pass('lunch', 11, 0, 15, 'Lunch', false),
    pass('rast', 11, 15, 30, 'Rast', false),
    pass('lektion', 11, 45, 60, 'Lektion', true),
    pass('rast', 12, 45, 5, 'Rast', false),
    pass('lektion', 12, 50, 60, 'Lektion', true),
    pass('rast', 13, 50, 5, 'Rast', false),
    pass('lektion', 13, 55, 60, 'Lektion', true),
  ];

  const tueThu: SchedulePass[] = [
    pass('lektion', 8, 30, 60, 'Lektion', true),
    pass('rast', 9, 30, 5, 'Rast', false),
    pass('lektion', 9, 35, 45, 'Lektion', true),
    pass('bro', 10, 20, 20, 'Bro-pass', true),
    pass('rast', 10, 40, 20, 'Rast', false),
    pass('lunch', 11, 0, 15, 'Lunch', false),
    pass('rast', 11, 15, 30, 'Rast', false),
    pass('lektion', 11, 45, 60, 'Lektion', true),
    pass('rast', 12, 45, 5, 'Rast', false),
    pass('lektion', 12, 50, 60, 'Lektion', true),
  ];

  const fri: SchedulePass[] = [
    pass('lektion', 8, 30, 60, 'Lektion', true),
    pass('rast', 9, 30, 5, 'Rast', false),
    pass('lektion', 9, 35, 45, 'Lektion', true),
    pass('rast', 10, 20, 40, 'Rast', false),
    pass('lunch', 11, 0, 15, 'Lunch', false),
    pass('rast', 11, 15, 30, 'Rast', false),
    pass('lektion', 11, 45, 60, 'Lektion', true),
  ];

  return {
    mon,
    tue: tueThu.map(p => ({ ...p, id: nextId() })),
    wed: tueThu.map(p => ({ ...p, id: nextId() })),
    thu: tueThu.map(p => ({ ...p, id: nextId() })),
    fri,
  };
}

/* ── Åk 6 ─────────────────────────────────────────────────────────
   Start 09:00 | Lunch 11:55–12:10 | Rast 12:10–12:40
   Mål 1285, utfall 1290 (+5), lärartid 21.5 h
   Weekly: (165+105)*4 + (165+45) = 1080+210 = 1290              */

function build6A(): Record<DayKey, SchedulePass[]> {
  const monThu: SchedulePass[] = [
    pass('lektion', 9, 0, 60, 'Lektion', true),
    pass('rast', 10, 0, 5, 'Rast', false),
    pass('lektion', 10, 5, 60, 'Lektion', true),
    pass('rast', 11, 5, 5, 'Rast', false),
    pass('lektion', 11, 10, 45, 'Lektion', true),
    pass('lunch', 11, 55, 15, 'Lunch', false),
    pass('rast', 12, 10, 30, 'Rast', false),
    pass('lektion', 12, 40, 60, 'Lektion', true),
    pass('rast', 13, 40, 5, 'Rast', false),
    pass('lektion', 13, 45, 45, 'Lektion', true),
  ];

  const fri: SchedulePass[] = [
    pass('lektion', 9, 0, 60, 'Lektion', true),
    pass('rast', 10, 0, 5, 'Rast', false),
    pass('lektion', 10, 5, 60, 'Lektion', true),
    pass('rast', 11, 5, 5, 'Rast', false),
    pass('lektion', 11, 10, 45, 'Lektion', true),
    pass('lunch', 11, 55, 15, 'Lunch', false),
    pass('rast', 12, 10, 30, 'Rast', false),
    pass('lektion', 12, 40, 45, 'Lektion', true),
  ];

  return {
    mon: monThu.map(p => ({ ...p, id: nextId() })),
    tue: monThu.map(p => ({ ...p, id: nextId() })),
    wed: monThu.map(p => ({ ...p, id: nextId() })),
    thu: monThu.map(p => ({ ...p, id: nextId() })),
    fri,
  };
}

/* ── Åk 7 ─────────────────────────────────────────────────────────
   ph-tid 08:15–09:00 | Start 09:00 | Lunch 12:40–12:55 | Rast 12:55–13:25
   Bro 11:55–12:30 (35 min) + rast 12:30–12:40
   Mål 1383, utfall 1375 (−8), lärartid 22.9 h
   Weekly: 305 + 275*3 + 245 = 1375                              */

function build7A(): Record<DayKey, SchedulePass[]> {
  const mon: SchedulePass[] = [
    pass('ph-tid', 8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9, 0, 60, 'Lektion', true),
    pass('rast', 10, 0, 5, 'Rast', false),
    pass('lektion', 10, 5, 60, 'Lektion', true),
    pass('rast', 11, 5, 5, 'Rast', false),
    pass('lektion', 11, 10, 45, 'Lektion', true),
    pass('bro', 11, 55, 35, 'Bro-pass', true),
    pass('rast', 12, 30, 10, 'Rast', false),
    pass('lunch', 12, 40, 15, 'Lunch', false),
    pass('rast', 12, 55, 30, 'Rast', false),
    pass('lektion', 13, 25, 60, 'Lektion', true),
  ];

  const tueThu: SchedulePass[] = [
    pass('ph-tid', 8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9, 0, 60, 'Lektion', true),
    pass('rast', 10, 0, 5, 'Rast', false),
    pass('lektion', 10, 5, 60, 'Lektion', true),
    pass('rast', 11, 5, 5, 'Rast', false),
    pass('lektion', 11, 10, 45, 'Lektion', true),
    pass('bro', 11, 55, 35, 'Bro-pass', true),
    pass('rast', 12, 30, 10, 'Rast', false),
    pass('lunch', 12, 40, 15, 'Lunch', false),
    pass('rast', 12, 55, 30, 'Rast', false),
    pass('lektion', 13, 25, 30, 'Lektion', true),
  ];

  const fri: SchedulePass[] = [
    pass('ph-tid', 8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9, 0, 60, 'Lektion', true),
    pass('rast', 10, 0, 5, 'Rast', false),
    pass('lektion', 10, 5, 60, 'Lektion', true),
    pass('rast', 11, 5, 5, 'Rast', false),
    pass('lektion', 11, 10, 45, 'Lektion', true),
    pass('bro', 11, 55, 35, 'Bro-pass', true),
    pass('rast', 12, 30, 10, 'Rast', false),
    pass('lunch', 12, 40, 15, 'Lunch', false),
    pass('rast', 12, 55, 30, 'Rast', false),
  ];

  return {
    mon,
    tue: tueThu.map(p => ({ ...p, id: nextId() })),
    wed: tueThu.map(p => ({ ...p, id: nextId() })),
    thu: tueThu.map(p => ({ ...p, id: nextId() })),
    fri,
  };
}

/* ── Åk 8 ─────────────────────────────────────────────────────────
   ph-tid 08:15–09:00 | Start 09:00 | Lunch 12:25–12:40 | Rast 12:40–13:10
   Bro 11:55–12:20/12:25
   Mål 1383, utfall 1380 (−3), lärartid 23.0 h
   Weekly: 285 + 280*3 + 255 = 1380                              */

function build8A(): Record<DayKey, SchedulePass[]> {
  const mon: SchedulePass[] = [
    pass('ph-tid', 8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9, 0, 60, 'Lektion', true),
    pass('rast', 10, 0, 5, 'Rast', false),
    pass('lektion', 10, 5, 60, 'Lektion', true),
    pass('rast', 11, 5, 5, 'Rast', false),
    pass('lektion', 11, 10, 45, 'Lektion', true),
    pass('bro', 11, 55, 30, 'Bro-pass', true),
    pass('lunch', 12, 25, 15, 'Lunch', false),
    pass('rast', 12, 40, 30, 'Rast', false),
    pass('lektion', 13, 10, 45, 'Lektion', true),
  ];

  const tueThu: SchedulePass[] = [
    pass('ph-tid', 8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9, 0, 60, 'Lektion', true),
    pass('rast', 10, 0, 5, 'Rast', false),
    pass('lektion', 10, 5, 60, 'Lektion', true),
    pass('rast', 11, 5, 5, 'Rast', false),
    pass('lektion', 11, 10, 45, 'Lektion', true),
    pass('bro', 11, 55, 25, 'Bro-pass', true),
    pass('rast', 12, 20, 5, 'Rast', false),
    pass('lunch', 12, 25, 15, 'Lunch', false),
    pass('rast', 12, 40, 30, 'Rast', false),
    pass('lektion', 13, 10, 45, 'Lektion', true),
  ];

  const fri: SchedulePass[] = [
    pass('ph-tid', 8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9, 0, 60, 'Lektion', true),
    pass('rast', 10, 0, 5, 'Rast', false),
    pass('lektion', 10, 5, 60, 'Lektion', true),
    pass('rast', 11, 5, 5, 'Rast', false),
    pass('lektion', 11, 10, 45, 'Lektion', true),
    pass('bro', 11, 55, 25, 'Bro-pass', true),
    pass('rast', 12, 20, 5, 'Rast', false),
    pass('lunch', 12, 25, 15, 'Lunch', false),
    pass('rast', 12, 40, 30, 'Rast', false),
    pass('lektion', 13, 10, 20, 'Lektion', true),
  ];

  return {
    mon,
    tue: tueThu.map(p => ({ ...p, id: nextId() })),
    wed: tueThu.map(p => ({ ...p, id: nextId() })),
    thu: tueThu.map(p => ({ ...p, id: nextId() })),
    fri,
  };
}

/* ── Åk 9 ─────────────────────────────────────────────────────────
   ph-tid 08:15–09:00 | Start 09:00 | 60-min Pass 3 (11:10–12:10)
   Lunch 12:10–12:25 | Rast 12:25–12:55
   Mål 1383, utfall 1410 (+27), lärartid 23.5 h
   Weekly: 285*4 + 270 = 1410                                    */

function build9A(): Record<DayKey, SchedulePass[]> {
  const monThu: SchedulePass[] = [
    pass('ph-tid', 8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9, 0, 60, 'Lektion', true),
    pass('rast', 10, 0, 5, 'Rast', false),
    pass('lektion', 10, 5, 60, 'Lektion', true),
    pass('rast', 11, 5, 5, 'Rast', false),
    pass('lektion', 11, 10, 60, 'Lektion', true),
    pass('lunch', 12, 10, 15, 'Lunch', false),
    pass('rast', 12, 25, 30, 'Rast', false),
    pass('lektion', 12, 55, 60, 'Lektion', true),
  ];

  const fri: SchedulePass[] = [
    pass('ph-tid', 8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9, 0, 60, 'Lektion', true),
    pass('rast', 10, 0, 5, 'Rast', false),
    pass('lektion', 10, 5, 60, 'Lektion', true),
    pass('rast', 11, 5, 5, 'Rast', false),
    pass('lektion', 11, 10, 60, 'Lektion', true),
    pass('lunch', 12, 10, 15, 'Lunch', false),
    pass('rast', 12, 25, 30, 'Rast', false),
    pass('lektion', 12, 55, 45, 'Lektion', true),
  ];

  return {
    mon: monThu.map(p => ({ ...p, id: nextId() })),
    tue: monThu.map(p => ({ ...p, id: nextId() })),
    wed: monThu.map(p => ({ ...p, id: nextId() })),
    thu: monThu.map(p => ({ ...p, id: nextId() })),
    fri,
  };
}

export function createDefaultSchedule(): FullSchedule {
  idCounter = 0;
  return {
    '4A': build4A(),
    '5A': build5A(),
    '6A': build6A(),
    '7A': build7A(),
    '8A': build8A(),
    '9A': build9A(),
  };
}
