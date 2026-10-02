import React from 'react';
import { 
  Home, 
  Upload, 
  ShieldAlert, 
  Wand2, 
  GitCompare, 
  BarChart3, 
  FileText, 
  Download,
  Database
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  datasetLoaded: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, datasetLoaded }) => {
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Home, requiresData: false },
    { id: 'upload', label: 'Upload Data', icon: Upload, requiresData: false },
    { id: 'quality', label: 'Data Quality', icon: ShieldAlert, requiresData: true },
    { id: 'cleaning', label: 'Cleaning Engine', icon: Wand2, requiresData: true },
    { id: 'comparison', label: 'Before / After & Log', icon: GitCompare, requiresData: true },
    { id: 'visualizations', label: 'Visual Analytics', icon: BarChart3, requiresData: true },
    { id: 'reports', label: 'Report & Export', icon: Download, requiresData: true },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base leading-tight tracking-tight">DataClean AI</h1>
          <p className="text-xs text-blue-400 font-medium">Automation & Reporting</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isDisabled = item.requiresData && !datasetLoaded;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onSelectView(item.id)}
              disabled={isDisabled}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : isDisabled
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : 'hover:bg-slate-800 hover:text-slate-100 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.requiresData && !datasetLoaded && (
                <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">Required</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/60 rounded-xl p-3 text-xs border border-slate-700/50">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-medium">Engine Status</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-[11px] text-slate-300 font-mono">FastAPI + Pandas 2.2</p>
        </div>
      </div>
    </aside>
  );
};
