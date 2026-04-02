import { useState, useEffect, useRef } from 'react';
import { DEFAULT_LGR22_TARGETS, DEFAULT_PASS_COLORS } from './constants';
import Sidebar from './components/Sidebar';
import ScheduleGrid from './components/ScheduleGrid';
import PassModal from './components/PassModal';
import AddPassModal from './components/AddPassModal';
import StatisticsView from './components/StatisticsView';
import ParallelView from './components/ParallelView';
import { createDefaultSchedule } from './data/defaultSchedule';
import { createV12Schedule } from './data/v12Schedule';
import { loadSchedule, saveVariants, loadVariants } from './storage';
import type { ScheduleVariant, VariantStore } from './storage';
import { validateSchedule } from './validation';
import { useScheduleHistory } from './hooks/useScheduleHistory';
import type { DayKey, FullSchedule, SchedulePass, GradeTargets, PassColors, WeekKey, CustomPassType } from './types';

interface EditingPass {
  cls: string;
  dayKey: DayKey;
  pass: SchedulePass;
}

interface AddingPass {
  cls: string;
  dayKey: DayKey;
}

function initVariantStore(): VariantStore {
  const existing = loadVariants();
  if (existing && existing.variants.length > 0) return existing;

  const sched = loadSchedule() || createDefaultSchedule();
  const now = new Date().toISOString();
  const variant: ScheduleVariant = {
    id: crypto.randomUUID(),
    name: 'v11 original',
    schedule: sched,
    createdAt: now,
    updatedAt: now,
  };
  const store: VariantStore = {
    activeVariantId: variant.id,
    variants: [variant],
  };
  saveVariants(store);
  return store;
}

function getInitialSchedule(variantStore: VariantStore): FullSchedule {
  const active = variantStore.variants.find(v => v.id === variantStore.activeVariantId);
  return active ? active.schedule : createDefaultSchedule();
}

function App() {
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['7A']);
  const [activeView, setActiveView] = useState<string>('schema');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeWeek, setActiveWeek] = useState<WeekKey>('A');

  const [variantStore, setVariantStore] = useState<VariantStore>(initVariantStore);

  const { schedule, updateSchedule, setScheduleDirect, undo, undoCount, clearHistory } =
    useScheduleHistory(getInitialSchedule(variantStore));

  const [editingPass, setEditingPass] = useState<EditingPass | null>(null);
  const [addingPass, setAddingPass] = useState<AddingPass | null>(null);

  const [targets, setTargets] = useState<GradeTargets>(() => {
    const saved = localStorage.getItem('schedulebuilder-targets');
    if (saved) try { return JSON.parse(saved); } catch { /* ignore */ }
    return { ...DEFAULT_LGR22_TARGETS };
  });

  useEffect(() => {
    localStorage.setItem('schedulebuilder-targets', JSON.stringify(targets));
  }, [targets]);

  const handleUpdateTarget = (grade: number, value: number) => {
    setTargets(prev => ({ ...prev, [grade]: value }));
  };

  const handleResetTargets = () => {
    setTargets({ ...DEFAULT_LGR22_TARGETS });
  };

  const [passColors, setPassColors] = useState<PassColors>(() => {
    const saved = localStorage.getItem('schedulebuilder-colors');
    if (saved) try { return JSON.parse(saved); } catch { /* ignore */ }
    return { ...DEFAULT_PASS_COLORS };
  });

  useEffect(() => {
    localStorage.setItem('schedulebuilder-colors', JSON.stringify(passColors));
  }, [passColors]);

  const handleUpdateColor = (passType: string, color: string) => {
    setPassColors(prev => ({ ...prev, [passType]: color }));
  };

  const handleResetColors = () => {
    setPassColors({ ...DEFAULT_PASS_COLORS });
  };

  /* ── Custom pass types ─────────────────────────────────────── */

  const [customTypes, setCustomTypes] = useState<CustomPassType[]>(() => {
    const saved = localStorage.getItem('schedulebuilder-custom-types');
    if (saved) try { return JSON.parse(saved); } catch { /* ignore */ }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('schedulebuilder-custom-types', JSON.stringify(customTypes));
  }, [customTypes]);

  const handleAddCustomType = (ct: CustomPassType) => {
    setCustomTypes(prev => [...prev, ct]);
  };

  const handleDeleteCustomType = (value: string) => {
    // Convert all passes using this type back to 'lektion'
    const next: FullSchedule = JSON.parse(JSON.stringify(schedule));
    for (const cls of Object.keys(next)) {
      for (const wk of ['A', 'B'] as const) {
        for (const dk of Object.keys(next[cls][wk]) as DayKey[]) {
          next[cls][wk][dk] = next[cls][wk][dk].map(p =>
            p.type === value ? { ...p, type: 'lektion' } : p
          );
        }
      }
    }
    updateSchedule(next);
    setCustomTypes(prev => prev.filter(ct => ct.value !== value));
    // Remove color entry if stored
    setPassColors(prev => {
      const copy = { ...prev };
      delete copy[value];
      return copy;
    });
  };

  const handleUpdateCustomTypeColor = (value: string, color: string) => {
    setCustomTypes(prev => prev.map(ct =>
      ct.value === value ? { ...ct, color } : ct
    ));
  };

  // Auto-save schedule changes to the active variant
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setVariantStore(prev => {
      const updated: VariantStore = {
        ...prev,
        variants: prev.variants.map(v =>
          v.id === prev.activeVariantId
            ? { ...v, schedule, updatedAt: new Date().toISOString() }
            : v,
        ),
      };
      saveVariants(updated);
      return updated;
    });
  }, [schedule]);

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls],
    );
  };

  const handleImportSchedule = (imported: FullSchedule) => {
    updateSchedule(imported);
  };

  const handleSavePass = (updated: SchedulePass) => {
    if (!editingPass) return;
    const { cls, dayKey } = editingPass;
    const weekData = schedule[cls][activeWeek];
    const next: FullSchedule = {
      ...schedule,
      [cls]: {
        ...schedule[cls],
        [activeWeek]: {
          ...weekData,
          [dayKey]: weekData[dayKey].map(p =>
            p.id === updated.id ? updated : p,
          ),
        },
      },
    };
    updateSchedule(next);
    setEditingPass(null);
  };

  const handleDeletePass = (id: string) => {
    if (!editingPass) return;
    const { cls, dayKey } = editingPass;
    const weekData = schedule[cls][activeWeek];
    const next: FullSchedule = {
      ...schedule,
      [cls]: {
        ...schedule[cls],
        [activeWeek]: {
          ...weekData,
          [dayKey]: weekData[dayKey].filter(p => p.id !== id),
        },
      },
    };
    updateSchedule(next);
    setEditingPass(null);
  };

  const handleAddPass = (dayKey: DayKey, passData: Omit<SchedulePass, 'id'>) => {
    if (!addingPass) return;
    const { cls } = addingPass;
    const newPass: SchedulePass = {
      ...passData,
      id: crypto.randomUUID(),
    };
    const weekData = schedule[cls][activeWeek];
    const next: FullSchedule = {
      ...schedule,
      [cls]: {
        ...schedule[cls],
        [activeWeek]: {
          ...weekData,
          [dayKey]: [...weekData[dayKey], newPass],
        },
      },
    };
    updateSchedule(next);
    setAddingPass(null);
  };

  /* ── Variant handlers ──────────────────────────────────────── */

  const handleSaveAsNewVariant = () => {
    if (variantStore.variants.length >= 10) {
      alert('Max 10 varianter. Ta bort en variant innan du sparar en ny.');
      return;
    }
    const name = window.prompt('Namn på ny variant:', '');
    if (!name) return;

    const now = new Date().toISOString();
    const newVariant: ScheduleVariant = {
      id: crypto.randomUUID(),
      name,
      schedule: JSON.parse(JSON.stringify(schedule)),
      createdAt: now,
      updatedAt: now,
    };
    const updated: VariantStore = {
      activeVariantId: newVariant.id,
      variants: [...variantStore.variants, newVariant],
    };
    setVariantStore(updated);
    saveVariants(updated);
    clearHistory();
  };

  const handleResetV11 = () => {
    if (!confirm('Vill du verkligen aterstalla till v11 default-schemat?')) return;

    const defaultSched = createDefaultSchedule();
    const now = new Date().toISOString();
    const newVariant: ScheduleVariant = {
      id: crypto.randomUUID(),
      name: 'v11 original (aterstallд)',
      schedule: defaultSched,
      createdAt: now,
      updatedAt: now,
    };

    let variants = [...variantStore.variants, newVariant];
    if (variants.length > 10) {
      variants = variants.slice(variants.length - 10);
    }

    const updated: VariantStore = {
      activeVariantId: newVariant.id,
      variants,
    };
    setVariantStore(updated);
    saveVariants(updated);
    setScheduleDirect(defaultSched);
    clearHistory();
  };

  const handleLoadV12 = () => {
    if (!confirm('Ladda v12-schema med rullande lunch? Nuvarande schema ers\u00e4tts.')) return;

    const v12Sched = createV12Schedule();
    const now = new Date().toISOString();
    const newVariant: ScheduleVariant = {
      id: crypto.randomUUID(),
      name: 'v12 rullande lunch',
      schedule: v12Sched,
      createdAt: now,
      updatedAt: now,
    };

    let variants = [...variantStore.variants, newVariant];
    if (variants.length > 10) {
      variants = variants.slice(variants.length - 10);
    }

    const updated: VariantStore = {
      activeVariantId: newVariant.id,
      variants,
    };
    setVariantStore(updated);
    saveVariants(updated);
    setScheduleDirect(v12Sched);
    clearHistory();
  };

  const handleLoadVariant = (variantId: string) => {
    if (variantId === variantStore.activeVariantId) return;
    if (!confirm('Vill du byta till denna variant? Undo-historiken rensas.')) return;

    const variant = variantStore.variants.find(v => v.id === variantId);
    if (!variant) return;

    const updated: VariantStore = {
      ...variantStore,
      activeVariantId: variantId,
    };
    setVariantStore(updated);
    saveVariants(updated);
    setScheduleDirect(variant.schedule);
    clearHistory();
  };

  const handleDeleteVariant = (variantId: string) => {
    if (variantStore.variants.length <= 1) return;
    if (!confirm('Vill du ta bort denna variant?')) return;

    const remaining = variantStore.variants.filter(v => v.id !== variantId);
    let activeId = variantStore.activeVariantId;

    if (activeId === variantId) {
      activeId = remaining[0].id;
      setScheduleDirect(remaining[0].schedule);
      clearHistory();
    }

    const updated: VariantStore = {
      activeVariantId: activeId,
      variants: remaining,
    };
    setVariantStore(updated);
    saveVariants(updated);
  };

  const handleRenameVariant = (variantId: string, newName: string) => {
    const updated: VariantStore = {
      ...variantStore,
      variants: variantStore.variants.map(v =>
        v.id === variantId ? { ...v, name: newName, updatedAt: new Date().toISOString() } : v,
      ),
    };
    setVariantStore(updated);
    saveVariants(updated);
  };

  /* ── Find which day a pass belongs to ──────────────────────── */

  const handleCopyWeek = () => {
    const from = activeWeek;
    const to = activeWeek === 'A' ? 'B' : 'A';
    if (!confirm(`Kopiera hela Vecka ${from} till Vecka ${to}? Befintligt innehåll i Vecka ${to} ersätts.`)) return;
    const next: FullSchedule = { ...schedule };
    for (const cls of Object.keys(next)) {
      next[cls] = {
        ...next[cls],
        [to]: JSON.parse(JSON.stringify(next[cls][from])),
      };
    }
    updateSchedule(next);
  };

  const findDayForPass = (cls: string, passId: string): DayKey | null => {
    const cs = schedule[cls]?.[activeWeek];
    if (!cs) return null;
    for (const dk of Object.keys(cs) as DayKey[]) {
      if (cs[dk].some(p => p.id === passId)) return dk;
    }
    return null;
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-800">
      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-50 md:hidden bg-white border border-gray-200 rounded-lg p-2 shadow-sm"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/25 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-200
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          selectedClasses={selectedClasses}
          onToggleClass={toggleClass}
          activeView={activeView}
          onChangeView={(view) => {
            setActiveView(view);
            setSidebarOpen(false);
          }}
          schedule={schedule}
          onImportSchedule={handleImportSchedule}
          undoCount={undoCount}
          onUndo={undo}
          variantStore={variantStore}
          onSaveAsNewVariant={handleSaveAsNewVariant}
          onResetV11={handleResetV11}
          onLoadV12={handleLoadV12}
          onLoadVariant={handleLoadVariant}
          onDeleteVariant={handleDeleteVariant}
          onRenameVariant={handleRenameVariant}
          targets={targets}
          onUpdateTarget={handleUpdateTarget}
          onResetTargets={handleResetTargets}
          passColors={passColors}
          onUpdateColor={handleUpdateColor}
          onResetColors={handleResetColors}
          customTypes={customTypes}
          onAddCustomType={handleAddCustomType}
          onDeleteCustomType={handleDeleteCustomType}
          onUpdateCustomTypeColor={handleUpdateCustomTypeColor}
        />
      </div>

      <main className="flex-1 overflow-auto p-4 md:p-6 pt-14 md:pt-6">
        {activeView === 'schema' && (
          <>
            {/* Week toggle + copy button */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1">
                {(['A', 'B'] as WeekKey[]).map((wk) => (
                  <button
                    key={wk}
                    onClick={() => setActiveWeek(wk)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeWeek === wk
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Vecka {wk}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopyWeek}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                title={`Kopiera Vecka ${activeWeek} till Vecka ${activeWeek === 'A' ? 'B' : 'A'}`}
              >
                {'\u{1F4CB}'} Kopiera {activeWeek} {'\u2192'} {activeWeek === 'A' ? 'B' : 'A'}
              </button>
            </div>

            {selectedClasses.map(cls => {
              const result = validateSchedule(schedule, cls, targets, activeWeek, customTypes);
              return (
                <div key={cls}>
                  <h2 className="text-lg font-bold text-gray-800 mb-3">Åk {cls}</h2>
                  {/* Validation warnings */}
                  {result.warnings.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {result.warnings.map((w, i) => (
                        <div
                          key={i}
                          className={`rounded-lg border p-3 text-xs ${
                            w.level === 'error'
                              ? 'border-red-300 bg-red-50 text-red-600 font-semibold'
                              : w.level === 'warn'
                                ? 'border-yellow-300 bg-yellow-50 text-yellow-800'
                                : w.level === 'success'
                                  ? 'border-green-300 bg-green-50 text-green-600'
                                  : 'border-blue-300 bg-blue-50 text-blue-700'
                          }`}
                        >
                          {w.level === 'error'
                            ? '\u26D4'
                            : w.level === 'warn'
                              ? '\u26A0\uFE0F'
                              : w.level === 'success'
                                ? '\u2705'
                                : '\u2139\uFE0F'}{' '}
                          {w.msg}
                        </div>
                      ))}
                    </div>
                  )}
                  <ScheduleGrid
                    schedule={schedule[cls][activeWeek]}
                    passColors={passColors}
                    customTypes={customTypes}
                    onClickPass={(pass) => {
                      const dk = findDayForPass(cls, pass.id);
                      if (dk) setEditingPass({ cls, dayKey: dk, pass });
                    }}
                    onClickSlot={(day: DayKey) =>
                      setAddingPass({ cls, dayKey: day })
                    }
                  />
                </div>
              );
            })}
          </>
        )}
        {activeView === 'statistik' && (
          <StatisticsView
            schedule={schedule}
            selectedClasses={selectedClasses}
            targets={targets}
            customTypes={customTypes}
          />
        )}
        {activeView === 'parallell' && (
          <ParallelView
            schedule={schedule}
            selectedClasses={selectedClasses}
            passColors={passColors}
            customTypes={customTypes}
            onClickPass={(cls, dayKey, pass) => {
              setEditingPass({ cls, dayKey, pass });
            }}
            onClickSlot={(cls, dayKey) => {
              setAddingPass({ cls, dayKey });
            }}
          />
        )}
      </main>

      {/* Edit modal */}
      {editingPass && (
        <PassModal
          pass={editingPass.pass}
          onSave={handleSavePass}
          onDelete={handleDeletePass}
          onClose={() => setEditingPass(null)}
          customTypes={customTypes}
        />
      )}

      {/* Add modal */}
      {addingPass && (
        <AddPassModal
          dayKey={addingPass.dayKey}
          onAdd={handleAddPass}
          onClose={() => setAddingPass(null)}
          customTypes={customTypes}
        />
      )}
    </div>
  );
}

export default App;
