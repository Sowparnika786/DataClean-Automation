import React from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Sparkles, 
  ShieldAlert, 
  CopyX, 
  Type, 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Download,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onUploadClick: () => void;
  onDemoClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onUploadClick, onDemoClick }) => {
  const featureCards = [
    { title: 'Missing Value Detection', desc: 'Identify empty cells across all columns with automated mean, median, mode, or removal recommendations.', icon: ShieldAlert, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { title: 'Duplicate Detection', desc: 'Find exact row duplicates or subset-based record duplicates with keep first/last logic.', icon: CopyX, color: 'text-rose-500 bg-rose-50 border-rose-200' },
    { title: 'Data Standardization', desc: 'Clean whitespace, case variations (Coimbatore vs coimbatore), and synonym categories instantly.', icon: Type, color: 'text-purple-500 bg-purple-50 border-purple-200' },
    { title: 'Outlier Detection', desc: 'Detect extreme statistical anomalies using IQR & Z-score models with capping or median replacement.', icon: TrendingUp, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
    { title: 'Automated Cleaning', desc: 'One-click AI cleaning pipeline performing 10 sequential transformations without touching original data.', icon: Sparkles, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    { title: 'Visual Analytics', desc: 'Interactive Recharts dashboard featuring histograms, box plots, scatter plots, pie charts, & heatmaps.', icon: BarChart3, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
    { title: 'Report Generation', desc: 'Produce executive PDF reports complete with scorecards, before/after comparisons, and recommendations.', icon: FileText, color: 'text-sky-500 bg-sky-50 border-sky-200' },
    { title: 'Excel & CSV Export', desc: 'Export clean datasets as CSV or multi-sheet Excel workbooks containing 5 structured report sheets.', icon: Download, color: 'text-teal-500 bg-teal-50 border-teal-200' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-900 via-slate-900 to-slate-900 text-white rounded-3xl p-10 md:p-14 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Automated Data Analytics & Preprocessing Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Data Cleaning & Reporting Automation
          </h1>
          
          <p className="text-lg text-slate-300 font-normal leading-relaxed">
            Transform messy datasets into clean, analysis-ready data and automated reports in minutes.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onUploadClick}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center space-x-2.5 text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Dataset</span>
            </button>

            <button
              onClick={onDemoClick}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl border border-slate-700 transition flex items-center space-x-2.5 text-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>View Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Workflow Illustration */}
      <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <h3 className="text-center font-bold text-slate-900 text-sm uppercase tracking-wider mb-8">
          Automated End-to-End Workflow Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            { step: '01', title: 'Raw Data', desc: 'CSV & XLSX File Upload' },
            { step: '02', title: 'Cleaning Engine', desc: 'Automated Diagnostic & Rules' },
            { step: '03', title: 'Analysis', desc: 'Data Quality Score & Metrics' },
            { step: '04', title: 'Dashboard', desc: 'Interactive Recharts Analytics' },
            { step: '05', title: 'Automated Report', desc: 'PDF & 5-Sheet Excel Export' },
          ].map((item, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mb-3">
                {item.step}
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Core Automation Capabilities</h2>
          <p className="text-sm text-slate-500 mt-1">Everything required for enterprise data quality inspection, preprocessing, and reporting.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {featureCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition group">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-blue-600 transition">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
