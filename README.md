# NeuroAI – AI-Powered Brain Tumor Classification & Diagnostic Report Generation

## Overview

NeuroAI is a full-stack medical imaging application that combines deep learning and large language models to assist in brain MRI analysis. The system classifies MRI scans into four categories and automatically generates a structured, patient-friendly diagnostic report.

The project integrates a fine-tuned EfficientNetB0 convolutional neural network for tumor classification and a locally hosted Mistral LLM through Ollama for intelligent report generation.

**Disclaimer:** This project is developed for educational and research purposes only and is not intended to replace professional medical diagnosis.

---

## Problem Statement

Brain tumor diagnosis requires careful interpretation of MRI scans by trained radiologists. NeuroAI explores how artificial intelligence can assist this process by:

* Automating MRI image classification
* Providing prediction confidence scores
* Generating understandable diagnostic summaries
* Demonstrating the integration of Computer Vision and Generative AI in healthcare

---

## System Architecture

### Frontend Layer

**React.js**

Responsible for:

* MRI image upload interface
* Prediction visualization
* Confidence score display
* Diagnostic report presentation
* Responsive user experience

---

### Backend Layer

**FastAPI**

Responsible for:

* Handling MRI uploads
* Image preprocessing
* Model inference
* LLM communication
* API response generation

---

### AI Layer

#### Deep Learning Model

**EfficientNetB0 (TensorFlow)**

Functions:

* Brain MRI feature extraction
* Tumor classification
* Confidence score prediction

Classes:

1. Glioma Tumor
2. Meningioma Tumor
3. Pituitary Tumor
4. No Tumor

---

#### Report Generation Model

**Mistral LLM via Ollama**

Functions:

* Interprets classification results
* Creates structured medical summaries
* Generates patient-friendly explanations
* Produces standardized report sections

---

## Architecture Flow

MRI Upload
↓
React Frontend
↓
FastAPI Backend
↓
Image Validation
↓
Preprocessing Pipeline
↓
EfficientNetB0 Inference
↓
Class Prediction + Confidence Scores
↓
Mistral LLM Prompt Construction
↓
Diagnostic Report Generation
↓
Response Returned to Frontend
↓
Prediction Dashboard Display

---

## Core Modules

### 1. MRI Upload & Validation

Users upload brain MRI scans through the web interface.

The system performs:

* File validation
* Format verification
* Secure upload handling
* Input preprocessing checks

---

### 2. Image Preprocessing Pipeline

Before inference, each MRI image undergoes:

* Image resizing to 224×224
* Pixel normalization
* Tensor conversion
* Batch preparation

This ensures compatibility with the EfficientNetB0 architecture.

---

### 3. Brain Tumor Classification Engine

The classification model is based on EfficientNetB0 transfer learning.

Features:

* Pretrained ImageNet weights
* Custom classification head
* Four-class prediction output
* Probability-based confidence scoring

Output Classes:

| Class      | Description                          |
| ---------- | ------------------------------------ |
| Glioma     | Brain tumor arising from glial cells |
| Meningioma | Tumor originating from meninges      |
| Pituitary  | Tumor affecting the pituitary gland  |
| No Tumor   | No detectable tumor pattern          |

---

### 4. Confidence Score Analysis

Instead of returning only the predicted class, NeuroAI provides probability scores for all classes.

Example:

Glioma → 92.4%

Meningioma → 3.8%

Pituitary → 2.1%

No Tumor → 1.7%

This improves transparency and model interpretability.

---

### 5. AI Report Generation System

After prediction, classification results are sent to a locally hosted Mistral LLM using Ollama.

The LLM generates a structured diagnostic report containing:

1. Prediction Summary
2. Tumor Description
3. Clinical Significance
4. Recommended Medical Consultation
5. Disclaimer & Next Steps

Reports are generated in natural language and designed to be understandable by non-technical users.

---

## Model Training Strategy

### Transfer Learning Phase

* EfficientNetB0 pretrained on ImageNet
* Base layers frozen
* Custom dense layers trained

### Fine-Tuning Phase

* Selected backbone layers unfrozen
* Lower learning rate applied
* Domain-specific MRI features learned

Benefits:

* Faster convergence
* Better feature extraction
* Improved classification accuracy

---

## Class Imbalance Handling

Medical datasets often contain uneven class distributions.

To improve model fairness:

* Class weights were computed
* Minority classes received higher training importance
* Loss contribution was balanced across categories

This reduces prediction bias toward dominant classes.

---

## Database-Free Inference Design

The application follows a lightweight inference-first architecture.

Advantages:

* Faster deployment
* Lower resource consumption
* Simplified scalability
* Reduced operational complexity

---

## Technical Highlights

* Brain MRI tumor classification using EfficientNetB0
* Four-class prediction system
* Transfer learning with fine-tuning
* Confidence score visualization
* FastAPI-powered inference APIs
* React-based frontend dashboard
* Local LLM integration through Ollama
* Automated diagnostic report generation
* Fully offline AI inference capability

---

## Tech Stack

### Frontend

* React.js
* JavaScript
* CSS

### Backend

* FastAPI
* Python

### Machine Learning

* TensorFlow
* EfficientNetB0
* NumPy
* OpenCV

### Generative AI

* Mistral LLM
* Ollama

### Development Tools

* Git
* GitHub

---

## Learning Outcomes

This project strengthened my understanding of:

* Computer Vision
* Medical Image Classification
* Transfer Learning
* CNN Architecture Design
* Model Fine-Tuning
* FastAPI Development
* React Frontend Integration
* LLM Prompt Engineering
* AI System Architecture
* End-to-End Machine Learning Deployment

NeuroAI demonstrates how Deep Learning and Large Language Models can be combined to create intelligent healthcare-focused applications that deliver both accurate predictions and human-readable insights.

LayerTechnologyFrontendReactBackendFastAPI, PythonDeep LearningTensorFlow / KerasLLMMistral via OllamaImage ProcessingPillow, NumPyML Utilitiesscikit-learn


⚠️ Disclaimer: NeuroAI is intended for educational and research purposes only. It is not a substitute for professional medical diagnosis. Always consult a qualified radiologist or neurologist.
