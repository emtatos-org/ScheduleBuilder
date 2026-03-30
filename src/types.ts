export type PassType = 
  | 'lektion' | 'ph-tid' | 'basgrupp' | 'lunch' 
  | 'rast' | 'em-bg' | 'bro' | 'ovrigt';

export interface SchedulePass {
  id: string;
  type: PassType;
  start: number;      // minuter från midnatt (ex: 510 = 08:30)
  duration: number;    // minuter
  label: string;
  guaranteed: boolean; // garanterad undervisningstid
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export type ClassSchedule = Record<DayKey, SchedulePass[]>;

export type FullSchedule = Record<string, ClassSchedule>;

export interface PassTypeConfig {
  value: PassType;
  label: string;
  color: string;  // tailwind-kompatibel hex
}
