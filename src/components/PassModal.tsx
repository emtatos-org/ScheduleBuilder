import { useState } from 'react';
import { PASS_TYPES } from '../constants';
import { generateTimeOptions, minutesToTime } from '../utils';
import type { SchedulePass, CustomPassType } from '../types';

interface PassModalProps {
  pass: SchedulePass;
  onSave: (updated: SchedulePass) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  customTypes: CustomPassType[];
}

const DURATION_PRESETS = [20, 30, 45, 60, 90];
export default function PassModal({ pass, onSave, onDelete, onClose, customTypes }: PassModalProps) {
  const allDefaultLabels = new Set([...PASS_TYPES.map(pt => pt.label), ...customTypes.map(ct => ct.label)]);
  const [type, setType] = useState<string>(pass.type);
  const [start, setStart] = useState(pass.start);
  const [duration, setDuration] = useState(pass.duration);
  const [customDuration, setCustomDuration] = useState('');
  const [label, setLabel] = useState(pass.label);
  const [guaranteed, setGuaranteed] = useState(pass.guaranteed);

  const timeOptions = generateTimeOptions();

  const handleTypeChange = (newType: string) => {
    const builtinMatch = PASS_TYPES.find(p => p.value === newType);
    const customMatch = customTypes.find(ct => ct.value === newType);
    const newDefault = builtinMatch?.label || customMatch?.label || '';

    // Om nuvarande etikett är ett default-namn (för VILKEN typ som helst) eller tom → byt
    if (label === '' || allDefaultLabels.has(label)) {
      setLabel(newDefault);
    }
    // Annars (användaren har skrivit t.ex. "Matematik") → behåll

    setType(newType);
  };

  const handleSave = () => {
    onSave({
      ...pass,
      type,
      start,
      duration,
      label,
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
        <h3 className="text-lg font-bold text-gray-800 mb-4">Redigera pass</h3>

        {/* Typ */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Typ</label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <optgroup label="Standard">
              {PASS_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>{pt.label}</option>
              ))}
            </optgroup>
            {customTypes.length > 0 && (
              <optgroup label="Egna ämnen">
                {customTypes.map((ct) => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Starttid */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Starttid</label>
          <select
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    ? 'bg-blue-600 text-white'
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Garanterad */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={guaranteed}
              onChange={(e) => setGuaranteed(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
            onClick={() => onDelete(pass.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Ta bort
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Spara
          </button>
        </div>
      </div>
    </div>
  );
}
