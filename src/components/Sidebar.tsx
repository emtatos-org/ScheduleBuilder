import { useState, useRef } from 'react';
import { CLASSES } from '../constants';
import type { FullSchedule } from '../types';

interface SidebarProps {
  selectedClasses: string[];
  onToggleClass: (cls: string) => void;
  activeView: string;
  onChangeView: (view: string) => void;
  schedule: FullSchedule;
  onImportSchedule: (schedule: FullSchedule) => void;
}

const VIEWS = [
  { key: 'schema', label: 'Schema', icon: '\u{1F4CB}' },
  { key: 'statistik', label: 'Statistik', icon: '\u{1F4CA}' },
  { key: 'parallell', label: 'Parallellitet', icon: '\u{1F500}' },
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Sidebar({
  selectedClasses,
  onToggleClass,
  activeView,
  onChangeView,
  schedule,
  onImportSchedule,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleSaveJSON = () => {
    const blob = new Blob([JSON.stringify(schedule, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'schema-v11.json');
  };

  const handleLoadJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (typeof data !== 'object' || data === null) {
          throw new Error('Ogiltigt format');
        }
        onImportSchedule(data as FullSchedule);
        setImportError(null);
      } catch {
        setImportError('Ogiltigt JSON-format. Kontrollera filen.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCSV = () => {
    const headers = ['Klass', 'Dag', 'Typ', 'Start', 'Slut', 'Längd (min)', 'Etikett', 'Garanterad'];
    const dayLabels: Record<string, string> = {
      mon: 'Måndag', tue: 'Tisdag', wed: 'Onsdag', thu: 'Torsdag', fri: 'Fredag',
    };
    const rows: string[][] = [];

    for (const cls of Object.keys(schedule)) {
      const classSchedule = schedule[cls];
      for (const dayKey of Object.keys(classSchedule)) {
        const passes = classSchedule[dayKey as keyof typeof classSchedule];
        for (const p of passes) {
          const startH = Math.floor(p.start / 60);
          const startM = p.start % 60;
          const endMin = p.start + p.duration;
          const endH = Math.floor(endMin / 60);
          const endM = endMin % 60;
          rows.push([
            cls,
            dayLabels[dayKey] || dayKey,
            p.type,
            `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
            `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
            String(p.duration),
            p.label,
            p.guaranteed ? 'Ja' : 'Nej',
          ]);
        }
      }
    }

    const csvContent = [headers, ...rows].map(row =>
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, 'schema-v11.csv');
  };

  return (
    <aside className="w-[220px] lg:w-[220px] md:w-[180px] shrink-0 bg-white border-r border-gray-200 flex flex-col p-4 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-800">
          {'\u{1F4C5}'} Schemabyggare
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {'v11 · Åk 4–9 · Lgr22'}
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Klasser
        </h2>
        <div className="flex flex-wrap gap-2">
          {CLASSES.map((cls) => (
            <button
              key={cls}
              onClick={() => onToggleClass(cls)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedClasses.includes(cls)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Vy
        </h2>
        <div className="flex flex-col gap-1">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => onChangeView(v.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors text-left ${
                activeView === v.key
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{v.icon}</span>
              <span>{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Export / Import */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Export / Import
        </h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSaveJSON}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-left"
          >
            <span>{'\u{1F4BE}'}</span>
            <span>Spara JSON</span>
          </button>
          <button
            onClick={handleLoadJSON}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-left"
          >
            <span>{'\u{1F4C2}'}</span>
            <span>Ladda JSON</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-left"
          >
            <span>{'\u{1F4C4}'}</span>
            <span>Exportera CSV</span>
          </button>
        </div>
        {importError && (
          <p className="text-xs text-red-600 mt-2">{importError}</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </aside>
  );
}
