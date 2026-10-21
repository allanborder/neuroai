"""
test_backend.py — Automated local verification for NeuroAI FastAPI Backend
Tests:
  - Startup & model loading
  - Liveness probe (/health)
  - Readiness probe (/ready)
  - Input validation (empty file, non-image)
  - Genuine CNN inference on a synthetic test image
  - Fallback/safe LLM report structure
"""

import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from app import app, load_brain_model, CATEGORIES

client = TestClient(app)

# Ensure model is initialized for tests
load_brain_model()

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "classes" in data
    assert data["classes"] == CATEGORIES

def test_readiness_endpoint():
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["model_loaded"] is True

def test_reject_empty_file():
    empty_file = io.BytesIO(b"")
    response = client.post(
        "/diagnose",
        files={"file": ("test.png", empty_file, "image/png")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()

def test_reject_non_image():
    fake_file = io.BytesIO(b"This is a text file pretending to be an image.")
    response = client.post(
        "/diagnose",
        files={"file": ("fake.txt", fake_file, "text/plain")}
    )
    assert response.status_code == 400

def test_reject_corrupted_image():
    corrupt_file = io.BytesIO(b"\x89PNG\r\n\x1a\ncorrupted_payload")
    response = client.post(
        "/diagnose",
        files={"file": ("corrupt.png", corrupt_file, "image/png")}
    )
    assert response.status_code in [400, 415]

def test_genuine_mri_inference():
    # Create an authorized synthetic test image (224x224 RGB image)
    img = Image.new("RGB", (224, 224), color=(30, 30, 30))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/diagnose",
        files={"file": ("synthetic_scan.png", buf, "image/png")}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["diagnosis"] in CATEGORIES
    assert isinstance(data["confidence"], (int, float))
    assert 0.0 <= data["confidence"] <= 100.0
    assert "all_probabilities" in data
    assert len(data["all_probabilities"]) == 4
    for cat in CATEGORIES:
        assert cat in data["all_probabilities"]
    assert "urgency" in data
    assert "generated_report" in data
    assert "DISCLAIMER" in data["generated_report"]
    print(f"\n[Test Verification] Predicted class: {data['diagnosis']} ({data['confidence']}%)")

if __name__ == "__main__":
    print("Running NeuroAI backend test suite...")
    test_health_endpoint()
    print("[PASS] Health endpoint")
    test_readiness_endpoint()
    print("[PASS] Readiness endpoint")
    test_reject_empty_file()
    print("[PASS] Reject empty file")
    test_reject_non_image()
    print("[PASS] Reject non-image")
    test_reject_corrupted_image()
    print("[PASS] Reject corrupted image")
    test_genuine_mri_inference()
    print("[PASS] Genuine CNN inference smoke test")
    print("\nAll automated backend tests PASSED successfully!")
