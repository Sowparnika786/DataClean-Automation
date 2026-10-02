import React from 'react';
import { ChevronRight } from 'lucide-react';

interface WorkflowBarProps {
  currentStep: number; // 1 to 8
  onStepClick: (stepId: string) => void;
  datasetLoaded: boolean;
}

export const WorkflowBar: React.FC<WorkflowBarProps> = ({ currentStep, onStepClick, datasetLoaded }) => {
  const steps = [
    { id: 'upload', step: 1, label: 'Upload Dataset' },
    { id: 'quality', step: 2, label: 'Analyze Data' },
    { id: 'quality', step: 3, label: 'Detect Problems' },
    { id: 'cleaning', step: 4, label: 'Clean Data' },
    { id: 'comparison', step: 5, label: 'Compare Before/After' },
    { id: 'visualizations', step: 6, label: 'Generate Visualizations' },
    { id: 'reports', step: 7, label: 'Generate Report' },
    { id: 'reports', step: 8, label: 'Download Results' },
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2.5 overflow-x-auto shadow-2xs">
      <div className="flex items-center min-w-max space-x-1">
        {steps.map((s, idx) => {
          const isActive = currentStep === s.step;
          const isCompleted = currentStep > s.step;
          const isDisabled = s.step > 1 && !datasetLoaded;

          return (
            <React.Fragment key={idx}>
              <button
                onClick={() => !isDisabled && onStepClick(s.id)}
                disabled={isDisabled}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                    : isCompleted
                    ? 'text-slate-700 hover:bg-slate-100'
                    : isDisabled
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {s.step}
                </span>
                <span>{s.label}</span>
              </button>

              {idx < steps.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
