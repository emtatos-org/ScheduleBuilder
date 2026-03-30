import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ScheduleGrid from './components/ScheduleGrid';
import PassModal from './components/PassModal';
import AddPassModal from './components/AddPassModal';
import StatisticsView from './components/StatisticsView';
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
      <Sidebar
        selectedClasses={selectedClasses}
        onToggleClass={toggleClass}
        activeView={activeView}
        onChangeView={setActiveView}
      />
      <main className="flex-1 overflow-auto p-6">
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
          <p className="text-gray-400">Parallellitet kommer i steg 3</p>
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
