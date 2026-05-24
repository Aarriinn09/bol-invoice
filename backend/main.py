import os
import uuid
import shutil
import tempfile
from pathlib import Path
from datetime import datetime, timedelta

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

from database import engine, Base
from routers import auth_router, product_router, invoice_router, customer_router

load_dotenv()

# ── Create tables on startup ──────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="BOL Invoice API", version="4.0")

# ── CORS ─────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── PDF storage ───────────────────────────────────────────────────────────────
PDF_DIR = Path(os.getenv("PDF_DIR", "pdfs"))
PDF_DIR.mkdir(exist_ok=True, parents=True)
app.mount("/pdfs", StaticFiles(directory=str(PDF_DIR)), name="pdfs")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(product_router.router)
app.include_router(invoice_router.router)
app.include_router(customer_router.router)

# ── Whisper model ─────────────────────────────────────────────────────────────
from faster_whisper import WhisperModel

print("Loading Whisper model...")
model = WhisperModel("small", device="cpu", compute_type="int8")
print("Model ready!")


# ── Correction layer ──────────────────────────────────────────────────────────
def apply_corrections(text: str) -> str:
    t = text.lower().strip()
    for ch in ['.', '!', '?', ':', ';']:
        t = t.replace(ch, '')
    t = t.replace(',', ' ').replace('-', ' ')
    corrections = {
        "that's the loop": "das rupay",
        "does rupee":      "das rupay",
        "ladies":          "lays",
        "lace":            "lays",
        "lazy":            "lays",
        "shockley":        "chocolate",
        "these":           "bees",
        "freeze":          "bees",
        "threes":          "tees",
        "freddy":          "parle g",
        "dost":            "das",
    }
    for wrong, right in corrections.items():
        t = t.replace(wrong, right)
    return ' '.join(t.split())


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "BOL API v4.0 running",
        "model":  "faster-whisper small",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    if not audio.content_type.startswith("audio/"):
        raise HTTPException(
            status_code=400,
            detail=f"Expected audio, got {audio.content_type}"
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        segments, info = model.transcribe(
            tmp_path,
            language=None,
            task="transcribe",
            beam_size=5,
            best_of=5,
            temperature=0.0,
            condition_on_previous_text=False,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=300),
            initial_prompt=(
                "Invoice items with prices: "
                "lays, pepsi, chips, dairy milk, "
                "maggi, kurkure, bisleri"
            ),
        )
        text = " ".join(s.text.strip() for s in segments).strip()
        text = apply_corrections(text)
        print(f"Transcribed: '{text}'")

        return {
            "text":       text,
            "language":   info.language,
            "confidence": round(info.language_probability, 2),
        }

    except Exception as e:
        print(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.post("/invoices/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    invoice_number: str = Form(""),
):
    """Receive PDF from frontend, save it, return public URL"""
    filename  = f"{invoice_number}.pdf" if invoice_number else f"{uuid.uuid4()}.pdf"
    file_path = PDF_DIR / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Use environment variable for base URL
    base_url = os.getenv("API_BASE_URL", "http://localhost:8000")

    return {
        "url":      f"{base_url}/pdfs/{filename}",
        "filename": filename,
    }