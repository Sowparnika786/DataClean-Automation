import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CopyX, 
  HelpCircle, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { QualityAnalysis } from '../types';

interface QualityDashboardProps {
  quality: QualityAnalysis;
  onGoToCleaning: () => void;
  onAutoClean: () => void;
  isCleaning: boolean;
}

export const QualityDashboard: React.FC<QualityDashboardProps> = ({
  quality,
  onGoToCleaning,
  onAutoClean,
  isCleaning,
}) => {
  const { dataset_info, quality_score, quality_indicators } = quality;
  const score = quality_score.score;

  // Gauge color determination
  const scoreColor =
    score >= 90 ? '#10B981' : score >= 75 ? '#3B82F6' : score >= 60 ? '#F59E0B' : '#EF4444';
  const badgeBg =
    score >= 90 ? 'bg-emerald-100 text-emerald-800' : score >= 75 ? 'bg-blue-100 text-blue-800' : score >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Banner & Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Gauge Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center relative overflow-hidden">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Overall Data Quality Score
          </h3>

          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.8"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3.8"
                strokeDasharray={`${score}, 100`}
                stroke={scoreColor}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-900">{score}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">out of 100</span>
            </div>
          </div>

          <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${badgeBg}`}>
            {quality_score.rating}
          </span>
        </div>

        {/* Dataset Summary Cards */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Automated Quality Diagnostic</h3>
              <p className="text-xs text-slate-500">Overview of dataset structure and health indicators.</p>
            </div>
            <button
              onClick={onAutoClean}
              disabled={isCleaning}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isCleaning ? 'Cleaning...' : 'Auto-Clean Dataset'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[11px] text-slate-400 font-medium">Total Rows</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{dataset_info.total_rows}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[11px] text-slate-400 font-medium">Numerical Cols</span>
              <p className="text-base font-bold text-blue-600 mt-0.5">{dataset_info.numerical_columns_count}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[11px] text-slate-400 font-medium">Categorical Cols</span>
              <p className="text-base font-bold text-purple-600 mt-0.5">{dataset_info.categorical_columns_count}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[11px] text-slate-400 font-medium">Date Cols</span>
              <p className="text-base font-bold text-emerald-600 mt-0.5">{dataset_info.date_columns_count}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Identified Issues: <b>{quality_indicators.missing_by_column.length}</b> missing columns, <b>{quality_indicators.duplicate_rows}</b> duplicates</span>
            <button
              onClick={onGoToCleaning}
              className="text-blue-600 font-bold hover:underline inline-flex items-center space-x-1"
            >
              <span>Manage Cleaning Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Indicator Issue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Missing Values</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{quality_indicators.missing_cells}</p>
          <p className="text-xs text-slate-500 mt-1">{quality_indicators.missing_percentage}% of total cells missing</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Duplicate Rows</span>
            <CopyX className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{quality_indicators.duplicate_rows}</p>
          <p className="text-xs text-slate-500 mt-1">{quality_indicators.duplicate_percentage}% duplicate record ratio</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Inconsistencies</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{quality_indicators.inconsistent_columns.length}</p>
          <p className="text-xs text-slate-500 mt-1">Columns with text/casing issues</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Outliers</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{quality_indicators.outlier_total_count}</p>
          <p className="text-xs text-slate-500 mt-1">Extreme statistical anomalies</p>
        </div>
      </div>

      {/* Detailed Diagnostics Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm">
          Detected Data Quality Issues & Recommendations
        </h4>

        <div className="divide-y divide-slate-100">
          {quality_indicators.missing_by_column.map((col, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800">{col.column}</span>
                <span className="text-xs text-slate-400 ml-2">
                  • {col.missing_count} missing values ({col.missing_percentage}%)
                </span>
              </div>
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
                Recommended: Fill with {col.recommended_action}
              </span>
            </div>
          ))}

          {quality_indicators.inconsistent_columns.map((col, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800">{col.column}</span>
                <span className="text-xs text-slate-400 ml-2">
                  • {col.case_variations} case variations, {col.whitespace_issues} whitespace errors
                </span>
              </div>
              <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-200">
                Recommended: Title Case & Trim
              </span>
            </div>
          ))}

          {quality_indicators.data_type_issues.map((col, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800">{col.column}</span>
                <span className="text-xs text-slate-400 ml-2">
                  • {col.reason} (Current: {col.current_type})
                </span>
              </div>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
                Suggested: Convert to {col.suggested_type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
