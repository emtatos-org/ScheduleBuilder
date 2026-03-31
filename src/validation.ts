import type { FullSchedule, SchedulePass, GradeTargets } from './types';
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

const TEACHER_TYPES = new Set(['lektion', 'basgrupp', 'em-bg', 'bro', 'ph-tid']);

export function validateSchedule(
  schedule: FullSchedule,
  cls: string,
  targets: GradeTargets = DEFAULT_LGR22_TARGETS,
): ValidationResult {
  const classSchedule = schedule[cls];
  if (!classSchedule) {
    return { warnings: [], weeklyGuaranteed: 0, weeklyTeacher: 0, weeklyPh: 0 };
  }

  const warnings: ValidationWarning[] = [];
  let weeklyGuaranteed = 0;
  let weeklyTeacher = 0;
  let weeklyPh = 0;

  for (const day of DAYS) {
    const passes = classSchedule[day.key] || [];
    const sorted = [...passes].sort((a, b) => a.start - b.start);

    for (const p of sorted) {
      // Guaranteed time
      if (p.guaranteed) {
        weeklyGuaranteed += p.duration;
      }

      // Teacher time (lektion + basgrupp + em-bg + bro + ph-tid)
      if (TEACHER_TYPES.has(p.type)) {
        weeklyTeacher += p.duration;
      }

      // ph-tid
      if (p.type === 'ph-tid') {
        weeklyPh += p.duration;
      }

      // Rule 1: Pass shorter than 20 min (excl rast)
      if (p.type !== 'rast' && p.type !== 'lunch' && p.duration < 20) {
        warnings.push({
          level: 'warn',
          msg: `${day.label}: "${p.label}" är bara ${p.duration} min (< 20 min)`,
        });
      }

      // Rule 3: Lunch outside 10:30–13:05
      if (p.type === 'lunch') {
        const lunchStart = p.start;
        const lunchEnd = p.start + p.duration;
        if (lunchStart < 630 || lunchEnd > 785) {
          warnings.push({
            level: 'warn',
            msg: `${day.label}: Lunch ${minutesToTime(lunchStart)}–${minutesToTime(lunchEnd)} ligger utanför 10:30–13:05`,
          });
        }
      }
    }

    // Rule 2: Rest between passes < 5 min
    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = sorted[i];
      const next = sorted[i + 1];
      const gap = next.start - (curr.start + curr.duration);
      // Only check gaps between teaching passes (skip if one is rast/lunch)
      if (gap > 0 && gap < 5 && isTeachingPass(curr) && isTeachingPass(next)) {
        warnings.push({
          level: 'warn',
          msg: `${day.label}: Bara ${gap} min rast mellan "${curr.label}" och "${next.label}"`,
        });
      }
    }

    // Rule 5: End time after 15:00
    if (sorted.length > 0) {
      const lastPass = sorted[sorted.length - 1];
      const endTime = lastPass.start + lastPass.duration;
      if (endTime > 900) {
        warnings.push({
          level: 'warn',
          msg: `${day.label}: Sluttid ${minutesToTime(endTime)} (efter 15:00)`,
        });
      }
    }
  }

  // Rule 4: Teacher time > 27.5 h/week
  const teacherHours = weeklyTeacher / 60;
  if (teacherHours > MAX_TEACHER_HOURS) {
    warnings.push({
      level: 'error',
      msg: `Lärartid ${teacherHours.toFixed(1)} h/v överstiger max ${MAX_TEACHER_HOURS} h`,
    });
  }

  // Rule 6: Guaranteed time vs target – always show
  const grade = getGrade(cls);
  const target = targets[grade];
  if (target) {
    const deviation = weeklyGuaranteed - target;
    if (deviation < 0) {
      warnings.push({
        level: 'warn',
        msg: `Garanterad tid ${weeklyGuaranteed} min/v är under mål ${target} min (${deviation} min)`,
      });
    } else if (deviation === 0) {
      warnings.push({
        level: 'success',
        msg: `Garanterad tid ${weeklyGuaranteed} min/v ✓ uppfyller mål ${target} min`,
      });
    } else {
      warnings.push({
        level: 'success',
        msg: `Garanterad tid ${weeklyGuaranteed} min/v ✓ överstiger mål ${target} min (+${deviation} min)`,
      });
    }
  }

  return { warnings, weeklyGuaranteed, weeklyTeacher, weeklyPh };
}

function isTeachingPass(p: SchedulePass): boolean {
  return p.type !== 'rast' && p.type !== 'lunch';
}
