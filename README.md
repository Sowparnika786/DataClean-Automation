# Data Cleaning & Reporting Automation System

An automated end-to-end data preprocessing, diagnostic analytics, visual dashboard, and report generation web application built with **Python FastAPI**, **Pandas**, **React (TypeScript)**, **Tailwind CSS**, and **Recharts**.

---

## 📌 Project Overview

Raw datasets often suffer from missing values, duplicate entries, text formatting inconsistencies, mixed data types, and statistical outliers. Manually cleaning large datasets in spreadsheets or writing custom pandas code repeatedly is slow, error-prone, and inefficient.

The **Data Cleaning & Reporting Automation System** automates this entire pipeline. Users can upload messy CSV/Excel datasets, run an instant automated diagnostic, apply 1-click auto-cleaning or fine-grained manual transformations, compare before/after metrics (+quality improvement badge), view interactive visual analytics, and export executive PDF reports and 5-sheet Excel workbooks.

---

## 🎯 Objectives & Features

- **Automated Data Quality Analysis**: Instant calculation of composite **Data Quality Score (0–100)** with rating breakdown (Excellent, Good, Needs Improvement, Poor).
- **1-Click Auto-Clean Engine**: Performs 10 sequential automated transformations while preserving the original uploaded dataset intact.
- **Missing Value Imputation**: Smart recommendations (mean, median, mode, zero, unknown, row removal) for numeric and categorical fields.
- **Duplicate Purging**: Identifies exact and column-subset duplicates with keep first/last rules.
- **Text Standardization**: Normalizes whitespace, casing variations (e.g., `Coimbatore`, `coimbatore` → `Coimbatore`), and category synonyms (`M`, `male` → `Male`).
- **Data Type Coercion**: Coerces currency strings (`₹45,000`), integer strings (`"25"`), and mixed date formats (`02/10/2026`) into standard numeric and YYYY-MM-DD datetime types.
- **Outlier Detection & Capping**: Identifies anomalies using IQR and Z-score models with capping (winsorizing) or median replacement.
- **Before vs After Comparison Matrix**: Side-by-side metric comparison and chronological step-by-step audit action trail.
- **Interactive Visual Dashboard**: Recharts-powered distribution histograms, box plot statistics, frequency bar charts, data type donut charts, and correlation heatmaps.
- **Smart Column Analysis Modal**: Deep statistics per clicked column (min, max, mean, median, std, mode, top frequencies).
- **Multi-Format Reporting & Export**:
  - Download Cleaned CSV
  - Download Cleaned Excel (5 structured sheets: *Cleaned Data*, *Data Summary*, *Cleaning Log*, *Missing Value Report*, *Statistical Summary*)
  - Download Executive PDF Report (7-section report complete with scorecards)
  - Download Audit Log JSON

---

## 🏗️ Architecture & Technology Stack

```text
DataClean-Automation/
│
├── backend/
│   ├── main.py                     # FastAPI application entrypoint & CORS middleware
│   ├── routes/
│   │   ├── upload.py               # File upload, demo dataset loader, preview router
│   │   ├── analysis.py             # Data quality analyzer, stats, visualizations router
│   │   ├── cleaning.py             # Imputation, deduplication, standardization router
│   │   └── reports.py              # CSV, 5-sheet Excel, and PDF export router
│   │
│   ├── services/
│   │   ├── data_loader.py          # CSV/Excel parsing and metadata extraction
│   │   ├── quality_analyzer.py     # Quality score (0-100) & diagnostics engine
│   │   ├── cleaner.py              # Modular & auto-clean transformation engine
│   │   ├── outlier_detector.py     # IQR and Z-Score detection & capping
│   │   ├── visualizer.py           # Summary stats & Recharts payload builder
│   │   └── report_generator.py     # OpenPyXL 5-sheet workbook & ReportLab PDF builder
│   │
│   └── utils/
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Sidebar, Header, WorkflowBar, LandingPage, UploadModule,
│   │   │                           # QualityDashboard, CleaningEngine, ComparisonDashboard,
│   │   │                           # AnalyticsDashboard, SmartColumnModal, ReportExportModule
│   │   ├── services/api.ts         # API wrapper client for backend endpoints
│   │   ├── types/index.ts          # TypeScript interfaces
│   │   ├── App.tsx                 # Main application view & state manager
│   │   ├── index.css               # Tailwind CSS rules
│   │   └── main.tsx                # React DOM root
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── datasets/
│   └── sample_sales_data.csv       # Messy customer sales dataset for demonstration
│
├── requirements.txt
└── README.md
```

### Technology Stack
- **Backend**: Python 3.14, FastAPI, Uvicorn, Pandas, NumPy, OpenPyXL, ReportLab, Scikit-learn
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons

---

## ⚡ Installation & How to Run

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Setup Backend
```bash
# Navigate to project directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
pip install -r ../requirements.txt

# Start FastAPI server (runs on http://localhost:8000)
uvicorn main:app --reload --port 8000
```

### 2. Setup Frontend
```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server (runs on http://localhost:3000)
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 📊 Sample Demo Dataset (`sample_sales_data.csv`)

The project includes a built-in messy Customer Sales Dataset (`datasets/sample_sales_data.csv`) featuring:
1. **Missing values**: Empty cells in `Age`, `Gender`, `Total_Amount`.
2. **Duplicate rows**: Exact duplicate rows and duplicate `Customer_ID` records.
3. **Text casing issues**: `Coimbatore`, `coimbatore`, ` COIMBATORE `; `Male`, `male`, `M`, `MALE`.
4. **Mixed date formats**: `02/10/2026`, `2026-10-02`, `10/02/2026`.
5. **Currency formatting**: `₹45,000`, `₹ 12500`, `$450`, `"25"`.
6. **Outliers**: Extreme sales amounts ($999,999) and negative quantities.

Clicking **Load Demo Dataset** inside the app allows instant testing of every cleaning and reporting feature.

---

## 🛠️ FastAPI REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload raw CSV/XLSX file |
| `POST` | `/api/load-demo` | Load sample sales dataset |
| `GET` | `/api/dataset-preview` | Get preview of uploaded/cleaned dataset |
| `POST` | `/api/analyze` | Execute data quality diagnostic & score |
| `POST` | `/api/clean/auto-clean` | Trigger 1-click 10-step cleaning pipeline |
| `POST` | `/api/clean/missing` | Impute or drop missing values |
| `POST` | `/api/clean/duplicates` | Purge exact or column duplicates |
| `POST` | `/api/clean/inconsistent` | Standardize text case & whitespace |
| `POST` | `/api/clean/dtypes` | Coerce data types to numeric/datetime |
| `POST` | `/api/clean/outliers` | Cap or remove statistical outliers |
| `POST` | `/api/clean/reset` | Reset dataset back to raw uploaded state |
| `GET` | `/api/visualizations` | Fetch Recharts visualization payload |
| `GET` | `/api/column-details/{col_name}` | Fetch detailed statistics for specific column |
| `POST` | `/api/export/csv` | Download cleaned CSV file |
| `POST` | `/api/export/excel` | Download 5-sheet Excel workbook |
| `POST` | `/api/generate-report` | Download 7-section Executive PDF Report |

---

## 🚀 Future Enhancements

- Automated anomaly detection using Isolation Forests
- Natural language query interface for dataset filtering
- Cloud storage integration (S3 / Google Cloud Storage)
