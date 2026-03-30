import { useState } from 'react';
import { PASS_TYPES } from '../constants';
import { generateTimeOptions, minutesToTime, timeToMinutes } from '../utils';
import type { SchedulePass, PassType, DayKey } from '../types';

interface AddPassModalProps {
  dayKey: DayKey;
  onAdd: (dayKey: DayKey, pass: Omit<SchedulePass, 'id'>) => void;
  onClose: () => void;
}

const DURATION_PRESETS = [20, 30, 45, 60, 90];

export default function AddPassModal({ dayKey, onAdd, onClose }: AddPassModalProps) {
  const [type, setType] = useState<PassType>('lektion');
  const [start, setStart] = useState(timeToMinutes(9, 0));
  const [duration, setDuration] = useState(60);
  const [customDuration, setCustomDuration] = useState('');
  const [label, setLabel] = useState('');
  const [guaranteed, setGuaranteed] = useState(true);

  const timeOptions = generateTimeOptions();

  const handleAdd = () => {
    onAdd(dayKey, {
      type,
      start,
      duration,
      label: label || PASS_TYPES.find(p => p.value === type)?.label || type,
      guaranteed,
    });
  };

  const handleDurationPreset = (d: number) => {
    setDuration(d);
    setCustomDuration('');
  };

  const handleCustomDuration = (val: string) => {
    setCustomDuration(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) {
      setDuration(n);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }} onClick={onClose} />
      <div className="relative bg-white p-6 w-full max-w-md mx-4" style={{ borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Lägg till pass</h3>

        {/* Typ */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Typ</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PassType)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {PASS_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value}>{pt.label}</option>
            ))}
          </select>
        </div>

        {/* Starttid */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Starttid</label>
          <select
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {timeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Längd */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Längd ({duration} min → {minutesToTime(start)}–{minutesToTime(start + duration)})
          </label>
          <div className="flex gap-2 flex-wrap mb-2">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleDurationPreset(d)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  duration === d && customDuration === ''
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            placeholder="Egen längd (min)"
            value={customDuration}
            onChange={(e) => handleCustomDuration(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Etikett */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Etikett</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="t.ex. Matematik"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Garanterad */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={guaranteed}
              onChange={(e) => setGuaranteed(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            Garanterad undervisningstid
          </label>
        </div>

        {/* Knappar */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Lägg till
          </button>
        </div>
      </div>
    </div>
  );
}
