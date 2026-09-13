"""
Thin wrapper around LLM APIs (Google Gemini via REST) with automatic mock fallback.

Guarantees:
- If GEMINI_API_KEY is present and valid, calls the live Gemini API.
- If GEMINI_API_KEY is absent or fails, falls back to mock mode after an artificial
  1-2 second delay, returning plausible domain text and realistic token usage.
- EVERY response object strictly includes a "mode": "live" | "mode": "mock" field
  so downstream components never confuse mock output with live execution.
"""

import os
import time
import json
import random
import asyncio
import logging
import httpx
from typing import Dict, Any, Optional

logger = logging.getLogger("synapseos.llm_client")

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
FALLBACK_GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"


class LLMClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")

    def is_live_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 8)

    async def generate(self, prompt: str, system_prompt: str = "") -> Dict[str, Any]:
        """
        Generates content using live Gemini API if configured, otherwise falls back
        to mock mode with realistic latency and token counts.

        Returns:
            {
                "text": str,
                "tokens_used": int,
                "mode": "live" | "mock",
                "model": str,
                "elapsed_s": float
            }
        """
        start_t = time.time()

        if self.is_live_configured():
            try:
                result = await self._call_gemini_live(prompt, system_prompt)
                result["elapsed_s"] = round(time.time() - start_t, 3)
                return result
            except Exception as e:
                logger.warning(f"Live Gemini call failed ({e}), falling back to mock mode.")

        # Fallback Mock Mode (no key or API error)
        return await self._call_mock_mode(prompt, system_prompt, start_t)

    async def _call_gemini_live(self, prompt: str, system_prompt: str) -> Dict[str, Any]:
        """Calls Google Gemini REST API directly with httpx."""
        url = f"{GEMINI_API_URL}?key={self.api_key}"
        payload: Dict[str, Any] = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1000
            }
        }

        if system_prompt:
            payload["systemInstruction"] = {
                "parts": [{"text": system_prompt}]
            }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                # Try fallback model
                fallback_url = f"{FALLBACK_GEMINI_API_URL}?key={self.api_key}"
                resp = await client.post(fallback_url, json=payload)
                resp.raise_for_status()

            data = resp.json()

        candidates = data.get("candidates", [])
        text = ""
        if candidates and "content" in candidates[0]:
            parts = candidates[0]["content"].get("parts", [])
            if parts:
                text = parts[0].get("text", "")

        usage = data.get("usageMetadata", {})
        total_tokens = usage.get("totalTokenCount", len(prompt.split()) + len(text.split()))

        return {
            "text": text.strip(),
            "tokens_used": int(total_tokens),
            "mode": "live",
            "model": "gemini-2.5-flash"
        }

    async def _call_mock_mode(self, prompt: str, system_prompt: str, start_t: float) -> Dict[str, Any]:
        """
        Artificial 1-2s delay generating structured, realistic mock outputs.
        Guaranteed to flag mode='mock'.
        """
        delay = random.uniform(1.0, 1.8)
        await asyncio.sleep(delay)

        prompt_lower = prompt.lower()

        # Handle lead extraction / generation prompt
        if "lead" in prompt_lower or "target" in prompt_lower or "company" in prompt_lower:
            canned_text = json.dumps([
                {
                    "name": "Sarah Chen",
                    "title": "VP of Revenue Operations",
                    "company": "Kinetix Cloud",
                    "fit_reason": "Scaling Series-B B2B SaaS expanding enterprise pipeline across North America."
                },
                {
                    "name": "Marcus Vance",
                    "title": "Head of Sales Engineering",
                    "company": "Aura Logic",
                    "fit_reason": "Managing 120-person distributed technical workforce with active hiring signals."
                },
                {
                    "name": "Elena Rostova",
                    "title": "Director of Growth Infrastructure",
                    "company": "Syntropic Systems",
                    "fit_reason": "Evaluating agentic workflow automation platforms to reduce pipeline cycle times."
                }
            ], indent=2)
            est_tokens = random.randint(320, 480)
        else:
            # Handle outreach email drafting prompt
            canned_text = (
                "Hi Sarah,\n\n"
                "I noticed Kinetix Cloud's recent expansion into enterprise sales. As teams scale past 100 reps, "
                "orchestrating autonomous pipeline generation while keeping compute and outreach costs bounded becomes critical.\n\n"
                "SynapseOS coordinates specialized AI worker swarms under game-theoretic resource allocation, "
                "ensuring high-priority enterprise deals get immediate execution bandwidth without starving inbound operations.\n\n"
                "Would you be open to a 10-minute briefing next Tuesday to see our multi-agent revenue console in action?\n\n"
                "Best regards,\n"
                "Alex Rivera — Enterprise Swarm Systems"
            )
            est_tokens = random.randint(220, 360)

        return {
            "text": canned_text,
            "tokens_used": est_tokens,
            "mode": "mock",
            "model": "mock-heuristic-v1",
            "elapsed_s": round(time.time() - start_t, 3)
        }


# Shared singleton instance
llm_client = LLMClient()
