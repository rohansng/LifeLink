"""Gemini Client Integration for LifeLink Modular Agents.

Interfaces with Google Gemini 2.5 Flash / 1.5 Flash via REST API with strict JSON schema outputs.
Supports deterministic fallbacks and testing hooks for malformed AI responses.
"""

import json
import logging
import os
from typing import Any, Callable, Dict, Optional, Type
import httpx
from pydantic import BaseModel, ValidationError

logger = logging.getLogger("lifelink.gemini_client")


class GeminiClient:
    """Client for generating structured JSON via Google Gemini API."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.model = model
        self._mock_responder: Optional[Callable[[str, str], Optional[str]]] = None

    def set_mock_responder(self, mock_fn: Optional[Callable[[str, str], Optional[str]]]):
        """Sets a mock responder for deterministic unit testing of LLM responses & error handling."""
        self._mock_responder = mock_fn

    @property
    def is_configured(self) -> bool:
        """True if a valid Gemini API key is present or a test mock is active."""
        return bool(self.api_key or self._mock_responder)

    def generate_structured_json(
        self,
        prompt: str,
        system_instruction: str,
        schema_class: Optional[Type[BaseModel]] = None,
    ) -> Optional[Dict[str, Any]]:
        """Invokes Gemini with JSON output mode.

        Returns parsed and validated dictionary, or None if the LLM output is malformed,
        network fails, or the API key is unconfigured (triggering safe deterministic fallback).
        """
        # 1. Check for active test mock
        if self._mock_responder is not None:
            raw_text = self._mock_responder(prompt, system_instruction)
            if raw_text is None:
                return None
            return self._parse_and_validate(raw_text, schema_class)

        # 2. Check API key availability
        if not self.api_key:
            logger.info("Gemini API key not configured. Utilizing deterministic agent fallback.")
            return None

        # 3. Call Gemini REST endpoint
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "systemInstruction": {"parts": [{"text": system_instruction}]},
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.1,
            },
        }

        try:
            with httpx.Client(timeout=8.0) as client:
                response = client.post(url, json=payload)
                if response.status_code != 200:
                    logger.warning("Gemini API returned status %s: %s", response.status_code, response.text[:200])
                    return None

                data = response.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    return None

                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts or "text" not in parts[0]:
                    return None

                raw_text = parts[0]["text"]
                return self._parse_and_validate(raw_text, schema_class)

        except Exception as exc:
            logger.warning("Gemini API call failed (%s). Safely utilizing deterministic fallback.", exc)
            return None

    def _parse_and_validate(
        self,
        raw_text: str,
        schema_class: Optional[Type[BaseModel]] = None,
    ) -> Optional[Dict[str, Any]]:
        """Safely parses JSON string and optionally validates against Pydantic schema."""
        try:
            # Strip markdown code fences if LLM wrapped output
            cleaned = raw_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

            parsed = json.loads(cleaned)

            if schema_class:
                # Validate against target Pydantic schema
                validated = schema_class.model_validate(parsed)
                return validated.model_dump()
            return parsed

        except (json.JSONDecodeError, ValidationError, TypeError) as err:
            logger.warning("Malformed AI response encountered: %s. Initiating deterministic fallback.", err)
            return None


gemini_client = GeminiClient()

