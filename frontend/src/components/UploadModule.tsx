import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Check, ArrowRight, Table as TableIcon, Filter } from 'lucide-react';
import { DatasetMetadata } from '../types';

interface UploadModuleProps {
  onFileUpload: (file: File) => void;
  onAnalyze: () => void;
  dataset?: DatasetMetadata;
  isLoading: boolean;
}

export const UploadModule: React.FC<UploadModuleProps> = ({
  onFileUpload,
  onAnalyze,
  dataset,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const filteredPreview = dataset?.preview.filter((row) =>
    Object.values(row).some((val) =>
      String(val ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/50 shadow-sm'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv, .xlsx, .xls"
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
          <Upload className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {isLoading ? 'Processing File...' : 'Drag and drop your dataset here'}
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Supports CSV, XLSX, and XLS spreadsheet formats
        </p>

        <button
          type="button"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition inline-flex items-center space-x-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Browse File</span>
        </button>
      </div>

      {/* Dataset Info & Preview */}
      {dataset && (
        <div className="space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-400 font-medium">Dataset File</span>
              <p className="text-sm font-bold text-slate-900 truncate mt-1">{dataset.filename}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-400 font-medium">Total Records</span>
              <p className="text-xl font-black text-blue-600 mt-1">{dataset.total_rows.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-400 font-medium">Total Columns</span>
              <p className="text-xl font-black text-indigo-600 mt-1">{dataset.total_columns}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Ready for Inspection</span>
                <p className="text-xs text-emerald-600 font-bold mt-1">Schema Parsed</p>
              </div>
              <button
                onClick={onAnalyze}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-1.5"
              >
                <span>Analyze Dataset</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Schema & Data Type Badges */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Detected Schema & Data Types
            </h4>
            <div className="flex flex-wrap gap-2">
              {dataset.columns.map((col, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs flex items-center space-x-2">
                  <span className="font-semibold text-slate-800">{col.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    col.inferred_type.includes('numerical') ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {col.inferred_type}
                  </span>
                  {col.null_count > 0 && (
                    <span className="text-[10px] text-amber-600 font-medium">
                      ({col.null_count} nulls)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Table Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <TableIcon className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  Raw Dataset Preview (First 20 Rows)
                </h4>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter preview rows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                />
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 font-semibold sticky top-0">
                    <th className="p-3 w-12 text-center border-r border-slate-200">#</th>
                    {dataset.columns.map((col, idx) => (
                      <th key={idx} className="p-3 border-r border-slate-200 min-w-[130px]">
                        <div>{col.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{col.data_type}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {filteredPreview.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-blue-50/30 transition">
                      <td className="p-3 text-center text-slate-400 bg-slate-50/50 font-mono border-r border-slate-200">
                        {rIdx + 1}
                      </td>
                      {dataset.columns.map((col, cIdx) => {
                        const val = row[col.name];
                        const isNull = val === null || val === undefined || String(val).trim() === '';
                        return (
                          <td key={cIdx} className="p-3 border-r border-slate-200 max-w-xs truncate">
                            {isNull ? (
                              <span className="text-amber-500 italic bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                                null
                              </span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
