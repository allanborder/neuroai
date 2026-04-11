🧠 NeuroAI — Brain Tumor MRI Classification & Diagnostic Report Generator
NeuroAI is a full-stack AI-powered medical imaging web application that classifies brain MRI scans into four categories — Glioma, Meningioma, Pituitary Tumor, and No Tumor — and automatically generates a structured, patient-friendly diagnostic report using a local LLM.

🚀 Features

🔬 Deep Learning Classification — Fine-tuned EfficientNetB0 CNN trained on thousands of brain MRI scans with two-phase transfer learning for maximum accuracy
⚖️ Class Imbalance Handling — Uses sklearn's compute_class_weight to fairly train on imbalanced tumor categories
📊 Confidence Scoring — Returns per-class probabilities alongside the top prediction so you always know how certain the model is
🤖 AI Diagnostic Reports — Integrates a local Mistral LLM via Ollama to generate a 5-section structured report: Scan Summary, Condition Explanation, Confidence Interpretation, Next Steps, and Questions for Your Doctor
⚡ FastAPI Backend — Async, production-ready REST API with a /diagnose endpoint and a /health check
🌐 React Frontend — Clean, responsive UI for uploading MRI scans and viewing results
🔒 Fully Local & Private — The LLM runs on your own machine via Ollama; no patient data leaves your system
🛡️ Safety Disclaimers — Every report is clearly flagged as AI-generated and for educational purposes only


🧬 Model Architecture

Base: EfficientNetB0 pretrained on ImageNet
Phase 1: Top layers trained with frozen base (Adam, lr=0.001)
Phase 2: Fine-tuning with last 60 layers unfrozen (Adam, lr=5e-6)
Regularization: Dropout (0.5 + 0.3), Batch Normalization, Label Smoothing
Augmentation: Flips, zoom, rotation, shifts, shear, brightness variation
Input: 224×224 RGB, EfficientNet-native preprocessing


🛠️ Tech Stack
LayerTechnologyFrontendReactBackendFastAPI, PythonDeep LearningTensorFlow / KerasLLMMistral via OllamaImage ProcessingPillow, NumPyML Utilitiesscikit-learn


⚠️ Disclaimer: NeuroAI is intended for educational and research purposes only. It is not a substitute for professional medical diagnosis. Always consult a qualified radiologist or neurologist.
