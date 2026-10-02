export interface ColumnInfo {
  name: string;
  data_type: string;
  inferred_type: string;
  null_count: number;
  null_percentage: number;
}

export interface DatasetMetadata {
  filename: string;
  total_rows: number;
  total_columns: number;
  columns: ColumnInfo[];
  preview: Record<string, any>[];
}

export interface QualityScore {
  score: number;
  rating: string;
  breakdown: {
    missing_penalty: number;
    duplicate_penalty: number;
    inconsistency_penalty: number;
    outlier_penalty: number;
  };
}

export interface QualityAnalysis {
  dataset_info: {
    total_rows: number;
    total_columns: number;
    numerical_columns_count: number;
    categorical_columns_count: number;
    date_columns_count: number;
    numerical_columns: string[];
    categorical_columns: string[];
    date_columns: string[];
  };
  quality_score: QualityScore;
  quality_indicators: {
    missing_cells: number;
    missing_percentage: number;
    missing_by_column: {
      column: string;
      missing_count: number;
      missing_percentage: number;
      recommended_action: string;
    }[];
    duplicate_rows: number;
    duplicate_percentage: number;
    inconsistent_columns: {
      column: string;
      whitespace_issues: number;
      case_variations: number;
      sample_variations: string[];
    }[];
    data_type_issues: {
      column: string;
      current_type: string;
      suggested_type: string;
      reason: string;
    }[];
    outliers_found: {
      column: string;
      outlier_count: number;
      outlier_percentage: number;
    }[];
    outlier_total_count: number;
  };
}

export interface ColumnDetails {
  column_name: string;
  data_type: string;
  total_values: number;
  missing_count: number;
  missing_percentage: number;
  unique_values_count: number;
  sample_values: any[];
  is_numeric: boolean;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
  outliers_count?: number;
  top_categories?: { category: string; count: number }[];
  mode?: string;
}

export interface VisualizationsData {
  missing_values_chart: { column: string; missing_count: number; missing_percentage: number }[];
  data_types_chart: { name: string; value: number }[];
  numeric_charts: Record<string, {
    histogram: { bin: string; frequency: number }[];
    boxplot: { min: number; q1: number; median: number; q3: number; max: number; outliers_count: number };
  }>;
  categorical_charts: Record<string, { category: string; count: number }[]>;
  correlation_matrix: { x: string; y: string; value: number }[];
  comparison_metrics: {
    rows: { before: number; after: number };
    missing_values: { before: number; after: number };
    duplicate_rows: { before: number; after: number };
    outliers: { before: number; after: number };
    quality_score: { before: number; after: number };
    score_improvement: number;
  };
}
