import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_LGR22_TARGETS } from './constants';
import Sidebar from './components/Sidebar';
import ScheduleGrid from './components/ScheduleGrid';
import PassModal from './components/PassModal';
import AddPassModal from './components/AddPassModal';
import StatisticsView from './components/StatisticsView';
import ParallelView from './components/ParallelView';
import { createDefaultSchedule } from './data/defaultSchedule';
import { saveSchedule, loadSchedule, saveVariants, loadVariants } from './storage';
import type { ScheduleVariant, VariantStore } from './storage';
import { validateSchedule } from './validation';
import { useScheduleHistory } from './hooks/useScheduleHistory';
import type { DayKey, FullSchedule, SchedulePass, GradeTargets } from './types';

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

  const schedule = loadSchedule() || createDefaultSchedule();
  const now = new Date().toISOString();
  const variant: ScheduleVariant = {
    id: crypto.randomUUID(),
    name: 'v11 original',
    schedule,
    createdAt: now,
    updatedAt: now,
  };
  const store: VariantStore = {
    activeVariantId: variant.id,
    variants: [variant],
  };
  saveVariants(store);
  saveSchedule(schedule);
  return store;
}

function App() {
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['7A']);
  const [activeView, setActiveView] = useState<string>('schema');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [variantStore, setVariantStore] = useState<VariantStore>(initVariantStore);

  const activeVariant = variantStore.variants.find(v => v.id === variantStore.activeVariantId)!;

  const [schedule, setSchedule] = useState<FullSchedule>(
    () => activeVariant.schedule,
  );

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

  const { pushState, undo, undoCount, clearHistory } = useScheduleHistory();

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls],
    );
  };

  /* ── Schedule mutation helpers ──────────────────────────────── */

  const updateAndSave = useCallback((next: FullSchedule, skipHistory = false) => {
    if (!skipHistory) {
      setSchedule(prev => {
        pushState(prev);
        return next;
      });
    } else {
      setSchedule(next);
    }
    saveSchedule(next);

    // Auto-save to active variant
    setVariantStore(prev => {
      const updated: VariantStore = {
        ...prev,
        variants: prev.variants.map(v =>
          v.id === prev.activeVariantId
            ? { ...v, schedule: next, updatedAt: new Date().toISOString() }
            : v,
        ),
      };
      saveVariants(updated);
      return updated;
    });
  }, [pushState]);

  const handleImportSchedule = (imported: FullSchedule) => {
    updateAndSave(imported);
  };

  const handleSavePass = (updated: SchedulePass) => {
    if (!editingPass) return;
    const { cls, dayKey } = editingPass;
    const next: FullSchedule = {
      ...schedule,
      [cls]: {
        ...schedule[cls],
        [dayKey]: schedule[cls][dayKey].map(p =>
          p.id === updated.id ? updated : p,
        ),
      },
    };
    updateAndSave(next);
    setEditingPass(null);
  };

  const handleDeletePass = (id: string) => {
    if (!editingPass) return;
    const { cls, dayKey } = editingPass;
    const next: FullSchedule = {
      ...schedule,
      [cls]: {
        ...schedule[cls],
        [dayKey]: schedule[cls][dayKey].filter(p => p.id !== id),
      },
    };
    updateAndSave(next);
    setEditingPass(null);
  };

  const handleAddPass = (dayKey: DayKey, passData: Omit<SchedulePass, 'id'>) => {
    if (!addingPass) return;
    const { cls } = addingPass;
    const newPass: SchedulePass = {
      ...passData,
      id: crypto.randomUUID(),
    };
    const next: FullSchedule = {
      ...schedule,
      [cls]: {
        ...schedule[cls],
        [dayKey]: [...schedule[cls][dayKey], newPass],
      },
    };
    updateAndSave(next);
    setAddingPass(null);
  };

  /* ── Undo handler ──────────────────────────────────────────── */

  const handleUndo = useCallback(() => {
    const prev = undo();
    if (prev) {
      updateAndSave(prev, true);
    }
  }, [undo, updateAndSave]);

  // Listen for Ctrl+Z custom event from useScheduleHistory
  useEffect(() => {
    const handler = () => handleUndo();
    window.addEventListener('schedule-undo', handler);
    return () => window.removeEventListener('schedule-undo', handler);
  }, [handleUndo]);

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
      schedule: structuredClone(schedule),
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
    setSchedule(defaultSched);
    saveSchedule(defaultSched);
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
    setSchedule(variant.schedule);
    saveSchedule(variant.schedule);
    clearHistory();
  };

  const handleDeleteVariant = (variantId: string) => {
    if (variantStore.variants.length <= 1) return;
    if (!confirm('Vill du ta bort denna variant?')) return;

    const remaining = variantStore.variants.filter(v => v.id !== variantId);
    let activeId = variantStore.activeVariantId;

    if (activeId === variantId) {
      activeId = remaining[0].id;
      setSchedule(remaining[0].schedule);
      saveSchedule(remaining[0].schedule);
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

  const findDayForPass = (cls: string, passId: string): DayKey | null => {
    const cs = schedule[cls];
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
          onUndo={handleUndo}
          variantStore={variantStore}
          onSaveAsNewVariant={handleSaveAsNewVariant}
          onResetV11={handleResetV11}
          onLoadVariant={handleLoadVariant}
          onDeleteVariant={handleDeleteVariant}
          onRenameVariant={handleRenameVariant}
          targets={targets}
          onUpdateTarget={handleUpdateTarget}
          onResetTargets={handleResetTargets}
        />
      </div>

      <main className="flex-1 overflow-auto p-4 md:p-6 pt-14 md:pt-6">
        {activeView === 'schema' &&
          selectedClasses.map(cls => {
            const result = validateSchedule(schedule, cls, targets);
            return (
              <div key={cls}>
                {/* Validation warnings */}
                {result.warnings.length > 0 && (
                  <div className="mb-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3">
                    {result.warnings.map((w, i) => (
                      <p
                        key={i}
                        className={`text-xs ${
                          w.level === 'error'
                            ? 'text-red-700 font-semibold'
                            : w.level === 'warn'
                              ? 'text-yellow-800'
                              : 'text-blue-700'
                        }`}
                      >
                        {w.level === 'error' ? '\u26D4' : w.level === 'warn' ? '\u26A0\uFE0F' : '\u2139\uFE0F'}{' '}
                        {w.msg}
                      </p>
                    ))}
                  </div>
                )}
                <ScheduleGrid
                  className={cls}
                  schedule={schedule[cls]}
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
        {activeView === 'statistik' && (
          <StatisticsView
            schedule={schedule}
            selectedClasses={selectedClasses}
            targets={targets}
          />
        )}
        {activeView === 'parallell' && (
          <ParallelView
            schedule={schedule}
            selectedClasses={selectedClasses}
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
        />
      )}

      {/* Add modal */}
      {addingPass && (
        <AddPassModal
          dayKey={addingPass.dayKey}
          onAdd={handleAddPass}
          onClose={() => setAddingPass(null)}
        />
      )}
    </div>
  );
}

export default App;
