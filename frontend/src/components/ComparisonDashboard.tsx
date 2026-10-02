import React from 'react';
import { 
  GitCompare, 
  TrendingUp, 
  CheckCircle2, 
  FileText, 
  History, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { QualityAnalysis } from '../types';

interface ComparisonDashboardProps {
  originalQuality: QualityAnalysis;
  cleanedQuality: QualityAnalysis;
  cleaningLog: string[];
}

export const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({
  originalQuality,
  cleanedQuality,
  cleaningLog,
}) => {
  const origScore = originalQuality.quality_score.score;
  const cleanScore = cleanedQuality.quality_score.score;
  const scoreDiff = cleanScore - origScore;

  const comparisonRows = [
    {
      metric: 'Total Rows',
      before: originalQuality.dataset_info.total_rows,
      after: cleanedQuality.dataset_info.total_rows,
      change: `${cleanedQuality.dataset_info.total_rows - originalQuality.dataset_info.total_rows} rows`,
      isGood: true
    },
    {
      metric: 'Missing Value Cells',
      before: originalQuality.quality_indicators.missing_cells,
      after: cleanedQuality.quality_indicators.missing_cells,
      change: `-${originalQuality.quality_indicators.missing_cells - cleanedQuality.quality_indicators.missing_cells}`,
      isGood: true
    },
    {
      metric: 'Duplicate Records',
      before: originalQuality.quality_indicators.duplicate_rows,
      after: cleanedQuality.quality_indicators.duplicate_rows,
      change: `-${originalQuality.quality_indicators.duplicate_rows - cleanedQuality.quality_indicators.duplicate_rows}`,
      isGood: true
    },
    {
      metric: 'Outliers Found',
      before: originalQuality.quality_indicators.outlier_total_count,
      after: cleanedQuality.quality_indicators.outlier_total_count,
      change: `-${originalQuality.quality_indicators.outlier_total_count - cleanedQuality.quality_indicators.outlier_total_count}`,
      isGood: true
    },
    {
      metric: 'Data Quality Score',
      before: `${origScore}/100`,
      after: `${cleanScore}/100`,
      change: `+${scoreDiff} points`,
      isGood: scoreDiff >= 0
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Banner: Improvement Metric */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-blue-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Data Cleaning Results</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Data Quality Improvement: +{scoreDiff}%
          </h2>
          <p className="text-xs text-emerald-100">
            Dataset transitioned from <span className="font-bold">{originalQuality.quality_score.rating}</span> to <span className="font-bold">{cleanedQuality.quality_score.rating}</span>.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl border border-white/20 text-center shrink-0">
          <span className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">Final Score</span>
          <p className="text-3xl font-black text-white">{cleanScore}/100</p>
        </div>
      </div>

      {/* Side by Side Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <GitCompare className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-base">Before vs After Cleaning Comparison</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider">
                <th className="p-3.5">Metric</th>
                <th className="p-3.5 text-center bg-rose-50/50 text-rose-700">Before Cleaning</th>
                <th className="p-3.5 text-center bg-emerald-50/50 text-emerald-700">After Cleaning</th>
                <th className="p-3.5 text-right">Net Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition font-medium">
                  <td className="p-3.5 font-bold text-slate-900">{row.metric}</td>
                  <td className="p-3.5 text-center bg-rose-50/20 text-slate-800">{row.before}</td>
                  <td className="p-3.5 text-center bg-emerald-50/20 text-slate-900 font-bold">{row.after}</td>
                  <td className="p-3.5 text-right font-bold text-emerald-600 flex items-center justify-end space-x-1">
                    <span>{row.change}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cleaning History / Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-base">Cleaning Actions Log</h3>
        </div>

        {cleaningLog.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No cleaning actions performed yet.</p>
        ) : (
          <div className="space-y-2.5">
            {cleaningLog.map((log, idx) => (
              <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 flex items-start space-x-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-slate-800 font-medium leading-relaxed pt-0.5">{log}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
