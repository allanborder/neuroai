# app.py — NeuroAI FastAPI Backend
# Brain MRI Classification + Local Mistral LLM Report
# Run: uvicorn app:app --reload --port 8000

import os
import io
import json
import httpx
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(title="NeuroAI", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Config ────────────────────────────────────────────────────────────────────
OLLAMA_URL   = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "mistral"
IMAGE_SIZE   = (224, 224)
CATEGORIES   = ["Glioma", "Meningioma", "No Tumor", "Pituitary"]

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

DISCLAIMER = (
    "\n\n⚠️ DISCLAIMER: This report is AI-generated for EDUCATIONAL PURPOSES ONLY. "
    "It is NOT a substitute for professional medical diagnosis. "
    "Always consult a qualified radiologist or neurologist."
)

# ── Load model ONCE at startup ────────────────────────────────────────────────
model_path = os.path.join(os.path.dirname(__file__), "brain_tumor_model.h5")
model = tf.keras.models.load_model(model_path)
print(f"[NeuroAI] ✅ Model loaded from {model_path}")


# ── Helpers ───────────────────────────────────────────────────────────────────

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    MUST match exactly what was used during training:
      - Resize to 224×224
      - Convert to float32
      - Apply EfficientNet's preprocess_input (scales to [-1, 1] internally)
      - Do NOT divide by 255 — preprocess_input handles normalisation
    """
    img = (
        Image.open(io.BytesIO(image_bytes))
        .convert("RGB")
        .resize(IMAGE_SIZE)
    )
    arr = np.array(img, dtype=np.float32)          # shape: (224, 224, 3)
    arr = preprocess_input(arr)                     # ✅ same as training
    return np.expand_dims(arr, axis=0)              # shape: (1, 224, 224, 3)


async def call_ollama(prompt: str) -> str:
    """Send prompt to local Ollama and return text response."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            OLLAMA_URL,
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
        )
        resp.raise_for_status()
        return resp.json()["response"]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/diagnose")
async def diagnose_mri(file: UploadFile = File(...)):
    """
    1. CNN classifies the uploaded MRI into one of 4 classes.
    2. Local Mistral LLM generates a structured diagnostic report.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files accepted.")

    image_bytes = await file.read()

    # ── Step 1: CNN inference ──
    tensor     = preprocess_image(image_bytes)
    preds      = model.predict(tensor, verbose=0)[0]
    idx        = int(np.argmax(preds))
    diagnosis  = CATEGORIES[idx]
    confidence = round(float(preds[idx]) * 100, 2)
    all_probs  = {
        cat: round(float(preds[i]) * 100, 2)
        for i, cat in enumerate(CATEGORIES)
    }
    meta = TUMOR_INFO[diagnosis]

    # ── Step 2: LLM report ──
    prompt = f"""You are a neuro-radiology AI assistant. A CNN model analyzed a brain MRI and found:

- Diagnosis: {diagnosis}
- Confidence: {confidence}%
- All class probabilities: {json.dumps(all_probs)}
- Condition: {meta['description']}
- Common symptoms: {meta['symptoms']}
- Urgency: {meta['urgency']}

Write a clear, structured diagnostic report with these 5 sections:

1. Scan Summary — what was detected and the confidence level
2. About This Condition — explain {diagnosis} in simple, patient-friendly language
3. Interpreting the Confidence — what {confidence}% means; flag uncertainty if below 75%
4. Recommended Next Steps — 3 specific actions for the patient or doctor
5. Questions to Ask Your Doctor — 3 relevant questions for a specialist visit

Be professional, compassionate, and concise (2-3 sentences per section)."""

    report = await call_ollama(prompt) + DISCLAIMER

    return {
        "diagnosis":        diagnosis,
        "confidence":       confidence,
        "all_probabilities": all_probs,
        "urgency":          meta["urgency"],
        "generated_report": report,
    }


@app.get("/health")
async def health():
    return {
        "status":      "ok",
        "model":       model_path,
        "llm":         f"Ollama / {OLLAMA_MODEL}",
        "classes":     CATEGORIES,
    }