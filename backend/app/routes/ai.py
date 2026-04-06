import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.services.ai_service import generate_mindmap, expand_node, explain_node, generate_from_chat
from app.routes.auth import get_current_user_id

router = APIRouter(prefix="/api/ai", tags=["ai"])


class GenerateRequest(BaseModel):
    topic: str
    file_content: str | None = None   # base64-encoded file content
    file_type: str | None = None      # MIME type, e.g. "image/png" or "text/plain"


class ExpandRequest(BaseModel):
    node_label: str
    context: str


class ExplainRequest(BaseModel):
    node_label: str
    context: str


class GenerateFromChatRequest(BaseModel):
    chat_json: str


@router.post("/generate")
async def generate(
    body: GenerateRequest,
    user_id: str = Depends(get_current_user_id),
):
    if not body.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")

    try:
        result = await generate_mindmap(body.topic, body.file_content, body.file_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


@router.post("/expand")
async def expand(
    body: ExpandRequest,
    user_id: str = Depends(get_current_user_id),
):
    if not body.node_label.strip():
        raise HTTPException(status_code=400, detail="Node label cannot be empty")

    try:
        result = await expand_node(body.node_label, body.context)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI expansion failed: {str(e)}")


@router.post("/generate-from-chat")
async def generate_chat_map(
    body: GenerateFromChatRequest,
    user_id: str = Depends(get_current_user_id),
):
    try:
        chat_data = json.loads(body.chat_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")

    messages = chat_data.get("messages", [])
    transcript_lines = []
    for msg in messages:
        sender = "Human" if msg.get("sender") == "human" else "Claude"
        text = msg.get("text", "").strip()
        if text:
            transcript_lines.append(f"{sender}: {text}")

    chat_text = "\n\n".join(transcript_lines)
    if not chat_text.strip():
        raise HTTPException(status_code=400, detail="No messages found in chat export")

    try:
        result = await generate_from_chat(chat_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat map generation failed: {str(e)}")


@router.post("/explain")
async def explain(
    body: ExplainRequest,
    user_id: str = Depends(get_current_user_id),
):
    if not body.node_label.strip():
        raise HTTPException(status_code=400, detail="Node label cannot be empty")

    try:
        result = await explain_node(body.node_label, body.context)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI explain failed: {str(e)}")
