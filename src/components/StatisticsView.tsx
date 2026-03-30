import type { FullSchedule, GradeTargets } from '../types';
import { validateSchedule } from '../validation';
import { DAYS } from '../constants';
import { getGrade, minutesToTime } from '../utils';

interface StatisticsViewProps {
  schedule: FullSchedule;
  selectedClasses: string[];
  targets: GradeTargets;
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

export default function StatisticsView({ schedule, selectedClasses, targets }: StatisticsViewProps) {
  return (
    <div className="space-y-8">
      {selectedClasses.map((cls) => {
        const grade = getGrade(cls);
        const target = targets[grade] || 0;
        const result = validateSchedule(schedule, cls, targets);
        const diff = result.weeklyGuaranteed - target;
        const teacherH = (result.weeklyTeacher / 60).toFixed(1);
        const phMin = result.weeklyPh;

        const pdfTeacher = PDF_TEACHER_REF[grade];
        const pdfGuaranteed = PDF_GUARANTEED_REF[grade];
        const pdfPh = PDF_PH_REF[grade];

        // Per-day stats
        const dayStats = DAYS.map((day) => {
          const passes = schedule[cls]?.[day.key] || [];
          const guaranteed = passes
            .filter((p) => p.guaranteed)
            .reduce((sum, p) => sum + p.duration, 0);
          const sorted = [...passes].sort((a, b) => a.start - b.start);
          const lastPass = sorted[sorted.length - 1];
          const endTime = lastPass ? lastPass.start + lastPass.duration : 0;
          return { day: day.label, guaranteed, endTime };
        });

        return (
          <div key={cls} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Åk {cls}</h2>

            {/* Stat cards grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              <StatCard
                title="Garanterad tid/v"
                value={`${result.weeklyGuaranteed}`}
                unit="min"
                color={deviationColor(diff)}
                subText={`M\u00e5l: ${target} min`}
              />
              <StatCard
                title="Avvikelse mot mål"
                value={`${diff >= 0 ? '+' : ''}${diff}`}
                unit={`min (mål ${target})`}
                color={deviationColor(diff)}
                subText={`M\u00e5l: ${target} min`}
              />
              <StatCard
                title="Lärartid/v"
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
                <PdfRefCard
                  title="PDF-ref garanterad"
                  value={`${pdfGuaranteed}`}
                  unit="min"
                />
              )}
              {pdfTeacher !== undefined && (
                <PdfRefCard
                  title="PDF-ref lärartid"
                  value={`${pdfTeacher}`}
                  unit="h"
                />
              )}
              {pdfPh !== undefined && (
                <PdfRefCard
                  title="PDF-ref ph-tid"
                  value={`${pdfPh}`}
                  unit="min"
                />
              )}
            </div>

            {/* Per-day table */}
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
                        {ds.endTime > 0 ? minutesToTime(ds.endTime) : '–'}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="py-2 pr-4 text-gray-800">Totalt</td>
                    <td className="py-2 px-4 text-right text-gray-800">
                      {result.weeklyGuaranteed} min
                    </td>
                    <td className="py-2 pl-4 text-right text-gray-400">–</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
