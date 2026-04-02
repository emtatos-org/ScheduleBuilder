import { useState, useRef } from 'react';
import { CLASSES, DEFAULT_LGR22_TARGETS, PASS_TYPES } from '../constants';
import type { FullSchedule, GradeTargets, PassColors, WeekKey, CustomPassType } from '../types';
import { getPassLabel } from '../utils';
import { migrateSchedule } from '../types';
import type { VariantStore } from '../storage';

interface SidebarProps {
  selectedClasses: string[];
  onToggleClass: (cls: string) => void;
  activeView: string;
  onChangeView: (view: string) => void;
  schedule: FullSchedule;
  onImportSchedule: (schedule: FullSchedule) => void;
  undoCount: number;
  onUndo: () => void;
  variantStore: VariantStore;
  onSaveAsNewVariant: () => void;
  onResetV11: () => void;
  onLoadV12: () => void;
  onLoadVariant: (id: string) => void;
  onDeleteVariant: (id: string) => void;
  onRenameVariant: (id: string, name: string) => void;
  targets: GradeTargets;
  onUpdateTarget: (grade: number, value: number) => void;
  onResetTargets: () => void;
  passColors: PassColors;
  onUpdateColor: (passType: string, color: string) => void;
  onResetColors: () => void;
  customTypes: CustomPassType[];
  onAddCustomType: (ct: CustomPassType) => void;
  onDeleteCustomType: (value: string) => void;
  onUpdateCustomTypeColor: (value: string, color: string) => void;
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
  undoCount,
  onUndo,
  variantStore,
  onSaveAsNewVariant,
  onResetV11,
  onLoadV12,
  onLoadVariant,
  onDeleteVariant,
  onRenameVariant,
  targets,
  onUpdateTarget,
  onResetTargets,
  passColors,
  onUpdateColor,
  onResetColors,
  customTypes,
  onAddCustomType,
  onDeleteCustomType,
  onUpdateCustomTypeColor,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showAddCustomType, setShowAddCustomType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('#F59E0B');
  const [newTypeIsTeaching, setNewTypeIsTeaching] = useState(true);
  const [addTypeError, setAddTypeError] = useState<string | null>(null);

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
        const migrated = migrateSchedule(data as Record<string, unknown>);
        onImportSchedule(migrated);
        setImportError(null);
      } catch {
        setImportError('Ogiltigt JSON-format. Kontrollera filen.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCSV = () => {
    const headers = ['Klass', 'Vecka', 'Dag', 'Typ', 'Start', 'Slut', 'L\u00e4ngd (min)', 'Etikett', 'Garanterad'];
    const dayLabels: Record<string, string> = {
      mon: 'M\u00e5ndag', tue: 'Tisdag', wed: 'Onsdag', thu: 'Torsdag', fri: 'Fredag',
    };
    const rows: string[][] = [];

    for (const cls of Object.keys(schedule)) {
      const weekSchedule = schedule[cls];
      for (const weekKey of ['A', 'B'] as WeekKey[]) {
        const classSchedule = weekSchedule[weekKey];
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
              weekKey,
              dayLabels[dayKey] || dayKey,
              getPassLabel(p.type, customTypes),
              `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
              `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
              String(p.duration),
              p.label,
              p.guaranteed ? 'Ja' : 'Nej',
            ]);
          }
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

      {/* ── SCHEMAN section ──────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Scheman
        </h2>

        {/* Active variant name (inline editable) */}
        {(() => {
          const active = variantStore.variants.find(v => v.id === variantStore.activeVariantId);
          if (!active) return null;
          return editingVariantId === active.id ? (
            <input
              autoFocus
              className="w-full text-sm font-medium text-gray-800 bg-white border border-blue-400 rounded px-2 py-1 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => {
                if (editingName.trim()) onRenameVariant(active.id, editingName.trim());
                setEditingVariantId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (editingName.trim()) onRenameVariant(active.id, editingName.trim());
                  setEditingVariantId(null);
                } else if (e.key === 'Escape') {
                  setEditingVariantId(null);
                }
              }}
            />
          ) : (
            <p
              className="text-sm font-medium text-gray-800 cursor-pointer hover:text-blue-600 mb-2 truncate"
              title="Klicka for att byta namn"
              onClick={() => {
                setEditingVariantId(active.id);
                setEditingName(active.name);
              }}
            >
              {active.name}
            </p>
          );
        })()}

        {/* Variant action buttons */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={onSaveAsNewVariant}
            className="flex-1 px-2 py-1.5 rounded text-xs font-medium border border-green-400 text-green-700 hover:bg-green-50 transition-colors"
          >
            Spara som ny
          </button>
          <button
            onClick={onResetV11}
            className="flex-1 px-2 py-1.5 rounded text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Aterstall v11
          </button>
        </div>
        <div className="mb-2">
          <button
            onClick={onLoadV12}
            className="w-full px-2 py-1.5 rounded text-xs font-medium border border-purple-400 text-purple-700 hover:bg-purple-50 transition-colors"
          >
            {String.fromCodePoint(0x1F4CB)} Ladda v12 (rullande lunch)
          </button>
        </div>

        {/* Variant list (if more than 1) */}
        {variantStore.variants.length > 1 && (
          <div className="max-h-[160px] overflow-y-auto space-y-1">
            {variantStore.variants.map(v => {
              const isActive = v.id === variantStore.activeVariantId;
              return (
                <div
                  key={v.id}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                  style={{
                    borderLeft: isActive ? '3px solid #2563EB' : '3px solid transparent',
                    backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                    maxHeight: '36px',
                  }}
                >
                  <span className="flex-1 truncate font-medium text-gray-700" title={v.name}>
                    {v.name}
                  </span>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(v.updatedAt).toLocaleDateString('sv-SE')}
                  </span>
                  {!isActive && (
                    <button
                      onClick={() => onLoadVariant(v.id)}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-medium shrink-0"
                    >
                      Ladda
                    </button>
                  )}
                  {variantStore.variants.length > 1 && !isActive && (
                    <button
                      onClick={() => onDeleteVariant(v.id)}
                      className="text-[10px] text-red-500 hover:text-red-700 shrink-0"
                    >
                      Ta bort
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MÅLTAL section ──────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Måltal
        </h2>
        <div className="space-y-1.5">
          {Object.keys(DEFAULT_LGR22_TARGETS)
            .map(Number)
            .sort((a, b) => a - b)
            .map((grade) => (
              <div key={grade} className="flex items-center gap-1.5">
                <span className="text-xs text-gray-600 w-[32px] shrink-0">Åk {grade}</span>
                <input
                  type="number"
                  value={targets[grade] ?? DEFAULT_LGR22_TARGETS[grade]}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) onUpdateTarget(grade, val);
                  }}
                  className="w-[70px] text-right text-xs border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-400">min/v</span>
              </div>
            ))}
        </div>
        <button
          onClick={onResetTargets}
          className="mt-2 flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors w-full justify-center"
        >
          <span>{String.fromCodePoint(0x1F504)}</span>
          <span>Återställ Lgr22</span>
        </button>
      </div>

      {/* ── FÄRGER section ──────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Färger
        </h2>
        <div className="space-y-0.5">
          {PASS_TYPES.map((pt) => (
            <div key={pt.value} className="flex items-center gap-2 py-1">
              <input
                type="color"
                value={passColors[pt.value]}
                onChange={(e) => onUpdateColor(pt.value, e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border border-gray-200"
                style={{ padding: 0 }}
              />
              <span className="text-xs text-gray-600">{pt.label}</span>
            </div>
          ))}
        </div>

        {/* ── Egna ämnen ── */}
        {customTypes.length > 0 && (
          <>
            <div className="mt-3 mb-1 border-t border-gray-200 pt-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Egna ämnen</span>
            </div>
            <div className="space-y-0.5">
              {customTypes.map((ct) => (
                <div key={ct.value} className="flex items-center gap-2 py-1">
                  <input
                    type="color"
                    value={ct.color}
                    onChange={(e) => onUpdateCustomTypeColor(ct.value, e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border border-gray-200"
                    style={{ padding: 0 }}
                  />
                  <span className="text-xs text-gray-600 flex-1 truncate">{ct.label}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Ta bort ämnestypen '${ct.label}'? Pass som använder den ändras till 'Lektion'.`)) {
                        onDeleteCustomType(ct.value);
                      }
                    }}
                    className="text-red-400 hover:text-red-600 text-xs shrink-0"
                    title="Ta bort"
                  >
                    {String.fromCodePoint(0x1F5D1)}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Add custom type button / form */}
        {showAddCustomType ? (
          <div className="mt-2 p-2 border border-gray-200 rounded-lg bg-gray-50 space-y-2">
            <div>
              <input
                type="text"
                placeholder="Namn, t.ex. Idrott"
                value={newTypeName}
                onChange={(e) => { setNewTypeName(e.target.value); setAddTypeError(null); }}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Färg:</label>
              <input
                type="color"
                value={newTypeColor}
                onChange={(e) => setNewTypeColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border border-gray-200"
                style={{ padding: 0 }}
              />
              <label className="flex items-center gap-1 text-xs text-gray-600 ml-auto cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTypeIsTeaching}
                  onChange={(e) => setNewTypeIsTeaching(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Lärartid
              </label>
            </div>
            {addTypeError && (
              <p className="text-[10px] text-red-600">{addTypeError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const trimmed = newTypeName.trim();
                  if (!trimmed) {
                    setAddTypeError('Namn får inte vara tomt.');
                    return;
                  }
                  const id = trimmed.toLowerCase().replace(/[^a-zåäö0-9]/g, '');
                  if (!id) {
                    setAddTypeError('Ogiltigt namn.');
                    return;
                  }
                  const allValues = [...PASS_TYPES.map(p => p.value), ...customTypes.map(ct => ct.value)];
                  if (allValues.includes(id)) {
                    setAddTypeError('Denna typ finns redan.');
                    return;
                  }
                  onAddCustomType({ value: id, label: trimmed, color: newTypeColor, isTeaching: newTypeIsTeaching });
                  setNewTypeName('');
                  setNewTypeColor('#F59E0B');
                  setNewTypeIsTeaching(true);
                  setAddTypeError(null);
                  setShowAddCustomType(false);
                }}
                className="flex-1 px-2 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Lägg till
              </button>
              <button
                onClick={() => { setShowAddCustomType(false); setAddTypeError(null); setNewTypeName(''); }}
                className="flex-1 px-2 py-1.5 rounded text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Avbryt
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddCustomType(true)}
            className="mt-2 flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium border border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 transition-colors w-full justify-center"
          >
            <span>+</span>
            <span>Lägg till ämne</span>
          </button>
        )}

        <button
          onClick={onResetColors}
          className="mt-2 flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors w-full justify-center"
        >
          <span>{String.fromCodePoint(0x1F504)}</span>
          <span>Återställ färger</span>
        </button>
      </div>

      {/* ── Undo button ──────────────────────────────────────── */}
      <div className="mb-6">
        <button
          onClick={onUndo}
          disabled={undoCount === 0}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left ${
            undoCount > 0
              ? 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-300'
              : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
          }`}
          title="Ctrl+Z / Cmd+Z"
        >
          <span>{'\u21A9'} Angra</span>
          {undoCount > 0 && (
            <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full">
              ({undoCount})
            </span>
          )}
        </button>
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

      {/* Credit footer */}
      <div
        className="mt-auto pt-4 px-4 pb-3 text-center"
        style={{ borderTop: '1px solid #F1F5F9' }}
      >
        <p style={{ fontSize: '10px', color: '#CBD5E1', lineHeight: 1.4 }}>
          Utvecklad av Emmanuel Markatatos
        </p>
        <p style={{ fontSize: '10px', color: '#CBD5E1', lineHeight: 1.4 }}>
          Kunskapsskolan Spånga
        </p>
      </div>
    </aside>
  );
}
