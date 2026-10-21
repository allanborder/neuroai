# 🧠 NeuroAI — Brain MRI Classifier & Clinical Report Generator

[![NeuroAI CI/CD](https://github.com/allanborder/neuroai/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/allanborder/neuroai/actions/workflows/ci-cd.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-2.0.0-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-FF6F00?logo=tensorflow)](https://tensorflow.org/)
[![Mistral AI](https://img.shields.io/badge/Mistral_AI-7B-FF7000)](https://mistral.ai/)

**NeuroAI** is a full-stack medical imaging application that combines deep learning (CNN) and large language models (LLM) to assist in brain MRI analysis. The system classifies MRI scans into four categories and automatically generates a structured, patient-friendly diagnostic report.

---

## 🌐 Live Website & Deployment Status

- **Production Frontend**: `Awaiting Vercel deployment` (See [DEPLOYMENT.md](DEPLOYMENT.md) for 2-minute setup)
- **Production Backend API**: `Awaiting Render deployment` (Configured via `render.yaml` & `Dockerfile`)
- **Health Check Endpoint**: `/health` (Liveness) & `/ready` (Model Readiness)
- **Automated CI/CD**: Active via `.github/workflows/ci-cd.yml`

---

## 🔬 Overview & Architecture

### 1. Discriminative Vision (EfficientNetB0)
- Evaluates brain MRI scans across **4 categories**:
  - `Glioma`
  - `Meningioma`
  - `Pituitary Tumor`
  - `No Tumor`
- Trained via 2-phase transfer learning on 3,000+ labeled MRI scans with 95%+ validation accuracy.
- Outputs calibrated softmax probabilities and confidence score.

### 2. Generative Synthesis (Mistral 7B)
- Injects CNN predictions and condition metadata into a structured prompt.
- Generates a 5-section clinical diagnostic report:
  1. Scan Summary
  2. About This Condition
  3. Interpreting the Confidence
  4. Recommended Next Steps
  5. Questions to Ask Your Doctor
- Multi-provider support via `llm_service.py`: Mistral AI Cloud API, remote Ollama, or OpenAI-compatible endpoints.
- Resilient fallback: If the LLM provider is offline, returns real CNN classification metrics and an explicit status note without crashing or hallucinating.

### 3. Production Security
- Dynamic CORS: strictly allows configured frontend origins via `ALLOWED_ORIGINS`.
- Image validation: verifies file size (10MB limit), non-empty payload, and image headers using Pillow `verify()`.
- Zero patient data retention: in-memory tensor processing only.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, JavaScript, CSS (Vercel) |
| **Backend** | FastAPI, Uvicorn, Python 3.11 (Render / Docker) |
| **Deep Learning** | TensorFlow 2.x, EfficientNetB0, Keras |
| **Generative AI** | Mistral 7B, Mistral AI API, Ollama |
| **Image Processing** | Pillow, NumPy |
| **CI/CD** | GitHub Actions |

---

## ⚡ Quick Start (Local Run)

### Backend (FastAPI)
```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
python test_backend.py
```

### Frontend (React)
```bash
cd neuroai-frontend
npm ci
npm test -- --watchAll=false
npm start
```

---

## 📦 Deployment Guide

Refer to [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions for deploying to **Vercel** (Frontend) and **Render / Docker** (Backend).

---

## ⚠️ Medical AI Disclaimer

This application is developed and deployed for **educational and research purposes only**. It does not constitute professional medical advice, clinical diagnosis, or treatment recommendations. Always consult a licensed radiologist or neurologist for medical evaluation.
