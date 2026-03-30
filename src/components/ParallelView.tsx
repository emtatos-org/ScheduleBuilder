import { useState, useMemo } from 'react';
import { DAYS, CLASSES, START_HOUR, END_HOUR } from '../constants';
import type { FullSchedule, DayKey, SchedulePass } from '../types';
import { minutesToTime, getPassColor } from '../utils';

const HOUR_HEIGHT = 70;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const TOTAL_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;
const START_MIN = START_HOUR * 60;
const TOTAL_MIN = TOTAL_HOURS * 60;

const PARALLEL_TYPES = new Set(['lektion', 'bro', 'ph-tid']);

interface ParallelViewProps {
  schedule: FullSchedule;
  selectedClasses: string[];
  onClickPass?: (cls: string, dayKey: DayKey, pass: SchedulePass) => void;
  onClickSlot?: (cls: string, dayKey: DayKey) => void;
}

interface PassWithParallel extends SchedulePass {
  parallelCount: number;
  parallelClasses: string[];
}

function computeParallelism(
  schedule: FullSchedule,
  dayKey: DayKey,
): Record<string, PassWithParallel[]> {
  // Collect all passes for this day across all classes that count for parallelism
  const allPasses: { cls: string; pass: SchedulePass }[] = [];
  for (const cls of CLASSES) {
    const passes = schedule[cls]?.[dayKey] || [];
    for (const p of passes) {
      if (PARALLEL_TYPES.has(p.type)) {
        allPasses.push({ cls, pass: p });
      }
    }
  }

  const result: Record<string, PassWithParallel[]> = {};
  for (const cls of CLASSES) {
    const passes = schedule[cls]?.[dayKey] || [];
    result[cls] = passes.map((p) => {
      if (!PARALLEL_TYPES.has(p.type)) {
        return { ...p, parallelCount: 0, parallelClasses: [] };
      }
      // Find which classes have a pass starting within +-5 min
      const parallelClasses: string[] = [cls];
      for (const other of allPasses) {
        if (other.cls === cls) continue;
        if (Math.abs(other.pass.start - p.start) <= 5) {
          if (!parallelClasses.includes(other.cls)) {
            parallelClasses.push(other.cls);
          }
        }
      }
      return { ...p, parallelCount: parallelClasses.length, parallelClasses };
    });
  }
  return result;
}

interface ParallelPassBlockProps {
  pass: PassWithParallel;
  cls: string;
  dayKey: DayKey;
  onClickPass?: (cls: string, dayKey: DayKey, pass: SchedulePass) => void;
}

function ParallelPassBlock({ pass, cls, dayKey, onClickPass }: ParallelPassBlockProps) {
  const color = getPassColor(pass.type);
  const top = ((pass.start - START_MIN) / TOTAL_MIN) * TOTAL_HEIGHT;
  const height = (pass.duration / TOTAL_MIN) * TOTAL_HEIGHT;
  const showTime = height >= 32;
  const isCompact = height <= 40;

  const isHighParallel = pass.parallelCount >= 4;
  const isMediumParallel = pass.parallelCount >= 2 && pass.parallelCount < 4;

  const bgColor = isHighParallel ? '#FEE2E2' : `${color}18`;
  const borderColor = isHighParallel ? '#EF4444' : color;

  const tooltipText = pass.parallelCount >= 2
    ? `${pass.label} ${minutesToTime(pass.start)}\u2013${minutesToTime(pass.start + pass.duration)}\n${pass.parallelCount} klasser parallella: ${pass.parallelClasses.join(', ')}`
    : `${pass.label} ${minutesToTime(pass.start)}\u2013${minutesToTime(pass.start + pass.duration)}`;

  const badgeText = pass.parallelCount >= 2
    ? (isCompact ? `${pass.parallelCount}\u2225` : `${pass.parallelCount} parallella`)
    : null;

  return (
    <div
      className="absolute left-1 right-1 rounded-[6px] cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md overflow-hidden"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: bgColor,
        borderLeft: `3px solid ${borderColor}`,
      }}
      title={tooltipText}
      onClick={(e) => { e.stopPropagation(); onClickPass?.(cls, dayKey, pass); }}
    >
      <div className="px-1.5 py-0.5 relative">
        <p
          className="text-[10px] font-bold truncate"
          style={{ color }}
        >
          {pass.label}
        </p>
        {showTime && (
          <p className="text-[9px] text-gray-500">
            {minutesToTime(pass.start)}&ndash;{minutesToTime(pass.start + pass.duration)}
          </p>
        )}
        {/* Parallelism badge */}
        {badgeText && (
          <span
            className="absolute top-0.5 right-0.5 text-[9px] font-bold px-1 py-0.5 rounded-full leading-none"
            style={{
              backgroundColor: isHighParallel ? '#FEE2E2' : isMediumParallel ? '#DBEAFE' : 'transparent',
              color: isHighParallel ? '#DC2626' : '#2563EB',
              border: `1px solid ${isHighParallel ? '#EF4444' : '#2563EB'}`,
            }}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ParallelView({ schedule, selectedClasses, onClickPass, onClickSlot }: ParallelViewProps) {
  const [selectedDay, setSelectedDay] = useState<DayKey>('mon');

  const parallelData = useMemo(
    () => computeParallelism(schedule, selectedDay),
    [schedule, selectedDay],
  );
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">Parallellitetsvy</h2>

      {/* Day selector */}
      <div className="flex gap-2 mb-4">
        {DAYS.map((day) => (
          <button
            key={day.key}
            onClick={() => setSelectedDay(day.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedDay === day.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <div className="flex min-w-[700px]">
          {/* Time axis */}
          <div className="w-[52px] shrink-0 border-r" style={{ borderColor: '#E2E8F0' }}>
            <div className="h-10 border-b" style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }} />
            <div className="relative" style={{ height: `${TOTAL_HEIGHT}px` }}>
              {hours.map((h) => {
                const top = (h - START_HOUR) * HOUR_HEIGHT;
                return (
                  <span
                    key={h}
                    className="absolute right-2 text-[11px] -translate-y-1/2"
                    style={{ top: `${top}px`, color: '#94A3B8' }}
                  >
                    {String(h).padStart(2, '0')}:00
                  </span>
                );
              })}
            </div>
          </div>

          {/* Class columns */}
          {CLASSES.map((cls, idx) => {
            const isSelected = selectedClasses.includes(cls);
            return (
              <div
                key={cls}
                className="flex-1 min-w-[100px]"
                style={{
                  borderRight: idx < CLASSES.length - 1 ? '1px solid #E2E8F0' : 'none',
                  opacity: isSelected ? 1 : 0.5,
                }}
              >
                {/* Header */}
                <div
                  className="h-10 flex items-center justify-center border-b"
                  style={{
                    borderColor: '#E2E8F0',
                    backgroundColor: isSelected ? '#DBEAFE' : '#F1F5F9',
                  }}
                >
                  <span
                    className="text-sm font-semibold"
                    style={{ color: isSelected ? '#1D4ED8' : '#94A3B8' }}
                  >
                    Åk {cls}
                  </span>
                </div>

                {/* Body */}
                <div
                  className="relative cursor-pointer"
                  style={{ height: `${TOTAL_HEIGHT}px` }}
                  onClick={() => onClickSlot?.(cls, selectedDay)}
                >
                  {/* Grid lines */}
                  {hours.map((h) => {
                    const top = (h - START_HOUR) * HOUR_HEIGHT;
                    return (
                      <div
                        key={h}
                        className="absolute left-0 right-0"
                        style={{ top: `${top}px`, borderTop: '1px solid #F1F5F9' }}
                      />
                    );
                  })}

                  {/* Passes */}
                  {parallelData[cls]?.map((pass) => (
                    <ParallelPassBlock
                      key={pass.id}
                      pass={pass}
                      cls={cls}
                      dayKey={selectedDay}
                      onClickPass={onClickPass}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
