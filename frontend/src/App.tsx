import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WorkflowBar } from './components/WorkflowBar';
import { LandingPage } from './components/LandingPage';
import { UploadModule } from './components/UploadModule';
import { QualityDashboard } from './components/QualityDashboard';
import { CleaningEngine } from './components/CleaningEngine';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SmartColumnModal } from './components/SmartColumnModal';
import { ReportExportModule } from './components/ReportExportModule';

import { 
  uploadFile, 
  loadDemo, 
  analyzeDataset, 
  autoClean, 
  cleanMissing, 
  cleanDuplicates, 
  cleanInconsistent, 
  cleanDtypes, 
  cleanOutliers, 
  resetCleaning, 
  getVisualizations, 
  getColumnDetails 
} from './services/api';
import { DatasetMetadata, QualityAnalysis, VisualizationsData, ColumnDetails } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [datasetMetadata, setDatasetMetadata] = useState<DatasetMetadata | undefined>(undefined);
  const [originalQuality, setOriginalQuality] = useState<QualityAnalysis | undefined>(undefined);
  const [cleanedQuality, setCleanedQuality] = useState<QualityAnalysis | undefined>(undefined);
  const [cleaningLog, setCleaningLog] = useState<string[]>([]);
  const [visData, setVisData] = useState<VisualizationsData | undefined>(undefined);
  const [selectedColumnDetails, setSelectedColumnDetails] = useState<ColumnDetails | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const refreshAllState = async () => {
    try {
      const res = await analyzeDataset();
      setOriginalQuality(res.original_quality);
      setCleanedQuality(res.cleaned_quality);
      setCleaningLog(res.cleaning_log);

      const vis = await getVisualizations();
      setVisData(vis.data);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const res = await uploadFile(file);
      setDatasetMetadata(res.data);
      await refreshAllState();
      setCurrentView('upload');
      showNotification(`File '${file.name}' uploaded successfully!`);
    } catch (e: any) {
      showNotification(e.message || 'Failed to upload file', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDemo = async () => {
    setIsLoading(true);
    try {
      const res = await loadDemo();
      setDatasetMetadata(res.data);
      await refreshAllState();
      setCurrentView('upload');
      showNotification('Demo Customer Sales Dataset loaded successfully!');
    } catch (e: any) {
      showNotification(e.message || 'Failed to load demo', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeClick = async () => {
    await refreshAllState();
    setCurrentView('quality');
  };

  const handleAutoClean = async () => {
    setIsCleaning(true);
    try {
      const res = await autoClean();
      setCleanedQuality(res.quality);
      setCleaningLog(res.cleaning_log);
      await refreshAllState();
      showNotification(`Auto-clean complete! Quality improved to ${res.quality.quality_score.score}%`);
    } catch (e: any) {
      showNotification(e.message || 'Auto-clean failed', 'error');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleCleanMissing = async (col: string, strategy: string) => {
    setIsCleaning(true);
    try {
      const res = await cleanMissing(col, strategy);
      await refreshAllState();
      showNotification(res.message);
    } catch (e: any) {
      showNotification(e.message, 'error');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleCleanDuplicates = async (subset?: string[], keep: string = 'first') => {
    setIsCleaning(true);
    try {
      const res = await cleanDuplicates(subset, keep);
      await refreshAllState();
      showNotification(res.message);
    } catch (e: any) {
      showNotification(e.message, 'error');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleCleanInconsistent = async (col: string, action: string) => {
    setIsCleaning(true);
    try {
      const res = await cleanInconsistent(col, action);
      await refreshAllState();
      showNotification(res.message);
    } catch (e: any) {
      showNotification(e.message, 'error');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleCleanDtypes = async (col: string, targetType: string) => {
    setIsCleaning(true);
    try {
      const res = await cleanDtypes(col, targetType);
      await refreshAllState();
      showNotification(res.message);
    } catch (e: any) {
      showNotification(e.message, 'error');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleCleanOutliers = async (col: string, method: string, action: string) => {
    setIsCleaning(true);
    try {
      const res = await cleanOutliers(col, method, action);
      await refreshAllState();
      showNotification(res.message);
    } catch (e: any) {
      showNotification(e.message, 'error');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetCleaning();
      await refreshAllState();
      showNotification('Reset dataset to original state.');
    } catch (e: any) {
      showNotification(e.message, 'error');
    }
  };

  const handleSelectColumn = async (colName: string) => {
    try {
      const res = await getColumnDetails(colName);
      setSelectedColumnDetails(res.data);
    } catch (e: any) {
      showNotification(`Failed to fetch column details for '${colName}'`, 'error');
    }
  };

  // Map view to stepper step number (1 to 8)
  const getStepFromView = (view: string): number => {
    switch (view) {
      case 'upload': return 1;
      case 'quality': return 2;
      case 'cleaning': return 4;
      case 'comparison': return 5;
      case 'visualizations': return 6;
      case 'reports': return 7;
      default: return 1;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold transition flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-emerald-900 text-emerald-100 border-emerald-700' : 'bg-rose-900 text-rose-100 border-rose-700'
        }`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        datasetLoaded={!!datasetMetadata}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          filename={datasetMetadata?.filename}
          qualityScore={cleanedQuality?.quality_score.score}
          onLoadDemo={handleLoadDemo}
          onAutoClean={handleAutoClean}
          onReset={handleReset}
          datasetLoaded={!!datasetMetadata}
          isCleaning={isCleaning}
        />

        <WorkflowBar
          currentStep={getStepFromView(currentView)}
          onStepClick={(v) => setCurrentView(v)}
          datasetLoaded={!!datasetMetadata}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {currentView === 'landing' && (
            <LandingPage
              onUploadClick={() => setCurrentView('upload')}
              onDemoClick={handleLoadDemo}
            />
          )}

          {currentView === 'upload' && (
            <UploadModule
              onFileUpload={handleFileUpload}
              onAnalyze={handleAnalyzeClick}
              dataset={datasetMetadata}
              isLoading={isLoading}
            />
          )}

          {currentView === 'quality' && cleanedQuality && (
            <QualityDashboard
              quality={cleanedQuality}
              onGoToCleaning={() => setCurrentView('cleaning')}
              onAutoClean={handleAutoClean}
              isCleaning={isCleaning}
            />
          )}

          {currentView === 'cleaning' && cleanedQuality && (
            <CleaningEngine
              quality={cleanedQuality}
              onCleanMissing={handleCleanMissing}
              onCleanDuplicates={handleCleanDuplicates}
              onCleanInconsistent={handleCleanInconsistent}
              onCleanDtypes={handleCleanDtypes}
              onCleanOutliers={handleCleanOutliers}
              onAutoClean={handleAutoClean}
              onReset={handleReset}
              isProcessing={isCleaning}
            />
          )}

          {currentView === 'comparison' && originalQuality && cleanedQuality && (
            <ComparisonDashboard
              originalQuality={originalQuality}
              cleanedQuality={cleanedQuality}
              cleaningLog={cleaningLog}
            />
          )}

          {currentView === 'visualizations' && visData && cleanedQuality && (
            <AnalyticsDashboard
              visData={visData}
              quality={cleanedQuality}
              onSelectColumn={handleSelectColumn}
            />
          )}

          {currentView === 'reports' && originalQuality && cleanedQuality && (
            <ReportExportModule
              originalQuality={originalQuality}
              cleanedQuality={cleanedQuality}
              filename={datasetMetadata?.filename}
              cleaningLog={cleaningLog}
            />
          )}
        </main>
      </div>

      {/* Smart Column Analysis Modal */}
      <SmartColumnModal
        details={selectedColumnDetails}
        onClose={() => setSelectedColumnDetails(null)}
      />
    </div>
  );
}

export default App;
