import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  Layers, 
  Filter, 
  Maximize2,
  Table as TableIcon
} from 'lucide-react';
import { VisualizationsData, QualityAnalysis } from '../types';

interface AnalyticsDashboardProps {
  visData: VisualizationsData;
  quality: QualityAnalysis;
  onSelectColumn: (colName: string) => void;
}

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#4f46e5'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  visData,
  quality,
  onSelectColumn,
}) => {
  const [selectedNumCol, setSelectedNumCol] = useState<string>(
    quality.dataset_info.numerical_columns[0] || ''
  );
  const [selectedCatCol, setSelectedCatCol] = useState<string>(
    quality.dataset_info.categorical_columns[0] || ''
  );

  const numChartInfo = visData.numeric_charts[selectedNumCol];
  const catChartData = visData.categorical_charts[selectedCatCol] || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Records</span>
          <p className="text-xl font-black text-slate-900 mt-1">{quality.dataset_info.total_rows}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Columns</span>
          <p className="text-xl font-black text-slate-900 mt-1">{quality.dataset_info.total_columns}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Missing Cells</span>
          <p className="text-xl font-black text-amber-600 mt-1">{quality.quality_indicators.missing_cells}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Duplicate Rows</span>
          <p className="text-xl font-black text-rose-600 mt-1">{quality.quality_indicators.duplicate_rows}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Numeric Features</span>
          <p className="text-xl font-black text-blue-600 mt-1">{quality.dataset_info.numerical_columns_count}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Categorical</span>
          <p className="text-xl font-black text-purple-600 mt-1">{quality.dataset_info.categorical_columns_count}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Quality Score</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{quality.quality_score.score}%</p>
        </div>
      </div>

      {/* Interactive Columns Trigger Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Click any column for Smart Column Statistics
        </h4>
        <div className="flex flex-wrap gap-2">
          {quality.dataset_info.numerical_columns.concat(quality.dataset_info.categorical_columns).map((col, idx) => (
            <button
              key={idx}
              onClick={() => onSelectColumn(col)}
              className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 shadow-2xs"
            >
              <span>{col}</span>
              <Maximize2 className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Grid Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CHART 1: Numerical Histogram */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Numerical Feature Distribution (Histogram)
            </h4>
            <select
              value={selectedNumCol}
              onChange={(e) => setSelectedNumCol(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:outline-none"
            >
              {quality.dataset_info.numerical_columns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="h-64">
            {numChartInfo ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={numChartInfo.histogram}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="frequency" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 text-center pt-20">Select a numerical feature</p>
            )}
          </div>
        </div>

        {/* CHART 2: Categorical Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-600" />
              Categorical Frequencies (Bar Chart)
            </h4>
            <select
              value={selectedCatCol}
              onChange={(e) => setSelectedCatCol(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:outline-none"
            >
              {quality.dataset_info.categorical_columns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Data Types Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 text-sm">
            Data Types Distribution (Donut Chart)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visData.data_types_chart}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {visData.data_types_chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Missing Values by Column */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 text-sm">
            Missing Values by Column (%)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visData.missing_values_chart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="column" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="missing_percentage" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
