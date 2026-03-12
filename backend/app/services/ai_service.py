import json
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


async def generate_mindmap(topic: str) -> dict:
    response = await client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": f"Create a mind map for: {topic}"}],
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
