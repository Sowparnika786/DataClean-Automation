import React from 'react';
import { Sparkles, FileSpreadsheet, RotateCcw, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  filename?: string;
  qualityScore?: number;
  onLoadDemo: () => void;
  onAutoClean: () => void;
  onReset: () => void;
  datasetLoaded: boolean;
  isCleaning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  filename,
  qualityScore,
  onLoadDemo,
  onAutoClean,
  onReset,
  datasetLoaded,
  isCleaning,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Data Cleaning & Reporting Automation
          </h2>
          {datasetLoaded && filename ? (
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              Active Dataset: <span className="font-semibold text-slate-700">{filename}</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-0.5">
              No dataset loaded • Upload a CSV/XLSX or launch demo
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {datasetLoaded && qualityScore !== undefined && (
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <ShieldCheck className={`w-4 h-4 ${qualityScore >= 80 ? 'text-emerald-600' : 'text-amber-500'}`} />
            <span className="text-xs font-medium text-slate-600">Quality Score:</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              qualityScore >= 85 ? 'bg-emerald-100 text-emerald-800' : qualityScore >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {qualityScore}/100
            </span>
          </div>
        )}

        <button
          onClick={onLoadDemo}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200 flex items-center space-x-1.5"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
          <span>Load Demo Dataset</span>
        </button>

        {datasetLoaded && (
          <>
            <button
              onClick={onReset}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={onAutoClean}
              disabled={isCleaning}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isCleaning ? 'animate-spin' : ''}`} />
              <span>{isCleaning ? 'Cleaning...' : 'Auto Clean Dataset'}</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
