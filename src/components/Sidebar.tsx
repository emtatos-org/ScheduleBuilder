import { CLASSES } from '../constants';

interface SidebarProps {
  selectedClasses: string[];
  onToggleClass: (cls: string) => void;
  activeView: string;
  onChangeView: (view: string) => void;
}

const VIEWS = [
  { key: 'schema', label: 'Schema', icon: '\u{1F4CB}' },
  { key: 'statistik', label: 'Statistik', icon: '\u{1F4CA}' },
  { key: 'parallell', label: 'Parallellitet', icon: '\u{1F500}' },
];

export default function Sidebar({
  selectedClasses,
  onToggleClass,
  activeView,
  onChangeView,
}: SidebarProps) {
  return (
    <aside className="w-[220px] shrink-0 bg-white border-r border-gray-200 flex flex-col p-4">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-800">
          {'\u{1F4C5}'} Schemabyggare
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          v11 · Åk 4–9 · Lgr22
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

      <div>
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
    </aside>
  );
}
