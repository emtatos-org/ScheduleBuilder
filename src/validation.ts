import type { ClassSchedule, FullSchedule, SchedulePass, GradeTargets, WeekKey, CustomPassType } from './types';
import { MAX_TEACHER_HOURS, DAYS, DEFAULT_LGR22_TARGETS } from './constants';
import { getGrade, minutesToTime } from './utils';

export interface ValidationWarning {
  level: 'error' | 'warn' | 'info' | 'success';
  msg: string;
}

export interface ValidationResult {
  warnings: ValidationWarning[];
  weeklyGuaranteed: number;
  weeklyTeacher: number;
  weeklyPh: number;
}

const BUILTIN_TEACHER_TYPES = new Set(['lektion', 'basgrupp', 'em-bg', 'bro', 'ph-tid']);

function isTeacherType(type: string, customTypes: CustomPassType[]): boolean {
  if (BUILTIN_TEACHER_TYPES.has(type)) return true;
  const custom = customTypes.find(ct => ct.value === type);
  return custom?.isTeaching ?? false;
}

/** Validate a single ClassSchedule (one week of one class). Optional weekPrefix for warnings. */
export function validateClassSchedule(
  classSchedule: ClassSchedule,
  cls: string,
  targets: GradeTargets = DEFAULT_LGR22_TARGETS,
  weekPrefix?: string,
  customTypes: CustomPassType[] = [],
): ValidationResult {
  if (!classSchedule) {
    return { warnings: [], weeklyGuaranteed: 0, weeklyTeacher: 0, weeklyPh: 0 };
  }

  const prefix = weekPrefix ? `${weekPrefix} — ` : '';
  const warnings: ValidationWarning[] = [];
  let weeklyGuaranteed = 0;
  let weeklyTeacher = 0;
  let weeklyPh = 0;

  for (const day of DAYS) {
    const passes = classSchedule[day.key] || [];
    const sorted = [...passes].sort((a, b) => a.start - b.start);

    for (const p of sorted) {
      if (p.guaranteed) {
        weeklyGuaranteed += p.duration;
      }
      if (isTeacherType(p.type, customTypes)) {
        weeklyTeacher += p.duration;
      }
      if (p.type === 'ph-tid') {
        weeklyPh += p.duration;
      }

      if (p.type !== 'rast' && p.type !== 'lunch' && p.duration < 20) {
        warnings.push({
          level: 'warn',
          msg: `${prefix}${day.label}: "${p.label}" är bara ${p.duration} min (< 20 min)`,
        });
      }

      if (p.type === 'lunch') {
        const lunchStart = p.start;
        const lunchEnd = p.start + p.duration;
        if (lunchStart < 630 || lunchEnd > 785) {
          warnings.push({
            level: 'warn',
            msg: `${prefix}${day.label}: Lunch ${minutesToTime(lunchStart)}–${minutesToTime(lunchEnd)} ligger utanför 10:30–13:05`,
          });
        }
      }
    }

    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = sorted[i];
      const next = sorted[i + 1];
      const gap = next.start - (curr.start + curr.duration);
      if (gap > 0 && gap < 5 && isTeachingPass(curr) && isTeachingPass(next)) {
        warnings.push({
          level: 'warn',
          msg: `${prefix}${day.label}: Bara ${gap} min rast mellan "${curr.label}" och "${next.label}"`,
        });
      }
    }

    if (sorted.length > 0) {
      const lastPass = sorted[sorted.length - 1];
      const endTime = lastPass.start + lastPass.duration;
      if (endTime > 900) {
        warnings.push({
          level: 'warn',
          msg: `${prefix}${day.label}: Sluttid ${minutesToTime(endTime)} (efter 15:00)`,
        });
      }
    }
  }

  const teacherHours = weeklyTeacher / 60;
  if (teacherHours > MAX_TEACHER_HOURS) {
    warnings.push({
      level: 'error',
      msg: `${prefix}Lärartid ${teacherHours.toFixed(1)} h/v överstiger max ${MAX_TEACHER_HOURS} h`,
    });
  }

  const grade = getGrade(cls);
  const target = targets[grade];
  if (target) {
    const deviation = weeklyGuaranteed - target;
    if (deviation < 0) {
      warnings.push({
        level: 'warn',
        msg: `${prefix}Garanterad tid ${weeklyGuaranteed} min/v är under mål ${target} min (${deviation} min)`,
      });
    } else if (deviation === 0) {
      warnings.push({
        level: 'success',
        msg: `${prefix}Garanterad tid ${weeklyGuaranteed} min/v \u2713 uppfyller mål ${target} min`,
      });
    } else {
      warnings.push({
        level: 'success',
        msg: `${prefix}Garanterad tid ${weeklyGuaranteed} min/v \u2713 överstiger mål ${target} min (+${deviation} min)`,
      });
    }
  }

  return { warnings, weeklyGuaranteed, weeklyTeacher, weeklyPh };
}

/** Validate a specific week for a class within the full schedule */
export function validateSchedule(
  schedule: FullSchedule,
  cls: string,
  targets: GradeTargets = DEFAULT_LGR22_TARGETS,
  week?: WeekKey,
  customTypes: CustomPassType[] = [],
): ValidationResult {
  const weekSchedule = schedule[cls];
  if (!weekSchedule) {
    return { warnings: [], weeklyGuaranteed: 0, weeklyTeacher: 0, weeklyPh: 0 };
  }

  const weekKey = week ?? 'A';
  const classSchedule = weekSchedule[weekKey];
  return validateClassSchedule(classSchedule, cls, targets, week ? `Vecka ${week}` : undefined, customTypes);
}

function isTeachingPass(p: SchedulePass): boolean {
  return p.type !== 'rast' && p.type !== 'lunch';
}

export { isTeacherType };
