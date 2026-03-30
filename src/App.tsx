import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ScheduleGrid from './components/ScheduleGrid';
import { CLASSES } from './constants';
import type { DayKey, FullSchedule } from './types';

function App() {
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['7A']);
  const [activeView, setActiveView] = useState<string>('schema');

  // Tom schedule tills vi lägger in v11-data i prompt 2
  const [schedule] = useState<FullSchedule>(() => {
    const s: FullSchedule = {};
    CLASSES.forEach(cls => {
      s[cls] = { mon: [], tue: [], wed: [], thu: [], fri: [] };
    });
    return s;
  });

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
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
        {activeView === 'schema' && selectedClasses.map(cls => (
          <ScheduleGrid
            key={cls}
            className={cls}
            schedule={schedule[cls]}
            onClickPass={(pass) => console.log('edit', pass)}
            onClickSlot={(day: DayKey) => console.log('add', day)}
          />
        ))}
        {activeView === 'statistik' && (
          <p className="text-gray-400">Statistik kommer i steg 3</p>
        )}
        {activeView === 'parallell' && (
          <p className="text-gray-400">Parallellitet kommer i steg 3</p>
        )}
      </main>
    </div>
  );
}

export default App;
