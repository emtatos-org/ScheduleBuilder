import type { ClassSchedule, FullSchedule, SchedulePass, GradeTargets, WeekKey, CustomPassType, ValidationRules } from './types';
import { DAYS, DEFAULT_LGR22_TARGETS, DEFAULT_RULES } from './constants';
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
  rules: ValidationRules = DEFAULT_RULES,
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

      // Rule 1: Short pass
      if (rules.minPassDuration.enabled && p.type !== 'rast' && p.type !== 'lunch' && p.duration < rules.minPassDuration.value) {
        warnings.push({
          level: 'warn',
          msg: `${prefix}${day.label}: "${p.label}" är bara ${p.duration} min (< ${rules.minPassDuration.value} min)`,
        });
      }

      // Rule 3: Lunch outside window
      if (rules.lunchWindow.enabled && p.type === 'lunch') {
        const lunchStart = p.start;
        const lunchEnd = p.start + p.duration;
        if (lunchStart < rules.lunchWindow.start || lunchEnd > rules.lunchWindow.end) {
          warnings.push({
            level: 'warn',
            msg: `${prefix}${day.label}: Lunch ${minutesToTime(lunchStart)}–${minutesToTime(lunchEnd)} ligger utanför ${minutesToTime(rules.lunchWindow.start)}–${minutesToTime(rules.lunchWindow.end)}`,
          });
        }
      }
    }

    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = sorted[i];
      const next = sorted[i + 1];
      const gap = next.start - (curr.start + curr.duration);
      // Rule 2: Short break
      if (rules.minBreakBetween.enabled && gap > 0 && gap < rules.minBreakBetween.value && isTeachingPass(curr) && isTeachingPass(next)) {
        warnings.push({
          level: 'warn',
          msg: `${prefix}${day.label}: Bara ${gap} min rast mellan "${curr.label}" och "${next.label}"`,
        });
      }
    }

    if (sorted.length > 0) {
      const lastPass = sorted[sorted.length - 1];
      const endTime = lastPass.start + lastPass.duration;
      // Rule 5: Late end time
      if (rules.maxEndTime.enabled && endTime > rules.maxEndTime.value) {
        warnings.push({
          level: 'warn',
          msg: `${prefix}${day.label}: Sluttid ${minutesToTime(endTime)} (efter ${minutesToTime(rules.maxEndTime.value)})`,
        });
      }
    }
  }

  // Rule 4: Teacher hours
  const teacherHours = weeklyTeacher / 60;
  if (rules.maxTeacherHours.enabled && teacherHours > rules.maxTeacherHours.value) {
    warnings.push({
      level: 'error',
      msg: `${prefix}Lärartid ${teacherHours.toFixed(1)} h/v överstiger max ${rules.maxTeacherHours.value} h`,
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
  rules: ValidationRules = DEFAULT_RULES,
  week?: WeekKey,
  customTypes: CustomPassType[] = [],
): ValidationResult {
  const weekSchedule = schedule[cls];
  if (!weekSchedule) {
    return { warnings: [], weeklyGuaranteed: 0, weeklyTeacher: 0, weeklyPh: 0 };
  }

  const weekKey = week ?? 'A';
  const classSchedule = weekSchedule[weekKey];
  return validateClassSchedule(classSchedule, cls, targets, rules, week ? `Vecka ${week}` : undefined, customTypes);
}

function isTeachingPass(p: SchedulePass): boolean {
  return p.type !== 'rast' && p.type !== 'lunch';
}

export { isTeacherType };
