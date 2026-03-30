import { DAYS, START_HOUR, END_HOUR } from '../constants';
import type { ClassSchedule, DayKey, SchedulePass } from '../types';
import { minutesToTime, getPassColor } from '../utils';

const HOUR_HEIGHT = 70;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const TOTAL_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;
const START_MIN = START_HOUR * 60;
const TOTAL_MIN = TOTAL_HOURS * 60;

interface ScheduleGridProps {
  className: string;
  schedule: ClassSchedule;
  onClickPass: (pass: SchedulePass) => void;
  onClickSlot: (day: DayKey) => void;
}

function PassBlock({
  pass,
  onClick,
}: {
  pass: SchedulePass;
  onClick: () => void;
}) {
  const color = getPassColor(pass.type);
  const top = ((pass.start - START_MIN) / TOTAL_MIN) * TOTAL_HEIGHT;
  const height = (pass.duration / TOTAL_MIN) * TOTAL_HEIGHT;
  const showTime = height >= 32;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute left-1 right-1 rounded cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md overflow-hidden"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: `${color}1A`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className="px-2 py-1">
        <p className="text-xs font-medium text-gray-800 truncate">
          {pass.label}
        </p>
        {showTime && (
          <p className="text-[10px] text-gray-500">
            {minutesToTime(pass.start)}–{minutesToTime(pass.start + pass.duration)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ScheduleGrid({
  className: cls,
  schedule,
  onClickPass,
  onClickSlot,
}: ScheduleGridProps) {
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-3">Åk {cls}</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex">
          {/* Tidsaxel */}
          <div className="w-14 shrink-0 border-r border-gray-100">
            {/* Header spacer */}
            <div className="h-10 border-b border-gray-200" />
            <div className="relative" style={{ height: `${TOTAL_HEIGHT}px` }}>
              {hours.map((h) => {
                const top = (h - START_HOUR) * HOUR_HEIGHT;
                return (
                  <span
                    key={h}
                    className="absolute right-2 text-[11px] text-gray-400 -translate-y-1/2"
                    style={{ top: `${top}px` }}
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
              className={`flex-1 ${idx < DAYS.length - 1 ? 'border-r border-gray-100' : ''}`}
            >
              {/* Dag-header */}
              <div className="h-10 flex items-center justify-center border-b border-gray-200">
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
                      className="absolute left-0 right-0 border-t border-gray-100"
                      style={{ top: `${top}px` }}
                    />
                  );
                })}

                {/* Pass-block */}
                {schedule[day.key]?.map((pass) => (
                  <PassBlock
                    key={pass.id}
                    pass={pass}
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
