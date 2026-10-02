import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  CopyX, 
  Type, 
  TrendingUp, 
  Binary, 
  Check, 
  RotateCcw,
  Sliders,
  Wand2
} from 'lucide-react';
import { QualityAnalysis } from '../types';

interface CleaningEngineProps {
  quality: QualityAnalysis;
  onCleanMissing: (column: string, strategy: string) => void;
  onCleanDuplicates: (subset?: string[], keep?: string) => void;
  onCleanInconsistent: (column: string, action: string) => void;
  onCleanDtypes: (column: string, targetType: string) => void;
  onCleanOutliers: (column: string, method: string, action: string) => void;
  onAutoClean: () => void;
  onReset: () => void;
  isProcessing: boolean;
}

export const CleaningEngine: React.FC<CleaningEngineProps> = ({
  quality,
  onCleanMissing,
  onCleanDuplicates,
  onCleanInconsistent,
  onCleanDtypes,
  onCleanOutliers,
  onAutoClean,
  onReset,
  isProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<'missing' | 'duplicates' | 'inconsistent' | 'dtypes' | 'outliers'>('missing');
  const [dupKeep, setDupKeep] = useState<'first' | 'last'>('first');
  const [outlierMethod, setOutlierMethod] = useState<'iqr' | 'zscore'>('iqr');

  const tabs = [
    { id: 'missing', label: 'Missing Values', icon: HelpCircle },
    { id: 'duplicates', label: 'Duplicates', icon: CopyX },
    { id: 'inconsistent', label: 'Text Inconsistencies', icon: Type },
    { id: 'dtypes', label: 'Data Types', icon: Binary },
    { id: 'outliers', label: 'Outliers', icon: TrendingUp },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Auto Clean Master Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold">1-Click Automated Cleaning Engine</h3>
          </div>
          <p className="text-xs text-slate-300">
            Automatically handle missing values, duplicates, text capitalization, data types, and extreme outliers.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onReset}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
          <button
            onClick={onAutoClean}
            disabled={isProcessing}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/30 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Wand2 className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Processing Pipeline...' : 'Run Auto Clean Engine'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* TAB 1: MISSING VALUES */}
          {activeTab === 'missing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Missing Value Resolution</h4>
                  <p className="text-xs text-slate-500">Apply custom imputation rules per column.</p>
                </div>
              </div>

              {quality.quality_indicators.missing_by_column.length === 0 ? (
                <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-emerald-900">No missing values in dataset!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quality.quality_indicators.missing_by_column.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{item.column}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-slate-500">{item.missing_count} missing ({item.missing_percentage}%)</span>
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Recommended: {item.recommended_action}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {['median', 'mean', 'mode', 'zero', 'remove_rows'].map((strat) => (
                          <button
                            key={strat}
                            onClick={() => onCleanMissing(item.column, strat)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 bg-white hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition shadow-2xs capitalize disabled:opacity-50"
                          >
                            Fill {strat.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DUPLICATES */}
          {activeTab === 'duplicates' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Duplicate Records Removal</h4>
                <p className="text-xs text-slate-500">Detect and remove exact duplicate rows.</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Duplicate Rows Detected</span>
                  <p className="text-3xl font-black text-rose-600 mt-1">
                    {quality.quality_indicators.duplicate_rows}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {quality.quality_indicators.duplicate_percentage}% of total dataset rows are exact copies.
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                    <span>Keep:</span>
                    <button
                      onClick={() => setDupKeep('first')}
                      className={`px-3 py-1 rounded-lg border text-xs font-bold ${dupKeep === 'first' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'}`}
                    >
                      First Occurrence
                    </button>
                    <button
                      onClick={() => setDupKeep('last')}
                      className={`px-3 py-1 rounded-lg border text-xs font-bold ${dupKeep === 'last' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'}`}
                    >
                      Last Occurrence
                    </button>
                  </div>

                  <button
                    onClick={() => onCleanDuplicates(undefined, dupKeep)}
                    disabled={isProcessing || quality.quality_indicators.duplicate_rows === 0}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    Remove All Duplicates
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEXT INCONSISTENCIES */}
          {activeTab === 'inconsistent' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Text Formatting & Casing Standardization</h4>
                <p className="text-xs text-slate-500">Fix inconsistent text, capitalization variations, and trim whitespace.</p>
              </div>

              {quality.quality_indicators.inconsistent_columns.length === 0 ? (
                <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-emerald-900">All text fields are standardized!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quality.quality_indicators.inconsistent_columns.map((col, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{col.column}</span>
                        <div className="text-xs text-slate-500 mt-1">
                          Sample variations: {col.sample_variations.join(', ')}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {['trim_title', 'uppercase', 'lowercase'].map((act) => (
                          <button
                            key={act}
                            onClick={() => onCleanInconsistent(col.column, act)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 bg-white hover:bg-purple-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition shadow-2xs capitalize disabled:opacity-50"
                          >
                            {act.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DATA TYPES */}
          {activeTab === 'dtypes' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Data Type Coercion & Normalization</h4>
                <p className="text-xs text-slate-500">Convert string numbers, currency symbols (₹45,000), and dates into standard types.</p>
              </div>

              <div className="space-y-3">
                {quality.dataset_info.categorical_columns.concat(quality.dataset_info.numerical_columns).map((col, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{col}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onCleanDtypes(col, 'numeric')}
                        disabled={isProcessing}
                        className="px-3 py-1.5 bg-white hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition shadow-2xs disabled:opacity-50"
                      >
                        Convert Numeric
                      </button>
                      <button
                        onClick={() => onCleanDtypes(col, 'datetime')}
                        disabled={isProcessing}
                        className="px-3 py-1.5 bg-white hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition shadow-2xs disabled:opacity-50"
                      >
                        Convert Date
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OUTLIERS */}
          {activeTab === 'outliers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Outlier Detection & Capping</h4>
                  <p className="text-xs text-slate-500">Detect anomalies using IQR or Z-score models.</p>
                </div>

                <div className="flex items-center space-x-2 text-xs font-medium">
                  <span>Method:</span>
                  <button
                    onClick={() => setOutlierMethod('iqr')}
                    className={`px-3 py-1 rounded-lg border text-xs font-bold ${outlierMethod === 'iqr' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'}`}
                  >
                    IQR (1.5x)
                  </button>
                  <button
                    onClick={() => setOutlierMethod('zscore')}
                    className={`px-3 py-1 rounded-lg border text-xs font-bold ${outlierMethod === 'zscore' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'}`}
                  >
                    Z-Score (3.0)
                  </button>
                </div>
              </div>

              {quality.dataset_info.numerical_columns.map((col, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{col}</span>
                    <p className="text-xs text-slate-500">Numerical feature</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onCleanOutliers(col, outlierMethod, 'cap')}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition shadow-2xs disabled:opacity-50"
                    >
                      Cap Outliers
                    </button>
                    <button
                      onClick={() => onCleanOutliers(col, outlierMethod, 'replace_median')}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition shadow-2xs disabled:opacity-50"
                    >
                      Replace Median
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
