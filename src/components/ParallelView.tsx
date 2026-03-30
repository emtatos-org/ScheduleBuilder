import { useState } from 'react';
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
}

interface PassWithParallel extends SchedulePass {
  parallelCount: number;
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
        return { ...p, parallelCount: 0 };
      }
      // Count how many other classes have a pass starting within +-5 min
      let count = 0;
      for (const other of allPasses) {
        if (other.cls === cls && other.pass.id === p.id) continue;
        if (Math.abs(other.pass.start - p.start) <= 5) {
          count++;
        }
      }
      // +1 to include self
      return { ...p, parallelCount: count + 1 };
    });
  }
  return result;
}

function ParallelPassBlock({ pass }: { pass: PassWithParallel }) {
  const color = getPassColor(pass.type);
  const top = ((pass.start - START_MIN) / TOTAL_MIN) * TOTAL_HEIGHT;
  const height = (pass.duration / TOTAL_MIN) * TOTAL_HEIGHT;
  const showTime = height >= 32;

  const isHighParallel = pass.parallelCount >= 4;
  const isMediumParallel = pass.parallelCount >= 2 && pass.parallelCount < 4;

  const bgColor = isHighParallel ? '#FEE2E2' : `${color}18`;
  const borderColor = isHighParallel ? '#EF4444' : color;

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="absolute left-1 right-1 rounded-[6px] cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md overflow-hidden"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: bgColor,
        borderLeft: `3px solid ${borderColor}`,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
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
            {minutesToTime(pass.start)}–{minutesToTime(pass.start + pass.duration)}
          </p>
        )}
        {/* Parallelism badge */}
        {pass.parallelCount >= 2 && (
          <span
            className="absolute top-0.5 right-0.5 text-[9px] font-bold px-1 py-0.5 rounded-full leading-none"
            style={{
              backgroundColor: isHighParallel ? '#FEE2E2' : isMediumParallel ? '#DBEAFE' : 'transparent',
              color: isHighParallel ? '#DC2626' : '#2563EB',
              border: `1px solid ${isHighParallel ? '#EF4444' : '#2563EB'}`,
            }}
          >
            {pass.parallelCount}st
          </span>
        )}
      </div>
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 left-full ml-2 top-0 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg pointer-events-none">
          <p className="font-bold">{pass.label}</p>
          <p>{minutesToTime(pass.start)}–{minutesToTime(pass.start + pass.duration)}</p>
          <p>{pass.parallelCount} klass{pass.parallelCount !== 1 ? 'er' : ''} parallellt</p>
        </div>
      )}
    </div>
  );
}

export default function ParallelView({ schedule }: ParallelViewProps) {
  const [selectedDay, setSelectedDay] = useState<DayKey>('mon');

  const parallelData = computeParallelism(schedule, selectedDay);
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
          {CLASSES.map((cls, idx) => (
            <div
              key={cls}
              className="flex-1 min-w-[100px]"
              style={{ borderRight: idx < CLASSES.length - 1 ? '1px solid #E2E8F0' : 'none' }}
            >
              {/* Header */}
              <div
                className="h-10 flex items-center justify-center border-b"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
              >
                <span className="text-sm font-semibold text-gray-700">Åk {cls}</span>
              </div>

              {/* Body */}
              <div className="relative" style={{ height: `${TOTAL_HEIGHT}px` }}>
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
                  <ParallelPassBlock key={pass.id} pass={pass} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
