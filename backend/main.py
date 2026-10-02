from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import upload, analysis, cleaning, reports

app = FastAPI(
    title="Data Cleaning & Reporting Automation Engine",
    description="Automated data preprocessing, diagnostics, visual analytics, and report generation API.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(upload.router)
app.include_router(analysis.router)
app.include_router(cleaning.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "Data Cleaning & Reporting Automation System",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
