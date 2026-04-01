import type { FullSchedule, SchedulePass, DayKey, ClassSchedule } from '../types';
import { timeToMinutes } from '../utils';

let idCounter = 0;
function nextId(): string {
  return `v11-${++idCounter}`;
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
   Mån: 310, Tis: 250, Ons: 250, Tor: 225, Fre: 165 = 1200
   Sluttider: mån 14:40, tis–ons 13:35, tor 13:35, fre 12:30    */

function build4A(): Record<DayKey, SchedulePass[]> {
  // Mon: 60+45+25+60+60+60 = 310 min teaching
  const mon: SchedulePass[] = [
    pass('lektion', 8, 30, 60, 'Pass 1', true),
    pass('rast',    9, 30,  5, 'Rast', false),
    pass('lektion', 9, 35, 45, 'Pass 2', true),
    pass('bro',    10, 20, 25, 'Bro-pass', true),
    pass('lunch',  10, 45, 15, 'Lunch', false),
    pass('rast',   11,  0, 30, 'Rast', false),
    pass('lektion',11, 30, 60, 'Pass 3', true),
    pass('rast',   12, 30,  5, 'Rast', false),
    pass('lektion',12, 35, 60, 'Pass 4', true),
    pass('rast',   13, 35,  5, 'Rast', false),
    pass('lektion',13, 40, 60, 'Pass 5', true),
  ];

  // Tue, Wed: 60+45+25+60+60 = 250 min teaching
  const tueWed: SchedulePass[] = [
    pass('lektion', 8, 30, 60, 'Pass 1', true),
    pass('rast',    9, 30,  5, 'Rast', false),
    pass('lektion', 9, 35, 45, 'Pass 2', true),
    pass('bro',    10, 20, 25, 'Bro-pass', true),
    pass('lunch',  10, 45, 15, 'Lunch', false),
    pass('rast',   11,  0, 30, 'Rast', false),
    pass('lektion',11, 30, 60, 'Pass 3', true),
    pass('rast',   12, 30,  5, 'Rast', false),
    pass('lektion',12, 35, 60, 'Pass 4', true),
  ];

  // Thu: 60+45+60+60 = 225 min teaching (no bro-pass)
  const thu: SchedulePass[] = [
    pass('lektion', 8, 30, 60, 'Pass 1', true),
    pass('rast',    9, 30,  5, 'Rast', false),
    pass('lektion', 9, 35, 45, 'Pass 2', true),
    pass('rast',   10, 20, 25, 'Rast', false),
    pass('lunch',  10, 45, 15, 'Lunch', false),
    pass('rast',   11,  0, 30, 'Rast', false),
    pass('lektion',11, 30, 60, 'Pass 3', true),
    pass('rast',   12, 30,  5, 'Rast', false),
    pass('lektion',12, 35, 60, 'Pass 4', true),
  ];

  // Fri: 60+45+60 = 165 min teaching (no bro-pass)
  const fri: SchedulePass[] = [
    pass('lektion', 8, 30, 60, 'Pass 1', true),
    pass('rast',    9, 30,  5, 'Rast', false),
    pass('lektion', 9, 35, 45, 'Pass 2', true),
    pass('rast',   10, 20, 25, 'Rast', false),
    pass('lunch',  10, 45, 15, 'Lunch', false),
    pass('rast',   11,  0, 30, 'Rast', false),
    pass('lektion',11, 30, 60, 'Pass 3', true),
  ];

  return {
    mon,
    tue: tueWed.map(p => ({ ...p, id: nextId() })),
    wed: tueWed.map(p => ({ ...p, id: nextId() })),
    thu,
    fri,
  };
}

/* ── Åk 5 ─────────────────────────────────────────────────────────
   Start 08:30 | Lunch 11:00–11:15 | Rast 11:15–11:45
   Mål 1200 min/v, lärartid 20.0 h
   Mån: 310, Tis: 250, Ons: 250, Tor: 225, Fre: 165 = 1200
   Sluttider: mån 14:55, tis–ons 13:50, tor 13:50, fre 12:45    */

function build5A(): Record<DayKey, SchedulePass[]> {
  // Mon: 60+45+25+60+60+60 = 310 min teaching
  const mon: SchedulePass[] = [
    pass('lektion', 8, 30, 60, 'Pass 1', true),
    pass('rast',    9, 30,  5, 'Rast', false),
    pass('lektion', 9, 35, 45, 'Pass 2', true),
    pass('bro',    10, 20, 25, 'Bro-pass', true),
    pass('rast',   10, 45, 15, 'Rast', false),
    pass('lunch',  11,  0, 15, 'Lunch', false),
    pass('rast',   11, 15, 30, 'Rast', false),
    pass('lektion',11, 45, 60, 'Pass 3', true),
    pass('rast',   12, 45,  5, 'Rast', false),
    pass('lektion',12, 50, 60, 'Pass 4', true),
    pass('rast',   13, 50,  5, 'Rast', false),
    pass('lektion',13, 55, 60, 'Pass 5', true),
  ];

  // Tue, Wed: 60+45+25+60+60 = 250 min teaching
  const tueWed: SchedulePass[] = [
    pass('lektion', 8, 30, 60, 'Pass 1', true),
    pass('rast',    9, 30,  5, 'Rast', false),
    pass('lektion', 9, 35, 45, 'Pass 2', true),
    pass('bro',    10, 20, 25, 'Bro-pass', true),
    pass('rast',   10, 45, 15, 'Rast', false),
    pass('lunch',  11,  0, 15, 'Lunch', false),
    pass('rast',   11, 15, 30, 'Rast', false),
    pass('lektion',11, 45, 60, 'Pass 3', true),
    pass('rast',   12, 45,  5, 'Rast', false),
    pass('lektion',12, 50, 60, 'Pass 4', true),
  ];

  // Thu: 60+45+60+60 = 225 min teaching (no bro-pass)
  const thu: SchedulePass[] = [
    pass('lektion', 8, 30, 60, 'Pass 1', true),
    pass('rast',    9, 30,  5, 'Rast', false),
    pass('lektion', 9, 35, 45, 'Pass 2', true),
    pass('rast',   10, 20, 40, 'Rast', false),
    pass('lunch',  11,  0, 15, 'Lunch', false),
    pass('rast',   11, 15, 30, 'Rast', false),
    pass('lektion',11, 45, 60, 'Pass 3', true),
    pass('rast',   12, 45,  5, 'Rast', false),
    pass('lektion',12, 50, 60, 'Pass 4', true),
  ];

  // Fri: 60+45+60 = 165 min teaching (no bro-pass)
  const fri: SchedulePass[] = [
    pass('lektion', 8, 30, 60, 'Pass 1', true),
    pass('rast',    9, 30,  5, 'Rast', false),
    pass('lektion', 9, 35, 45, 'Pass 2', true),
    pass('rast',   10, 20, 40, 'Rast', false),
    pass('lunch',  11,  0, 15, 'Lunch', false),
    pass('rast',   11, 15, 30, 'Rast', false),
    pass('lektion',11, 45, 60, 'Pass 3', true),
  ];

  return {
    mon,
    tue: tueWed.map(p => ({ ...p, id: nextId() })),
    wed: tueWed.map(p => ({ ...p, id: nextId() })),
    thu,
    fri,
  };
}

/* ── Åk 6 ─────────────────────────────────────────────────────────
   Start 09:00 | Lunch 11:55–12:10 | Rast 12:10–12:40
   Mål 1285, utfall 1290 (+5), lärartid 21.5 h
   Mån–Ons: 275, Tor: 270, Fre: 195 = 1290
   Sluttider: mån–ons 14:35, tor 14:30, fre 13:10               */

function build6A(): Record<DayKey, SchedulePass[]> {
  // Mon–Wed: 60+60+45+60+50 = 275 min teaching
  const monWed: SchedulePass[] = [
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('lunch',  11, 55, 15, 'Lunch', false),
    pass('rast',   12, 10, 30, 'Rast', false),
    pass('lektion',12, 40, 60, 'Pass 4', true),
    pass('rast',   13, 40,  5, 'Rast', false),
    pass('lektion',13, 45, 50, 'Pass 5', true),
  ];

  // Thu: 60+60+45+60+45 = 270 min teaching
  const thu: SchedulePass[] = [
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

  // Fri: 60+60+45+30 = 195 min teaching
  const fri: SchedulePass[] = [
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 45, 'Pass 3', true),
    pass('lunch',  11, 55, 15, 'Lunch', false),
    pass('rast',   12, 10, 30, 'Rast', false),
    pass('lektion',12, 40, 30, 'Pass 4', true),
  ];

  return {
    mon: monWed.map(p => ({ ...p, id: nextId() })),
    tue: monWed.map(p => ({ ...p, id: nextId() })),
    wed: monWed.map(p => ({ ...p, id: nextId() })),
    thu,
    fri,
  };
}

/* ── Åk 7 ─────────────────────────────────────────────────────────
   ph-tid 08:15–09:00 | Start 09:00 | Lunch 12:40–12:55 | Rast 12:55–13:25
   Bro 11:55–12:30 (35 min) + rast 12:30–12:40
   Mål 1383, utfall 1375 (−8), lärartid 22.9 h
   Varje dag: 45+60+60+45+35+30 = 275, Vecka: 1375              */

function build7A(): Record<DayKey, SchedulePass[]> {
  // Every day identical: 275 min teaching
  const day: SchedulePass[] = [
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

  return {
    mon: day.map(p => ({ ...p, id: nextId() })),
    tue: day.map(p => ({ ...p, id: nextId() })),
    wed: day.map(p => ({ ...p, id: nextId() })),
    thu: day.map(p => ({ ...p, id: nextId() })),
    fri: day.map(p => ({ ...p, id: nextId() })),
  };
}

/* ── Åk 8 ─────────────────────────────────────────────────────────
   ph-tid 08:15–09:00 | Start 09:00 | Lunch 12:25–12:40 | Rast 12:40–13:10
   Bro 11:55–12:25 (30 min)
   Mål 1383, utfall 1380 (−3), lärartid 23.0 h
   Mån–Tor: 285, Fre: 240 = 1380                                 */

function build8A(): Record<DayKey, SchedulePass[]> {
  // Mon–Thu: 45+60+60+45+30+45 = 285 min teaching
  const monThu: SchedulePass[] = [
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

  // Fri: 45+60+60+45+30 = 240 min teaching (no afternoon pass)
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
  ];

  return {
    mon: monThu.map(p => ({ ...p, id: nextId() })),
    tue: monThu.map(p => ({ ...p, id: nextId() })),
    wed: monThu.map(p => ({ ...p, id: nextId() })),
    thu: monThu.map(p => ({ ...p, id: nextId() })),
    fri,
  };
}

/* ── Åk 9 ─────────────────────────────────────────────────────────
   ph-tid 08:15–09:00 | Start 09:00 | 60-min Pass 3 (11:10–12:10)
   Lunch 12:10–12:25 | Rast 12:25–12:55
   Mål 1383, utfall 1410 (+27), lärartid 23.5 h
   Mån: 290, Tis: 290, Ons: 280, Tor: 280, Fre: 270 = 1410     */

function build9A(): Record<DayKey, SchedulePass[]> {
  // Mon, Tue: 45+60+60+60+45+20 = 290 min teaching
  const monTue: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 60, 'Pass 3', true),
    pass('lunch',  12, 10, 15, 'Lunch', false),
    pass('rast',   12, 25, 30, 'Rast', false),
    pass('lektion',12, 55, 45, 'Pass 4', true),
    pass('rast',   13, 40,  5, 'Rast', false),
    pass('lektion',13, 45, 20, 'Pass 5', true),
  ];

  // Wed, Thu: 45+60+60+60+55 = 280 min teaching
  const wedThu: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 60, 'Pass 3', true),
    pass('lunch',  12, 10, 15, 'Lunch', false),
    pass('rast',   12, 25, 30, 'Rast', false),
    pass('lektion',12, 55, 55, 'Pass 4', true),
  ];

  // Fri: 45+60+60+60+45 = 270 min teaching
  const fri: SchedulePass[] = [
    pass('ph-tid',  8, 15, 45, 'ph-tid morgon', true),
    pass('lektion', 9,  0, 60, 'Pass 1', true),
    pass('rast',   10,  0,  5, 'Rast', false),
    pass('lektion',10,  5, 60, 'Pass 2', true),
    pass('rast',   11,  5,  5, 'Rast', false),
    pass('lektion',11, 10, 60, 'Pass 3', true),
    pass('lunch',  12, 10, 15, 'Lunch', false),
    pass('rast',   12, 25, 30, 'Rast', false),
    pass('lektion',12, 55, 45, 'Pass 4', true),
  ];

  return {
    mon: monTue.map(p => ({ ...p, id: nextId() })),
    tue: monTue.map(p => ({ ...p, id: nextId() })),
    wed: wedThu.map(p => ({ ...p, id: nextId() })),
    thu: wedThu.map(p => ({ ...p, id: nextId() })),
    fri,
  };
}

function wrapWeek(cs: ClassSchedule): { A: ClassSchedule; B: ClassSchedule } {
  return {
    A: cs,
    B: JSON.parse(JSON.stringify(cs)) as ClassSchedule,
  };
}

export function createDefaultSchedule(): FullSchedule {
  idCounter = 0;
  return {
    '4A': wrapWeek(build4A()),
    '5A': wrapWeek(build5A()),
    '6A': wrapWeek(build6A()),
    '7A': wrapWeek(build7A()),
    '8A': wrapWeek(build8A()),
    '9A': wrapWeek(build9A()),
  };
}
