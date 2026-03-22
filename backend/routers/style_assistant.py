import asyncio
import base64
import json
import os
import re
from concurrent.futures import ThreadPoolExecutor

from google import genai
from dotenv import load_dotenv
from fastapi import APIRouter, File, Form, UploadFile
from fastapi.exceptions import HTTPException
from utils.serpapi_util import search_products

load_dotenv()

client = genai.Client()

router = APIRouter()

_executor = ThreadPoolExecutor()

STYLE_PROMPT = """You are a sustainable fashion stylist. \
The user is asking: "{query}"
{image_context}
Respond with ONLY valid JSON in this exact shape — no markdown, no explanation:
{{
  "summary": "2-3 sentence outfit recommendation",
  "outfit_items": [
    {{ "label": "Display label", "search_query": "search query for this piece" }}
  ]
}}
Suggest 3-4 outfit items. Keep search_query short and specific (e.g. "flowy midi skirt", "linen blazer")."""


def _build_prompt_parts(query: str, images: list[bytes]) -> list:
    image_context = (
        "The user has also uploaded inspiration images — analyse their style, colours, and silhouettes."
        if images else ""
    )
    prompt_text = STYLE_PROMPT.format(query=query, image_context=image_context)

    parts = []
    for img_bytes in images:
        parts.append({"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(img_bytes).decode()}})
    parts.append(prompt_text)
    return parts


def _parse_gemini_response(text: str) -> dict:
    # Strip markdown code fences if present
    text = re.sub(r"```(?:json)?", "", text).strip()
    return json.loads(text)


def _run_search(search_query: str) -> list:
    return search_products(search_query, sustainable_only=True)["shopping_results"]


@router.post("/style-assistant")
async def style_assistant(
    query: str = Form(..., description="User query"),
    images: list[UploadFile] = File(default=[], description="One or more inspiration photos"),
):
    # Read all uploaded images
    image_bytes: list[bytes] = []
    if images:
        for upload in images:
            image_bytes.append(await upload.read())

    # Call Gemini
    parts = _build_prompt_parts(query, image_bytes)
    try:
        response = client.models.generate_content(
            model = "gemini-3-flash-preview",
            contents = parts
        )
        parsed = _parse_gemini_response(response.text)
    except (json.JSONDecodeError, Exception) as e:
        raise HTTPException(status_code=502, detail=f"Gemini response error: {e}")

    outfit_items = parsed.get("outfit_items", [])

    # Search for each outfit item concurrently
    loop = asyncio.get_event_loop()
    search_tasks = [
        loop.run_in_executor(_executor, _run_search, item["search_query"])
        for item in outfit_items
    ]
    search_results = await asyncio.gather(*search_tasks)

    return {
        "summary": parsed.get("summary", ""),
        "outfit_items": [
            {"label": item["label"], "search_query": item["search_query"], "results": results}
            for item, results in zip(outfit_items, search_results)
        ],
    }
