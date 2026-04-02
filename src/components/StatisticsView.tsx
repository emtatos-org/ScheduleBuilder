import { useState } from 'react';
import type { FullSchedule, GradeTargets, WeekKey, CustomPassType } from '../types';
import { validateSchedule } from '../validation';
import type { ValidationResult } from '../validation';
import { DAYS } from '../constants';
import { getGrade, minutesToTime } from '../utils';

interface StatisticsViewProps {
  schedule: FullSchedule;
  selectedClasses: string[];
  targets: GradeTargets;
  customTypes: CustomPassType[];
}

/* PDF-referensvärden per årskurs (lärartid h/v) */
const PDF_TEACHER_REF: Record<number, number> = {
  4: 20.0, 5: 20.0, 6: 21.5, 7: 22.9, 8: 23.0, 9: 23.5,
};

const PDF_GUARANTEED_REF: Record<number, number> = {
  4: 1200, 5: 1200, 6: 1290, 7: 1375, 8: 1380, 9: 1410,
};

const PDF_PH_REF: Record<number, number> = {
  7: 225, 8: 225, 9: 225,
};

function StatCard({
  title,
  value,
  unit,
  color,
  subText,
}: {
  title: string;
  value: string;
  unit: string;
  color: string;
  subText?: string;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-400">{unit}</p>
      {subText && <p className="text-xs text-gray-500 mt-1">{subText}</p>}
    </div>
  );
}

function PdfRefCard({
  title,
  value,
  unit,
}: {
  title: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <p className="text-xs font-medium text-purple-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold mt-1 text-purple-700">{value}</p>
      <p className="text-xs text-purple-400">{unit}</p>
    </div>
  );
}

function deviationColor(diff: number): string {
  if (diff > 0) return '#DC2626';   // red – over
  if (diff < 0) return '#CA8A04';   // yellow – under
  return '#16A34A';                  // green – OK
}

type StatTab = 'snitt' | 'A' | 'B';

function WeekStatsSection({
  result,
  target,
  grade,
  schedule,
  cls,
  weekKey,
}: {
  result: ValidationResult;
  target: number;
  grade: number;
  schedule: FullSchedule;
  cls: string;
  weekKey: WeekKey;
}) {
  const diff = result.weeklyGuaranteed - target;
  const teacherH = (result.weeklyTeacher / 60).toFixed(1);
  const phMin = result.weeklyPh;

  const pdfTeacher = PDF_TEACHER_REF[grade];
  const pdfGuaranteed = PDF_GUARANTEED_REF[grade];
  const pdfPh = PDF_PH_REF[grade];

  const dayStats = DAYS.map((day) => {
    const passes = schedule[cls]?.[weekKey]?.[day.key] || [];
    const guaranteed = passes
      .filter((p) => p.guaranteed)
      .reduce((sum, p) => sum + p.duration, 0);
    const sorted = [...passes].sort((a, b) => a.start - b.start);
    const lastPass = sorted[sorted.length - 1];
    const endTime = lastPass ? lastPass.start + lastPass.duration : 0;
    return { day: day.label, guaranteed, endTime };
  });

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard
          title="Garanterad tid/v"
          value={`${result.weeklyGuaranteed}`}
          unit="min"
          color={deviationColor(diff)}
          subText={`M\u00e5l: ${target} min`}
        />
        <StatCard
          title="Avvikelse mot m\u00e5l"
          value={`${diff >= 0 ? '+' : ''}${diff}`}
          unit={`min (m\u00e5l ${target})`}
          color={deviationColor(diff)}
          subText={`M\u00e5l: ${target} min`}
        />
        <StatCard
          title="L\u00e4rartid/v"
          value={teacherH}
          unit="h"
          color={parseFloat(teacherH) > 27.5 ? '#DC2626' : '#16A34A'}
        />
        <StatCard
          title="ph-tid morgon/v"
          value={`${phMin}`}
          unit="min"
          color={phMin > 0 ? '#16A34A' : '#94A3B8'}
        />
        {pdfGuaranteed !== undefined && (
          <PdfRefCard title="PDF-ref garanterad" value={`${pdfGuaranteed}`} unit="min" />
        )}
        {pdfTeacher !== undefined && (
          <PdfRefCard title="PDF-ref l\u00e4rartid" value={`${pdfTeacher}`} unit="h" />
        )}
        {pdfPh !== undefined && (
          <PdfRefCard title="PDF-ref ph-tid" value={`${pdfPh}`} unit="min" />
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 font-semibold text-gray-600">Dag</th>
              <th className="text-right py-2 px-4 font-semibold text-gray-600">Garanterad tid</th>
              <th className="text-right py-2 pl-4 font-semibold text-gray-600">Sluttid</th>
            </tr>
          </thead>
          <tbody>
            {dayStats.map((ds) => (
              <tr key={ds.day} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-700">{ds.day}</td>
                <td className="py-2 px-4 text-right font-medium text-gray-800">
                  {ds.guaranteed} min
                </td>
                <td className="py-2 pl-4 text-right font-medium text-gray-800">
                  {ds.endTime > 0 ? minutesToTime(ds.endTime) : '\u2013'}
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="py-2 pr-4 text-gray-800">Totalt</td>
              <td className="py-2 px-4 text-right text-gray-800">
                {result.weeklyGuaranteed} min
              </td>
              <td className="py-2 pl-4 text-right text-gray-400">\u2013</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function StatisticsView({ schedule, selectedClasses, targets, customTypes }: StatisticsViewProps) {
  const [activeTab, setActiveTab] = useState<StatTab>('snitt');

  return (
    <div className="space-y-8">
      {selectedClasses.map((cls) => {
        const grade = getGrade(cls);
        const target = targets[grade] || 0;
        const resultA = validateSchedule(schedule, cls, targets, 'A', customTypes);
        const resultB = validateSchedule(schedule, cls, targets, 'B', customTypes);

        // Average results for Snitt
        const avgGuaranteed = Math.round((resultA.weeklyGuaranteed + resultB.weeklyGuaranteed) / 2);
        const avgTeacher = (resultA.weeklyTeacher + resultB.weeklyTeacher) / 2;
        const avgPh = Math.round((resultA.weeklyPh + resultB.weeklyPh) / 2);
        const avgDiff = avgGuaranteed - target;
        const avgTeacherH = (avgTeacher / 60).toFixed(1);

        const pdfTeacher = PDF_TEACHER_REF[grade];
        const pdfGuaranteed = PDF_GUARANTEED_REF[grade];
        const pdfPh = PDF_PH_REF[grade];

        return (
          <div key={cls} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">\u00c5k {cls}</h2>

            {/* Stat tabs */}
            <div className="flex gap-1 mb-4">
              {([
                { key: 'snitt' as StatTab, label: 'Snitt' },
                { key: 'A' as StatTab, label: 'Vecka A' },
                { key: 'B' as StatTab, label: 'Vecka B' },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'snitt' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                <StatCard
                  title="Garanterad tid/v (snitt)"
                  value={`${avgGuaranteed}`}
                  unit="min"
                  color={deviationColor(avgDiff)}
                  subText={`M\u00e5l: ${target} min`}
                />
                <StatCard
                  title="Avvikelse mot m\u00e5l"
                  value={`${avgDiff >= 0 ? '+' : ''}${avgDiff}`}
                  unit={`min (m\u00e5l ${target})`}
                  color={deviationColor(avgDiff)}
                  subText={`M\u00e5l: ${target} min`}
                />
                <StatCard
                  title="L\u00e4rartid/v (snitt)"
                  value={avgTeacherH}
                  unit="h"
                  color={parseFloat(avgTeacherH) > 27.5 ? '#DC2626' : '#16A34A'}
                />
                <StatCard
                  title="ph-tid morgon/v (snitt)"
                  value={`${avgPh}`}
                  unit="min"
                  color={avgPh > 0 ? '#16A34A' : '#94A3B8'}
                />
                {pdfGuaranteed !== undefined && (
                  <PdfRefCard title="PDF-ref garanterad" value={`${pdfGuaranteed}`} unit="min" />
                )}
                {pdfTeacher !== undefined && (
                  <PdfRefCard title="PDF-ref l\u00e4rartid" value={`${pdfTeacher}`} unit="h" />
                )}
                {pdfPh !== undefined && (
                  <PdfRefCard title="PDF-ref ph-tid" value={`${pdfPh}`} unit="min" />
                )}
              </div>
            )}

            {activeTab === 'A' && (
              <WeekStatsSection
                result={resultA}
                target={target}
                grade={grade}
                schedule={schedule}
                cls={cls}
                weekKey="A"
              />
            )}

            {activeTab === 'B' && (
              <WeekStatsSection
                result={resultB}
                target={target}
                grade={grade}
                schedule={schedule}
                cls={cls}
                weekKey="B"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
