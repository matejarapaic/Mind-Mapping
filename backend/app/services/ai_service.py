import base64
import json
from typing import Optional

import anthropic

from app.config import settings

client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """You are an expert mind map generator. When given a topic or idea, generate a comprehensive mind map as valid JSON.

Return ONLY a raw JSON object — no markdown fences, no explanation. Use this exact structure:

{
  "title": "The central topic label",
  "nodes": [
    {"id": "0", "label": "Central Topic"},
    {"id": "1", "label": "Main Branch 1", "parent": "0"},
    {"id": "2", "label": "Sub Item 1", "parent": "1"},
    {"id": "3", "label": "Sub Item 2", "parent": "1"},
    {"id": "4", "label": "Main Branch 2", "parent": "0"}
  ]
}

Rules:
- Node id "0" is always the central node (no parent field)
- Generate 4–6 main branches directly from the central node
- Each main branch can have 2–4 sub-branches
- Labels should be concise: 2–5 words max
- IDs are sequential strings: "0", "1", "2", etc.
- Return only the JSON object, nothing else"""


async def generate_mindmap(
    topic: str,
    file_content: Optional[str] = None,
    file_type: Optional[str] = None,
) -> dict:
    # Build the user message content — plain text or multimodal with attachment
    if file_content and file_type:
        if file_type.startswith("image/"):
            # Vision: send the image + topic as a multimodal message
            user_content = [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": file_type,
                        "data": file_content,
                    },
                },
                {
                    "type": "text",
                    "text": (
                        f"Create a mind map for: {topic}\n\n"
                        "Use the attached image as visual context and reference."
                    ),
                },
            ]
        else:
            # Text file: decode and embed as extra context
            try:
                text_body = base64.b64decode(file_content).decode("utf-8", errors="replace")
            except Exception:
                text_body = ""
            # Truncate to keep within token limits
            if len(text_body) > 6000:
                text_body = text_body[:6000] + "\n…[truncated]"
            user_content = (
                f"Create a mind map for: {topic}\n\n"
                f"Use the following attached file content as context:\n\n{text_body}"
            )
    else:
        user_content = f"Create a mind map for: {topic}"

    response = await client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_content}],
    )

    # Extract text content (skip thinking blocks)
    text = next(
        (block.text for block in response.content if block.type == "text"), ""
    )

    # Strip any accidental markdown fences
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    return json.loads(text)


EXPAND_PROMPT = """You are a mind map expansion expert. Given a concept and its broader topic, generate 3-4 specific child ideas that directly expand upon it.

Return ONLY a raw JSON object — no markdown, no explanation:

{
  "nodes": [
    {"label": "Child Idea 1"},
    {"label": "Child Idea 2"},
    {"label": "Child Idea 3"}
  ]
}

Rules:
- Generate exactly 3-4 child nodes
- Labels must be concise: 2-5 words max
- Ideas must directly expand or explain the given concept
- Return only the JSON object, nothing else"""


EXPLAIN_PROMPT = """You are a knowledgeable assistant helping users understand concepts in a mind map.
Given a concept and its broader topic, write a clear, insightful explanation of what the concept means and why it matters in that context.

Return ONLY a raw JSON object — no markdown, no explanation:

{
  "explanation": "Your explanation here (2-4 sentences, plain text)."
}

Rules:
- Be concise but informative: 2-4 sentences
- Explain the concept in the context of the broader topic
- Use clear, accessible language
- Return only the JSON object, nothing else"""


async def explain_node(node_label: str, context: str) -> dict:
    response = await client.messages.create(
        model="claude-opus-4-6",
        max_tokens=512,
        system=EXPLAIN_PROMPT,
        messages=[{"role": "user", "content": f"Explain '{node_label}' in the context of: {context}"}],
    )

    text = next(
        (block.text for block in response.content if block.type == "text"), ""
    )
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    return json.loads(text)


async def expand_node(node_label: str, context: str) -> dict:
    response = await client.messages.create(
        model="claude-opus-4-6",
        max_tokens=512,
        system=EXPAND_PROMPT,
        messages=[{"role": "user", "content": f"Expand '{node_label}' within the topic: {context}"}],
    )

    text = next(
        (block.text for block in response.content if block.type == "text"), ""
    )
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    return json.loads(text)
