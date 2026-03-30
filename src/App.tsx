import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ScheduleGrid from './components/ScheduleGrid';
import PassModal from './components/PassModal';
import AddPassModal from './components/AddPassModal';
import StatisticsView from './components/StatisticsView';
import ParallelView from './components/ParallelView';
import { createDefaultSchedule } from './data/defaultSchedule';
import { saveSchedule, loadSchedule } from './storage';
import { validateSchedule } from './validation';
import type { DayKey, FullSchedule, SchedulePass } from './types';

interface EditingPass {
  cls: string;
  dayKey: DayKey;
  pass: SchedulePass;
}

interface AddingPass {
  cls: string;
  dayKey: DayKey;
}

function App() {
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['7A']);
  const [activeView, setActiveView] = useState<string>('schema');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [schedule, setSchedule] = useState<FullSchedule>(
    () => loadSchedule() || createDefaultSchedule(),
  );

  const [editingPass, setEditingPass] = useState<EditingPass | null>(null);
  const [addingPass, setAddingPass] = useState<AddingPass | null>(null);

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls],
    );
  };

  /* ── Schedule mutation helpers ──────────────────────────────── */

  const updateAndSave = (next: FullSchedule) => {
    setSchedule(next);
    saveSchedule(next);
  };

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
        />
      </div>

      <main className="flex-1 overflow-auto p-4 md:p-6 pt-14 md:pt-6">
        {activeView === 'schema' &&
          selectedClasses.map(cls => {
            const result = validateSchedule(schedule, cls);
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
          />
        )}
        {activeView === 'parallell' && (
          <ParallelView
            schedule={schedule}
            selectedClasses={selectedClasses}
            onClickPass={(cls, dayKey, pass) => {
              setEditingPass({ cls, dayKey, pass });
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
