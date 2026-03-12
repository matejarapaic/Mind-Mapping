from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.services.ai_service import generate_mindmap, expand_node
from app.routes.auth import get_current_user_id

router = APIRouter(prefix="/api/ai", tags=["ai"])


class GenerateRequest(BaseModel):
    topic: str


class ExpandRequest(BaseModel):
    node_label: str
    context: str


@router.post("/generate")
async def generate(
    body: GenerateRequest,
    user_id: str = Depends(get_current_user_id),
):
    if not body.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")

    try:
        result = await generate_mindmap(body.topic)
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
