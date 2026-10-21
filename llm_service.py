import os
import json
import logging
import httpx
from typing import Tuple, Dict, Any

logger = logging.getLogger("neuroai.llm")

# Medical Disclaimer (Preserved from original research code)
DISCLAIMER = (
    "\n\n⚠️ DISCLAIMER: This report is AI-generated for EDUCATIONAL PURPOSES ONLY. "
    "It is NOT a substitute for professional medical diagnosis. "
    "Always consult a qualified radiologist or neurologist."
)

def get_llm_config() -> Dict[str, Any]:
    """
    Resolves the LLM provider and settings from environment variables.
    Supported providers: 'mistral' (Mistral API), 'ollama' (local/remote Ollama), 'openai_compatible'.
    """
    provider = os.getenv("LLM_PROVIDER", "").strip().lower()
    mistral_key = os.getenv("MISTRAL_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip() or os.getenv("LLM_API_KEY", "").strip()
    ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate").strip()

    if not provider:
        if mistral_key:
            provider = "mistral"
        elif openai_key:
            provider = "openai_compatible"
        else:
            provider = "ollama"

    return {
        "provider": provider,
        "mistral_api_key": mistral_key,
        "mistral_api_url": os.getenv("MISTRAL_API_URL", "https://api.mistral.ai/v1/chat/completions").strip(),
        "mistral_model": os.getenv("MISTRAL_MODEL", "mistral-small-latest").strip(),
        "ollama_url": ollama_url,
        "ollama_model": os.getenv("OLLAMA_MODEL", "mistral").strip(),
        "openai_api_key": openai_key,
        "openai_api_base": os.getenv("OPENAI_API_BASE", "").strip() or os.getenv("LLM_API_BASE", "").strip(),
        "openai_model": os.getenv("LLM_MODEL", "mistralai/Mistral-7B-Instruct-v0.2").strip(),
        "timeout": float(os.getenv("LLM_TIMEOUT_SECONDS", "45.0")),
    }


def build_prompt(diagnosis: str, confidence: float, all_probs: Dict[str, float], meta: Dict[str, str]) -> str:
    """Builds the structured clinical prompt preserved from the original application."""
    return f"""You are a neuro-radiology AI assistant. A CNN model analyzed a brain MRI and found:

- Diagnosis: {diagnosis}
- Confidence: {confidence}%
- All class probabilities: {json.dumps(all_probs)}
- Condition: {meta.get('description', '')}
- Common symptoms: {meta.get('symptoms', '')}
- Urgency: {meta.get('urgency', '')}

Write a clear, structured diagnostic report with these 5 sections:

1. Scan Summary — what was detected and the confidence level
2. About This Condition — explain {diagnosis} in simple, patient-friendly language
3. Interpreting the Confidence — what {confidence}% means; flag uncertainty if below 75%
4. Recommended Next Steps — 3 specific actions for the patient or doctor
5. Questions to Ask Your Doctor — 3 relevant questions for a specialist visit

Be professional, compassionate, and concise (2-3 sentences per section)."""


async def call_mistral_api(prompt: str, config: Dict[str, Any]) -> str:
    """Calls official Mistral AI chat completions endpoint."""
    if not config["mistral_api_key"]:
        raise ValueError("MISTRAL_API_KEY environment variable is not configured.")

    headers = {
        "Authorization": f"Bearer {config['mistral_api_key']}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    payload = {
        "model": config["mistral_model"],
        "messages": [
            {"role": "system", "content": "You are a professional neuro-radiology medical AI assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 1000,
    }

    async with httpx.AsyncClient(timeout=config["timeout"]) as client:
        resp = await client.post(config["mistral_api_url"], headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


async def call_ollama(prompt: str, config: Dict[str, Any]) -> str:
    """Sends prompt to local or remote Ollama service."""
    payload = {
        "model": config["ollama_model"],
        "prompt": prompt,
        "stream": False,
    }
    async with httpx.AsyncClient(timeout=config["timeout"]) as client:
        resp = await client.post(config["ollama_url"], json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data.get("response", "").strip()


async def call_openai_compatible(prompt: str, config: Dict[str, Any]) -> str:
    """Calls OpenAI-compatible inference endpoints (Groq, Together, OpenRouter, vLLM)."""
    base_url = config["openai_api_base"].rstrip("/")
    if not base_url.endswith("/v1"):
        endpoint = f"{base_url}/v1/chat/completions" if "/chat/completions" not in base_url else base_url
    else:
        endpoint = f"{base_url}/chat/completions"

    headers = {"Content-Type": "application/json"}
    if config["openai_api_key"]:
        headers["Authorization"] = f"Bearer {config['openai_api_key']}"

    payload = {
        "model": config["openai_model"],
        "messages": [
            {"role": "system", "content": "You are a professional neuro-radiology medical AI assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 1000,
    }

    async with httpx.AsyncClient(timeout=config["timeout"]) as client:
        resp = await client.post(endpoint, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


async def generate_diagnostic_report(
    diagnosis: str,
    confidence: float,
    all_probs: Dict[str, float],
    meta: Dict[str, str]
) -> Tuple[str, bool]:
    """
    Executes report generation with the configured LLM provider.
    Returns: (report_text, success_boolean)
    Guarantees:
      - Never crashes the caller.
      - Never invents fake medical findings if the provider fails.
      - Always appends the medical disclaimer.
    """
    config = get_llm_config()
    provider = config["provider"]
    prompt = build_prompt(diagnosis, confidence, all_probs, meta)

    logger.info("Generating report with provider '%s'", provider)

    try:
        if provider == "mistral":
            raw_report = await call_mistral_api(prompt, config)
        elif provider == "openai_compatible":
            raw_report = await call_openai_compatible(prompt, config)
        elif provider == "ollama":
            raw_report = await call_ollama(prompt, config)
        else:
            raise ValueError(f"Unknown LLM provider '{provider}'. Expected 'mistral', 'ollama', or 'openai_compatible'.")

        full_report = raw_report + DISCLAIMER
        return full_report, True

    except Exception as exc:
        err_msg = str(exc)
        logger.warning("LLM report generation failed (%s): %s", provider, err_msg)

        # Distinguish CNN classification results from unavailable LLM text
        guidance = ""
        if provider == "mistral" and not config["mistral_api_key"]:
            guidance = "MISTRAL_API_KEY is not set on the hosting server."
        elif provider == "ollama":
            guidance = f"Ollama endpoint at {config['ollama_url']} was unreachable. Set MISTRAL_API_KEY for cloud inference or ensure Ollama is running."
        else:
            guidance = "Inference endpoint connection error or rate limit."

        fallback_report = (
            f"1. Scan Summary: The CNN classifier analyzed the brain MRI and detected {diagnosis} with {confidence}% confidence.\n\n"
            f"2. Clinical Notice: Automated generative report generation via Mistral is currently offline ({guidance}). "
            f"CNN classification results above remain fully valid and unaffected.\n\n"
            f"3. Condition Reference: {meta.get('description', '')}\n"
            f"Typical symptoms: {meta.get('symptoms', 'N/A')}\n"
            f"Urgency assessment: {meta.get('urgency', 'MODERATE')}\n\n"
            f"4. Recommended Next Steps: Review scan with a board-certified neurologist or radiologist."
            + DISCLAIMER
        )
        return fallback_report, False
