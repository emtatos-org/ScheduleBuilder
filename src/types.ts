// Built-in pass types (cannot be removed)
export type BuiltinPassType = 'lektion' | 'ph-tid' | 'basgrupp' | 'lunch' | 'rast' | 'em-bg' | 'bro' | 'ovrigt';

export interface ValidationRules {
  minPassDuration: { enabled: boolean; value: number };
  maxEndTime: { enabled: boolean; value: number };
  lunchWindow: { enabled: boolean; start: number; end: number };
  maxTeacherHours: { enabled: boolean; value: number };
  minBreakBetween: { enabled: boolean; value: number };
}

// PassType is a string to support custom types
export type PassType = string;

export interface CustomPassType {
  value: string;       // unique ID, e.g. "idrott", "musik" (lowercase, no spaces)
  label: string;       // Display name, e.g. "Idrott", "Musik"
  color: string;       // Hex color, e.g. "#F59E0B"
  isTeaching: boolean; // Counts as teacher time? (default: true)
}

export interface SchedulePass {
  id: string;
  type: PassType;
  start: number;      // minuter från midnatt (ex: 510 = 08:30)
  duration: number;    // minuter
  label: string;
  guaranteed: boolean; // garanterad undervisningstid
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export type WeekKey = 'A' | 'B';

export type ClassSchedule = Record<DayKey, SchedulePass[]>;

export type WeekSchedule = Record<WeekKey, ClassSchedule>;

export type FullSchedule = Record<string, WeekSchedule>;

export interface PassTypeConfig {
  value: string;
  label: string;
  color: string;  // tailwind-kompatibel hex
}

export type GradeTargets = Record<number, number>; // grade → min/vecka

export type PassColors = Record<string, string>; // passtyp → hex-färg

/** Migrate old single-week data to the new two-week structure */
export function migrateSchedule(data: Record<string, unknown>): FullSchedule {
  const firstClass = Object.values(data)[0] as Record<string, unknown> | undefined;
  if (firstClass && ('A' in firstClass) && ('B' in firstClass)) {
    return data as FullSchedule;
  }

  const migrated: FullSchedule = {};
  for (const [cls, classSchedule] of Object.entries(data)) {
    migrated[cls] = {
      A: JSON.parse(JSON.stringify(classSchedule)) as ClassSchedule,
      B: JSON.parse(JSON.stringify(classSchedule)) as ClassSchedule,
    };
  }
  return migrated;
}
