import { DatasetMetadata, QualityAnalysis, VisualizationsData, ColumnDetails } from '../types';

const API_BASE = '/api';

export async function uploadFile(file: File): Promise<{ data: DatasetMetadata }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function loadDemo(): Promise<{ data: DatasetMetadata }> {
  const res = await fetch(`${API_BASE}/load-demo`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to load demo dataset');
  }
  return res.json();
}

export async function getDatasetPreview(datasetType: 'cleaned' | 'original' = 'cleaned'): Promise<{ data: DatasetMetadata }> {
  const res = await fetch(`${API_BASE}/dataset-preview?dataset_type=${datasetType}`);
  if (!res.ok) throw new Error('Failed to fetch preview');
  return res.json();
}

export async function analyzeDataset(): Promise<{ original_quality: QualityAnalysis; cleaned_quality: QualityAnalysis; cleaning_log: string[]; filename: string }> {
  const res = await fetch(`${API_BASE}/analyze`, { method: 'POST' });
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
}

export async function autoClean(): Promise<{ quality: QualityAnalysis; cleaning_log: string[]; message: string }> {
  const res = await fetch(`${API_BASE}/clean/auto-clean`, { method: 'POST' });
  if (!res.ok) throw new Error('Auto-clean failed');
  return res.json();
}

export async function cleanMissing(column: string, strategy: string, customValue?: string) {
  const res = await fetch(`${API_BASE}/clean/missing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column, strategy, custom_value: customValue })
  });
  if (!res.ok) throw new Error('Cleaning missing values failed');
  return res.json();
}

export async function cleanDuplicates(subsetColumns?: string[], keep: string = 'first') {
  const res = await fetch(`${API_BASE}/clean/duplicates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subset_columns: subsetColumns, keep })
  });
  if (!res.ok) throw new Error('Removing duplicates failed');
  return res.json();
}

export async function cleanInconsistent(column: string, action: string) {
  const res = await fetch(`${API_BASE}/clean/inconsistent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column, action })
  });
  if (!res.ok) throw new Error('Text standardization failed');
  return res.json();
}

export async function cleanDtypes(column: string, targetType: string) {
  const res = await fetch(`${API_BASE}/clean/dtypes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column, target_type: targetType })
  });
  if (!res.ok) throw new Error('Data type conversion failed');
  return res.json();
}

export async function cleanOutliers(column: string, method: string, action: string, threshold: number = 1.5) {
  const res = await fetch(`${API_BASE}/clean/outliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column, method, action, threshold })
  });
  if (!res.ok) throw new Error('Outlier handling failed');
  return res.json();
}

export async function resetCleaning() {
  const res = await fetch(`${API_BASE}/clean/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Reset failed');
  return res.json();
}

export async function getVisualizations(): Promise<{ data: VisualizationsData }> {
  const res = await fetch(`${API_BASE}/visualizations`);
  if (!res.ok) throw new Error('Failed to fetch visualizations data');
  return res.json();
}

export async function getColumnDetails(colName: string): Promise<{ data: ColumnDetails }> {
  const res = await fetch(`${API_BASE}/column-details/${encodeURIComponent(colName)}`);
  if (!res.ok) throw new Error('Failed to fetch column details');
  return res.json();
}

export function getExportUrl(type: 'csv' | 'excel' | 'pdf'): string {
  if (type === 'csv') return `${API_BASE}/export/csv`;
  if (type === 'excel') return `${API_BASE}/export/excel`;
  return `${API_BASE}/generate-report`;
}
