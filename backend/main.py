from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# --- CORS (important for frontend → backend communication) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Health check ---
@app.get("/")
def root():
    return {"status": "Backend is running"}

# --- Analyze endpoint ---
@app.post("/analyze-paper")
async def analyze_paper(file: UploadFile = File(...)):
    """
    Receives a PDF file and returns dummy analysis for now.
    """
    return {
        "filename": file.filename,
        "core_problem": "What problem the paper is trying to solve",
        "key_idea": "The main insight proposed by the authors",
        "method": "High-level description of the approach",
        "assumptions": [
            "Data is clean",
            "Model assumptions hold"
        ],
        "mental_model": "Diagram will be generated later"
    }
