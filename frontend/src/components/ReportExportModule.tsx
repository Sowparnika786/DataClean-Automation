import React from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Code, 
  FileCheck, 
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { getExportUrl } from '../services/api';
import { QualityAnalysis } from '../types';

interface ReportExportModuleProps {
  originalQuality: QualityAnalysis;
  cleanedQuality: QualityAnalysis;
  filename?: string;
  cleaningLog: string[];
}

export const ReportExportModule: React.FC<ReportExportModuleProps> = ({
  originalQuality,
  cleanedQuality,
  filename = 'dataset.csv',
  cleaningLog,
}) => {
  const scoreBefore = originalQuality.quality_score.score;
  const scoreAfter = cleanedQuality.quality_score.score;
  const diff = scoreAfter - scoreBefore;

  const handleDownload = (type: 'csv' | 'excel' | 'pdf') => {
    const url = getExportUrl(type);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJsonLog = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      filename,
      total_actions: cleaningLog.length,
      quality_before: originalQuality.quality_score,
      quality_after: cleanedQuality.quality_score,
      cleaning_log: cleaningLog
    }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `cleaning_log_${filename}.json`);
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Export Action Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Download Results & Export Center</h3>
          <p className="text-xs text-slate-500">Export clean dataset formats, executive PDF summary, or 5-sheet Excel workbook.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* CSV Button */}
          <button
            onClick={() => handleDownload('csv')}
            className="p-5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl text-left transition group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700">Download Cleaned CSV</h4>
            <p className="text-[11px] text-slate-500 mt-1">Single CSV file ready for database or BI tool import.</p>
          </button>

          {/* Excel Button */}
          <button
            onClick={() => handleDownload('excel')}
            className="p-5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-left transition group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700">Download Cleaned Excel</h4>
            <p className="text-[11px] text-slate-500 mt-1">Workbook with 5 sheets (Data, Summary, Log, Missing, Stats).</p>
          </button>

          {/* PDF Button */}
          <button
            onClick={() => handleDownload('pdf')}
            className="p-5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-2xl text-left transition group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 shadow-md shadow-sky-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-700">Download Executive PDF</h4>
            <p className="text-[11px] text-slate-500 mt-1">Full 7-section data diagnostics & scorecard PDF report.</p>
          </button>

          {/* JSON Log Button */}
          <button
            onClick={handleDownloadJsonLog}
            className="p-5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-2xl text-left transition group shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-md shadow-purple-500/20">
              <Code className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-purple-700">Download Cleaning Log</h4>
            <p className="text-[11px] text-slate-500 mt-1">Audit log formatted as JSON object for system records.</p>
          </button>
        </div>
      </div>

      {/* Excel Sheet Structure Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-900 text-sm">
          Excel Export Multi-Sheet Structure (5 Sheets Included)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { num: 'Sheet 1', title: 'Cleaned Data', desc: 'Full processed dataset with headers' },
            { num: 'Sheet 2', title: 'Data Summary', desc: 'Dataset info & health metrics' },
            { num: 'Sheet 3', title: 'Cleaning Log', desc: 'Step-by-step audit action trail' },
            { num: 'Sheet 4', title: 'Missing Report', desc: 'Detailed per-column missing stats' },
            { num: 'Sheet 5', title: 'Stats Summary', desc: 'Descriptive numeric metrics' },
          ].map((s, idx) => (
            <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{s.num}</span>
              <h5 className="font-bold text-slate-900 text-xs mt-2">{s.title}</h5>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Automated PDF Report Live Summary Preview */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Report Preview</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">Automated Executive PDF Summary Report</h3>
          <p className="text-xs text-slate-500">Generated report structure covering 7 analytical sections.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <h5 className="font-bold text-slate-900">Section 1 — Dataset Overview</h5>
              <p className="text-slate-500 mt-1">Name: <b>{filename}</b> | Rows: <b>{cleanedQuality.dataset_info.total_rows}</b> | Columns: <b>{cleanedQuality.dataset_info.total_columns}</b></p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <h5 className="font-bold text-slate-900">Section 2 — Data Quality Diagnostics</h5>
              <p className="text-slate-500 mt-1">Missing values resolved: <b>{originalQuality.quality_indicators.missing_cells}</b> | Duplicates purged: <b>{originalQuality.quality_indicators.duplicate_rows}</b></p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <h5 className="font-bold text-slate-900">Section 3 — Cleaning Actions Audit</h5>
              <p className="text-slate-500 mt-1">{cleaningLog.length} sequential transformations recorded in audit history.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <h5 className="font-bold text-slate-900">Section 4 — Before vs After Metrics</h5>
              <p className="text-slate-500 mt-1">Quality score improvement: <b>+{diff} points</b></p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <h5 className="font-bold text-slate-900">Section 5 — Statistical Summary</h5>
              <p className="text-slate-500 mt-1">Includes count, mean, std, min, median, max for all numeric features.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <h5 className="font-bold text-slate-900">Section 6 — Visual Analysis Summary</h5>
              <p className="text-slate-500 mt-1">Distribution histograms and category frequency statistics.</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h5 className="font-bold text-blue-900">Section 7 — Final Score & Readiness</h5>
              <p className="text-blue-800 font-bold mt-1">Original: {scoreBefore}/100 → Final Score: {scoreAfter}/100 (+{diff}%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
