# NeuroAI — Production Deployment & Operations Guide

## 1. System Architecture Overview

NeuroAI is a compound AI medical imaging system consisting of:

```
┌─────────────────────────────────┐
│     Vercel Edge Network         │
│  React SPA (neuroai-frontend)   │
│  HTTPS · Auto-Deploys on push   │
└────────────────┬────────────────┘
                 │ REST API (HTTPS + CORS)
                 ▼
┌─────────────────────────────────┐
│     Render / Container Host     │
│   FastAPI Backend (Python 3.11) │
│   EfficientNetB0 (In-Memory)    │
│   /health · /ready · /diagnose  │
└────────────────┬────────────────┘
                 │ Async HTTPS
                 ▼
┌─────────────────────────────────┐
│   Hosted Mistral 7B / Cloud API │
│   (Mistral AI / Ollama / Groq)  │
│   Structured Diagnostic Report  │
└─────────────────────────────────┘
```

### Key Design & Reliability Decisions

1. **Decoupled Frontend & Backend**:
   - The React frontend is hosted on **Vercel** with global CDN distribution, HTTPS termination, and SPA routing rewrites.
   - The FastAPI backend is deployed on a persistent container or Python service (**Render**, **Railway**, or **Docker**).
2. **Deterministic CNN Inference**:
   - `brain_tumor_model.h5` (~25.4 MB) is loaded into RAM once at startup (`compile=False`).
   - Image tensor preprocessing (`224×224`, `float32`, EfficientNet `preprocess_input`) matches the exact training protocol.
   - Classification never mocks or fabricates predictions.
3. **Resilient Mistral Report Generation**:
   - The LLM service is decoupled from the image classifier in `llm_service.py`.
   - Supports:
     - **Mistral AI Cloud API** (`MISTRAL_API_KEY`) using `mistral-small-latest` or `open-mistral-7b`.
     - **Remote or Local Ollama** (`OLLAMA_URL` + `OLLAMA_MODEL`).
     - **OpenAI-Compatible providers** (Groq, Together, vLLM).
   - If the LLM provider times out or is unreachable, the API returns the genuine CNN classification results and an explicit service status notice, never crashing or inventing hallucinated clinical text.
4. **Security & Privacy**:
   - Strict CORS: Only authorized frontend origins are permitted via `ALLOWED_ORIGINS`.
   - Upload validation: Verifies file size (default max 10MB), non-empty payload, and image byte headers via Pillow before tensor conversion.
   - Zero image retention: Scans are processed in memory and discarded immediately; no patient images or identifying logs are stored.
   - Clear educational/research disclaimer on all responses and UI views.

---

## 2. Environment Variables Specification

### Backend Environment Variables (`render.yaml` or container `.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Auto by host | `8000` | Port for ASGI web service. |
| `ALLOWED_ORIGINS` | **Yes (Prod)** | `http://localhost:3000` | Comma-separated list of allowed frontend origins (e.g., `https://your-neuroai.vercel.app`). |
| `MODEL_PATH` | No | `./brain_tumor_model.h5` | Path to trained HDF5 model weights. |
| `MAX_UPLOAD_SIZE_MB` | No | `10` | Maximum allowable upload file size in megabytes. |
| `LLM_PROVIDER` | No | `mistral` | LLM backend: `mistral`, `ollama`, or `openai_compatible`. |
| `MISTRAL_API_KEY` | **Recommended** | `""` | API key from [Mistral AI Console](https://console.mistral.ai/). |
| `MISTRAL_MODEL` | No | `mistral-small-latest` | Mistral model identifier. |
| `MISTRAL_API_URL` | No | `https://api.mistral.ai/v1/chat/completions` | Mistral endpoint. |
| `OLLAMA_URL` | If using Ollama | `http://localhost:11434/api/generate` | Remote or local Ollama URL. |
| `OLLAMA_MODEL` | If using Ollama | `mistral` | Model name on Ollama instance. |
| `LLM_TIMEOUT_SECONDS`| No | `45.0` | Timeout in seconds for LLM generation requests. |

### Frontend Environment Variables (Vercel Project Settings)

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_API_URL` | **Yes** | Deployed backend HTTPS URL (e.g., `https://neuroai-backend.onrender.com`). |

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Deploy Backend (Render)

1. Sign in to [Render](https://dashboard.render.com/).
2. Click **New +** → **Blueprint** (or **Web Service**).
3. Connect your GitHub repository `https://github.com/allanpaulraj/neuroai`.
4. Render will detect `render.yaml`:
   - **Service Name**: `neuroai-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install --no-cache-dir -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Standard (2 GB+ RAM recommended for in-memory TensorFlow inference)
5. Under **Environment Variables**:
   - Set `MISTRAL_API_KEY`: Paste your key from `https://console.mistral.ai/`.
   - Set `ALLOWED_ORIGINS`: Set temporarily to `*` or leave to update once frontend URL is ready.
6. Click **Apply / Deploy**.
7. Once deployed, test the health check in your browser or terminal:
   ```bash
   curl https://your-backend.onrender.com/health
   curl https://your-backend.onrender.com/ready
   ```
   Confirm `"status": "ready"` and `"model_loaded": true`.

---

### Step 2: Deploy Frontend (Vercel)

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New…** → **Project**.
3. Import the `allanpaulraj/neuroai` repository.
4. In **Project Configuration**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `neuroai-frontend` (or leave default if using root `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. In **Environment Variables**:
   - Add `REACT_APP_API_URL` = `https://your-backend.onrender.com` (your actual Render backend URL).
6. Click **Deploy**.
7. Vercel will build and assign a production HTTPS URL (e.g., `https://neuroai-frontend.vercel.app`).
8. Return to Render and update `ALLOWED_ORIGINS` to `https://neuroai-frontend.vercel.app` for strict CORS security.

---

### Step 3: Containerized Alternative (Docker / Cloud Run / Railway / Fly.io)

A production Dockerfile is included. To run or deploy with Docker:

```bash
# Build the container image
docker build -t neuroai-backend:latest .

# Run container locally or on any cloud server
docker run -d \
  -p 8000:8000 \
  -e ALLOWED_ORIGINS="https://your-neuroai.vercel.app" \
  -e MISTRAL_API_KEY="your_api_key_here" \
  -e LLM_PROVIDER="mistral" \
  --name neuroai-api \
  neuroai-backend:latest
```

---

## 4. Local Development & Testing Instructions

### Run Backend Locally

```bash
# From repository root
pip install -r requirements.txt

# Start backend server
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Run automated backend test suite
python test_backend.py
```

### Run Frontend Locally

```bash
# From neuroai-frontend directory
cd neuroai-frontend

# Install dependencies
npm ci

# Run test suite
npm test -- --watchAll=false

# Run local development server
npm start
```

---

## 5. Automated CI/CD (GitHub Actions)

The repository includes `.github/workflows/ci-cd.yml` which executes automatically on every push and pull request to `main`:

1. **Backend Validation**:
   - Sets up Python 3.11.
   - Compiles Python syntax for `app.py` and `llm_service.py`.
   - Executes model verification and import smoke tests.
2. **Frontend Validation**:
   - Sets up Node.js 20.
   - Installs clean dependencies with `npm ci`.
   - Runs automated Jest tests (`App.test.js`).
   - Executes production build check with `CI=true`.
3. **Deployment Trigger**:
   - If secrets (`RENDER_DEPLOY_HOOK_URL`) are configured in GitHub Secrets, triggers automatic production rollout.
   - Vercel automatically deploys updates upon push to `main`.

---

## 6. Rollback Procedures

If a deployment exhibits regressions:

### Frontend (Vercel)
1. Go to **Vercel Dashboard** → Select **NeuroAI Project** → **Deployments**.
2. Locate the previous working deployment.
3. Click the three dots `...` → **Instant Rollback**.
4. Traffic routes to the previous production deployment within seconds.

### Backend (Render / Docker)
1. In the **Render Dashboard** → Select `neuroai-backend` → **Deploys**.
2. Select the last known-good build and click **Rollback to this deploy**.
3. Alternatively, git revert the offending commit and push to `main`:
   ```bash
   git revert HEAD
   git push origin main
   ```
