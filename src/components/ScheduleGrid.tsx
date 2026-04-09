import { DAYS, START_HOUR, END_HOUR } from '../constants';
import type { ClassSchedule, DayKey, SchedulePass, PassColors, CustomPassType } from '../types';
import { getPassColor, minutesToTime } from '../utils';

const HOUR_HEIGHT = 70;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const TOTAL_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;
const START_MIN = START_HOUR * 60;
const TOTAL_MIN = TOTAL_HOURS * 60;

interface ScheduleGridProps {
  schedule: ClassSchedule;
  passColors: PassColors;
  customTypes: CustomPassType[];
  onClickPass: (pass: SchedulePass) => void;
  onClickSlot: (day: DayKey) => void;
}

function PassBlock({
  pass,
  onClick,
  color,
}: {
  pass: SchedulePass;
  onClick: () => void;
  color: string;
}) {
  const top = ((pass.start - START_MIN) / TOTAL_MIN) * TOTAL_HEIGHT;
  const height = (pass.duration / TOTAL_MIN) * TOTAL_HEIGHT;
  const showTime = height >= 32;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute left-1 right-1 rounded-[6px] cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md overflow-hidden"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: `${color}30`,
        border: `1px solid ${color}66`,
        borderLeft: `4px solid ${color}`,
        color: '#1E293B',
      }}
    >
      <div className="px-2 py-1">
        <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 11 }} className="block truncate">
          {pass.label}
        </span>
        {showTime && (
          <span style={{ fontSize: 10, color: '#475569', fontWeight: 500 }} className="block">
            {minutesToTime(pass.start)}–{minutesToTime(pass.start + pass.duration)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ScheduleGrid({
  schedule,
  passColors,
  customTypes,
  onClickPass,
  onClickSlot,
}: ScheduleGridProps) {
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="mb-8">
      {/* Heading rendered by parent to allow warnings between heading and grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex">
          {/* Tidsaxel */}
          <div className="w-[52px] shrink-0 border-r" style={{ borderColor: '#E2E8F0' }}>
            {/* Header spacer */}
            <div className="h-10 border-b" style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }} />
            <div className="relative" style={{ height: `${TOTAL_HEIGHT}px` }}>
              {hours.map((h) => {
                const top = (h - START_HOUR) * HOUR_HEIGHT;
                return (
                  <span
                    key={h}
                    className="absolute right-2 text-[11px] -translate-y-1/2"
                    style={{ color: '#94A3B8', top: `${top}px` }}
                  >
                    {String(h).padStart(2, '0')}:00
                  </span>
                );
              })}
            </div>
          </div>

          {/* Dagkolumner */}
          {DAYS.map((day, idx) => (
            <div
              key={day.key}
              className="flex-1"
              style={{ borderRight: idx < DAYS.length - 1 ? '1px solid #E2E8F0' : 'none' }}
            >
              {/* Dag-header */}
              <div className="h-10 flex items-center justify-center border-b" style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}>
                <span className="text-sm font-semibold text-gray-700">
                  {day.label}
                </span>
              </div>

              {/* Dag-body */}
              <div
                className="relative cursor-pointer"
                style={{ height: `${TOTAL_HEIGHT}px` }}
                onClick={() => onClickSlot(day.key)}
              >
                {/* Gridlinjer */}
                {hours.map((h) => {
                  const top = (h - START_HOUR) * HOUR_HEIGHT;
                  return (
                    <div
                      key={h}
                      className="absolute left-0 right-0"
                      style={{ borderTop: '1px solid #F1F5F9', top: `${top}px` }}
                    />
                  );
                })}

                {/* Pass-block */}
                {schedule[day.key]?.map((pass) => (
                  <PassBlock
                    key={pass.id}
                    pass={pass}
                    color={getPassColor(pass.type, passColors, customTypes)}
                    onClick={() => onClickPass(pass)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
