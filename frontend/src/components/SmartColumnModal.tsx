import React from 'react';
import { X, Table as TableIcon, Hash, Type, HelpCircle, Layers } from 'lucide-react';
import { ColumnDetails } from '../types';

interface SmartColumnModalProps {
  details: ColumnDetails | null;
  onClose: () => void;
}

export const SmartColumnModal: React.FC<SmartColumnModalProps> = ({ details, onClose }) => {
  if (!details) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            {details.is_numeric ? <Hash className="w-5 h-5" /> : <Type className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{details.column_name}</h3>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {details.data_type}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Rows</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{details.total_values}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Unique Values</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{details.unique_values_count}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Missing Count</span>
            <p className="text-sm font-bold text-amber-600 mt-0.5">
              {details.missing_count} ({details.missing_percentage}%)
            </p>
          </div>

          {details.is_numeric ? (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Outliers Count</span>
              <p className="text-sm font-bold text-rose-600 mt-0.5">{details.outliers_count || 0}</p>
            </div>
          ) : (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Mode (Top Value)</span>
              <p className="text-sm font-bold text-purple-600 mt-0.5 truncate">{details.mode}</p>
            </div>
          )}
        </div>

        {/* Numeric Distribution Details */}
        {details.is_numeric && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-2 mb-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase">Numerical Descriptive Metrics</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div><span className="text-slate-400">Min:</span> <b>{details.min}</b></div>
              <div><span className="text-slate-400">Max:</span> <b>{details.max}</b></div>
              <div><span className="text-slate-400">Mean:</span> <b>{details.mean}</b></div>
              <div><span className="text-slate-400">Median:</span> <b>{details.median}</b></div>
              <div><span className="text-slate-400">Std Dev:</span> <b>{details.std}</b></div>
            </div>
          </div>
        )}

        {/* Categorical Frequencies */}
        {!details.is_numeric && details.top_categories && (
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase">Top Categories Frequency</h4>
            <div className="bg-slate-50 rounded-xl border border-slate-200/70 p-3 space-y-1.5 text-xs">
              {details.top_categories.map((cat, idx) => (
                <div key={idx} className="flex justify-between text-slate-700">
                  <span className="font-medium truncate max-w-[200px]">{cat.category}</span>
                  <span className="font-bold">{cat.count} occurrences</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
        >
          Close Statistics
        </button>
      </div>
    </div>
  );
};
