# app.py — NeuroAI FastAPI Backend
# Brain MRI Classification + Configurable Mistral LLM Report

import os
import io
import logging
import numpy as np
import tensorflow as tf
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError
from tensorflow.keras.applications.efficientnet import preprocess_input

from llm_service import generate_diagnostic_report, get_llm_config, DISCLAIMER

# ── Logging Configuration ─────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [NeuroAI] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("neuroai.api")

# ── Config & Constants ────────────────────────────────────────────────────────
IMAGE_SIZE = (224, 224)
CATEGORIES = ["Glioma", "Meningioma", "No Tumor", "Pituitary"]
MAX_FILE_SIZE_BYTES = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10")) * 1024 * 1024
SUPPORTED_IMAGE_FORMATS = {"JPEG", "JPG", "PNG", "WEBP", "BMP"}

TUMOR_INFO = {
    "Glioma": {
        "description": "a malignant tumor arising from glial cells in the brain or spine",
        "symptoms":    "headaches, seizures, memory loss, personality changes",
        "urgency":     "HIGH — requires immediate specialist consultation",
    },
    "Meningioma": {
        "description": "a typically benign tumor on the membranes surrounding the brain",
        "symptoms":    "gradual headaches, vision problems, hearing loss, memory difficulty",
        "urgency":     "MODERATE — requires specialist evaluation and monitoring",
    },
    "No Tumor": {
        "description": "no tumor detected in the provided MRI scan",
        "symptoms":    "N/A",
        "urgency":     "LOW — no immediate concern based on this scan alone",
    },
    "Pituitary": {
        "description": "a usually benign adenoma in the pituitary gland at the base of the brain",
        "symptoms":    "hormonal imbalances, vision changes, headaches, fatigue",
        "urgency":     "MODERATE — endocrinology and neurology evaluation recommended",
    },
}

# ── Global Model Reference ───────────────────────────────────────────────────
model = None
model_load_error = None
model_path = os.getenv("MODEL_PATH", os.path.join(os.path.dirname(__file__), "brain_tumor_model.h5"))

def load_brain_model():
    """Loads the trained CNN model into memory once."""
    global model, model_load_error
    if not os.path.exists(model_path):
        model_load_error = f"Model file not found at: {model_path}"
        logger.error(model_load_error)
        return False
    try:
        logger.info("Loading MRI classification model from %s...", model_path)
        # compile=False avoids recompiling unused training metrics during inference
        model = tf.keras.models.load_model(model_path, compile=False)
        model_load_error = None
        logger.info("Model loaded successfully into memory.")
        return True
    except Exception as exc:
        model_load_error = f"Failed to load model: {str(exc)}"
        logger.exception("Error loading model: %s", exc)
        return False


# ── Lifespan Startup & Shutdown ───────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    load_brain_model()
    yield

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="NeuroAI Backend",
    version="2.0.0",
    description="Brain MRI Classification (EfficientNetB0) & Diagnostic Reporting (Mistral)",
    lifespan=lifespan
)

# ── Dynamic CORS Configuration ───────────────────────────────────────────────
raw_origins = os.getenv("ALLOWED_ORIGINS", "").strip()
if not raw_origins:
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
elif raw_origins == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("Configured CORS allowed origins: %s", allowed_origins)


# ── Helpers ───────────────────────────────────────────────────────────────────

def validate_and_preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Validates uploaded image and produces the exact EfficientNetB0 tensor:
      - Validates non-empty and readable image headers via Pillow.
      - Resizes to 224x224.
      - Converts to float32.
      - Applies EfficientNet preprocess_input.
    """
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Uploaded file exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB."
        )

    try:
        # Verify valid image structure
        with Image.open(io.BytesIO(image_bytes)) as img_check:
            img_format = img_check.format
            if img_format not in SUPPORTED_IMAGE_FORMATS:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"Unsupported image format '{img_format}'. Supported formats: {', '.join(sorted(SUPPORTED_IMAGE_FORMATS))}."
                )
            img_check.verify()

        # Re-open for actual processing (verify closes file pointers)
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize(IMAGE_SIZE)
        arr = np.array(img, dtype=np.float32)
        arr = preprocess_input(arr)
        return np.expand_dims(arr, axis=0)

    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is not a valid or readable image."
        )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "NeuroAI",
        "status": "online",
        "version": "2.0.0",
        "endpoints": {
            "diagnose": "/diagnose (POST)",
            "health": "/health (GET)",
            "ready": "/ready (GET)"
        }
    }


@app.get("/health")
async def health():
    """Liveness check endpoint."""
    llm_info = get_llm_config()
    return {
        "status": "ok",
        "service": "NeuroAI",
        "version": "2.0.0",
        "model_loaded": model is not None,
        "llm_provider": llm_info["provider"],
        "classes": CATEGORIES,
    }


@app.get("/ready")
async def readiness():
    """Readiness probe: validates that the model is loaded and ready for inference."""
    if model is None:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "model_loaded": False,
                "error": model_load_error or "Model is not yet initialized"
            }
        )

    llm_info = get_llm_config()
    return {
        "status": "ready",
        "model_loaded": True,
        "llm_provider": llm_info["provider"],
        "classes": CATEGORIES,
    }


@app.post("/diagnose")
async def diagnose_mri(file: UploadFile = File(...)):
    """
    1. Validates and preprocesses the uploaded brain MRI scan.
    2. Runs CNN inference with EfficientNetB0 to classify tumor category and probabilities.
    3. Calls the configured Mistral LLM service to generate structured diagnostic report.
    """
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="MRI classification model is currently loading or unavailable."
        )

    # Validate content-type header
    content_type = file.content_type or ""
    if not (content_type.startswith("image/") or content_type == "application/octet-stream"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files (JPG, PNG, WebP) are accepted."
        )

    image_bytes = await file.read()
    tensor = validate_and_preprocess_image(image_bytes)

    # ── Step 1: CNN Inference ──
    try:
        preds = model.predict(tensor, verbose=0)[0]
    except Exception as exc:
        logger.exception("Inference failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Inference execution failed while processing the scan."
        )

    idx = int(np.argmax(preds))
    diagnosis = CATEGORIES[idx]
    confidence = round(float(preds[idx]) * 100, 2)
    all_probs = {
        cat: round(float(preds[i]) * 100, 2)
        for i, cat in enumerate(CATEGORIES)
    }
    meta = TUMOR_INFO[diagnosis]

    # ── Step 2: LLM Report Generation ──
    report, _ = await generate_diagnostic_report(
        diagnosis=diagnosis,
        confidence=confidence,
        all_probs=all_probs,
        meta=meta
    )

    return {
        "diagnosis": diagnosis,
        "confidence": confidence,
        "all_probabilities": all_probs,
        "urgency": meta["urgency"],
        "generated_report": report,
    }